import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Terminal, ChevronRight, X, Maximize2 } from 'lucide-react';

const COMMANDS = {
  'status':       { response: 'VITAM Phase 13 ONLINE · Strategic Alignment ACTIVE · All nodes: SYNC ACTIVE · Variance: 0.01ms', color: '#10b981' },
  'nodes':        { response: 'Active: CSE [99.1%] · ECE [87.4%] · MECH [76.2%] · CIVIL [78.8%] · Core nodes: STRAT_LAB, RES_CORE (2027)', color: '#3b82f6' },
  'finance':      { response: 'Institutional Reserve: ₹14.2Cr · Pending: ₹1.8Cr · Audit Alignment: COMMITTED · Flow Delta: +₹2.1Cr', color: '#fbbf24' },
  'predict':      { response: 'Q3 Enrollment: 4,250 (Strategic α, 94% confidence) · NIRF Rank Δ: +3 positions · ROI Vector: +12.4%', color: '#818cf8' },
  'variance':     { response: 'Variance Index: 0.01ms · Sync active on MECH · Suppression rate: 99.97% · System reset: OK', color: '#f59e0b' },
  'alignment':    { response: 'Convergence: 99.4% · Maturity State: T+30D · Optimization: T+90D · Consensus lock: ACHIEVED', color: '#6366f1' },
  'help':         { response: 'Commands: status · nodes · finance · predict · variance · alignment · clear · help', color: '#94a3b8' },
  'clear':        { response: '__CLEAR__', color: '' },
};

const BOOT_SEQUENCE = [
  { text: '> Initializing VITAM Institutional Terminal v13.0...', delay: 0 },
  { text: '> Loading Strategic Grid drivers...', delay: 400 },
  { text: '> System coherence: LOCKED', delay: 700 },
  { text: '> Institutional ledger sync: OK', delay: 1000 },
  { text: '> Phase 13 Strategic Alignment: ACTIVE', delay: 1400 },
  { text: '> Type "help" for command list.', delay: 1800 },
];

function SineWave({ isListening }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const t = useRef(0);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = 48;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      if (!isListening) {
        // flat idle line
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(59,130,246,0.2)';
        ctx.lineWidth = 1;
        ctx.moveTo(0, H / 2);
        ctx.lineTo(W, H / 2);
        ctx.stroke();
        frameRef.current = requestAnimationFrame(draw);
        return;
      }
      t.current += 0.08;
      ctx.beginPath();
      const points = 80;
      for (let i = 0; i <= points; i++) {
        const x = (i / points) * W;
        const noise = Math.sin(t.current * 3 + i * 0.4) * 6;
        const y = H / 2 + Math.sin(t.current + i * 0.25) * (14 + noise);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, '#3b82f6');
      grad.addColorStop(0.5, '#8b5cf6');
      grad.addColorStop(1, '#10b981');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 8;
      ctx.stroke();
      frameRef.current = requestAnimationFrame(draw);
    };

    if (!contextLost) draw();

    const handleCtxLost = (e) => {
      e.preventDefault();
      setContextLost(true);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };

    const handleCtxRestored = () => {
      setContextLost(false);
      draw();
    };

    canvas.addEventListener('contextlost', handleCtxLost);
    canvas.addEventListener('contextrestored', handleCtxRestored);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      canvas.removeEventListener('contextlost', handleCtxLost);
      canvas.removeEventListener('contextrestored', handleCtxRestored);
    };
  }, [isListening, contextLost]);

  return (
    <div className="relative w-full h-12">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {contextLost && (
        <div className="absolute inset-x-0 bottom-0 text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded text-center animate-pulse">
          Waveform Context Lost
        </div>
      )}
    </div>
  );
}

function TypewriterText({ text, color, onDone }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) { clearInterval(id); onDone?.(); }
    }, 18);
    return () => clearInterval(id);
  }, [text]);
  return <span style={{ color }}>{displayed}<span className="animate-pulse">▊</span></span>;
}

export default function InstitutionalVoiceTerminal() {
  const [history, setHistory] = useState([]);
  const [input, setInput]     = useState('');
  const [isListening, setIsListening] = useState(false);
  const [booted, setBooted]   = useState(false);
  const [minimized, setMinimized] = useState(false);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  // Boot sequence
  useEffect(() => {
    let timeout;
    const bootLines = [];
    BOOT_SEQUENCE.forEach(({ text, delay }) => {
      timeout = setTimeout(() => {
        setHistory(prev => [...prev, { type: 'boot', text, color: '#475569' }]);
        if (delay === 1800) setBooted(true);
      }, delay);
    });
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const runCommand = useCallback((cmd) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;

    setHistory(prev => [...prev, { type: 'input', text: `> ${cmd}`, color: '#60a5fa' }]);

    const def = COMMANDS[trimmed];
    if (!def) {
      setHistory(prev => [...prev, { type: 'output', text: `Command not found: "${cmd}". Type "help".`, color: '#ef4444' }]);
    } else if (def.response === '__CLEAR__') {
      setHistory([]);
    } else {
      setHistory(prev => [...prev, { type: 'output', text: def.response, color: def.color }]);
    }
    setInput('');
  }, []);

  const simulateVoice = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const cmds = Object.keys(COMMANDS).filter(k => k !== 'clear' && k !== 'help');
      const cmd = cmds[Math.floor(Math.random() * cmds.length)];
      setInput(cmd);
      setTimeout(() => runCommand(cmd), 300);
    }, 2200);
  };

  return (
    <div className={`flex flex-col bg-black/80 border border-blue-500/20 rounded-3xl overflow-hidden backdrop-blur-2xl transition-all duration-500 ${minimized ? 'h-16' : 'h-[480px]'}`}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-black/40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 animate-pulse" />
          </div>
          <Terminal size={12} className="text-blue-500" />
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] italic leading-none">Institutional AI Command v13</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.3em] italic">● SYNC ACTIVE</span>
          <button onClick={() => setMinimized(m => !m)} className="text-slate-600 hover:text-white transition-all ml-1">
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Output area */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 custom-scrollbar font-mono text-[10px] leading-relaxed">
            {history.map((line, i) => (
              <div key={i} style={{ color: line.color }} className={line.type === 'input' ? 'opacity-80' : ''}>
                {line.type === 'output' && i === history.length - 1
                  ? <TypewriterText text={line.text} color={line.color} />
                  : line.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="px-5 pt-3 bg-black/20 border-t border-white/5">
            <SineWave isListening={isListening} />
          </div>

          {/* Input row */}
          <div className="flex items-center gap-3 px-5 py-3 border-t border-white/5 bg-black/40 flex-shrink-0">
            <ChevronRight size={14} className="text-blue-500 flex-shrink-0" />
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') runCommand(input); }}
              disabled={!booted || isListening}
              placeholder={isListening ? 'Awaiting Voice Input...' : 'Enter System Directive...'}
              className="flex-1 bg-transparent text-blue-400 text-[10px] font-mono font-black outline-none placeholder-slate-800 disabled:opacity-40 uppercase italic"
            />
            <button
              onClick={simulateVoice}
              disabled={!booted || isListening}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500/30 border border-red-500/50' : 'bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/40'} disabled:opacity-30`}
            >
              <Mic size={12} className={isListening ? 'text-red-400 animate-pulse' : 'text-blue-400'} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
