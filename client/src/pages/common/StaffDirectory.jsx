import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Mail, Phone, MapPin, BookOpen,
  ChevronRight, ExternalLink, Filter, Globe
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

const DEPARTMENTS = ['All', 'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Mathematics', 'Physics', 'Management'];

const STAFF = [
  { id: 1, name: 'Dr. Priya Nair',      role: 'Professor & HOD',    dept: 'Computer Science',  phone: '+91 98765 43210', email: 'priya.nair@vitam.edu',     office: 'CS Block, Room 301',  subjects: ['Data Structures', 'Algorithms'],     experience: 18, avatar: 'P', phd: true },
  { id: 2, name: 'Prof. Rahul Sharma',   role: 'Associate Professor', dept: 'Electronics',       phone: '+91 98765 43211', email: 'rahul.sharma@vitam.edu',   office: 'ECE Block, Room 204', subjects: ['VLSI Design', 'Signal Processing'],  experience: 12, avatar: 'R', phd: true },
  { id: 3, name: 'Dr. Ananya Krishnan',  role: 'Assistant Professor', dept: 'Computer Science',  phone: '+91 98765 43212', email: 'ananya.k@vitam.edu',       office: 'CS Block, Room 209',  subjects: ['OS', 'Cloud Computing'],             experience: 8,  avatar: 'A', phd: true },
  { id: 4, name: 'Prof. Kiran Reddy',    role: 'Associate Professor', dept: 'Mechanical',        phone: '+91 98765 43213', email: 'kiran.r@vitam.edu',        office: 'Mech Block, Room 105',subjects: ['Thermodynamics', 'Fluid Mechanics'],  experience: 15, avatar: 'K', phd: false },
  { id: 5, name: 'Dr. Sneha Menon',      role: 'Professor',           dept: 'Mathematics',       phone: '+91 98765 43214', email: 'sneha.m@vitam.edu',        office: 'Main Block, Room 401',subjects: ['Calculus', 'Linear Algebra'],         experience: 20, avatar: 'S', phd: true },
  { id: 6, name: 'Prof. Aditya Singh',   role: 'Assistant Professor', dept: 'Electronics',       phone: '+91 98765 43215', email: 'aditya.s@vitam.edu',       office: 'ECE Block, Room 112', subjects: ['Embedded Systems', 'IoT'],           experience: 6,  avatar: 'A', phd: false },
  { id: 7, name: 'Dr. Meera Das',        role: 'Professor & HOD',    dept: 'Civil',             phone: '+91 98765 43216', email: 'meera.d@vitam.edu',        office: 'Civil Block, Room 201',subjects: ['Structural Analysis', 'Soil Mech.'], experience: 22, avatar: 'M', phd: true },
  { id: 8, name: 'Prof. Suresh Pillai',  role: 'Associate Professor', dept: 'Physics',           phone: '+91 98765 43217', email: 'suresh.p@vitam.edu',       office: 'Main Block, Room 305',subjects: ['Engineering Physics', 'Optics'],      experience: 14, avatar: 'S', phd: false },
  { id: 9, name: 'Dr. Kavya Menon',      role: 'Assistant Professor', dept: 'Computer Science',  phone: '+91 98765 43218', email: 'kavya.m@vitam.edu',        office: 'CS Block, Room 215',  subjects: ['Machine Learning', 'Deep Learning'], experience: 5,  avatar: 'K', phd: true },
  { id: 10, name: 'Prof. Rohit Bhat',    role: 'Associate Professor', dept: 'Management',        phone: '+91 98765 43219', email: 'rohit.b@vitam.edu',        office: 'Admin Block, Room 102',subjects: ['Business Analytics', 'Strategy'],    experience: 10, avatar: 'R', phd: false },
  { id: 11, name: 'Dr. Divya Iyer',      role: 'Professor',           dept: 'Computer Science',  phone: '+91 98765 43220', email: 'divya.i@vitam.edu',        office: 'CS Block, Room 310',  subjects: ['DBMS', 'Big Data Analytics'],        experience: 16, avatar: 'D', phd: true },
  { id: 12, name: 'Prof. Nikhil Rao',    role: 'Assistant Professor', dept: 'Mechanical',        phone: '+91 98765 43221', email: 'nikhil.r@vitam.edu',       office: 'Mech Block, Room 203',subjects: ['Manufacturing', 'CAD/CAM'],          experience: 7,  avatar: 'N', phd: false },
];

