import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Award, Users, FileText, ExternalLink, Plus, CheckCircle2, Clock, Star, BarChart2, Globe } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const RESEARCH_PAPERS = [
  { id: 1, title: 'Deep Learning Approaches for Student Dropout Prediction', journal: 'IEEE Access', status: 'published', year: 2025, citations: 42, impact: 4.8, authors: ['Dr. S. Mehta', 'Dr. R. Patel'] },
  { id: 2, title: 'Federated Privacy in Campus Management Systems', journal: 'Elsevier COMNET', status: 'under_review', year: 2025, citations: 0, impact: 6.1, authors: ['Dr. S. Mehta', 'V. Kumar'] },
  { id: 3, title: 'Blockchain-Based Academic Credential Verification', journal: 'ACM CCS Workshop', status: 'published', year: 2024, citations: 18, impact: 3.9, authors: ['Dr. S. Mehta'] },
  { id: 4, title: 'Attention Mechanisms in EdTech Recommendation Engines', journal: 'Springer LNCS', status: 'draft', year: 2025, citations: 0, impact: null, authors: ['Dr. R. Patel', 'N. Sharma'] },
];

const NAAC_CRITERIA = [
  { id: 1, name: 'Curricular Aspects', score: 3.42, max: 4.0, color: '#3b82f6' },
  { id: 2, name: 'Teaching-Learning', score: 3.71, max: 4.0, color: '#10b981' },
  { id: 3, name: 'Research & Innovation', score: 3.18, max: 4.0, color: '#8b5cf6' },
  { id: 4, name: 'Infrastructure', score: 3.55, max: 4.0, color: '#f59e0b' },
  { id: 5, name: 'Student Support', score: 3.66, max: 4.0, color: '#ef4444' },
  { id: 6, name: 'Governance', score: 3.82, max: 4.0, color: '#06b6d4' },
  { id: 7, name: 'Innovations', score: 3.28, max: 4.0, color: '#ec4899' },
];

const STATUS_CONFIG = {
  published:    { label: 'Published', className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  under_review: { label: 'Under Review', className: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  draft:        { label: 'Draft', className: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
};

export default function HodResearch() {
  const { user } = useAuth();
  const { push } = useToast();
  const [papers, setPapers] = useState(RESEARCH_PAPERS);
  const [activeView, setActiveView] = useState('papers');

  const totalCitations = papers.reduce((s, p) => s + p.citations, 0);
  const publishedCount = papers.filter(p => p.status === 'published').length;
  const hIndex = Math.floor(Math.sqrt(totalCitations));

  const overallNAAC = (NAAC_CRITERIA.reduce((s, c) => s + c.score, 0) / NAAC_CRITERIA.length).toFixed(2);

  const handleSubmit = (paperId) => {
    setPapers(prev => prev.map(p => p.id === paperId ? { ...p, status: 'under_review' } : p));
    push({ type: 'success', title: 'Paper Submitted', body: 'Manuscript transmitted to journal for peer review.' });
  };

  return (
    <DashboardLayout title="Research & Accreditation" role={user?.role || 'HOD'}>
      <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <BookOpen size={28} className="text-purple-500" />
            Research Matrix
          </h2>
          <p className="text-slate-400 mt-1">Department scholarly output, H-index, and NAAC compliance tracker.</p>
        </div>
        <div className="flex gap-2">
          {['papers', 'naac'].map(v => (
            <button key={v} onClick={() => setActiveView(v)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === v ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'}`}>
              {v === 'papers' ? '📄 Papers' : '🏛 NAAC'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Published Papers', value: publishedCount, unit: '', color: '#10b981', icon: FileText },
          { label: 'Total Citations', value: totalCitations, unit: '+', color: '#3b82f6', icon: TrendingUp },
          { label: 'H-Index Score', value: hIndex, unit: '', color: '#8b5cf6', icon: Star },
          { label: 'NAAC Overall', value: overallNAAC, unit: '/4', color: '#f59e0b', icon: Award },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="p-5 rounded-3xl bg-[#080808] border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{kpi.label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}15` }}>
                <kpi.icon size={14} style={{ color: kpi.color }} />
              </div>
            </div>
            <p className="text-3xl font-black text-white" style={{ textShadow: `0 0 30px ${kpi.color}50` }}>
              {kpi.value}<span className="text-slate-500 text-base ml-0.5">{kpi.unit}</span>
            </p>
          </motion.div>
        ))}
      </div>

      {activeView === 'papers' ? (
        <div className="space-y-3">
          {papers.map((paper, i) => {
            const status = STATUS_CONFIG[paper.status];
            return (
              <motion.div key={paper.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="group p-5 rounded-3xl bg-[#080808] border border-white/5 hover:border-white/10 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <span className={`flex-shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${status.className}`}>
                        {status.label}
                      </span>
                      <h4 className="text-sm font-black text-white leading-snug">{paper.title}</h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500 font-bold">
                      <span className="flex items-center gap-1"><Globe size={10} /> {paper.journal}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {paper.year}</span>
                      {paper.citations > 0 && <span className="flex items-center gap-1 text-blue-400"><TrendingUp size={10} /> {paper.citations} citations</span>}
                      {paper.impact && <span className="text-amber-400">IF: {paper.impact}</span>}
                    </div>
                    <p className="mt-2 text-[10px] text-slate-600">{paper.authors.join(', ')}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {paper.status === 'draft' && (
                      <button onClick={() => handleSubmit(paper.id)}
                        className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-500/20 transition-colors flex items-center gap-1.5">
                        <ExternalLink size={11} /> Submit
                      </button>
                    )}
                    {paper.status === 'published' && (
                      <button className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircle2 size={11} /> Indexed
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          <button onClick={() => push({ type: 'info', title: 'Paper Form', body: 'Research submission portal coming soon.' })}
            className="w-full py-4 rounded-3xl border border-dashed border-white/10 text-slate-600 hover:text-white hover:border-white/20 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
            <Plus size={14} /> Add New Research Paper
          </button>
        </div>
      ) : (
        <GlassCard>
          <div className="p-6 border-b border-white/5">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Award size={18} className="text-amber-400" /> NAAC A++ Compliance — {overallNAAC} / 4.00
            </h3>
            <p className="text-xs text-slate-500 mt-1">Department-level criterion scores vs. national benchmark of 3.50.</p>
          </div>
          <div className="p-6 space-y-5">
            {NAAC_CRITERIA.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-300">{c.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-[9px]">Benchmark: 3.50</span>
                    <span style={{ color: c.color }}>{c.score}</span>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden relative">
                  {/* Benchmark marker */}
                  <div className="absolute top-0 bottom-0 w-px bg-white/20 z-10" style={{ left: `${(3.50 / c.max) * 100}%` }} />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.score / c.max) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${c.color}60, ${c.color})`, boxShadow: `0 0 10px ${c.color}40` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}
    </DashboardLayout>
  );
}
