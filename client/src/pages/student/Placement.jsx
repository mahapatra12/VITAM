import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, GraduationCap, Award, FileText, Globe,
  Linkedin, Github, ExternalLink, ChevronRight, CheckCircle2,
  Clock, AlertTriangle, Building2, DollarSign, Users, Brain,
  Trophy, Star, Search, Plus, X, Send, Target
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const ACTIVE_DRIVES = [
  { 
    id: "PL-001", company: "Google", role: "Software Engineer (SDE I)", 
    salary: "32.5 LPA", type: "Full Time", deadline: "25 Mar 2026",
    eligibility: { cgpa: 8.5, backlogs: 0, branches: ["CSE", "ECE", "IT"] },
    logo: "G", color: "#4285F4",
    status: "Applications Open"
  },
  { 
    id: "PL-002", company: "Microsoft", role: "Cloud Solution Architect", 
    salary: "28.0 LPA", type: "Full Time", deadline: "30 Mar 2026",
    eligibility: { cgpa: 8.0, backlogs: 0, branches: ["CSE", "IT"] },
    logo: "M", color: "#00A4EF",
    status: "Shortlisting"
  },
  { 
    id: "PL-003", company: "Adobe", role: "Product Intern", 
    salary: "80,000/mo", type: "Internship", deadline: "05 Apr 2026",
    eligibility: { cgpa: 7.5, backlogs: 0, branches: ["All"] },
    logo: "A", color: "#FF0000",
    status: "Applications Open"
  },
  { 
    id: "PL-004", company: "Zomato", role: "Android Developer", 
    salary: "18.0 LPA", type: "Full Time", deadline: "22 Mar 2026",
    logo: "Z", color: "#CB202D",
    status: "Interviewing"
  }
];

const MY_APPLICATIONS = [
  { id: "APP-101", company: "Google", role: "SDE I", status: "Aptitude Cleared", date: "15 Mar", nextStep: "Technical Round 1 (24 Mar)" },
  { id: "APP-102", company: "Zomato", role: "Android Dev", status: "Rejected", date: "10 Mar", nextStep: null },
];

const RECRUITER_PROFILE = {
  skills: ["React.js", "Node.js", "Python", "Cloud Architecture", "Data Structures", "System Design"],
  projects: [
    { name: "VITAM Smart Campus", desc: "Enterprise college portal with AI analytics", link: "#" },
    { name: "De-Auth Protocol", desc: "Blockchain based voting system", link: "#" }
  ],
  experience: [
    { role: "Full Stack Intern", company: "TechNext", duration: "3 Months" }
  ],
  cgpa: 8.73,
  backlogs: 0
};

