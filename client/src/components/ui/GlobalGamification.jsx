import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Zap, Star, Shield, Crown, Trophy, Target, TrendingUp, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROLE_ACHIEVEMENTS = {
  STUDENT: [
    { id: 1, title: 'Perfect Attendance', desc: '100% presence for 30 consecutive days', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { id: 2, title: 'Top Percentile', desc: 'Achieved > 95% across all core matrix subjects', icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ],
  FACULTY: [
    { id: 3, title: 'Grading Speed Demon', desc: 'Cleared 100 assignments in under 24 hours', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 4, title: 'Student Favorite', desc: 'Maintained a 4.9/5 satisfaction quotient', icon: Crown, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ],
  HOD: [
    { id: 5, title: 'Department Optimizer', desc: 'Reduced syllabus lag to 0% across all sections', icon: Target, color: 'text-red-400', bg: 'bg-red-400/10' },
  ],
  ADMIN: [
    { id: 6, title: 'Zero Downtime', desc: 'Maintained 99.99% matrix uptime', icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  ],
  PARENT: [
    { id: 7, title: 'Early Funder', desc: 'Cleared institutional ledger 15 days early', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ],
  CHAIRMAN: [
    { id: 8, title: 'Visionary Leader', desc: 'Increased global revenue trajectory by 10%', icon: Crown, color: 'text-amber-400', bg: 'bg-amber-400/10' }
  ]
};

export default function GlobalGamification() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [xp, setXp] = useState(0);

  // Animate XP count on load
  useEffect(() => {
    if (!user) return;
    const targetXp = Math.floor(Math.random() * 5000) + 1200;
    let current = 0;
    const interval = setInterval(() => {
      current += 40;
      if (current >= targetXp) {
        setXp(targetXp);
        clearInterval(interval);
      } else {
        setXp(current);
      }
    }, 10);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  // Fallback to student achievements if role not specifically mapped
  const achievements = ROLE_ACHIEVEMENTS[user.role] || ROLE_ACHIEVEMENTS['STUDENT'];
  const level = Math.floor(xp / 1000) + 1;
  const xpProgress = (xp % 1000) / 10;

  return (
    <>
      {/* HUD Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#0a0a0a] border border-white/10 p-3 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:bg-white/5 transition-all group overflow-hidden flex items-center gap-3 backdrop-blur-md"
      >
        <div className="relative">
          <Award size={24} className="text-yellow-500 group-hover:scale-110 transition-transform" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-[#0a0a0a] animate-pulse" />
        </div>
      </button>

      {/* Gamification HUD Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-[#050505]/95 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-white/5 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-purple-500/10 opacity-50" />
               <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                 <X size={16} />
               </button>
               
               <div className="relative z-10 flex items-center gap-4">
                 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shadow-inner relative overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-yellow-500/20 blur-xl" />
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                      L{level}
                    </span>
                 </div>
                 <div>
                   <h3 className="text-sm font-black text-white uppercase tracking-widest leading-tight">{user.name}</h3>
                   <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mt-1">Global Ranking: #{Math.floor(Math.random() * 100) + 1}</p>
                 </div>
               </div>
               
               {/* XP Bar */}
               <div className="mt-5 relative z-10">
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    <span>{xp.toLocaleString()} XP</span>
                    <span>Next Level: {((level) * 1000).toLocaleString()} XP</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" 
                    />
                  </div>
               </div>
            </div>

            {/* Badges List */}
            <div className="p-6 overflow-y-auto max-h-[60vh] custom-scroll">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                 <Trophy size={12} /> {user.role} Milestones
               </h4>
               
               <div className="space-y-3">
                 {achievements.map((badge, idx) => (
                   <motion.div 
                     key={badge.id}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: idx * 0.1 }}
                     className="flex items-start gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
                   >
                     <div className={`mt-0.5 w-10 h-10 rounded-xl ${badge.bg} border border-white/5 flex items-center justify-center flex-shrink-0 shadow-inner`}>
                       <badge.icon size={18} className={badge.color} />
                     </div>
                     <div>
                       <h5 className="text-xs font-black text-white">{badge.title}</h5>
                       <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{badge.desc}</p>
                       <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                         Unlocked
                       </div>
                     </div>
                   </motion.div>
                 ))}
                 
                 {/* Locked Badges Mockup */}
                 <div className="opacity-50 grayscale flex items-start gap-4 p-3 rounded-2xl bg-white/[0.01] border border-white/5 border-dashed">
                     <div className="mt-0.5 w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center flex-shrink-0">
                       <LockIcon size={18} className="text-slate-500" />
                     </div>
                     <div>
                       <h5 className="text-xs font-black text-slate-400">Classified Objective</h5>
                       <p className="text-[10px] text-slate-500 mt-1">Requirements not yet met.</p>
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
