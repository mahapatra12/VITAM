import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, BookOpen, Clock, AlertTriangle, CheckCircle2, TrendingUp, MessageCircle, CreditCard, Bell, ChevronRight, Phone, Mail, MapPin, Award } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const WARD = {
  name: 'Aarav Mehta',
  regNo: 'CS2022047',
  branch: 'Computer Science',
  semester: '5th Semester',
  batch: '2022–26',
  cgpa: 8.74,
  attendanceOverall: 91.2,
  photo: null,
};

const SUBJECTS = [
  { name: 'Data Structures', code: 'CS301', faculty: 'Dr. S. Mehta', attendance: 94, internal: 38, max: 40, grade: 'O' },
  { name: 'Operating Systems', code: 'CS401', faculty: 'Dr. R. Patel', attendance: 88, internal: 35, max: 40, grade: 'A+' },
  { name: 'Cloud Computing', code: 'CS501', faculty: 'Prof. V. Iyer', attendance: 96, internal: 37, max: 40, grade: 'O' },
  { name: 'Software Engineering', code: 'CS601', faculty: 'Dr. N. Singh', attendance: 85, internal: 32, max: 40, grade: 'A' },
  { name: 'DBMS', code: 'CS302', faculty: 'Prof. A. Kumar', attendance: 91, internal: 36, max: 40, grade: 'O' },
];

const TIMELINE = [
  { date: 'Mar 20', event: 'Unit Test 4 Result', detail: 'Scored 38/40 in Data Structures', type: 'success' },
  { date: 'Mar 18', event: 'Library Book Returned', detail: '"Algorithms" by Cormen returned on time', type: 'info' },
  { date: 'Mar 15', event: 'Attendance Alert', detail: 'OS attendance dropped to 87%. Min 75% required', type: 'warning' },
  { date: 'Mar 10', event: 'Fee Acknowledged', detail: 'Semester IV fee receipt generated', type: 'success' },
];

const GRADE_COLOR = { O: '#10b981', 'A+': '#3b82f6', A: '#8b5cf6', B: '#f59e0b' };