const ROLE_COLORS = {
  'Professor & HOD':     '#f59e0b',
  'Professor':           '#6366f1',
  'Associate Professor': '#3b82f6',
  'Assistant Professor': '#10b981',
};

function StaffCard({ staff }) {
  const [expanded, setExpanded] = useState(false);
  const roleColor = ROLE_COLORS[staff.role] || '#6366f1';

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-[#080808] border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all group">
      <div className="p-5">
        <div className="flex items-start gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white flex-shrink-0 relative"
            style={{ background: `linear-gradient(135deg, ${roleColor}30, ${roleColor}15)`, border: `1px solid ${roleColor}30` }}>
            {staff.avatar}
            {staff.phd && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                <span className="text-[7px] font-black text-white">Dr</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors leading-snug">{staff.name}</h3>
            <p className="text-[10px] font-bold mt-0.5" style={{ color: roleColor }}>{staff.role}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">{staff.dept} · {staff.experience} yrs exp</p>
          </div>
        </div>

        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 hover:text-slate-300 transition-colors">
            <MapPin size={10} className="flex-shrink-0" />
            <span className="truncate">{staff.office}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
            onClick={() => window.location.href = `mailto:${staff.email}`}>
            <Mail size={10} className="flex-shrink-0" />
            <span className="truncate">{staff.email}</span>
          </div>
        </div>

        {/* Subjects */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {staff.subjects.map(s => (
            <span key={s} className="text-[8px] font-black px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 uppercase tracking-widest">{s}</span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 flex items-center justify-between border-t border-white/5 pt-3">
        <a href={`tel:${staff.phone}`} className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-emerald-400 transition-colors font-bold">
          <Phone size={11} /> {staff.phone}
        </a>
        <button onClick={() => setExpanded(e => !e)}
          className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-xl hover:bg-indigo-500/20 transition-colors">
          {expanded ? 'Less' : 'View Profile'}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5">
            <div className="p-5 space-y-2 bg-white/[0.01]">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                {['Book Appointment', 'Send Email', 'View Publications'].map(a => (
                  <button key={a} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-slate-400 hover:text-white hover:bg-white/10 transition-colors uppercase tracking-widest">
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function StaffDirectory() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [view, setView] = useState('grid'); // grid | list

  const filtered = STAFF.filter(s =>
    (dept === 'All' || s.dept === dept) &&
    (search === '' || s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.dept.toLowerCase().includes(search.toLowerCase()) ||
      s.subjects.some(sub => sub.toLowerCase().includes(search.toLowerCase())))
  );

  const deptCounts = DEPARTMENTS.reduce((acc, d) => ({ ...acc, [d]: d === 'All' ? STAFF.length : STAFF.filter(s => s.dept === d).length }), {});

  return (
    <DashboardLayout title="Staff Directory" role={user?.role || 'STUDENT'}>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Users size={28} className="text-blue-500" /> Faculty Directory
          </h2>
          <p className="text-slate-400 mt-1">{STAFF.length} faculty members across {DEPARTMENTS.length - 1} departments.</p>
        </div>
        <div className="flex items-center gap-2">
          {['grid', 'list'].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${view === v ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-white/[0.02] border-white/10 text-slate-500 hover:text-white'}`}>
              {v === 'grid' ? '⊞ Grid' : '≡ List'}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, department, or subject..."
          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-slate-600" />
      </div>

      {/* Department Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {DEPARTMENTS.filter(d => deptCounts[d] > 0).map(d => (
          <button key={d} onClick={() => setDept(d)}
            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${dept === d ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/[0.02] border-white/10 text-slate-500 hover:border-white/20 hover:text-white'}`}>
            {d} {d === 'All' ? `(${STAFF.length})` : `(${deptCounts[d]})`}
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <Users size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-bold">No faculty match your search.</p>
        </div>
      ) : (
        <motion.div layout
          className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          <AnimatePresence>
            {filtered.map(staff => <StaffCard key={staff.id} staff={staff} />)}
          </AnimatePresence>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
