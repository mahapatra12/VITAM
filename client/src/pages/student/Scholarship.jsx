import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Plus, ChevronRight, CheckCircle2, Clock, X,
  AlertTriangle, Star, Zap, FileText, Upload, Brain,
  TrendingUp, DollarSign, Users, Shield
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const SCHOLARSHIPS = [
  {
    id: 'SCH-001', name: 'Merit Excellence Award', type: 'Merit',
    amount: 50000, seats: 10, deadline: '2026-04-15',
    eligibility: { minCGPA: 8.5, minAttendance: 85, incomeLimit: null },
    color: '#f59e0b', icon: Star,
    desc: 'Awarded to the top academic performers with CGPA ≥ 8.5 across all departments.',
  },
  {
    id: 'SCH-002', name: 'Need-Based Financial Aid', type: 'Need',
    amount: 40000, seats: 25, deadline: '2026-04-20',
    eligibility: { minCGPA: 6.0, minAttendance: 70, incomeLimit: 300000 },
    color: '#10b981', icon: DollarSign,
    desc: 'Supporting meritorious students from economically weaker sections (family income < ₹3L/yr).',
  },
  {
    id: 'SCH-003', name: 'Sports & Cultural Excellence', type: 'Sports',
    amount: 20000, seats: 15, deadline: '2026-05-01',
    eligibility: { minCGPA: 6.0, minAttendance: 75, incomeLimit: null },
    color: '#6366f1', icon: Zap,
    desc: 'For students representing the college at state or national level sports/cultural competitions.',
  },
  {
    id: 'SCH-004', name: "Women in STEM Scholarship", type: 'Diversity',
    amount: 35000, seats: 20, deadline: '2026-04-30',
    eligibility: { minCGPA: 7.0, minAttendance: 75, incomeLimit: null },
    color: '#ec4899', icon: Users,
    desc: 'Empowering women students in STEM fields. Open to all female students in engineering branches.',
  },
  {
    id: 'SCH-005', name: 'Research Innovation Grant', type: 'Research',
    amount: 25000, seats: 8, deadline: '2026-05-15',
    eligibility: { minCGPA: 8.0, minAttendance: 80, incomeLimit: null },
    color: '#8b5cf6', icon: Brain,
    desc: 'Supporting student research projects and paper publications. Requires a research proposal.',
  },
];

const DOCS_REQUIRED = [
  'Aadhaar Card (Self)',
  'Income Certificate (Latest)',
  '10th & 12th Marksheets',
  'Current Semester Marksheet',
  'Bank Account Details (Passbook Copy)',
  'Passport-size Photograph',
];

const STATUS_CFG = {
  draft:     { label: 'Draft',         color: 'text-slate-400',   bg: 'bg-slate-500/10',    border: 'border-slate-500/20'  },
  submitted: { label: 'Under Review',  color: 'text-amber-400',   bg: 'bg-amber-500/10',    border: 'border-amber-500/20'  },
  shortlisted:{ label: 'Shortlisted', color: 'text-blue-400',    bg: 'bg-blue-500/10',     border: 'border-blue-500/20'   },
  awarded:   { label: '✓ Awarded',     color: 'text-emerald-400', bg: 'bg-emerald-500/10',  border: 'border-emerald-500/20'},
  rejected:  { label: 'Not Selected',  color: 'text-red-400',     bg: 'bg-red-500/10',      border: 'border-red-500/20'    },
};

// Our mock student profile
const MY_PROFILE = { cgpa: 8.73, attendance: 89, gender: 'M', income: 250000 };

const MY_APPLICATIONS = [
  { id: 'APP-001', schId: 'SCH-001', status: 'shortlisted', appliedOn: '15 Mar 2026', aiScore: 91 },
  { id: 'APP-002', schId: 'SCH-005', status: 'submitted',   appliedOn: '20 Mar 2026', aiScore: 78 },
];

function EligibilityChip({ sch, profile }) {
  const checks = [
    { pass: profile.cgpa >= sch.eligibility.minCGPA,          label: `CGPA ≥ ${sch.eligibility.minCGPA}` },
    { pass: profile.attendance >= sch.eligibility.minAttendance, label: `Attendance ≥ ${sch.eligibility.minAttendance}%` },
    ...(sch.eligibility.incomeLimit ? [{ pass: profile.income <= sch.eligibility.incomeLimit, label: `Income ≤ ₹${(sch.eligibility.incomeLimit/100000).toFixed(1)}L` }] : []),
  ];
  const allPass = checks.every(c => c.pass);
  return (
    <div className={`flex items-center gap-2 text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest ${allPass ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30'}`}>
      {allPass ? <CheckCircle2 size={10} /> : <X size={10} />}
      {allPass ? 'Eligible' : 'Not Eligible'}
    </div>
  );
}

