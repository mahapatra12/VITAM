import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Clock, CheckCircle2, XCircle, ChevronRight,
  ChevronLeft, Trophy, AlertTriangle, BarChart2, RotateCcw, Zap
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const AVAILABLE_QUIZZES = [
  {
    id: 'QZ-001',
    title: 'DSA Unit 3 – Trees & Graphs',
    subject: 'CS301 – Data Structures',
    duration: 20, // minutes
    questions: [
      { id: 1, text: 'Which data structure is used in BFS traversal?', options: ['Stack', 'Queue', 'Heap', 'Tree'], correct: 1 },
      { id: 2, text: 'What is the time complexity of binary search?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(n log n)'], correct: 2 },
      { id: 3, text: 'In a min-heap, the root contains:', options: ['Maximum element', 'Minimum element', 'Random element', 'Last inserted element'], correct: 1 },
      { id: 4, text: 'Which traversal visits: Left → Root → Right?', options: ['Pre-order', 'Post-order', 'In-order', 'Level-order'], correct: 2 },
      { id: 5, text: 'The number of edges in a complete graph with n vertices is:', options: ['n(n-1)', 'n(n-1)/2', 'n²', 'n-1'], correct: 1 },
      { id: 6, text: "Dijkstra's algorithm is used for:", options: ['Sorting', 'Shortest path', 'Minimum spanning tree', 'Cycle detection'], correct: 1 },
      { id: 7, text: 'AVL tree maintains a balance factor of:', options: ['-2 to 2', '-1 to 1', '0 to 1', 'Any'], correct: 1 },
      { id: 8, text: 'What is the height of a balanced binary tree with n nodes?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correct: 2 },
      { id: 9, text: 'DFS uses which auxiliary data structure?', options: ['Queue', 'Stack', 'Linked List', 'Array'], correct: 1 },
      { id: 10, text: 'A tree with n nodes has how many edges?', options: ['n', 'n+1', 'n-1', '2n'], correct: 2 },
    ],
  },
  {
    id: 'QZ-002',
    title: 'OS Mid-Sem Revision',
    subject: 'CS401 – Operating Systems',
    duration: 30,
    questions: [
      { id: 1, text: 'Which scheduling algorithm is non-preemptive by default?', options: ['Round Robin', 'FCFS', 'SRTF', 'Priority Preemptive'], correct: 1 },
      { id: 2, text: 'A process in the "waiting" state is waiting for:', options: ['CPU', 'An I/O event', 'Memory', 'User input'], correct: 1 },
      { id: 3, text: 'Thrashing occurs when:', options: ['Too many processes', 'Page faults are frequent', 'CPU is idle', 'Memory is abundant'], correct: 1 },
      { id: 4, text: 'Which page replacement algorithm has Belady\'s anomaly?', options: ['LRU', 'Optimal', 'FIFO', 'LFU'], correct: 2 },
      { id: 5, text: 'A semaphore with value = 1 acts as a:', options: ['Counting semaphore', 'Binary semaphore/Mutex', 'Spinlock', 'Monitor'], correct: 1 },
    ],
  },
];

function TimerRing({ secondsLeft, totalSeconds }) {
  const pct = secondsLeft / totalSeconds;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const isWarning = pct < 0.25;
  const color = pct > 0.5 ? '#10b981' : pct > 0.25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <motion.circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circ}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 0.8, ease: 'easeOut' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className={`text-lg font-black tabular-nums ${isWarning ? 'text-red-400' : 'text-white'}`}>
          {String(Math.floor(secondsLeft / 60)).padStart(2,'0')}:{String(secondsLeft % 60).padStart(2,'0')}
        </p>
        <p className="text-[8px] text-slate-500 uppercase tracking-widest">left</p>
      </div>
    </div>
  );
}

