import React, { createContext, useContext, useState, useEffect, useRef, startTransition } from 'react';
import axios from 'axios';
import { Cpu, Database, Server, Briefcase, Box } from 'lucide-react';
import { getPendingMutations, removeMutation, queueMutation } from '../utils/mutationQueue';
import { recordAudit } from '../utils/auditVault';
import Telemetry from '../utils/telemetry';
import { API_BASE_URL, API_ORIGIN } from '../config/runtime';
import { getHealthCheckIntervalMs } from '../utils/runtimeProfile';

const HealthContext = createContext();
const ENABLE_DIAGNOSTIC_OVERLAYS = import.meta.env.VITE_ENABLE_SYSTEM_OVERLAYS === 'true';

const createSystemChannel = () => {
    if (typeof window === 'undefined' || typeof window.BroadcastChannel === 'undefined') {
        return null;
    }

    try {
        return new window.BroadcastChannel('vitam_system_bridge');
    } catch (_error) {
        return null;
    }
};

const createSystemWorker = () => {
    if (typeof window === 'undefined' || typeof window.Worker === 'undefined') {
        return null;
    }

    try {
        return new Worker(new URL('../workers/systemWorker.js', import.meta.url), { type: 'module' });
    } catch (_error) {
        return null;
    }
};

const trimLeadingSlashes = (value) => String(value || '').replace(/^\/+/, '');
const isAbsoluteUrl = (value) => /^https?:\/\//i.test(String(value || ''));

const resolveMutationUrl = (url, baseURL) => {
    const target = String(url || '').trim();
    if (!target) {
        return API_BASE_URL;
    }
    if (isAbsoluteUrl(target)) {
        return target;
    }
    if (target.startsWith('/api/')) {
        return `${API_ORIGIN}/${trimLeadingSlashes(target)}`;
    }
    if (target.startsWith('/')) {
        return `${API_BASE_URL}/${trimLeadingSlashes(target)}`;
    }
    if (baseURL) {
        return `${String(baseURL).replace(/\/+$/, '')}/${trimLeadingSlashes(target)}`;
    }
    return `${API_BASE_URL}/${trimLeadingSlashes(target)}`;
};

export const useHealth = () => useContext(HealthContext);

