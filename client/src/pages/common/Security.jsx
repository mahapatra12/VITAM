import React, { useState, useEffect, useRef } from 'react';
import { 
  Fingerprint, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Smartphone, 
  History, 
  Lock, 
  Activity,
  MapPin,
  Globe,
  Radio,
  Zap,
  Cpu,
  ShieldCheck,
  Eye,
  Terminal,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import DashboardLayout from '../../layouts/DashboardLayout';

const CryptographicRain = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
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
      ctx.fillStyle = '#0071e3';
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
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-20 z-0" />;
};

const SecurityPage = () => {
  const { user, registerBiometrics } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState({ isBiometricEnabled: true, isTwoFactorEnabled: false, deviceCount: 0 });
  const [toast, setToast] = useState({ show: false, type: '', text: '' });
  const [showConfirm, setShowConfirm] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [identityScore, setIdentityScore] = useState({ score: 98, status: 'OPTIMAL', recommendation: 'Sovereign Link Synchronized. No threat vectors detected.' });
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    fetchSecurityData();
    const timer = setTimeout(() => setIsScanning(false), 2000);
    return () => clearTimeout(timer);
  }, [user.id || user._id]);

  const handleToggleMFA = async (type) => {
    const newVal = type === 'biometric' ? !settings.isBiometricEnabled : !settings.isTwoFactorEnabled;
    const update = type === 'biometric' 
      ? { isBiometricEnabled: newVal } 
      : { isTwoFactorEnabled: newVal };

    try {
      const uid = user?.id || user?._id;
      await api.post('/auth/update-security-settings', { 
        userId: uid, 
        ...update 
      });
      setSettings(prev => ({ ...prev, ...update }));
      showToast('success', `Security protocol ${type.toUpperCase()} modified.`);
      fetchSecurityData();
    } catch (err) {
      showToast('error', 'Protocol update failed.');
    }
  };

  const showToast = (type, text) => {
    setToast({ show: true, type, text });
    setTimeout(() => setToast({ show: false, type: '', text: '' }), 4000);
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const uid = user?.id || user?._id;
      const success = await registerBiometrics(uid);
      if (success) {
        showToast('success', 'Sovereign identity seed registered.');
        fetchSecurityData();
      }
    } catch (err) {
      showToast('error', 'Handshake failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePanicMode = async () => {
    setIsRevoking(true);
    try {
      const uid = user?.id || user?._id;
      await api.post('/auth/revoke-all-sessions', { userId: uid });
      showToast('success', 'INSTITUTIONAL BLACKOUT COMPLETE.');
      setShowConfirm(false);
      fetchSecurityData();
    } catch (err) {
      showToast('error', 'Shutdown sequence interrupted.');
    } finally {
      setIsRevoking(false);
    }
  };

  const handleDownloadAudit = () => {
    showToast('success', 'Generating cryptographic manifest...');
  };

  const [sessions, setSessions] = useState([]);

  const fetchSecurityData = async () => {
    try {
      const uid = user?.id || user?._id;
      const [logRes, settingsRes, scoreRes] = await Promise.all([
        api.get(`/auth/security-logs/${uid}`),
        api.get(`/auth/get-security-settings/${uid}`),
        api.get(`/auth/get-identity-score/${uid}`)
      ]);
      setLogs(logRes.data);
      setSettings(settingsRes.data);
      setSessions(settingsRes.data.sessions || []);
      setIdentityScore(scoreRes.data);
    } catch (err) { console.error(err); }
  };

  const handleRevokeSession = async (sid) => {
    try {
      await api.post('/auth/revoke-session', { userId: user.id || user._id, sessionId: sid });
      showToast('success', `Session liquidated.`);
      fetchSecurityData();
    } catch (err) { showToast('error', 'Revocation failed.'); }
  };

  return (
    <DashboardLayout title="Security Settings" role="STUDENT">
      <div className="relative min-h-screen pb-32">
        {isScanning && <div className="scanning-intro" />}
        <CryptographicRain />
        
        {/* Top-Level Intelligence Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-12 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]" />
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-emerald-500/60">Sentinel Intelligence: Synchronized</span>
            </div>
            <h2 className="text-fluid-huge text-white">
              Account <span className="text-appleBlue drop-shadow-[0_0_20px_rgba(0,113,227,0.4)]">Security</span>
            </h2>
            <p className="text-white/30 font-bold uppercase tracking-[0.4em] text-[11px]">Manage your account protection and login history</p>
          </div>

          <div className="flex items-center gap-6 md:gap-12 w-full md:w-auto justify-end">
             <div className="text-right p-6 md:p-8 bg-white/5 rounded-[30px] md:rounded-[40px] border border-white/5 backdrop-blur-xl flex-1 md:flex-none">
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-apple-text-secondary dark:text-white/30 mb-2">Integrity Score</p>
                <div className="flex items-center gap-2 md:gap-3 justify-end">
                   <p className="text-4xl md:text-6xl font-black italic tracking-tighter text-appleBlue tabular-nums">{identityScore.score}%</p>
                   <ShieldCheck size={24} className="text-appleBlue" />
                </div>
             </div>
             <motion.button 
               whileHover={{ scale: 1.1, rotate: 90 }}
               whileTap={{ scale: 0.9 }}
               onClick={() => setShowConfirm(true)}
               className="w-16 h-16 md:w-24 md:h-24 bg-red-500/10 border border-red-500/20 rounded-[25px] md:rounded-[35px] flex items-center justify-center hover:bg-red-500 transition-all group shadow-2xl"
             >
                <Zap size={24} className="md:w-8 md:h-8 text-red-500 group-hover:text-white" />
             </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
          
          {/* Main Control Cluster */}
          <div className="lg:col-span-8 space-y-12">
             
             {/* Integrity Manifold Cluster */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               
               <motion.div className="hyper-monolith p-12 bg-[#050505] overflow-hidden group">
                  <div className="flex justify-between items-start mb-12">
                     <div className="w-16 h-16 bg-appleBlue/10 rounded-2xl flex items-center justify-center text-appleBlue group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                        <Cpu size={32} />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Manifold Status</span>
                  </div>
                  <h3 className="text-2xl md:text-4xl font-black tracking-tight uppercase text-white mb-6">Security <span className="text-appleBlue text-xl md:text-2xl">Status</span></h3>
                  <div className="p-6 md:p-8 bg-white/5 rounded-[30px] md:rounded-[40px] border border-white/5 italic">
                     <p className="text-[10px] md:text-xs text-white/50 leading-relaxed font-bold uppercase tracking-widest">
                        "{identityScore.recommendation}"
                     </p>
                  </div>
                  <div className="mt-12 flex gap-3 h-20 items-end px-2">
                     {[...Array(16)].map((_, i) => (
                       <motion.div 
                         key={i} 
                         initial={{ height: 0 }} 
                         animate={{ height: `${20 + Math.random() * 80}%` }} 
                         transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.05 }}
                         className="flex-1 bg-appleBlue/20 rounded-t-full shadow-[0_0_10px_rgba(0,113,227,0.2)]" 
                       />
                     ))}
                  </div>
               </motion.div>

               <div className="hyper-monolith p-12 bg-[#050505] flex flex-col h-[520px]">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xl font-black uppercase italic tracking-widest text-white/40">Active Nodes</h3>
                    <div className="px-6 py-2 bg-appleBlue rounded-full text-[10px] font-black text-white shadow-lg shadow-appleBlue/20">
                       {sessions.length} UNITS
                    </div>
                  </div>
                  <div className="space-y-6 flex-1 overflow-y-auto pr-4 scrollbar-hide">
                    {sessions.map((sess, i) => (
                      <motion.div 
                        key={sess.id} 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: i * 0.1 }} 
                        className="p-8 bg-white/[0.03] rounded-[40px] border border-white/5 flex justify-between items-center group/session hover:bg-white/[0.08] transition-all cursor-default shadow-xl"
                      >
                        <div className="flex items-center gap-6">
                           <div className="p-4 bg-white/5 rounded-2xl text-white/20 group-hover/session:text-appleBlue group-hover/session:bg-appleBlue/10 transition-all">
                              <Shield size={20} />
                           </div>
                           <div>
                             <p className="text-base font-black tracking-tight text-white">{sess.device}</p>
                             <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em] mt-1">{sess.location} • {sess.ip}</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => handleRevokeSession(sess.id)} 
                          className="w-12 h-12 flex items-center justify-center text-red-500 bg-red-500/10 rounded-2xl opacity-0 group-hover/session:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-lg shadow-red-500/20"
                        >
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
               </div>
             </div>

             {/* Protocol Configuration */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {[
                 { label: 'Biometric Login', state: settings.isBiometricEnabled, type: 'biometric', icon: Fingerprint, desc: 'Use fingerprint or face recognition for faster access.' },
                 { label: 'Two-Factor Auth', state: settings.isTwoFactorEnabled, type: 'totp', icon: Smartphone, desc: 'Enable secondary authentication for your account.' }
               ].map((item, i) => (
                 <motion.div 
                   key={i} 
                   whileHover={{ y: -5 }}
                   className="hyper-monolith p-12 bg-[#050505] flex flex-col justify-between group cursor-pointer"
                 >
                   <div className="flex justify-between items-start mb-12">
                     <div className={`w-16 h-16 md:w-24 md:h-24 rounded-[25px] md:rounded-[35px] flex items-center justify-center transition-all duration-700 ${item.state ? 'bg-appleBlue text-white shadow-[0_0_50px_rgba(0,113,227,0.5)] scale-110' : 'bg-white/[0.02] text-white/20 border border-white/5'}`}>
                       <item.icon className="w-8 h-8 md:w-10 md:h-10" />
                     </div>
                     <div 
                       onClick={() => handleToggleMFA(item.type)} 
                       className={`w-20 h-10 md:w-28 md:h-14 rounded-full p-1.5 md:p-2 transition-all duration-700 ${item.state ? 'bg-appleBlue' : 'bg-white/[0.05] border border-white/10'} flex items-center`}
                     >
                       <motion.div animate={{ x: item.state ? (window.innerWidth < 768 ? 40 : 56) : 0 }} className="w-7 h-7 md:w-10 md:h-10 bg-white rounded-full shadow-2xl shadow-black/50" />
                     </div>
                   </div>
                   <div>
                      <h4 className="text-3xl font-black italic tracking-tighter mb-4 text-white uppercase">{item.label}</h4>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.4em] leading-relaxed italic">{item.desc}</p>
                   </div>
                 </motion.div>
               ))}
             </div>
          </div>

          {/* High-Resolution Intelligence Feed */}
          <div className="lg:col-span-4">
             <div className="hyper-monolith rounded-[80px] p-0 overflow-hidden border border-white/10 h-[950px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex flex-col bg-[#020202]/90 backdrop-blur-3xl group/feed">
                
                {/* Feed Header */}
                 <div className="p-12 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/[0.02] relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-r from-appleBlue/30 to-transparent opacity-0 group-hover/feed:opacity-100 transition-opacity duration-1000" />
                   <div className="relative z-10 space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-apple-text-secondary dark:text-white/40 flex items-center gap-4">
                         <Terminal size={14} className="text-appleBlue" />
                         Manifest Stream
                       </h4>
                       <p className="text-[9px] font-black text-emerald-500 tracking-widest uppercase italic shadow-emerald-500/20 shadow-sm">Node Status: Pristine</p>
                    </div>
                   <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="relative z-10">
                      <Radio size={24} className="text-appleBlue/20" />
                   </motion.div>
                </div>

                {/* Audit Grid */}
                <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide">
                  {logs.map((log, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 30 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: i * 0.05 }}
                      className="space-y-6 group/log relative"
                    >
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'SYNCHRONIZING'}</span>
                          <span className={`text-[9px] font-black px-6 py-1.5 rounded-full uppercase tracking-[0.5em] border ${
                            log.status === 'CRITICAL' ? 'border-red-500/50 text-red-500 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/10 text-white/30'
                          }`}>{log.status}</span>
                       </div>
                       <h5 className="text-2xl font-black tracking-tighter text-white group-hover/log:text-appleBlue transition-colors uppercase italic">{log.event.replace('AI', 'Apex')}</h5>
                       <div className="p-8 bg-white/[0.03] rounded-[40px] border border-white/5 group-hover/log:bg-white/[0.08] transition-all shadow-xl">
                          <p className="text-[12px] text-white/40 font-bold font-mono leading-relaxed">{log.details}</p>
                       </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer Action */}
                <div className="p-12 bg-white/[0.03] border-t border-white/5">
                    <motion.button 
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownloadAudit} 
                      className="w-full py-10 bg-white text-black rounded-[50px] font-black uppercase tracking-[0.6em] text-[11px] shadow-[0_30px_80px_rgba(255,255,255,0.15)] transition-all flex items-center justify-center gap-4 group"
                    >
                       Commit Manifest
                       <div className="w-2 h-2 rounded-full bg-appleBlue animate-pulse" />
                    </motion.button>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Modal: Institutional Blackout */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-12">
            <motion.div initial={{ scale: 0.8, rotate: -3 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.8 }} className="bg-[#020202] border border-red-500/20 rounded-[120px] p-32 max-w-4xl w-full text-center relative overflow-hidden group shadow-[0_0_150px_rgba(239,68,68,0.2)]">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_20px_#ef4444]" />
              <div className="w-48 h-48 rounded-full border-2 border-red-500/20 flex items-center justify-center mx-auto mb-20 relative shadow-2xl">
                 <Lock size={80} className="text-red-500" />
                 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 15, ease: "linear" }} className="absolute inset-[-30px] border-4 border-dashed border-red-500/10 rounded-full" />
              </div>
              <h2 className="text-4xl md:text-8xl font-black text-white tracking-tighter mb-8 md:mb-10 uppercase leading-none">Security <span className="text-red-500">Reset</span></h2>
              <p className="text-base md:text-2xl text-white/30 font-bold mb-12 md:mb-20 leading-relaxed max-w-2xl mx-auto">
                 Signing out of all sessions will terminate all active connections to your account across all devices.
              </p>
              <div className="flex gap-10">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-10 rounded-[50px] bg-white/5 text-white font-black uppercase tracking-widest text-[12px] border border-white/10 hover:bg-white/10 transition-all">Abort Protocol</button>
                <button onClick={handlePanicMode} disabled={isRevoking} className="flex-1 py-10 rounded-[50px] bg-red-500 text-white font-black uppercase tracking-widest text-[12px] shadow-[0_30px_100px_rgba(239,68,68,0.5)] hover:scale-105 transition-all">
                   {isRevoking ? 'PURGING...' : 'EXECUTE PURGE'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast: Protocol Manifest */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: 100, x: 50 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }} className="fixed bottom-16 right-16 z-[200] p-1.5 rounded-[55px] bg-gradient-to-br from-appleBlue to-purple-600 shadow-4xl">
             <div className="px-16 py-10 bg-black rounded-[50px] flex items-center gap-10 border border-white/10">
                <div className={`w-16 h-16 rounded-[25px] flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-500 shadow-[0_0_30px_#10b981]' : 'bg-red-500 shadow-[0_0_30px_#ef4444]'}`}>
                    <CheckCircle2 size={32} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white/30 italic mb-1">Sentinel Update</span>
                  <span className="text-3xl font-black text-white tracking-tighter uppercase italic">{toast.text.replace('AI', 'Apex')}</span>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
};

export default SecurityPage;
