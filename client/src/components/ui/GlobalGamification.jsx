import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Zap, Star, Shield, Crown, Trophy, Target, TrendingUp, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROLE_ACHIEVEMENTS = {
  STUDENT: [
    { id: 1, title: 'Institutional Presence', desc: '100% presence for a 30-day academic cycle', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { id: 2, title: 'Academic Excellence', desc: 'Achieved > 95% across critical curriculum metrics', icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ],
  FACULTY: [
    { id: 3, title: 'Instructional Velocity', desc: 'Processed 100 assessments within optimized timeframe', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 4, title: 'Instructional Rating', desc: 'Maintained a 4.9/5 faculty evaluation score', icon: Crown, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ],
  HOD: [
    { id: 5, title: 'Departmental Optimization', desc: 'Minimized syllabus variance across all sections', icon: Target, color: 'text-red-400', bg: 'bg-red-400/10' },
  ],
  ADMIN: [
    { id: 6, title: 'System Resilience', desc: 'Maintained 99.99% infrastructure availability', icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  ],
  PARENT: [
    { id: 7, title: 'Ledger Optimization', desc: 'Cleared institutional ledger obligations proactively', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ],
  CHAIRMAN: [
    { id: 8, title: 'Institutional Leadership', desc: 'Increased organizational growth trajectory by 10%', icon: Crown, color: 'text-amber-400', bg: 'bg-amber-400/10' }
  ],
  DIRECTOR: [
    { id: 9, title: 'Strategic Execution', desc: 'Delivered institutional milestones within the cycle', icon: Shield, color: 'text-sky-400', bg: 'bg-sky-400/10' }
  ],
  ALUMNI: [
    { id: 10, title: 'Institutional Legacy', desc: 'Supported campus initiatives via alumni engagement', icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-400/10' }
  ]
};

const hashString = (value = '') => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 2147483647;
  }
  return Math.abs(hash);
};

const resolveAchievementKey = (user) => {
  const role = String(user?.role || '').toUpperCase();
  const subRole = String(user?.subRole || '').toUpperCase();

  if (role === 'ADMIN' && subRole === 'HOD') {
    return 'HOD';
  }

  if (ROLE_ACHIEVEMENTS[role]) {
    return role;
  }

  if (ROLE_ACHIEVEMENTS[subRole]) {
    return subRole;
  }

  return 'STUDENT';
};

export default function GlobalGamification() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [credits, setCredits] = useState(0);

  const achievementKey = useMemo(() => resolveAchievementKey(user), [user]);
  const achievements = ROLE_ACHIEVEMENTS[achievementKey] || ROLE_ACHIEVEMENTS.STUDENT;
  const rank = useMemo(() => {
    const seed = hashString(`${user?.email || 'guest'}:${achievementKey}`);
    return (seed % 100) + 1;
  }, [achievementKey, user?.email]);

  useEffect(() => {
    if (!user) {
      setIsOpen(false);
      setCredits(0);
      return undefined;
    }

    const targetCredits = Math.floor(Math.random() * 5000) + 1200;
    let current = 0;
    const interval = setInterval(() => {
      current += 40;
      if (current >= targetCredits) {
        setCredits(targetCredits);
        clearInterval(interval);
      } else {
        setCredits(current);
      }
    }, 10);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  const tier = Math.floor(credits / 1000) + 1;
  const creditProgress = (credits % 1000) / 10;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#0a0a0a]/80 border border-white/10 p-3.5 rounded-full shadow-2xl hover:bg-white/10 transition-all group backdrop-blur-3xl"
      >
        <div className="relative">
          <Award size={24} className="text-blue-500 group-hover:scale-110 transition-transform" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-[#0a0a0a] animate-pulse" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-[#050505]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl z-50 flex flex-col"
          >
            <div className="relative p-8 border-b border-white/5 overflow-hidden">
               <div className="absolute inset-0 bg-blue-500/5 opacity-50" />
               <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                 <X size={18} />
               </button>
               
               <div className="relative z-10 flex items-center gap-5">
                 <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shadow-inner relative overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-blue-500/10 blur-xl" />
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 italic">
                      T{tier}
                    </span>
                 </div>
                 <div>
                   <h3 className="text-sm font-black text-white uppercase tracking-widest leading-tight italic">{user.name}</h3>
                   <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1 italic">Institutional Standing: #{rank}</p>
                 </div>
               </div>
               
               <div className="mt-8 relative z-10">
                  <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 italic">
                    <span>{credits.toLocaleString()} Credits</span>
                    <span>Tier Plateau: {((tier) * 1000).toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${creditProgress}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                    />
                  </div>
               </div>
            </div>

            <div className="p-8 overflow-y-auto max-h-[50vh] custom-scroll">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-6 flex items-center gap-2 italic">
                 <Trophy size={14} className="text-blue-500/60" /> {achievementKey} Milestones
               </h4>
               
               <div className="space-y-4">
                 {achievements.map((badge, idx) => (
                   <motion.div 
                     key={badge.id}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: idx * 0.1 }}
                     className="flex items-start gap-5 p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group"
                   >
                     <div className={`mt-0.5 w-12 h-12 rounded-2xl ${badge.bg} border border-white/5 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                       <badge.icon size={20} className={badge.color} />
                     </div>
                     <div>
                       <h5 className="text-xs font-black text-white italic">{badge.title}</h5>
                       <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed font-bold italic">{badge.desc}</p>
                       <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 italic">
                         Synchronized
                       </div>
                     </div>
                   </motion.div>
                 ))}
                 
                 <div className="opacity-40 grayscale flex items-start gap-5 p-5 rounded-3xl bg-white/[0.01] border border-white/5 border-dashed">
                     <div className="mt-0.5 w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0">
                       <LockIcon size={20} className="text-slate-600" />
                     </div>
                     <div>
                       <h5 className="text-xs font-black text-slate-600 italic">Institutional Objective Pending</h5>
                       <p className="text-[10px] text-slate-700 mt-1.5 font-bold italic">Requirements not yet verified.</p>
                     </div>
                 </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const LockIcon = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);
