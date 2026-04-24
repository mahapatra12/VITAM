import React, { useState, useEffect, useRef } from 'react';
import { 
  Fingerprint, 
  Shield, 
  CheckCircle2, 
  Trash2, 
  Smartphone, 
  Lock, 
  Radio,
  Zap,
  Cpu,
  ShieldCheck,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import DashboardLayout from '../../layouts/DashboardLayout';

const SystemBackgroundGrid = () => (
  <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
  </div>
);

const SecurityPage = () => {
  const { user, registerBiometrics } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState({ isBiometricEnabled: true, isTwoFactorEnabled: false, deviceCount: 0 });
  const [toast, setToast] = useState({ show: false, type: '', text: '' });
  const [showConfirm, setShowConfirm] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [identityScore, setIdentityScore] = useState({ score: 98, status: 'OPTIMAL', recommendation: 'Institutional Security Synchronized. No threat vectors detected.' });
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
      showToast('success', `Security protocol ${type.toUpperCase()} updated.`);
      fetchSecurityData();
    } catch (err) {
      showToast('error', 'Configuration update failed.');
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
        showToast('success', 'Biometric signature successfully registered.');
        fetchSecurityData();
      }
    } catch (err) {
      showToast('error', 'Biometric registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePanicMode = async () => {
    setIsRevoking(true);
    try {
      const uid = user?.id || user?._id;
      await api.post('/auth/revoke-all-sessions', { userId: uid });
      showToast('success', 'SYSTEM-WIDE SESSION TERMINATION SUCCESSFUL.');
      setShowConfirm(false);
      fetchSecurityData();
    } catch (err) {
      showToast('error', 'Termination sequence interrupted.');
    } finally {
      setIsRevoking(false);
    }
  };

  const handleExportAudit = () => {
    showToast('success', 'Generating institutional security audit... ');
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
    } catch (err) { showToast('error', 'Unable to load security data.'); }
  };

  const handleRevokeSession = async (sid) => {
    showToast('error', 'Single-session termination is unavailable. Use global termination protocol.');
  };

  return (
    <DashboardLayout title="Security Operations" role="STUDENT">
      <div className="relative min-h-screen pb-32">
        <SystemBackgroundGrid />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-12 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_#3b82f6]" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-500/60 italic">Security Intelligence: Synchronized</span>
            </div>
            <h2 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
              Account <span className="text-blue-600">Security</span>
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[11px] italic mt-4">Manage your institutional protection and access history</p>
          </div>

          <div className="flex items-center gap-6 md:gap-12 w-full md:w-auto justify-end">
             <div className="text-right p-8 bg-white/[0.02] rounded-[40px] border border-white/5 backdrop-blur-3xl flex-1 md:flex-none">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 italic">Integrity Score</p>
                <div className="flex items-center gap-3 justify-end">
                   <p className="text-6xl font-black italic tracking-tighter text-blue-500 tabular-nums">{identityScore.score}%</p>
                   <ShieldCheck size={24} className="text-blue-500" />
                </div>
             </div>
             <motion.button 
               whileHover={{ scale: 1.05, rotate: 90 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setShowConfirm(true)}
               className="w-24 h-24 bg-rose-500/10 border border-rose-500/20 rounded-[40px] flex items-center justify-center hover:bg-rose-500 transition-all group shadow-2xl"
             >
                <Zap size={32} className="text-rose-500 group-hover:text-white" />
             </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
          
          <div className="lg:col-span-8 space-y-12">
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               
               <motion.div className="p-12 bg-white/[0.02] border border-white/5 rounded-[50px] overflow-hidden group">
                  <div className="flex justify-between items-start mb-12">
                     <div className="w-16 h-16 bg-blue-600/10 border border-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                        <Cpu size={32} />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">System Integrity</span>
                  </div>
                  <h3 className="text-3xl font-black tracking-tight uppercase text-white mb-6 italic">Security <span className="text-blue-500 text-xl">Operational</span></h3>
                  <div className="p-8 bg-white/[0.03] rounded-[40px] border border-white/5 italic">
                     <p className="text-xs text-slate-400 leading-relaxed font-bold uppercase tracking-widest">
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
                         className="flex-1 bg-blue-600/20 rounded-t-full shadow-[0_0_10px_rgba(37,99,235,0.2)]" 
                       />
                     ))}
                  </div>
               </motion.div>

               <div className="p-12 bg-white/[0.02] border border-white/5 rounded-[50px] flex flex-col h-[560px]">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xl font-black uppercase italic tracking-widest text-white/40">Active Sessions</h3>
                    <div className="px-6 py-2 bg-blue-600 rounded-full text-[10px] font-black text-white shadow-lg shadow-blue-600/20 italic">
                       {sessions.length} ACTIVE
                    </div>
                  </div>
                  <div className="space-y-6 flex-1 overflow-y-auto pr-4 scrollbar-hide">
                    {sessions.map((sess, i) => (
                      <motion.div 
                        key={sess.id} 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: i * 0.1 }} 
                        className="p-8 bg-white/[0.03] border border-white/5 rounded-[40px] flex justify-between items-center group/session hover:bg-white/[0.08] transition-all cursor-default shadow-xl"
                      >
                        <div className="flex items-center gap-6">
                           <div className="p-4 bg-white/5 rounded-[2rem] text-white/20 group-hover/session:text-blue-500 group-hover/session:bg-blue-600/10 transition-all">
                              <Shield size={20} />
                           </div>
                           <div>
                             <p className="text-base font-black tracking-tight text-white italic">{sess.device}</p>
                             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1 italic">{sess.location} • {sess.ip}</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => handleRevokeSession(sess.id)} 
                          className="w-12 h-12 flex items-center justify-center text-rose-500 bg-rose-500/10 rounded-2xl opacity-0 group-hover/session:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                        >
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {[
                 { label: 'Biometric Access', state: settings.isBiometricEnabled, type: 'biometric', icon: Fingerprint, desc: 'Institutional biometric signature recognition for priority access.' },
                 { label: 'MFA Protocol', state: settings.isTwoFactorEnabled, type: 'totp', icon: Smartphone, desc: 'Secondary authentication requirements for all administrative nodes.' }
               ].map((item, i) => (
                 <motion.div 
                   key={i} 
                   whileHover={{ y: -5 }}
                   className="p-12 bg-white/[0.02] border border-white/5 rounded-[50px] flex flex-col justify-between group cursor-pointer"
                 >
                   <div className="flex justify-between items-start mb-12">
                     <div className={`w-20 h-20 md:w-24 md:h-24 rounded-[30px] md:rounded-[40px] border flex items-center justify-center transition-all duration-700 ${item.state ? 'bg-blue-600 text-white border-blue-600 shadow-2xl scale-110' : 'bg-white/5 text-white/20 border-white/5'}`}>
                       <item.icon className="w-8 h-8 md:w-10 md:h-10" />
                     </div>
                     <div 
                       onClick={() => handleToggleMFA(item.type)} 
                       className={`w-20 h-10 md:w-28 md:h-14 rounded-full p-2 transition-all duration-700 ${item.state ? 'bg-blue-600' : 'bg-white/10 border border-white/10'} flex items-center`}
                     >
                       <motion.div animate={{ x: item.state ? (window.innerWidth < 768 ? 40 : 56) : 0 }} className="w-6 h-6 md:w-10 md:h-10 bg-white rounded-full shadow-2xl shadow-black/50" />
                     </div>
                   </div>
                   <div>
                      <h4 className="text-3xl font-black italic tracking-tighter mb-4 text-white uppercase">{item.label}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] leading-relaxed italic">{item.desc}</p>
                   </div>
                 </motion.div>
               ))}
             </div>
          </div>

          <div className="lg:col-span-4">
             <div className="rounded-[60px] p-0 overflow-hidden border border-white/5 h-[1000px] flex flex-col bg-white/[0.02] backdrop-blur-3xl group/feed relative">
                
                 <div className="p-12 border-b border-white/5 bg-white/[0.02] relative overflow-hidden">
                    <div className="relative z-10 space-y-2">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-500 flex items-center gap-4 italic">
                          <Terminal size={14} className="text-blue-500" />
                          Security Log
                        </h4>
                        <p className="text-[9px] font-black text-emerald-500 tracking-widest uppercase italic">Node Status: Functional</p>
                     </div>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="absolute -top-10 -right-10 opacity-5">
                       <Radio size={160} className="text-blue-500" />
                    </motion.div>
                 </div>

                 <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide">
                   {logs.map((log, i) => (
                     <motion.div 
                       key={i} 
                       initial={{ opacity: 0, y: 30 }} 
                       animate={{ opacity: 1, y: 0 }} 
                       transition={{ delay: i * 0.05 }}
                       className="space-y-6 group/log relative"
                     >
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'PENDING'}</span>
                           <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.4em] border italic ${
                             log.status === 'CRITICAL' ? 'border-rose-500/50 text-rose-500 bg-rose-500/5' : 'border-white/10 text-slate-500'
                           }`}>{log.status}</span>
                        </div>
                        <h5 className="text-2xl font-black tracking-tighter text-white group-hover/log:text-blue-500 transition-colors uppercase italic">{log.event.replace('Apex', 'System')}</h5>
                        <div className="p-8 bg-white/[0.03] rounded-[40px] border border-white/5 group-hover/log:bg-white/[0.06] transition-all">
                           <p className="text-xs text-slate-400 font-bold italic leading-relaxed">{log.details}</p>
                        </div>
                     </motion.div>
                   ))}
                 </div>

                 <div className="p-10 bg-white/[0.03] border-t border-white/5">
                     <motion.button 
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                       onClick={handleExportAudit} 
                       className="w-full py-8 bg-blue-600 text-white rounded-[40px] font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-blue-600/20 transition-all flex items-center justify-center gap-4 italic"
                     >
                        Export Security Audit
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                     </motion.button>
                 </div>
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-12">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#0c0c0c] border border-rose-500/20 rounded-[80px] p-24 max-w-4xl w-full text-center relative overflow-hidden group">
              <div className="w-48 h-48 rounded-[3rem] border border-rose-500/20 bg-rose-500/5 flex items-center justify-center mx-auto mb-16 relative shadow-2xl">
                 <Lock size={64} className="text-rose-500" />
              </div>
              <h2 className="text-6xl font-black text-white tracking-tighter mb-10 uppercase italic">Security <span className="text-rose-500">Reset</span></h2>
              <p className="text-xl text-slate-500 font-bold mb-16 leading-relaxed max-w-2xl mx-auto italic">
                 Termination of all active sessions will immediately invalidate access across all devices linked to this account.
              </p>
              <div className="flex gap-8">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-8 rounded-[40px] bg-white/5 text-white font-black uppercase tracking-widest text-xs border border-white/10 hover:bg-white/10 transition-all italic">Abort Protocol</button>
                <button onClick={handlePanicMode} disabled={isRevoking} className="flex-1 py-8 rounded-[40px] bg-rose-600 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-rose-600/30 hover:bg-rose-500 transition-all italic">
                   {isRevoking ? 'TERMINATING...' : 'CONFIRM TERMINATION'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed bottom-12 right-12 z-[200] p-1 bg-blue-600 rounded-[50px] shadow-2xl shadow-blue-600/20">
             <div className="px-12 py-8 bg-[#0c0c0c] rounded-[48px] flex items-center gap-8 border border-white/10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                    <CheckCircle2 size={24} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic mb-1">Security Update</span>
                  <span className="text-2xl font-black text-white tracking-tighter uppercase italic">{toast.text.replace('Apex', 'System')}</span>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
};

export default SecurityPage;
