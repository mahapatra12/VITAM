import { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, X, CheckCheck, Sparkles, Activity, ShieldCheck, Menu, Clock, Eye, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';


const MOCK_NOTIFICATIONS = [
  { id: 1, text: 'Sovereign Sync Complete: Alaric Sovereign_A7', time: '2 min ago', read: false, type: 'sync' },
  { id: 2, text: 'HOD approved Security Ledger update', time: '1 hr ago', read: false, type: 'admin' },
  { id: 3, text: 'Anomaly Detected: APEX-401 Node Access', time: '3 hr ago', read: true, type: 'alert' },
  { id: 4, text: 'Sovereign Manifest v9.4 published', time: 'Yesterday', read: true, type: 'update' },
];

const Navbar = ({ title = "Student Portal", onMenuClick, onCommsClick }) => {
  const { user, impersonateRole } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const displayName = user?.name || 'Vitam Scholar';
  const displayRole = user?.role ? user.role.toUpperCase() : 'SCHOLAR';

  const handleImpersonate = (targetRole) => {
    if (impersonateRole && window.confirm(`Switch to ${targetRole} View?`)) {
      impersonateRole(targetRole);
      setTimeout(() => window.location.href = `/${targetRole.toLowerCase()}/dashboard`, 100);
    }
  };

  return (
    <div className="h-20 fixed top-0 left-0 lg:left-64 right-0 z-50 px-6 md:px-10 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-3xl transition-all">
      
      <div className="flex items-center gap-4 md:gap-6">
         <button 
           onClick={onMenuClick}
           className="p-3 text-apple-text-secondary dark:text-white/30 hover:text-appleBlue dark:hover:text-white lg:hidden transition-all bg-black/5 dark:bg-white/5 rounded-2xl"
         >
           <Menu size={22} />
         </button>
         <div className="w-[1px] h-6 bg-black/10 dark:bg-white/10 hidden lg:block" />
         <h2 className="text-[10px] md:text-sm font-black text-apple-text-secondary dark:text-white/50 tracking-[0.2em] md:tracking-[0.4em] uppercase italic truncate max-w-[120px] md:max-w-none"> {title} </h2>
      </div>
      
      <div className="flex items-center gap-4 md:gap-10">
        
        {/* Sovereign Search */}
        <div className="relative group hidden lg:block">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-apple-text-secondary dark:text-white/20 group-focus-within:text-appleBlue transition-all" size={16} />
          <input 
            type="text" 
            placeholder="Search Portal..." 
            className="h-11 pl-12 pr-6 w-64 xl:w-80 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-[22px] text-xs font-bold text-apple-text-primary dark:text-white focus:bg-black/10 dark:focus:bg-white/10 focus:ring-4 focus:ring-appleBlue/20 transition-all outline-none placeholder:text-apple-text-secondary/50 dark:placeholder:text-white/10"
          />
        </div>
        
        <div className="flex items-center gap-2 md:gap-6 pr-2 md:pr-6 border-r border-white/5">
           
           <div className="relative" ref={notifRef}>
             <motion.button 
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               onClick={onCommsClick}
               className="relative p-3 text-apple-text-secondary dark:text-white/30 hover:text-indigo-400 dark:hover:text-indigo-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-black/5 dark:hover:border-white/5 mr-2"
             >
               <MessageSquare size={20} />
             </motion.button>

             <motion.button 
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               onClick={() => setShowNotif(p => !p)}
               className="relative p-3 text-apple-text-secondary dark:text-white/30 hover:text-appleBlue dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-black/5 dark:hover:border-white/5"
             >
               <Bell size={20} />
               {unreadCount > 0 && (
                 <span className="absolute top-2 right-2 w-2 h-2 bg-appleBlue rounded-full shadow-[0_0_10px_#0071e3] animate-pulse"></span>
               )}
             </motion.button>

             <AnimatePresence>
               {showNotif && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
                   animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                   exit={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
                   className="absolute right-0 top-16 w-80 md:w-96 bg-[#0a0a0a] rounded-[35px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden z-50 p-2"
                 >
                   <div className="flex items-center justify-between px-8 py-6">
                     <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">System Notifications</h4>
                     <div className="flex gap-4">
                       <button onClick={() => setShowNotif(false)} className="text-white/20 hover:text-white transition-all"><X size={16}/></button>
                     </div>
                   </div>
                   <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-hide">
                     {notifications.map(n => (
                       <div key={n.id} className={`px-8 py-6 rounded-[25px] hover:bg-white/5 transition-all group ${!n.read ? 'bg-appleBlue/5' : ''}`}>
                         <div className="flex gap-5 items-start">
                           <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${!n.read ? 'bg-appleBlue shadow-[0_0_8px_#0071e3]' : 'bg-white/10'} shrink-0`} />
                           <div className="space-y-1">
                             <p className={`text-xs text-white/80 leading-relaxed ${!n.read ? 'font-black' : 'font-bold'}`}>{n.text}</p>
                             <p className="text-[9px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                                 <Clock size={10} /> {n.time}
                               </p>
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>

             {/* Role Impersonation Dropdown (God Mode) */}
             {(user?.role === 'CHAIRMAN' || user?.role === 'DIRECTOR' || user?.role === 'ADMIN') && (
               <div className="relative group ml-2">
                 <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all">
                   <Eye size={14} /> View As
                 </button>
                 <div className="absolute right-0 top-12 w-48 bg-[#0a0a0a] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0 z-50">
                   <div className="p-2 space-y-1">
                     <p className="px-3 py-2 text-[9px] uppercase tracking-widest text-slate-500 font-bold border-b border-white/5 mb-2">Impersonate Role</p>
                     {['HOD', 'FACULTY', 'STUDENT', 'ALUMNI', 'PARENT'].map(r => (
                       <button 
                         key={r}
                         onClick={() => handleImpersonate(r)}
                         className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 transition-all hover:text-white"
                       >
                         {r} Portal
                       </button>
                     ))}
                   </div>
                 </div>
               </div>
             )}
             
          </div>

          <motion.div 
           whileHover={{ x: -10 }}
           className="flex items-center gap-4 transition-all group cursor-pointer"
        >
          <div className="text-right hidden sm:block">
            <p className="text-[10px] md:text-xs font-black text-apple-text-primary dark:text-white tracking-widest uppercase group-hover:text-appleBlue transition-colors">{displayName}</p>
            <div className="flex items-center gap-2 justify-end">
               <ShieldCheck size={10} className="text-appleBlue" />
               <p className="text-[8px] md:text-[9px] text-apple-text-secondary dark:text-white/30 font-black uppercase tracking-[0.3em]">{displayRole}</p>
            </div>
          </div>
          <div className="relative">
             <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br from-appleBlue to-purple-600 flex items-center justify-center border border-white/20 overflow-hidden shadow-xl group-hover:shadow-appleBlue/20 transition-all">
                <span className="text-xs md:text-sm font-black text-white relative z-10">{displayName[0]}</span>
             </div>
             <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-3.5 md:h-3.5 bg-emerald-500 rounded-lg border-[3px] md:border-4 border-[#020202] shadow-[0_0_10px_#10b981]" />
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Navbar;
