import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Zap, Phone, MapPin, Briefcase, Award,
  X, Command, Hash, ChevronRight, Sparkles, Filter, Globe, Box,
  Terminal, User, Calendar, Search
} from 'lucide-react';

const SEARCH_DATA = [
  // Modules
  { id: 'm1', type: 'page', title: 'Institutional Dashboard', path: '/admin/dashboard', icon: Zap, category: 'Navigation' },
  { id: 'm7', type: 'page', title: 'Executive Command', path: '/admin/executive', icon: Sparkles, category: 'Management' },
  { id: 'm8', type: 'page', title: 'Predictive Success Hub', path: '/admin/predictive', icon: Zap, category: 'Strategic' },
  { id: 'm9', type: 'page', title: 'Resource Efficiency Hub', path: '/admin/resources', icon: Globe, category: 'Management' },
  { id: 'm10', type: 'page', title: 'Asset Management', path: '/admin/assets', icon: Box, category: 'Management' },
  { id: 'm2', type: 'page', title: 'Student ID Card', path: '/id-card', icon: ShieldCheck, category: 'Identity' },
  
  // Quick Actions
  { id: 'q1', type: 'action', title: 'Generate Digital ID', shortcut: '/id', icon: Terminal, category: 'Quick Protocol' },
  { id: 'q2', type: 'action', title: 'Track Active Bus', shortcut: '/transit', icon: MapPin, category: 'Quick Protocol' },
  { id: 'q3', type: 'action', title: 'SOS/Emergency Alert', shortcut: '/sos', icon: Zap, category: 'Security' },
  
  // Example Contextual Results (Mock)
  { id: 's1', type: 'student', title: 'Rahul Sharma (CS2022045)', path: '/admin/users', icon: User, category: 'Students' },
  { id: 'f1', type: 'faculty', title: 'Dr. Arpita Roy (HOD CSE)', path: '/hod/faculty', icon: User, category: 'Faculty' },
  { id: 'e1', type: 'event', title: 'Tech Summit 2026', path: '/events', icon: Calendar, category: 'Events' },
];

export default function CommandHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const filteredResults = SEARCH_DATA.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = useCallback((item) => {
    if (item.type === 'page' || item.type === 'student' || item.type === 'faculty' || item.type === 'event') {
      navigate(item.path);
    }
    setIsOpen(false);
    setQuery('');
  }, [navigate]);

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === '/') {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsOpen(false)} />
          
          <motion.div initial={{ scale: 0.95, y: -20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: -20, opacity: 0 }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
            
            {/* Search Header */}
            <div className="p-6 border-b border-white/5 flex items-center gap-4">
               <Search size={22} className="text-indigo-500" />
               <input autoFocus value={query} onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
                 placeholder="Search institutional ecosystem... (Students, Events, Modules)"
                 className="flex-1 bg-transparent border-none text-white focus:outline-none text-lg font-bold placeholder:text-slate-700" />
               <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-black text-slate-500 uppercase">ESC</span>
               </div>
            </div>

            {/* Results Section */}
            <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
               {filteredResults.length > 0 ? (
                 <div className="space-y-6">
                    {/* Unique Categories */}
                    {[...new Set(filteredResults.map(r => r.category))].map(cat => (
                      <div key={cat} className="space-y-2">
                         <div className="px-4 flex items-center gap-2">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{cat}</span>
                            <div className="h-px flex-1 bg-white/5" />
                         </div>
                         {filteredResults.filter(r => r.category === cat).map((item, idx) => (
                            <button key={item.id} onClick={() => handleSelect(item)}
                              className={`w-full flex items-center justify-between p-4 rounded-[1.5rem] transition-all group ${
                                query && idx === 0 ? 'bg-indigo-500 text-white shadow-xl' : 'hover:bg-white/5 text-slate-400'
                              }`}>
                               <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                    query && idx === 0 ? 'bg-white/20' : 'bg-white/5 text-indigo-400 group-hover:text-white'
                                  }`}>
                                     <item.icon size={20} />
                                  </div>
                                  <div className="text-left">
                                     <p className={`text-sm font-black uppercase tracking-tight ${query && idx === 0 ? 'text-white' : 'text-slate-300'}`}>{item.title}</p>
                                     <p className={`text-[10px] font-bold uppercase mt-0.5 ${query && idx === 0 ? 'text-indigo-100' : 'text-slate-600'}`}>
                                        {item.type === 'action' ? item.shortcut : item.path}
                                     </p>
                                  </div>
                               </div>
                               <ChevronRight size={16} className={`transition-transform group-hover:translate-x-1 ${query && idx === 0 ? 'opacity-100' : 'opacity-0'}`} />
                            </button>
                         ))}
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-700 mb-4 animate-pulse"><X size={32}/></div>
                    <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">No matching results found</h4>
                    <p className="text-[10px] text-slate-700 mt-1 font-bold">Try searching for "Events", "Hostel", or "Bus 201".</p>
                 </div>
               )}
            </div>

            {/* Footer Control */}
            <div className="p-4 bg-[#080808] border-t border-white/5 flex items-center justify-between">
               <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                     <div className="px-1.5 py-0.5 rounded bg-white/10 text-[8px] font-black text-slate-400">↑↓</div>
                     <span className="text-[8px] font-black text-slate-600 uppercase">Navigate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <div className="px-1.5 py-0.5 rounded bg-white/10 text-[8px] font-black text-slate-400">ENTER</div>
                     <span className="text-[8px] font-black text-slate-600 uppercase">Execute</span>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <Hash size={12} className="text-indigo-500" />
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Enterprise Command Hub V1.0</span>
               </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
