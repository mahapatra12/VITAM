import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const BASES = 'ACGT'; // adenine, cytosine, guanine, thymine (institutional data bases)
const BASE_COLORS = { A: '#3b82f6', C: '#10b981', G: '#a855f7', T: '#eab308' };
const BASE_LABELS = { A: 'Attendance', C: 'Collections', G: 'Governance', T: 'Treasury' };

const STRAND_LENGTH = 32;

function generateStrand() {
  return Array.from({ length: STRAND_LENGTH }, () => BASES[Math.floor(Math.random() * 4)]);
}

function mutate(strand) {
  return strand.map(b => Math.random() < 0.06 ? BASES[Math.floor(Math.random() * 4)] : b);
}

export default function DataGenomeSequencer({ className = '' }) {
  const [strand, setStrand] = useState(generateStrand);
  const [history, setHistory] = useState([]);
  const [mutations, setMutations] = useState(0);
  const [readHead, setReadHead] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setStrand(prev => {
        const next = mutate(prev);
        const diffs = next.filter((b, i) => b !== prev[i]).length;
        if (diffs > 0) setMutations(m => m + diffs);
        setHistory(h => {
          const entry = next.join('').slice(0, 16) + '...';
          return [...h.slice(-4), { seq: entry, t: new Date().toLocaleTimeString() }];
        });
        return next;
      });
      setReadHead(h => (h + 1) % STRAND_LENGTH);
    }, 500);
    return () => clearInterval(id);
  }, [isRunning]);

  const baseCount = BASES.split('').reduce((acc, b) => {
    acc[b] = strand.filter(x => x === b).length;
    return acc;
  }, {});

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[9px] font-black text-purple-400 uppercase tracking-[0.4em] mb-0.5">Institutional Genome Engine</p>
          <h3 className="text-lg font-black text-white tracking-tighter uppercase italic">Data Genome Sequencer</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right mr-2">
            <p className="text-[7px] font-black text-slate-600 uppercase">Mutations</p>
            <p className="text-sm font-black text-purple-400">{mutations}</p>
          </div>
          <button
            onClick={() => setIsRunning(r => !r)}
            className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${isRunning ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-500'}`}
          >
            {isRunning ? '● Running' : '◼ Paused'}
          </button>
        </div>
      </div>

      {/* Main strand display */}
      <div className="p-4 bg-black/50 rounded-2xl border border-white/5 mb-4 overflow-x-auto">
        <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-2">Primary Data Strand · {STRAND_LENGTH}bp</p>
        <div className="flex gap-1 min-w-max">
          {strand.map((base, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              {/* Read head indicator */}
              <div className={`w-0.5 h-1.5 rounded-full transition-all duration-300 ${i === readHead ? 'bg-white opacity-100' : 'opacity-0'}`} />
              {/* Base cell */}
              <motion.div
                key={`${i}-${base}`}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="w-5 h-6 rounded-md flex items-center justify-center font-black text-[9px] cursor-default"
                style={{
                  backgroundColor: `${BASE_COLORS[base]}20`,
                  border: `1px solid ${BASE_COLORS[base]}50`,
                  color: BASE_COLORS[base],
                  boxShadow: i === readHead ? `0 0 8px ${BASE_COLORS[base]}60` : '',
                }}
                title={`Position ${i}: ${BASE_LABELS[base]}`}
              >
                {base}
              </motion.div>
              {/* Position tick every 4 */}
              {i % 4 === 0 && (
                <span className="text-[5px] font-mono text-slate-700">{i}</span>
              )}
            </div>
          ))}
        </div>

        {/* Complementary strand */}
        <div className="flex gap-1 min-w-max mt-1">
          {strand.map((base, i) => {
            const comp = { A: 'T', T: 'A', C: 'G', G: 'C' }[base];
            return (
              <div key={i} className="w-5 h-5 rounded-sm flex items-center justify-center font-black text-[7px]"
                style={{ color: `${BASE_COLORS[comp]}50` }}>
                {comp}
              </div>
            );
          })}
        </div>
        <p className="text-[6px] font-mono text-slate-700 mt-1">↑ Complementary Strand</p>
      </div>

      {/* Base frequency bars */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {BASES.split('').map(b => {
          const pct = (baseCount[b] / STRAND_LENGTH) * 100;
          return (
            <div key={b} className="text-center">
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-1">
                <motion.div
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: BASE_COLORS[b] }}
                />
              </div>
              <p className="text-[6px] font-black uppercase tracking-widest" style={{ color: BASE_COLORS[b] }}>{b} · {pct.toFixed(0)}%</p>
              <p className="text-[5px] text-slate-700 uppercase">{BASE_LABELS[b].slice(0,4)}</p>
            </div>
          );
        })}
      </div>

      {/* Sequence log */}
      <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
        <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-2">Sequence Log</p>
        <div className="space-y-1 font-mono text-[7px]">
          {history.map((h, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-600">
              <span className="text-slate-700">{h.t}</span>
              <span className="text-purple-500/60 tracking-wider">{h.seq}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
