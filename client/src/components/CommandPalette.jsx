import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Map, Users, Settings, BookOpen, Shield, Cpu, Bus, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ACTIONS = [
  { id: 'dash-principal', label: 'Go to Principal Dashboard', icon: Shield, route: '/principal' },
  { id: 'dash-hod', label: 'Go to HOD Dashboard', icon: Map, route: '/hod' },
  { id: 'dash-finance', label: 'Go to Finance Dashboard', icon: Cpu, route: '/finance' },
  { id: 'dash-faculty', label: 'Go to Faculty Dashboard', icon: BookOpen, route: '/faculty' },
  { id: 'dash-exam', label: 'Go to Exam Department', icon: Settings, route: '/exam' },
  { id: 'dash-bus', label: 'Go to Bus Management', icon: Bus, route: '/bus' },
  { id: 'action-search', label: 'Search Students Directory', icon: Users, isAction: true },
];

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
        else document.dispatchEvent(new CustomEvent('open-command-palette'));
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filtered = ACTIONS.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (action) => {
    if (action.route) {
      navigate(action.route);
    } else {
      alert('Action executed: ' + action.label);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-xl bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden relative z-10 flex flex-col"
          >
            {/* Input Header */}
            <div className="flex items-center px-4 py-4 border-b border-slate-700/50">
              <Search size={22} className="text-slate-400 mr-3" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search... (Ctrl+K)"
                className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-slate-500 font-medium"
              />
              <button onClick={onClose} className="p-1 text-slate-500 hover:text-white transition-colors bg-slate-800 rounded-md ml-2">
                <X size={16} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[300px] overflow-y-auto p-2">
              {filtered.length > 0 ? (
                filtered.map((action, i) => (
                  <button
                    key={action.id}
                    onClick={() => handleSelect(action)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800 focus:bg-slate-800 rounded-xl group transition-all text-left outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-blue-500/20 group-hover:text-blue-400 flex items-center justify-center text-slate-400 transition-colors">
                        <action.icon size={16} />
                      </div>
                      <span className="text-sm font-black text-slate-300 group-hover:text-white transition-colors">
                        {action.label}
                      </span>
                    </div>
                    <ArrowRight size={14} className="text-slate-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                ))
              ) : (
                <div className="px-4 py-10 text-center">
                  <p className="text-slate-500 text-sm font-medium">No commands found for "{query}"</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-slate-800/50 border-t border-slate-700/50 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">VITAM OS</span>
              <div className="flex gap-2 text-[10px] text-slate-400 font-bold">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600">↑</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600">↓</span>
                <span>to navigate</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 ml-2">↵</span>
                <span>to select</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