export default function ParentDashboard() {
  const { user } = useAuth();
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [msgText, setMsgText] = useState('');

  const handleMessage = (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    push({ type: 'success', title: 'Message Sent', body: `Your concern has been forwarded to the Class Advisor and HOD.` });
    setMsgText('');
  };

  const atRisk = SUBJECTS.filter(s => s.attendance < 90);

  return (
    <DashboardLayout title="Parent Guardian Portal" role={user?.role || 'PARENT'}>
      {/* Ward Banner */}
      <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white border border-white/20 shadow-xl flex-shrink-0">
            {WARD.name[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-white">{WARD.name}</h2>
            <div className="flex flex-wrap gap-3 mt-2">
              {[WARD.regNo, WARD.branch, WARD.semester, WARD.batch].map(v => (
                <span key={v} className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg">{v}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-3xl font-black text-white">{WARD.cgpa}</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">CGPA</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className={`text-3xl font-black ${WARD.attendanceOverall >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{WARD.attendanceOverall}%</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Attendance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'subjects', label: '📚 Subjects' },
          { id: 'timeline', label: '🕐 Timeline' },
          { id: 'contact', label: '💬 Contact' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <GlassCard className="lg:col-span-2 p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2"><TrendingUp size={14} /> Academic Snapshot</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Overall CGPA', value: WARD.cgpa, unit: '/10', good: WARD.cgpa >= 8 },
                  { label: 'Att. This Sem', value: `${WARD.attendanceOverall}%`, good: WARD.attendanceOverall >= 85 },
                  { label: 'Active Subjects', value: SUBJECTS.length, good: true },
                  { label: 'Best Subject', value: 'DS', unit: '38/40', good: true },
                  { label: 'Subjects At Risk', value: atRisk.length, good: atRisk.length === 0 },
                  { label: 'Rank (Class)', value: '#12', unit: '/60', good: true },
                ].map(s => (
                  <div key={s.label} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-2">{s.label}</p>
                    <p className={`text-xl font-black ${s.good ? 'text-white' : 'text-amber-400'}`}>{s.value} <span className="text-slate-600 text-xs">{s.unit}</span></p>
                  </div>
                ))}
              </div>
            </GlassCard>
            <div className="space-y-4">
              {atRisk.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                  <p className="text-xs font-black text-amber-400 flex items-center gap-2 mb-3"><AlertTriangle size={14} /> Attendance Alerts</p>
                  {atRisk.map(s => (
                    <div key={s.code} className="flex justify-between text-[10px] font-bold py-1 border-b border-white/5 last:border-0">
                      <span className="text-slate-300">{s.name}</span>
                      <span className="text-amber-400">{s.attendance}%</span>
                    </div>
                  ))}
                </div>
              )}
              <GlassCard className="p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2"><Award size={12} /> Grade Summary</p>
                <div className="flex gap-2 flex-wrap">
                  {SUBJECTS.map(s => (
                    <div key={s.code} className="px-3 py-1.5 rounded-xl text-xs font-black border" style={{ color: GRADE_COLOR[s.grade] || '#94a3b8', borderColor: `${GRADE_COLOR[s.grade]}30` || '#334155', background: `${GRADE_COLOR[s.grade]}10` }}>
                      {s.code.slice(-3)} · {s.grade}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {activeTab === 'subjects' && (
          <motion.div key="subjects" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {SUBJECTS.map((sub, i) => (
              <motion.div key={sub.code} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="p-5 rounded-3xl bg-[#080808] border border-white/5 hover:border-white/10 transition-all">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[9px] font-black text-slate-500 bg-white/5 px-2 py-0.5 rounded">{sub.code}</span>
                      <h4 className="text-sm font-black text-white">{sub.name}</h4>
                      <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-lg" style={{ color: GRADE_COLOR[sub.grade], background: `${GRADE_COLOR[sub.grade]}15` }}>{sub.grade}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-3">{sub.faculty}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1">
                          <span>Attendance</span><span className={sub.attendance < 90 ? 'text-amber-400' : 'text-emerald-400'}>{sub.attendance}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${sub.attendance}%` }} transition={{ duration: 0.8, delay: i * 0.07 }}
                            className="h-full rounded-full" style={{ background: sub.attendance < 90 ? '#f59e0b' : '#10b981' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1">
                          <span>Internal</span><span className="text-blue-400">{sub.internal}/{sub.max}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(sub.internal / sub.max) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.07 }}
                            className="h-full rounded-full bg-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'timeline' && (
          <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="relative pl-6 space-y-4 border-l border-white/10">
              {TIMELINE.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="relative">
                  <div className={`absolute -left-[29px] w-4 h-4 rounded-full border-2 border-[#050505] ${item.type === 'success' ? 'bg-emerald-500' : item.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                  <div className="p-4 rounded-2xl bg-[#080808] border border-white/5 ml-4">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-black text-white">{item.event}</p>
                      <span className="text-[9px] text-slate-500 font-mono ml-4 flex-shrink-0">{item.date}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{item.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'contact' && (
          <motion.div key="contact" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassCard className="p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5">Contact Faculty</h3>
              <div className="space-y-3 mb-6">
                {SUBJECTS.slice(0, 3).map(s => (
                  <div key={s.code} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                    <div>
                      <p className="text-xs font-black text-white">{s.faculty}</p>
                      <p className="text-[9px] text-slate-500">{s.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => push({ type: 'info', title: 'Email Composed', body: `Draft to ${s.faculty} opened.` })} className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"><Mail size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleMessage}>
                <textarea value={msgText} onChange={e => setMsgText(e.target.value)} rows={4}
                  placeholder="Write your concern or query to the Class Advisor & HOD..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white resize-none focus:outline-none focus:border-indigo-500/50 transition-colors mb-3 placeholder:text-slate-600" />
                <button type="submit" className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-colors flex items-center justify-center gap-2">
                  <MessageCircle size={14} /> Send Concern
                </button>
              </form>
            </GlassCard>
            <GlassCard className="p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5">Institute Contact</h3>
              {[
                { icon: Phone, label: 'Reception', value: '+91 80-4521 9900' },
                { icon: Mail, label: 'Registrar', value: 'registrar@vitam.edu.in' },
                { icon: MapPin, label: 'Campus', value: 'Whitefield, Bengaluru – 560066' },
                { icon: Clock, label: 'Office Hours', value: 'Mon–Sat, 9:00 AM – 5:00 PM' },
              ].map(c => (
                <div key={c.label} className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 flex-shrink-0"><c.icon size={16} /></div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{c.label}</p>
                    <p className="text-xs font-bold text-white mt-0.5">{c.value}</p>
                  </div>
                </div>
              ))}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