export const HealthProvider = ({ children }) => {
    const systemChannelRef = useRef(null);
    const systemWorkerRef = useRef(null);
    const [health, setHealth] = useState({
        isHealthy: true,
        isLockdown: false,
        isLocalMode: false,
        services: {
            db: 'optimal',
            ai: 'optimal',
            server: 'optimal',
            infrastructure: 'optimal',
            career: 'optimal'
        },
        pendingSyncCount: 0,
        isSyncing: false,
        variance: 0,
        lastChecked: new Date().toISOString()
    });

    useEffect(() => {
        systemChannelRef.current = createSystemChannel();
        systemWorkerRef.current = createSystemWorker();

        return () => {
            if (systemChannelRef.current) {
                systemChannelRef.current.close();
                systemChannelRef.current = null;
            }

            if (systemWorkerRef.current) {
                systemWorkerRef.current.terminate();
                systemWorkerRef.current = null;
            }
        };
    }, []);

    const transitionHealthUpdate = (updater) => {
        startTransition(() => {
            setHealth(updater);
        });
    };

    const initiateConsensus = (data) => {
        return new Promise((resolve) => {
            const worker = systemWorkerRef.current;
            if (!worker) {
                resolve({
                    approved: true,
                    mode: 'local-fallback',
                    payload: data,
                    ts: new Date().toISOString()
                });
                return;
            }

            const handleMessage = (e) => {
                if (e.data.type === 'CONSENSUS_RESULT') {
                    worker.removeEventListener('message', handleMessage);
                    resolve(e.data.payload);
                }
            };
            worker.addEventListener('message', handleMessage);
            worker.postMessage({ type: 'INITIATE_CONSENSUS', payload: data });
        });
    };

    useEffect(() => {
        const systemChannel = systemChannelRef.current;
        if (!systemChannel) {
            return undefined;
        }

        const handleBridgeMessage = (event) => {
            const { type, payload, senderId } = event.data;
            if (type === 'HEALTH_UPDATE') {
                transitionHealthUpdate(prev => {
                    const reconciledSyncCount = Math.max(prev.pendingSyncCount, payload.pendingSyncCount || 0);
                    return { ...prev, ...payload, pendingSyncCount: reconciledSyncCount, lastChecked: new Date().toISOString() };
                });
            } else if (type === 'SYNC_TRIGGER') {
                syncMutations();
            } else if (type === 'QUORUM_VOTE_REQUEST') {
                systemChannel.postMessage({ 
                    type: 'QUORUM_VOTE_RESPONSE', 
                    payload: { pendingSyncCount: health.pendingSyncCount, variance: health.variance },
                    targetId: senderId 
                });
            }
        };
        systemChannel.addEventListener('message', handleBridgeMessage);
        return () => systemChannel.removeEventListener('message', handleBridgeMessage);
    }, [health.pendingSyncCount, health.variance]);

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            async (error) => {
                const { config, response } = error;
                const isMutation = ['post', 'put', 'delete'].includes(config?.method?.toLowerCase());
                const isRecoverable = !response || (response.status >= 500 && response.status <= 599) || response.status === 404;

                if (isMutation && isRecoverable && !config._isRetry) {
                    await recordAudit('MUTATION_FAILURE', { url: config.url, status: response?.status || 'network_error' });
                    await queueMutation({
                        url: config.url,
                        baseURL: config.baseURL || '',
                        method: config.method,
                        data: config.data,
                        headers: config.headers
                    });
                    updateSyncCount();
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    const updateSyncCount = async () => {
        const pending = await getPendingMutations();
        transitionHealthUpdate(prev => ({ ...prev, pendingSyncCount: pending.length }));
    };

    const syncMutations = async () => {
        const pending = await getPendingMutations();
        if (pending.length === 0) return;

        transitionHealthUpdate(prev => ({ ...prev, isSyncing: true }));
        await recordAudit('SYNC_START', { count: pending.length });

        for (const mutation of pending) {
            try {
                await axios({
                    url: resolveMutationUrl(mutation.url, mutation.baseURL),
                    method: mutation.method,
                    data: mutation.data,
                    headers: { ...mutation.headers, 'x-retry-audit': 'true' },
                    _isRetry: true
                });
                await removeMutation(mutation.id);
            } catch (err) {
                Telemetry.sentinel(`[Institutional Resilience] Sync failed for ${mutation.id}`, err.message);
            }
        }

        transitionHealthUpdate(prev => ({ ...prev, isSyncing: false }));
        updateSyncCount();
        await recordAudit('SYNC_COMPLETE');
    };

    const checkHealth = async () => {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
            return;
        }

        const startTime = Date.now();
        try {
            const res = await axios.get(`${API_BASE_URL}/health`, {
                timeout: 5000
            });
            const data = res.data;
            const latency = Date.now() - startTime;
            
            const pending = await getPendingMutations();
            const latencyScore = Math.min(latency / 100, 40); 
            const syncScore = Math.min(pending.length * 10, 40);

            const infraDrift = String(data.infrastructure || '').toLowerCase() === 'degraded' ? 15 : 0;
            const careerDrift = String(data.career || '').toLowerCase() === 'degraded' ? 10 : 0;
            const variance = Math.round(latencyScore + syncScore + infraDrift + careerDrift);

            const isLockdown = (data.status === 'degraded' && data.server === 'shutting_down') || variance > 90;
            const wasHealthy = health.isHealthy;
            const nowHealthy = data.status === 'healthy';
            
            const updatedHealth = {
                isHealthy: nowHealthy,
                isLockdown: isLockdown,
                services: {
                    db: data.db || 'optimal',
                    ai: data.ai || 'optimal',
                    server: data.server || 'optimal',
                    infrastructure: infraDrift > 0 ? 'degraded' : 'optimal',
                    career: careerDrift > 0 ? 'degraded' : 'optimal'
                },
                variance,
                pendingSyncCount: pending.length
            };

            Telemetry.info(`[Institutional Pulse] Health Monitor: ${nowHealthy ? 'OPTIMAL' : 'DEGRADED'}`, updatedHealth);
            
            transitionHealthUpdate(prev => ({ 
                ...prev, 
                ...updatedHealth, 
                isLocalMode: false,
                lastChecked: new Date().toISOString() 
            }));

            systemChannelRef.current?.postMessage({ type: 'HEALTH_UPDATE', payload: updatedHealth });

            if (!wasHealthy && nowHealthy) {
                syncMutations();
                systemChannelRef.current?.postMessage({ type: 'SYNC_TRIGGER' });
            }

            if (isLockdown && !health.isLockdown) {
                await recordAudit('LOCKDOWN_TRIGGERED', { variance });
            }
        } catch (err) {
            transitionHealthUpdate(prev => ({
                ...prev,
                isHealthy: false,
                isLocalMode: true,
                services: { ...prev.services, server: 'unreachable' }
            }));
            systemChannelRef.current?.postMessage({ type: 'HEALTH_UPDATE', payload: { isHealthy: false, isLocalMode: true } });
        }
    };

    useEffect(() => {
        checkHealth();
        updateSyncCount();
        const interval = setInterval(checkHealth, getHealthCheckIntervalMs());
        return () => clearInterval(interval);
    }, []);

    return (
        <HealthContext.Provider value={{ health, checkHealth, syncMutations, initiateConsensus }}>
            {children}
            {ENABLE_DIAGNOSTIC_OVERLAYS && (
                <>
                    <VarianceGuard variance={health.variance} />
                    <SectorMonitor services={health.services} />
                </>
            )}
        </HealthContext.Provider>
    );
};

const SectorMonitor = ({ services }) => {
    const sectors = [
        { label: 'Database', state: services.db, icon: Database },
        { label: 'VITAM AI', state: services.ai, icon: Cpu },
        { label: 'Core Server', state: services.server, icon: Server },
        { label: 'Infra Grid', state: services.infrastructure, icon: Box },
        { label: 'Career Hub', state: services.career, icon: Briefcase },
    ];

    return (
        <div className="fixed top-24 right-6 z-[9000] flex flex-col gap-2 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
            {sectors.map(s => (
                <div key={s.label} className="bg-black/90 border border-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-3 transition-all">
                    <s.icon className={`w-3.5 h-3.5 ${s.state === 'optimal' ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`} />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{s.label}</span>
                </div>
            ))}
        </div>
    );
};

const VarianceGuard = ({ variance }) => (
    variance > 70 ? (
        <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden transition-opacity duration-200">
            <div className="absolute inset-0 bg-rose-500/5 animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-500/10 text-[20vw] font-black pointer-events-none select-none opacity-10 italic">
                VARIANCE_{variance}%
            </div>
        </div>
    ) : null
);