export default function StudentQuizzes() {
  const { user } = useAuth();
  const { push } = useToast();
  const [phase, setPhase] = useState('list'); // list | taking | results
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [results, setResults] = useState(null);
  const timerRef = useRef(null);

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setCurrentQ(0);
    setSecondsLeft(quiz.duration * 60);
    setPhase('taking');
  };

  useEffect(() => {
    if (phase === 'taking') {
      timerRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) { clearInterval(timerRef.current); submitQuiz(true); return 0; }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const submitQuiz = (autoSubmit = false) => {
    clearInterval(timerRef.current);
    const total = activeQuiz.questions.length;
    let correct = 0;
    const breakdown = activeQuiz.questions.map(q => {
      const chosen = answers[q.id];
      const isCorrect = chosen === q.correct;
      if (isCorrect) correct++;
      return { ...q, chosen, isCorrect };
    });
    const score = Math.round((correct / total) * 100);
    setResults({ total, correct, wrong: total - correct, score, breakdown, autoSubmit });
    setPhase('results');
    push({
      type: score >= 75 ? 'success' : score >= 50 ? 'info' : 'warning',
      title: `Quiz Submitted${autoSubmit ? ' (Time Up)' : ''}`,
      body: `You scored ${correct}/${total} — ${score}%`,
    });
  };

  const q = activeQuiz?.questions[currentQ];

  return (
    <DashboardLayout title="My Quizzes" role={user?.role || 'STUDENT'}>
      {/* ─── Quiz List ─── */}
      {phase === 'list' && (
        <>
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <ClipboardList size={28} className="text-indigo-500" /> Online Assessments
            </h2>
            <p className="text-slate-400 mt-1">Faculty-assigned quizzes with live timer and instant auto-grading.</p>
          </div>
          <div className="space-y-4">
            {AVAILABLE_QUIZZES.map((quiz, i) => (
              <motion.div key={quiz.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="p-6 rounded-3xl bg-[#080808] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <ClipboardList size={24} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors">{quiz.title}</h3>
                    <p className="text-sm text-indigo-400 font-bold mt-0.5">{quiz.subject}</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={10} /> {quiz.duration} min</span>
                      <span className="flex items-center gap-1"><ClipboardList size={10} /> {quiz.questions.length} questions</span>
                      <span className="flex items-center gap-1"><Zap size={10} /> Auto-graded</span>
                    </div>
                  </div>
                  <button onClick={() => startQuiz(quiz)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] flex-shrink-0">
                    Start <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* ─── Quiz Taking ─── */}
      {phase === 'taking' && activeQuiz && q && (
        <div className="max-w-2xl mx-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-black text-white">{activeQuiz.title}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">{activeQuiz.subject}</p>
            </div>
            <TimerRing secondsLeft={secondsLeft} totalSeconds={activeQuiz.duration * 60} />
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 bg-white/5 rounded-full mb-6 overflow-hidden">
            <motion.div animate={{ width: `${((currentQ + 1) / activeQuiz.questions.length) * 100}%` }}
              transition={{ duration: 0.4 }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="p-6 rounded-3xl bg-[#080808] border border-white/5 mb-5">
              <div className="flex items-start gap-3 mb-6">
                <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 text-indigo-400 text-[10px] font-black border border-indigo-500/20 flex-shrink-0">
                  Q{currentQ + 1}/{activeQuiz.questions.length}
                </span>
                <p className="text-base font-black text-white leading-relaxed">{q.text}</p>
              </div>
              <div className="space-y-3">
                {q.options.map((opt, oi) => {
                  const chosen = answers[q.id];
                  const isChosen = chosen === oi;
                  return (
                    <motion.button key={oi} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                        isChosen
                          ? 'bg-indigo-500/15 border-indigo-500/50 text-white'
                          : 'bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.04]'
                      }`}>
                      <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center flex-shrink-0 font-black text-xs transition-all ${
                        isChosen ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-white/20 text-slate-500'
                      }`}>
                        {String.fromCharCode(65 + oi)}
                      </div>
                      <span className="text-sm font-bold">{opt}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="flex items-center justify-between">
            <button onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-30 hover:bg-white/10 transition-colors">
              <ChevronLeft size={14} /> Previous
            </button>
            <div className="text-[10px] text-slate-500 flex gap-1">
              {activeQuiz.questions.map((_, i) => (
                <button key={i} onClick={() => setCurrentQ(i)}
                  className={`w-6 h-6 rounded-md font-bold transition-all ${currentQ === i ? 'bg-indigo-500 text-white' : answers[activeQuiz.questions[i].id] !== undefined ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
            {currentQ < activeQuiz.questions.length - 1 ? (
              <button onClick={() => setCurrentQ(q => q + 1)}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500/20 transition-colors">
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button onClick={() => submitQuiz()}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                Submit <CheckCircle2 size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Results ─── */}
      {phase === 'results' && results && (
        <div className="max-w-2xl mx-auto">
          {/* Score Hero */}
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className={`p-8 rounded-3xl border mb-6 text-center ${
              results.score >= 75 ? 'bg-emerald-500/5 border-emerald-500/20'
              : results.score >= 50 ? 'bg-amber-500/5 border-amber-500/20'
              : 'bg-red-500/5 border-red-500/20'
            }`}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, delay: 0.2 }}>
              <Trophy size={48} className={`mx-auto mb-4 ${results.score >= 75 ? 'text-emerald-400' : results.score >= 50 ? 'text-amber-400' : 'text-red-400'}`} />
            </motion.div>
            <p className="text-6xl font-black text-white mb-1">{results.score}<span className="text-2xl text-slate-400">%</span></p>
            <p className={`text-lg font-black mb-2 ${results.score >= 75 ? 'text-emerald-400' : results.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {results.score >= 75 ? 'Excellent Work!' : results.score >= 50 ? 'Good Effort' : 'Needs Improvement'}
            </p>
            <p className="text-slate-400 text-sm">{results.correct} correct · {results.wrong} wrong out of {results.total} questions</p>
            {results.autoSubmit && (
              <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5 inline-flex mx-auto">
                <AlertTriangle size={10} /> Auto-submitted when time expired
              </div>
            )}
          </motion.div>

          {/* Q-by-Q breakdown */}
          <div className="space-y-2 mb-6">
            {results.breakdown.map((q, i) => (
              <motion.div key={q.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className={`flex gap-4 p-4 rounded-2xl border ${q.isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${q.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {q.isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white leading-snug">{q.text}</p>
                  <div className="mt-1.5 text-[10px] space-y-0.5">
                    {!q.isCorrect && q.chosen !== undefined && (
                      <p className="text-red-400"><span className="font-black">Your answer:</span> {q.options[q.chosen]}</p>
                    )}
                    <p className="text-emerald-400"><span className="font-black">Correct:</span> {q.options[q.correct]}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <button onClick={() => { setPhase('list'); setActiveQuiz(null); setResults(null); }}
            className="w-full py-3 bg-white/5 border border-white/10 text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
            <RotateCcw size={14} /> Back to Quizzes
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