function EligibilityBadge({ drive, profile }) {
  const isEligible = 
    profile.cgpa >= (drive.eligibility?.cgpa || 0) && 
    profile.backlogs <= (drive.eligibility?.backlogs || 0);
  
  return (
    <div className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
      isEligible ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
    }`}>
      {isEligible ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
      {isEligible ? 'Eligible' : 'Ineligible'}
    </div>
  );
}

export default function StudentPlacement() {
  const { user } = useAuth();
  const { push } = useToast();
  const [tab, setTab] = useState('drives'); // drives | profile | applications
  const [search, setSearch] = useState('');

  const filteredDrives = ACTIVE_DRIVES.filter(d => 
    d.company.toLowerCase().includes(search.toLowerCase()) || 
    d.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Placement Cell" role={user?.role || 'STUDENT'}>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
             <Target size={28} className="text-indigo-500" /> Career Velocity
          </h2>
          <p className="text-slate-400 mt-1">Accelerate your career with premium opportunities and recruiter networking.</p>
        </div>
        <div className="flex gap-2 bg-[#080808] p-1 rounded-2xl border border-white/5 self-stretch md:self-auto">
          {['drives', 'profile', 'applications'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 md:flex-none px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
              {t === 'drives' ? 'Opportunities' : t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Stats & Quick Profile */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-3xl bg-indigo-500 shadow-[0_20px_40px_rgba(99,102,241,0.2)] border border-indigo-400/30 relative overflow-hidden group">
             <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-700" />
             <div className="relative">
                <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest opacity-60">Recruiter Readiness</p>
                <h4 className="text-3xl font-black text-white mt-2">84%</h4>
                <div className="h-1.5 w-full bg-white/10 rounded-full mt-4 overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: "84%" }} transition={{ duration: 1 }} className="h-full bg-white rounded-full" />
                </div>
                <p className="text-[10px] text-indigo-100 mt-3 font-bold">Add 2 more projects to reach 95%</p>
                <button onClick={() => setTab('profile')} className="mt-4 w-full py-2.5 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors">
                   Update Portfolio
                </button>
             </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#080808] border border-white/5 space-y-4">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Statistics</h4>
             {[
               { l: 'Avg CTC', v: '9.2 LPA', i: DollarSign, c: 'text-emerald-400' },
               { l: 'Highest CTC', v: '44 LPA', i: Trophy, c: 'text-amber-500' },
               { l: 'Top Recruiters', v: '150+', i: Building2, c: 'text-blue-400' },
             ].map(s => (
               <div key={s.l} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${s.c}`}><s.i size={16}/></div>
                  <div>
                    <p className="text-sm font-black text-white leading-none">{s.v}</p>
                    <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest mt-0.5">{s.l}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {tab === 'drives' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by company, role or tech stack..."
                    className="w-full bg-[#080808] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold placeholder:text-slate-700" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDrives.map((d, i) => (
                    <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="group p-5 rounded-[2.5rem] bg-[#080808] border border-white/5 hover:border-indigo-500/30 transition-all relative overflow-hidden">
                       <div className="relative flex items-start justify-between gap-4">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-xl font-black text-white shadow-2xl transition-transform group-hover:scale-110" style={{ background: d.color }}>
                              {d.logo}
                            </div>
                            <div>
                               <h3 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors uppercase">{d.company}</h3>
                               <p className="text-xs font-bold text-slate-400 mt-0.5">{d.role}</p>
                            </div>
                          </div>
                          <EligibilityBadge drive={d} profile={RECRUITER_PROFILE} />
                       </div>
                       
                       <div className="mt-6 flex flex-wrap gap-2">
                          {[
                            { l: 'Package', v: d.salary, i: DollarSign, c: 'text-emerald-400' },
                            { l: 'Deadline', v: d.deadline, i: Clock, c: 'text-amber-500' },
                            { l: 'Type', v: d.type, i: Briefcase, c: 'text-indigo-400' },
                          ].map(item => (
                            <div key={item.l} className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                               <item.i size={12} className={item.c} />
                               <span className="text-[10px] font-bold text-white uppercase">{item.v}</span>
                            </div>
                          ))}
                       </div>

                       <div className="mt-6 flex items-center justify-between">
                          <div className="flex -space-x-2">
                             {[1,2,3].map(j => <div key={j} className="w-6 h-6 rounded-full border border-[#080808] bg-slate-800 flex items-center justify-center text-[8px] font-black text-white">+{j*10}</div>)}
                             <span className="text-[8px] text-slate-600 font-black ml-3 self-center uppercase tracking-widest">Applied</span>
                          </div>
                          <button onClick={() => push({ type: 'info', title: 'Drive Details', body: `Opening external portal for ${d.company}...` })}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">
                             View Drive <ChevronRight size={14} />
                          </button>
                       </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {tab === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                 <div className="p-8 rounded-[3rem] bg-[#080808] border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                       <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl font-mono">
                          LIVE PROFILE <Globe size={14}/>
                       </button>
                    </div>
                    <div className="flex flex-col items-center text-center">
                       <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl mb-4">
                          {user?.name?.[0] || 'S'}
                       </div>
                       <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{user?.name || 'Student Name'}</h3>
                       <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">B.Tech · {RECRUITER_PROFILE.cgpa} CGPA · CSE · 2026 Batch</p>
                       <div className="flex gap-3 mt-6">
                          <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-[#0077B5] transition-colors border border-white/5"><Linkedin size={18}/></button>
                          <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-white/5"><Github size={18}/></button>
                          <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-colors border border-white/5"><FileText size={18}/></button>
                       </div>
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Technical Mastery</h4>
                          <div className="flex flex-wrap gap-2">
                             {RECRUITER_PROFILE.skills.map(s => (
                               <span key={s} className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-black border border-indigo-500/20">{s}</span>
                             ))}
                             <button className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-500 text-[10px] font-black border border-white/5 hover:text-white transition-colors flex items-center gap-1"><Plus size={12}/> Skill</button>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Key Projects</h4>
                          <div className="space-y-3">
                             {RECRUITER_PROFILE.projects.map(p => (
                               <div key={p.name} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-white/20 transition-all cursor-pointer">
                                  <div className="flex items-center justify-between">
                                     <p className="text-xs font-black text-white uppercase">{p.name}</p>
                                     <ExternalLink size={12} className="text-slate-600 group-hover:text-indigo-400" />
                                  </div>
                                  <p className="text-[10px] text-slate-500 mt-1 font-bold">{p.desc}</p>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {tab === 'applications' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                 {MY_APPLICATIONS.map((app, i) => (
                   <div key={app.id} className="p-6 rounded-[2rem] bg-[#080808] border border-white/5 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden group">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl font-black text-white group-hover:bg-indigo-500 transition-colors">{app.company[0]}</div>
                         <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-tight">{app.company} <span className="text-slate-500 font-bold ml-2">({app.role})</span></h3>
                            <p className="text-[10px] text-indigo-400 font-black mt-1 uppercase tracking-widest flex items-center gap-1.5">
                               <Clock size={10}/> {app.status}
                            </p>
                         </div>
                      </div>
                      <div className="flex-1 min-w-[200px] border-l border-white/5 pl-6">
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Next Milestone</p>
                         <p className="text-xs font-bold text-white">{app.nextStep || 'Application Closed'}</p>
                      </div>
                      <div className="flex gap-2">
                         <button className="px-4 py-2 rounded-xl bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">Details</button>
                         <button className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">Schedule Mock</button>
                      </div>
                   </div>
                 ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
