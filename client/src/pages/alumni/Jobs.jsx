import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, Clock, DollarSign, ExternalLink, Search, Filter, Star, CheckCircle2, Building2, TrendingUp, Users } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const JOBS = [
  { id: 1, title: 'Senior Software Engineer', company: 'Google India', logo: 'G', location: 'Bengaluru', type: 'Full-time', salary: '₹28–42 LPA', posted: '2 days ago', tags: ['React', 'Go', 'Cloud'], match: 94, referrals: 3 },
  { id: 2, title: 'Product Manager – EdTech', company: 'BYJU\'S', logo: 'B', location: 'Remote', type: 'Full-time', salary: '₹20–32 LPA', posted: '5 days ago', tags: ['Product', 'Analytics', 'B2C'], match: 87, referrals: 1 },
  { id: 3, title: 'Data Scientist', company: 'Infosys AI Lab', logo: 'I', location: 'Pune', type: 'Hybrid', salary: '₹15–22 LPA', posted: '1 week ago', tags: ['Python', 'ML', 'TensorFlow'], match: 91, referrals: 5 },
  { id: 4, title: 'Cloud Architect', company: 'Microsoft Azure', logo: 'M', location: 'Hyderabad', type: 'Full-time', salary: '₹35–55 LPA', posted: '3 days ago', tags: ['Azure', 'DevOps', 'Kubernetes'], match: 79, referrals: 2 },
  { id: 5, title: 'Startup CTO (Early Stage)', company: 'EdVault (Seed)', logo: 'E', location: 'Bengaluru', type: 'Full-time', salary: '₹18 LPA + ESOPs', posted: '1 day ago', tags: ['Full-Stack', 'Leadership'], match: 83, referrals: 0 },
];

const COMPANY_COLORS = {
  G: 'from-blue-500 to-blue-600',
  B: 'from-purple-500 to-indigo-600',
  I: 'from-cyan-500 to-teal-600',
  M: 'from-blue-400 to-sky-500',
  E: 'from-emerald-500 to-green-600',
};

export default function AlumniJobs() {
  const { user } = useAuth();
  const { push } = useToast();
  const [search, setSearch] = useState('');
  const [appliedIds, setAppliedIds] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Full-time', 'Hybrid', 'Remote'];
  const filtered = JOBS.filter(j =>
    (activeFilter === 'All' || j.type === activeFilter) &&
    (search === '' || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()))
  );

  const handleApply = (job) => {
    setAppliedIds(p => [...p, job.id]);
    push({ type: 'success', title: 'Application Sent', body: `Your profile has been forwarded to ${job.company} via VITAM Alumni Network.` });
  };

  const handleSave = (job) => {
    setSavedIds(p => p.includes(job.id) ? p.filter(id => id !== job.id) : [...p, job.id]);
  };

  const handleReferral = (job) => {
    push({ type: 'info', title: 'Referral Requested', body: `${job.referrals} alumni from ${job.company} can provide a referral. Message sent.` });
  };

  return (
    <DashboardLayout title="Alumni Job Board" role={user?.role || 'ALUMNI'}>
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-5xl font-black text-white flex items-center gap-4 italic uppercase tracking-tighter">
          <Briefcase size={40} className="text-indigo-600" /> Strategic <span className="text-indigo-600">Opportunity Hub</span>
        </h2>
        <p className="text-slate-400 font-bold mt-4 max-w-2xl italic text-lg leading-relaxed">Curated opportunities from the VITAM corporate network with alumni referral matching.</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Live Openings', value: JOBS.length, icon: Briefcase, color: '#3b82f6' },
          { label: 'Alumni Referrers', value: 142, icon: Users, color: '#8b5cf6' },
          { label: 'Avg Package', value: '₹26L', icon: DollarSign, color: '#10b981' },
          { label: 'Placement Rate', value: '94%', icon: TrendingUp, color: '#f59e0b' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="p-4 rounded-2xl bg-[#080808] border border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-lg font-black text-white leading-none">{s.value}</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs, companies, skills..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600" />
        </div>
        <div className="flex gap-2">
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((job, i) => {
            const isApplied = appliedIds.includes(job.id);
            const isSaved = savedIds.includes(job.id);

            return (
              <motion.div key={job.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                className="group p-5 rounded-3xl bg-[#080808] border border-white/5 hover:border-white/10 transition-all">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Company Logo */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${COMPANY_COLORS[job.logo]} flex items-center justify-center text-xl font-black text-white flex-shrink-0 shadow-lg`}>
                    {job.logo}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-1">
                      <h3 className="text-sm font-black text-white">{job.title}</h3>
                      <span className="ml-auto text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {job.match}% Match
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500 font-bold mb-3">
                      <span className="flex items-center gap-1"><Building2 size={10} /> {job.company}</span>
                      <span className="flex items-center gap-1"><MapPin size={10} /> {job.location}</span>
                      <span className="flex items-center gap-1"><DollarSign size={10} /> {job.salary}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {job.posted}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${job.type === 'Remote' ? 'bg-cyan-500/10 text-cyan-400' : job.type === 'Hybrid' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>{job.type}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map(t => (
                        <span key={t} className="text-[9px] px-2 py-0.5 bg-white/5 rounded-lg text-slate-400 border border-white/10 font-bold">{t}</span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 flex-shrink-0 justify-end">
                    <button onClick={() => handleSave(job)}
                      className={`p-2 rounded-xl transition-all ${isSaved ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'}`}>
                      <Star size={15} className={isSaved ? 'fill-amber-400' : ''} />
                    </button>
                    {isApplied ? (
                      <button disabled className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle2 size={12} /> Applied
                      </button>
                    ) : (
                      <button onClick={() => handleApply(job)}
                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5">
                        <ExternalLink size={12} /> Apply
                      </button>
                    )}
                    {job.referrals > 0 && (
                      <button onClick={() => handleReferral(job)}
                        className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-500/20 transition-colors flex items-center gap-1.5">
                        <Users size={12} /> {job.referrals} Refs
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-600">
            <Briefcase size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">No jobs match your filters.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