function ApplyModal({ sch, onClose, onSubmit }) {
  const [step, setStep] = useState(1); // 1: info, 2: docs, 3: statement
  const [form, setForm] = useState({ statement: '', checkedDocs: [] });

  const toggleDoc = (doc) => setForm(p => ({
    ...p, checkedDocs: p.checkedDocs.includes(doc) ? p.checkedDocs.filter(d => d !== doc) : [...p.checkedDocs, doc]
  }));

  const allDocsChecked = form.checkedDocs.length === DOCS_REQUIRED.length;
  const canSubmit = allDocsChecked && form.statement.trim().length > 30;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="font-black text-white">{sch.name}</h3>
            <p className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-widest">Application — Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"><X size={15} /></button>
        </div>

        {/* Step progress */}
        <div className="flex gap-0 border-b border-white/5">
          {['Scholarship Info', 'Documents', 'Statement'].map((s, i) => (
            <div key={s} onClick={() => i + 1 <= step && setStep(i + 1)}
              className={`flex-1 py-2 text-center text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all ${step === i + 1 ? 'text-indigo-400 border-b-2 border-indigo-500' : step > i + 1 ? 'text-emerald-400' : 'text-slate-600'}`}>
              {step > i + 1 ? '✓ ' : ''}{s}
            </div>
          ))}
        </div>

        <div className="p-6 min-h-[280px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="p-4 rounded-2xl border" style={{ borderColor: `${sch.color}30`, background: `${sch.color}08` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <sch.icon size={18} style={{ color: sch.color }} />
                    <span className="text-xs font-black text-white">{sch.type} Scholarship</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{sch.desc}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[['Amount', `₹${(sch.amount/1000).toFixed(0)}K`], ['Seats', `${sch.seats}`], ['Deadline', sch.deadline.slice(5).replace('-', '/')] ].map(([l, v]) => (
                    <div key={l} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest">{l}</p>
                      <p className="text-base font-black text-white mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Eligibility Criteria</p>
                  {[
                    `Minimum CGPA: ${sch.eligibility.minCGPA}  (Your CGPA: ${MY_PROFILE.cgpa} ✓)`,
                    `Minimum Attendance: ${sch.eligibility.minAttendance}%  (Yours: ${MY_PROFILE.attendance}% ✓)`,
                    ...(sch.eligibility.incomeLimit ? [`Family Income ≤ ₹${(sch.eligibility.incomeLimit/100000).toFixed(0)}L`] : []),
                  ].map(e => <p key={e} className="text-xs text-slate-400 flex items-start gap-2"><CheckCircle2 size={11} className="text-emerald-400 flex-shrink-0 mt-0.5" />{e}</p>)}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                <p className="text-xs text-slate-400">Confirm you have the following documents ready for upload:</p>
                {DOCS_REQUIRED.map(doc => (
                  <label key={doc} onClick={() => toggleDoc(doc)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.checkedDocs.includes(doc) ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${form.checkedDocs.includes(doc) ? 'border-emerald-500 bg-emerald-500' : 'border-white/20'}`}>
                      {form.checkedDocs.includes(doc) && <CheckCircle2 size={11} className="text-white" />}
                    </div>
                    <span className={`text-xs font-bold ${form.checkedDocs.includes(doc) ? 'text-emerald-300' : 'text-slate-400'}`}>{doc}</span>
                  </label>
                ))}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Personal Statement *</label>
                  <textarea value={form.statement} onChange={e => setForm(p => ({ ...p, statement: e.target.value }))} rows={6}
                    placeholder="Explain why you deserve this scholarship, your academic journey, financial need, and how it will help you achieve your goals..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none transition-colors placeholder:text-slate-600" />
                  <p className="text-[9px] text-slate-600 mt-1">{form.statement.length} chars {form.statement.length < 30 ? '(min 30)' : '✓'}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-5 border-t border-white/5 flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="px-5 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-colors">
              Back
            </button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)}
              disabled={step === 2 && !allDocsChecked}
              className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button onClick={() => { if (canSubmit) { onSubmit(sch.id); onClose(); } }} disabled={!canSubmit}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Award size={14} /> Submit Application
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function StudentScholarship() {
  const { user } = useAuth();
  const { push } = useToast();
  const [applications, setApplications] = useState(MY_APPLICATIONS);
  const [applying, setApplying] = useState(null); // scholarship object
  const [tab, setTab] = useState('browse'); // browse | my

  const handleSubmit = (schId) => {
    const sch = SCHOLARSHIPS.find(s => s.id === schId);
    const aiScore = Math.floor(65 + Math.random() * 30);
    setApplications(prev => [...prev, {
      id: `APP-${String(prev.length + 10).padStart(3, '0')}`,
      schId, status: 'submitted',
      appliedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      aiScore,
    }]);
    push({ type: 'success', title: 'Application Submitted!', body: `${sch?.name} — AI predicts ${aiScore}% award likelihood. You'll hear back by ${sch?.deadline}.` });
  };

  const appliedIds = applications.map(a => a.schId);

  return (
    <DashboardLayout title="Scholarships" role={user?.role || 'STUDENT'}>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Award size={28} className="text-amber-500" /> Scholarship Portal
          </h2>
          <p className="text-slate-400 mt-1">Browse available scholarships, check eligibility, and apply online.</p>
        </div>
        <div className="flex gap-2">
          {['browse', 'my'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${tab === t ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-white/[0.02] border-white/10 text-slate-500 hover:text-white'}`}>
              {t === 'browse' ? `Browse (${SCHOLARSHIPS.length})` : `My Applications (${applications.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* My Profile Summary */}
      <div className="mb-6 p-4 rounded-2xl bg-[#080808] border border-white/5 flex flex-wrap items-center gap-6">
        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Your Profile</div>
        {[['CGPA', MY_PROFILE.cgpa, MY_PROFILE.cgpa >= 8.5 ? 'text-emerald-400' : MY_PROFILE.cgpa >= 7 ? 'text-amber-400' : 'text-red-400'],
          ['Attendance', `${MY_PROFILE.attendance}%`, MY_PROFILE.attendance >= 85 ? 'text-emerald-400' : 'text-amber-400'],
          ['Applied', applications.length, 'text-indigo-400'],
          ['Shortlisted', applications.filter(a => a.status === 'shortlisted').length, 'text-blue-400'],
        ].map(([l, v, c]) => (
          <div key={l} className="flex items-center gap-2">
            <span className="text-[9px] text-slate-600 uppercase">{l}:</span>
            <span className={`font-black text-sm ${c}`}>{v}</span>
          </div>
        ))}
      </div>

      {tab === 'browse' && (
        <div className="space-y-4">
          {SCHOLARSHIPS.map((sch, i) => {
            const applied = appliedIds.includes(sch.id);
            const eligible = MY_PROFILE.cgpa >= sch.eligibility.minCGPA && MY_PROFILE.attendance >= sch.eligibility.minAttendance &&
              (!sch.eligibility.incomeLimit || MY_PROFILE.income <= sch.eligibility.incomeLimit);

            return (
              <motion.div key={sch.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className={`p-5 rounded-3xl border transition-all ${applied ? 'border-emerald-500/20 bg-emerald-500/5' : eligible ? 'border-white/5 bg-[#080808] hover:border-white/10' : 'border-white/5 bg-[#080808] opacity-60'}`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${sch.color}15`, border: `1px solid ${sch.color}30` }}>
                    <sch.icon size={20} style={{ color: sch.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div>
                        <h3 className="text-sm font-black text-white">{sch.name}</h3>
                        <p className="text-[10px] font-bold mt-0.5" style={{ color: sch.color }}>{sch.type} · ₹{sch.amount.toLocaleString()} Award · {sch.seats} seats</p>
                      </div>
                      <EligibilityChip sch={sch} profile={MY_PROFILE} />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">{sch.desc}</p>
                    <div className="flex items-center gap-4 text-[9px] text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={9}/> Deadline: {sch.deadline}</span>
                      <span className="flex items-center gap-1"><Users size={9}/> {sch.seats} seats available</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {applied ? (
                      <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircle2 size={12} /> Applied
                      </div>
                    ) : eligible ? (
                      <button onClick={() => setApplying(sch)}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-1.5">
                        Apply <ChevronRight size={13} />
                      </button>
                    ) : (
                      <div className="px-4 py-2 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest">
                        Ineligible
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {tab === 'my' && (
        <div className="space-y-3">
          {applications.length === 0 ? (
            <div className="text-center py-16 text-slate-600">
              <Award size={28} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">No applications yet.</p>
              <button onClick={() => setTab('browse')} className="mt-3 text-amber-400 text-sm font-black underline hover:no-underline">Browse scholarships →</button>
            </div>
          ) : applications.map((app, i) => {
            const sch = SCHOLARSHIPS.find(s => s.id === app.schId);
            const st = STATUS_CFG[app.status];
            return (
              <motion.div key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                className={`p-5 rounded-2xl border ${app.status === 'awarded' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-[#080808] border-white/5'}`}>
                <div className="flex items-center gap-4">
                  {sch && <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${sch.color}15` }}><sch.icon size={18} style={{ color: sch.color }} /></div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white">{sch?.name}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-slate-500 mt-0.5">
                      <span className="font-mono">{app.id}</span>
                      <span>Applied {app.appliedOn}</span>
                      <span className="flex items-center gap-1 text-purple-400"><Brain size={9} /> AI Score: {app.aiScore}%</span>
                    </div>
                    {/* AI likelihood bar */}
                    <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden w-40">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${app.aiScore}%` }} transition={{ duration: 0.8 }}
                        className={`h-full rounded-full ${app.aiScore >= 80 ? 'bg-emerald-500' : app.aiScore >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} />
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex-shrink-0 ${st.bg} ${st.border} ${st.color}`}>
                    {st.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {applying && <ApplyModal sch={applying} onClose={() => setApplying(null)} onSubmit={handleSubmit} />}
      </AnimatePresence>
    </DashboardLayout>
  );
}
