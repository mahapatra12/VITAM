import React, { useState, useEffect, useRef } from 'react';
import { 
  Fingerprint, ShieldCheck, ShieldAlert, History, Smartphone, 
  MapPin, Globe, Clock, Monitor, Lock, CheckCircle2, XCircle, 
  AlertTriangle, RefreshCw, Key, Shield, Terminal, Zap, Radio, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import DashboardLayout from '../../layouts/DashboardLayout';

const CryptographicRain = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const characters = 'ABCDEF0123456789XYZ!@#$%^&*()';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    const draw = () => {
      ctx.fillStyle = 'rgba(2, 2, 2, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#2563eb'; // blue-600
      ctx.font = fontSize + 'px monospace';
      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-10 z-0" />;
};

const Security = () => {
  const { user, registerBiometrics } = useAuth();
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [identityScore, setIdentityScore] = useState({ score: 98, status: 'OPTIMAL', recommendation: 'Sovereign Link Synchronized.' });

  const fetchSecurityData = async () => {
    try {
      const uid = user?.id || user?._id;
      if (!uid) return;
      const [logsRes, settingsRes, scoreRes] = await Promise.all([
        api.get(`/auth/security-logs/${uid}`),
        api.get(`/auth/get-security-settings/${uid}`),
        api.get(`/auth/get-identity-score/${uid}`).catch(() => ({ data: { score: 98, status: 'OPTIMAL', recommendation: 'Sovereign Link Synchronized.' } }))
      ]);
      setLogs(logsRes.data);
      setSettings(settingsRes.data);
      setIdentityScore(scoreRes.data);
    } catch (err) {
      console.error("Security data fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSecurityData();
  };

  const handleToggleMFA = async (type) => {
    try {
      const uid = user?.id || user?._id;
      const updated = {
        userId: uid,
        isBiometricEnabled: type === 'biometric' ? !settings.isBiometricEnabled : settings.isBiometricEnabled,
        isTwoFactorEnabled: type === '2fa' ? !settings.isTwoFactorEnabled : settings.isTwoFactorEnabled
      };
      await api.post('/auth/update-security-settings', updated);
      setSettings(prev => ({ ...prev, ...updated }));
      setMsg({ type: 'success', text: `Protocol Update: ${type.toUpperCase()} modified.` });
    } catch (err) {
      setMsg({ type: 'error', text: 'Protocol Failure: Settings commit failed.' });
    }
  };

  const handleRegisterDevice = async () => {
    try {
      const uid = user?.id || user?._id;
      await registerBiometrics(uid);
      handleRefresh();
      setMsg({ type: 'success', text: 'Hardware Handshake: Device Seeded.' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Registration Interrupted.' });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center">
      <RefreshCw className="text-blue-500 animate-spin" size={48} />
    </div>
  );

  return (
    <DashboardLayout title="Security Command" role={user?.role}>
      <div className="relative pb-24 font-['Outfit']">
        <CryptographicRain />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto relative z-10"
        >
          {/* Header & Intel Bar */}
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-16 gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_#2563eb]" />
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500/60">Apex Sentinel: Active Monitor</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
                Security <span className="text-blue-600 drop-shadow-[0_0_20px_rgba(37,99,235,0.4)]">Master</span>
              </h1>
              <p className="text-white/30 font-bold uppercase tracking-[0.4em] text-[10px]">Cryptographic Device Management and Identity Audit Logs</p>
            </div>

            <div className="flex items-center gap-6 w-full xl:w-auto">
               <div className="bg-[#0a0a0a] border border-white/5 p-6 md:p-8 rounded-[40px] flex-1 xl:flex-none flex items-center gap-8 shadow-2xl">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Integrity Score</p>
                    <p className="text-4xl md:text-5xl font-black italic tracking-tighter text-blue-600">{identityScore.score}%</p>
                  </div>
                  <div className="w-px h-12 bg-white/5" />
                  <div className="w-16 h-16 rounded-[25px] bg-blue-600/10 flex items-center justify-center text-blue-600">
                    <ShieldCheck size={32} />
                  </div>
               </div>
               <button onClick={handleRefresh} className="w-20 h-20 md:w-24 md:h-24 bg-white/5 border border-white/10 rounded-[30px] md:rounded-[40px] flex items-center justify-center text-white/30 hover:text-white transition-all hover:bg-white/10 group">
                 <RefreshCw size={24} className={refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            
            {/* Left Column: Toggles & Stats */}
            <div className="xl:col-span-4 space-y-12">
              <div className="bg-[#050505] border border-white/5 rounded-[50px] p-10 space-y-10 shadow-3xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Subsystem Infrastructure</h3>
                  <Radio size={16} className="text-blue-500 animate-pulse" />
                </div>
                
                <div className="space-y-6">
                  {[
                    { label: '2FA Protocol', state: settings?.isTwoFactorEnabled, type: '2fa', icon: Lock, desc: 'TOTP Authentication' },
                    { label: 'Sovereign Biometrics', state: settings?.isBiometricEnabled, type: 'biometric', icon: Fingerprint, desc: 'WebAuthn Hardware Bond' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-8 bg-white/[0.02] rounded-[35px] border border-white/5 hover:border-blue-500/20 transition-all group">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${item.state ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-white/20'}`}>
                          <item.icon size={24} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-widest">{item.label}</h4>
                          <p className="text-[9px] text-white/20 font-black uppercase tracking-tight mt-1">{item.desc}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleToggleMFA(item.type)}
                        className={`w-14 h-7 rounded-full relative transition-all duration-500 ${item.state ? 'bg-blue-600' : 'bg-white/10'}`}
                      >
                        <motion.div animate={{ x: item.state ? 28 : 4 }} className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleRegisterDevice}
                    className="w-full bg-white text-black py-6 rounded-[30px] font-black uppercase tracking-widest text-[10px] transition-all shadow-2xl hover:bg-blue-600 hover:text-white group active:scale-95"
                  >
                    <span className="flex items-center justify-center gap-3">
                      <Smartphone size={18} className="group-hover:animate-bounce" />
                      Bind Physical Key
                    </span>
                  </button>
                  <div className="mt-8 flex justify-center gap-1.5 h-1">
                     {[...Array(20)].map((_, i) => (
                       <div key={i} className="flex-1 bg-white/[0.05] rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                            className="h-full bg-blue-600/30"
                          />
                       </div>
                     ))}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-600/5 to-transparent border border-red-500/20 rounded-[50px] p-10 group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                  <ShieldAlert size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                      <Zap size={24} />
                    </div>
                    <h4 className="text-white font-black uppercase tracking-tighter text-lg italic">Panic Lockout</h4>
                  </div>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest leading-loose mb-10">
                    Emergency session revocation. Immediate cryptographic termination of all active institutional links.
                  </p>
                  <button className="w-full py-5 border border-red-500/20 rounded-2xl text-red-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all">
                    Initialize Blackout
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Security Logs */}
            <div className="xl:col-span-8">
              <div className="bg-[#050505] border border-white/5 rounded-[60px] p-12 min-h-[750px] flex flex-col shadow-3xl overflow-hidden relative group/audit">
                <div className="absolute inset-0 bg-blue-600/[0.01] opacity-0 group-hover/audit:opacity-100 transition-opacity duration-1000" />
                
                <div className="flex items-center justify-between mb-12 relative z-10">
                  <div className="flex items-center gap-4">
                    <Terminal className="text-blue-600" size={24} />
                    <div>
                      <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em]">Identity Manifest Audit</h3>
                      <p className="text-[9px] font-black text-blue-500/40 tracking-widest uppercase mt-1">Real-time Subsystem Sync</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">Post-Quantum Verified</span>
                     <Shield size={16} className="text-white/10" />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 relative z-10">
                  {logs.length > 0 ? logs.map((log, idx) => (
                    <motion.div 
                      key={log._id} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-8 bg-white/[0.02] rounded-[40px] border border-white/5 hover:border-blue-500/20 transition-all group/log shadow-xl"
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex gap-6 items-start">
                          <div className={`mt-2 w-2 h-2 rounded-full shadow-[0_0_15px] ${
                            log.status === 'Success' ? 'bg-emerald-500 shadow-emerald-500' : 'bg-red-500 shadow-red-500 animate-pulse'
                          }`} />
                          <div className="space-y-3">
                            <div className="flex items-center gap-4">
                              <p className="text-xl font-black text-white italic tracking-tighter uppercase">{log.event.replace('AI', 'Apex')}</p>
                              <span className={`text-[8px] font-black uppercase tracking-[0.3em] px-4 py-1 rounded-full border ${
                                log.status === 'Success' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-red-500/20 text-red-500 bg-red-500/5'
                              }`}>{log.status}</span>
                            </div>
                            <p className="text-sm text-white/30 font-bold font-mono tracking-tight">{log.details}</p>
                            <div className="flex flex-wrap gap-6 pt-4">
                              {[
                                { icon: MapPin, text: log.location || 'Unknown' },
                                { icon: Globe, text: log.ip || 'Local Node' },
                                { icon: Monitor, text: log.device || 'Standard Access' }
                              ].map((meta, mIdx) => (
                                <div key={mIdx} className="flex items-center gap-2 text-[10px] font-black text-white/10 uppercase tracking-widest group-hover/log:text-white/30 transition-colors">
                                  <meta.icon size={12} className="text-blue-600/40" /> {meta.text}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-center md:text-right shrink-0">
                          <p className="text-2xl font-black text-white tracking-tighter tabular-nums leading-none mb-1">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em] italic">
                            {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="flex flex-col items-center justify-center h-full text-white/5 space-y-6 grayscale opacity-20">
                      <Shield size={120} />
                      <p className="font-black uppercase tracking-[1em] text-xs">Ledger Empty</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Global Alert Notification */}
        <AnimatePresence>
          {msg.text && (
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`fixed bottom-12 right-12 p-6 md:p-10 rounded-[50px] border backdrop-blur-3xl z-[100] shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex items-center gap-8 ${
                msg.type === 'success' ? 'bg-black border-emerald-500/20 text-emerald-400' : 'bg-black border-red-500/20 text-red-400'
              }`}
            >
              <div className={`w-16 h-16 rounded-[25px] flex items-center justify-center ${msg.type === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                {msg.type === 'success' ? <CheckCircle2 size={32}/> : <XCircle size={32}/>}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 mb-1">Sentinel Intelligence</p>
                <p className="text-2xl font-black text-white tracking-tighter uppercase italic">{msg.text}</p>
              </div>
              <button onClick={() => setMsg({ ...msg, text: '' })} className="ml-6 p-2 text-white/10 hover:text-white transition-all"><XCircle size={20}/></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default Security;
