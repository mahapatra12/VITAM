import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, ScanEye, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Lazy loaded sub-dashboards to simulate enterprise chunking
import PrincipalDashboard from '../pages/admin/PrincipalDashboard';
import FinanceDashboard from '../pages/admin/FinanceDashboard';
import HodDashboard from '../pages/hod/Dashboard';
import AdminDashboard from '../pages/admin/Dashboard';
import PlacementDashboard from '../pages/admin/PlacementDashboard';
import ExamDashboard from '../pages/admin/ExamDashboard';
import BusDashboard from '../pages/admin/BusDashboard';

export default function AdminRouter() {
    const { user } = useAuth();
    const [isVerifying, setIsVerifying] = useState(true);
    const [scanProgress, setScanProgress] = useState(0);

    // Advanced "Biometric" Route Authorization Simulation
    useEffect(() => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => setIsVerifying(false), 800);
            }
            setScanProgress(progress);
        }, 120);

        return () => clearInterval(interval);
    }, [user?.subRole]);

    // Role-Matrix Resolution
    const renderSubsystem = () => {
        switch (user?.subRole) {
            case 'principal':
            case 'vice_principal':
                return <PrincipalDashboard />;
            case 'finance':
                return <FinanceDashboard />;
            case 'hod':
                return <HodDashboard />;
            case 'placement':
                return <PlacementDashboard />;
            case 'exam':
                return <ExamDashboard />;
            case 'bus':
                return <BusDashboard />;
            default:
                return <AdminDashboard />;
        }
    };

    return (
        <AnimatePresence mode="wait">
            {isVerifying ? (
                <motion.div 
                    key="verification-matrix"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#020202] text-white overflow-hidden"
                >
                    <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="relative mb-8 group">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                            <motion.div 
                                className="w-32 h-32 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center relative overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.2)]"
                                animate={{ rotateY: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            >
                                <ScanEye size={48} className="text-indigo-400" />
                                <motion.div 
                                    className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_20px_#6366f1]"
                                    initial={{ top: 0 }}
                                    animate={{ top: "100%" }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                            </motion.div>
                        </div>

                        <h2 className="text-xl font-black tracking-[0.3em] uppercase mb-3 flex items-center gap-2">
                            <ShieldCheck size={20} className="text-emerald-400" /> Cryptographic Handshake
                        </h2>
                        
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-sm text-slate-400 font-mono tracking-widest uppercase">
                                Resolving Sub-Role Vectors for <span className="text-white font-black">{user?.subRole || 'Executive'}</span>
                            </p>
                            <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden mt-4 border border-white/5">
                                <motion.div 
                                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_10px_#6366f1]"
                                    style={{ width: `${scanProgress}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">
                                {scanProgress < 100 ? "Syncing Decentralized Identity Matrix..." : "Identity Verified. Unlocking Subsystem."}
                            </p>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="resolved-subsystem"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {renderSubsystem()}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
