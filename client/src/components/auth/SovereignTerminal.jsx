import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ChevronRight, X, Maximize2, Minimize2 } from 'lucide-react';
import { institutionalAudio } from '../../utils/InstitutionalAudio';

const SovereignTerminal = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState([
    { type: 'info', text: 'VITAM Sovereign Terminal v8.0.4' },
    { type: 'info', text: 'Establishing secure REPL link...' },
    { type: 'success', text: 'Institutional Bridge: ONLINE' }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const handleCommand = (e) => {
    if (e.key !== 'Enter') {
      if (e.key.length === 1) institutionalAudio.playBeep(880, 0.02);
      return;
    }
    
    const cmd = input.trim().toLowerCase();
    institutionalAudio.playPulse(0.1);
    setHistory(prev => [...prev, { type: 'cmd', text: `> ${input}` }]);
    
    const response = processCommand(cmd);
    if (response) setHistory(prev => [...prev, response]);
    setInput('');
  };

  const processCommand = (cmd) => {
    switch (cmd) {
      case 'drone':
        setHistory(prev => [...prev, { type: 'info', text: 'INITIALIZING AUTONOMOUS AI DRONE...' }, { type: 'info', text: 'STATUS: SCANNING HUD WIDGETS...' }]);
        return null;
      case 'chaos':
        setHistory(prev => [...prev, { type: 'error', text: 'WARNING: SOVEREIGN CHAOS SUITE ENGAGED.' }, { type: 'error', text: 'INJECTING PROTOCOL VULNERABILITIES...' }]);
        return null;
      case 'help': return { type: 'info', text: 'Available: audit, sync, whoami, clear, lockdown, status, drone, chaos' };
      case 'whoami': return { type: 'success', text: `Subject: ${user?.name || 'Authorized Admin'} // Role: ${user?.role || 'Apex'}` };
      case 'audit': return { type: 'info', text: 'Scanning logs... 98/98 Integrity Score maintained. No anomalies detected.' };
      case 'sync': 
        institutionalAudio.playSuccess();
        return { type: 'success', text: 'Synchronizing hardware nodes... Complete.' };
      case 'status': return { type: 'info', text: 'MEM: 44.2% // CPU: 12.0% // CRYPTO: OPTIMAL' };
      case 'lockdown': 
        institutionalAudio.playWarning();
        return { type: 'error', text: 'Lockout protocol requires dual-node confirmation. Aborted.' };
      case 'clear': 
        setHistory([]);
        return null;
      default: return { type: 'error', text: `Unknown identifier: ${cmd}` };
    }
  };

  return (
    <>
      <div className="fixed bottom-10 right-10 z-[1000]">
         <button 
           onClick={() => { setIsOpen(!isOpen); institutionalAudio.playPulse(0.2); }}
           className={`w-16 h-16 rounded-3xl border transition-all flex items-center justify-center shadow-2xl ${
             isOpen ? 'bg-blue-600 border-blue-400 text-white' : 'bg-black/60 border-white/5 text-blue-500 hover:bg-white/5'
           }`}
         >
           {isOpen ? <X /> : <Terminal />}
         </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-32 right-10 w-full max-w-lg h-[400px] bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden z-[1000] ring-1 ring-blue-500/20"
          >
             <div className="bg-white/5 px-8 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Terminal size={14} className="text-blue-500" />
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">Sovereign Terminal</span>
                </div>
                <div className="flex gap-2">
                   <div className="w-2 h-2 rounded-full bg-red-500/20" />
                   <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                   <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                </div>
             </div>

             <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto font-mono text-[11px] space-y-3 scrollbar-hide">
                {history.map((line, i) => line && (
                  <div key={i} className={`flex gap-3 ${
                    line.type === 'error' ? 'text-red-500' : 
                    line.type === 'success' ? 'text-emerald-500 shadow-emerald-500/10' : 
                    line.type === 'cmd' ? 'text-blue-500 font-black' : 'text-slate-400'
                  }`}>
                    {line.type === 'cmd' ? null : <ChevronRight size={10} className="mt-1" />}
                    <span className="leading-relaxed">{line.text}</span>
                  </div>
                ))}
             </div>

             <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center gap-4">
                <ChevronRight size={14} className="text-blue-500" />
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleCommand}
                  autoFocus
                  placeholder="Awaiting Command..."
                  className="bg-transparent border-none outline-none w-full font-mono text-white text-[12px] placeholder:text-white/5 tracking-wider"
                />
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SovereignTerminal;
