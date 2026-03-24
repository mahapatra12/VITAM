import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Plus, Trash2, CheckCircle2, X, ChevronDown, Eye,
  GripVertical, ToggleLeft, Clock, Users, BarChart2, BookOpen, Zap, Send
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const SUBJECTS = ['CS301 – Data Structures', 'CS401 – Operating Systems', 'CS501 – Cloud Computing'];

const INITIAL_QUIZZES = [
  { id: 'QZ-001', title: 'DSA Unit 3 – Trees & Graphs', subject: 'CS301 – Data Structures', duration: 20, totalQ: 10, attempts: 38, avgScore: 72, published: true, createdOn: '18 Mar 2026' },
  { id: 'QZ-002', title: 'OS Mid-Sem Revision', subject: 'CS401 – Operating Systems', duration: 30, totalQ: 15, attempts: 31, avgScore: 65, published: true, createdOn: '20 Mar 2026' },
  { id: 'QZ-003', title: 'Cloud Week 2 Quiz', subject: 'CS501 – Cloud Computing', duration: 15, totalQ: 8, attempts: 0, avgScore: 0, published: false, createdOn: '22 Mar 2026' },
];

function QuestionEditor({ q, index, onChange, onDelete }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
      <div className="flex items-center gap-2">
        <GripVertical size={14} className="text-slate-600 flex-shrink-0" />
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Q{index + 1}</span>
        <div className="flex-1" />
        <button onClick={() => onDelete(q.id)} className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
      <input value={q.text} onChange={e => onChange(q.id, 'text', e.target.value)} placeholder="Enter question..."
        className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600" />
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt, oi) => (
          <div key={oi} className="flex items-center gap-2">
            <button onClick={() => onChange(q.id, 'correct', oi)}
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${q.correct === oi ? 'border-emerald-500 bg-emerald-500' : 'border-white/20 hover:border-emerald-500/50'}`}>
              {q.correct === oi && <CheckCircle2 size={10} className="text-white" />}
            </button>
            <input value={opt} onChange={e => {
              const opts = [...q.options]; opts[oi] = e.target.value;
              onChange(q.id, 'options', opts);
            }} placeholder={`Option ${oi + 1}...`}
              className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600 text-xs" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-[9px] text-slate-600">
        <span>Click a circle to mark the correct answer</span>
        <span className="text-emerald-400 font-bold">{q.correct !== null ? `Answer: Option ${q.correct + 1}` : 'No answer set'}</span>
      </div>
    </motion.div>
  );
}

function QuizBuilder({ onClose, onSave }) {
  const [meta, setMeta] = useState({ title: '', subject: SUBJECTS[0], duration: 15 });
  const [questions, setQuestions] = useState([
    { id: 1, text: '', options: ['', '', '', ''], correct: null },
  ]);

  const addQ = () => setQuestions(prev => [...prev, { id: Date.now(), text: '', options: ['', '', '', ''], correct: null }]);
  const deleteQ = (id) => setQuestions(prev => prev.filter(q => q.id !== id));
  const changeQ = (id, field, val) => setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: val } : q));

  const valid = meta.title && questions.length >= 2 && questions.every(q => q.text && q.correct !== null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <h3 className="font-black text-white text-lg flex items-center gap-2"><ClipboardList size={18} className="text-indigo-400" /> Quiz Builder</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"><X size={15} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quiz meta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Quiz Title *</label>
              <input value={meta.title} onChange={e => setMeta(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Unit 3 – Trees & Graphs"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Duration (min)</label>
              <input type="number" value={meta.duration} onChange={e => setMeta(p => ({ ...p, duration: +e.target.value }))} min={5} max={120}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors" />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Subject</label>
              <select value={meta.subject} onChange={e => setMeta(p => ({ ...p, subject: e.target.value }))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none">
                {SUBJECTS.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
              </select>
            </div>
          </div>

          {/* Questions */}
          <div className="flex items-center justify-between">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{questions.length} Question{questions.length !== 1 ? 's' : ''}</label>
            <button onClick={addQ} className="flex items-center gap-1.5 text-[10px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl hover:bg-indigo-500/20 transition-colors">
              <Plus size={12} /> Add Question
            </button>
          </div>

          <div className="space-y-3">
            {questions.map((q, i) => (
              <QuestionEditor key={q.id} q={q} index={i} onChange={changeQ} onDelete={deleteQ} />
            ))}
          </div>
        </div>
        <div className="p-5 border-t border-white/5 flex-shrink-0 flex gap-3">
          <button onClick={() => { if (valid) onSave({ ...meta, questions, published: false }); onClose(); }} disabled={!valid}
            className="flex-1 py-3 bg-white/5 border border-white/10 disabled:opacity-30 text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-white/10">
            Save Draft
          </button>
          <button onClick={() => { if (valid) onSave({ ...meta, questions, published: true }); onClose(); }} disabled={!valid}
            className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2">
            <Send size={14} /> Publish Quiz
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FacultyQuiz() {
  const { user } = useAuth();
  const { push } = useToast();
  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);
  const [showBuilder, setShowBuilder] = useState(false);

  const handleSave = (quiz) => {
    const newQ = {
      id: `QZ-${String(quizzes.length + 1).padStart(3, '0')}`,
      ...quiz,
      totalQ: quiz.questions.length,
      attempts: 0,
      avgScore: 0,
      createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setQuizzes(prev => [newQ, ...prev]);
    push({ type: 'success', title: quiz.published ? 'Quiz Published!' : 'Draft Saved', body: `"${quiz.title}" ${quiz.published ? 'is now live for students' : 'saved as draft'}.` });
  };

  const togglePublish = (id) => {
    setQuizzes(prev => prev.map(q => {
      if (q.id !== id) return q;
      const next = !q.published;
      push({ type: next ? 'success' : 'warning', title: next ? 'Quiz Published' : 'Quiz Hidden', body: `${q.title} is now ${next ? 'live' : 'hidden from students'}.` });
      return { ...q, published: next };
    }));
  };

  const deleteQuiz = (id) => {
    setQuizzes(prev => prev.filter(q => q.id !== id));
    push({ type: 'warning', title: 'Quiz Deleted', body: 'The quiz and all attempt records have been removed.' });
  };

  const totalAttempts = quizzes.reduce((s, q) => s + q.attempts, 0);
  const published = quizzes.filter(q => q.published).length;
  const avgAcross = quizzes.filter(q => q.avgScore > 0);
  const globalAvg = avgAcross.length ? Math.round(avgAcross.reduce((s, q) => s + q.avgScore, 0) / avgAcross.length) : 0;

  return (
    <DashboardLayout title="Quiz Engine" role={user?.role || 'FACULTY'}>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <ClipboardList size={28} className="text-indigo-500" /> Online Assessment Engine
          </h2>
          <p className="text-slate-400 mt-1">Create, publish and analyse timed quizzes for your students.</p>
        </div>
        <button onClick={() => setShowBuilder(true)}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]">
          <Plus size={15} /> Create Quiz
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Quizzes', value: quizzes.length, color: '#6366f1', icon: ClipboardList },
          { label: 'Published',     value: published,      color: '#10b981', icon: CheckCircle2 },
          { label: 'Total Attempts',value: totalAttempts,  color: '#3b82f6', icon: Users },
          { label: 'Global Avg Score', value: `${globalAvg}%`, color: '#f59e0b', icon: BarChart2 },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="p-4 rounded-2xl bg-[#080808] border border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}15` }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-black text-white leading-none">{s.value}</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quiz Cards */}
      <div className="space-y-3">
        {quizzes.map((quiz, i) => (
          <motion.div key={quiz.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
            className={`p-5 rounded-2xl border transition-all ${quiz.published ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-white/5 bg-[#080808]'}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${quiz.published ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-500'}`}>
                <ClipboardList size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-black text-white">{quiz.title}</h3>
                  <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex-shrink-0 ${quiz.published ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-slate-500 border border-white/10'}`}>
                    {quiz.published ? '● Live' : '○ Draft'}
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500">
                  <span className="text-indigo-400">{quiz.subject}</span>
                  <span className="flex items-center gap-1"><Clock size={9} /> {quiz.duration} min</span>
                  <span className="flex items-center gap-1"><ClipboardList size={9} /> {quiz.totalQ} questions</span>
                  <span className="flex items-center gap-1"><Users size={9} /> {quiz.attempts} attempts</span>
                  {quiz.avgScore > 0 && <span className="flex items-center gap-1 text-amber-400"><BarChart2 size={9} /> {quiz.avgScore}% avg</span>}
                  <span>Created {quiz.createdOn}</span>
                </div>
                {quiz.avgScore > 0 && (
                  <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden w-48">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${quiz.avgScore}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                      className={`h-full rounded-full ${quiz.avgScore >= 70 ? 'bg-emerald-500' : quiz.avgScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => togglePublish(quiz.id)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${quiz.published ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'}`}>
                  {quiz.published ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => deleteQuiz(quiz.id)}
                  className="p-2 rounded-xl text-slate-600 hover:text-red-400 bg-white/5 hover:bg-red-500/10 transition-all border border-white/5">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showBuilder && <QuizBuilder onClose={() => setShowBuilder(false)} onSave={handleSave} />}
      </AnimatePresence>
    </DashboardLayout>
  );
}
