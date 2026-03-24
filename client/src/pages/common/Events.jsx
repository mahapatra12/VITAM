import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Users, Trophy, Ticket, Search, Filter,
  Star, Heart, Share2, MapPin, Clock, Plus, X,
  ExternalLink, CheckCircle2, Zap, Globe, MessageSquare,
  Award, Target
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const UPCOMING_EVENTS = [
  { 
    id: "EV-001", title: "VITAM Tech Summit 2026", date: "28 Mar", time: "10:00 AM", 
    location: "Main Auditorium", category: "Technology", attendees: 1250,
    organizer: "GDSC VITAM", image: "T", color: "#4285F4",
    description: "A flagship summit featuring industry leaders from Google, Microsoft, and NVIDIA."
  },
  { 
    id: "EV-002", title: "Cultural Fest: Harmony 2026", date: "05 Apr", time: "05:00 PM", 
    location: "Campus Grounds", category: "Cultural", attendees: 3200,
    organizer: "Student Council", image: "C", color: "#E91E63",
    description: "Annual cultural extravaganza with music, dance, and fashion showcases."
  },
  { 
    id: "EV-003", title: "Inter-College Robotics Challenge", date: "12 Apr", time: "09:00 AM", 
    location: "Robotics Lab", category: "Technical", attendees: 450,
    organizer: "RoboClub", image: "R", color: "#FF9800",
    description: "Battle of the bots! Compete in Robo-War and Line Tracking challenges."
  }
];

const CAMPUS_CLUBS = [
  { name: "GDSC VITAM", members: 840, type: "Technical", lead: "Aryan V.", active: true },
  { name: "Drama Society", members: 120, type: "Cultural", lead: "Sanya K.", active: true },
  { name: "Robotics Club", members: 350, type: "Innovation", lead: "Deepak S.", active: true },
  { name: "Chess Masters", members: 210, type: "Sports", lead: "Rohan M.", active: false },
];

function EventCard({ event, onRegister }) {
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="group p-6 rounded-[2.5rem] bg-[#080808] border border-white/5 hover:border-indigo-500/30 transition-all relative overflow-hidden flex flex-col h-full">
       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />
       
       <div className="flex justify-between items-start mb-6 relative">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-2xl transition-transform group-hover:scale-110" style={{ background: event.color }}>
             {event.image}
          </div>
          <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest">{event.category}</div>
       </div>

       <div className="relative flex-1">
          <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{event.title}</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 mb-4 flex items-center gap-2">
             <Star size={12} className="text-amber-500 fill-amber-500" /> Organized by {event.organizer}
          </p>
          <p className="text-xs text-slate-400 leading-relaxed font-bold mb-6 line-clamp-2">{event.description}</p>
       </div>

       <div className="grid grid-cols-2 gap-4 mb-6 relative">
          <div className="flex items-center gap-2">
             <Calendar size={14} className="text-indigo-500" />
             <span className="text-[10px] font-black text-white uppercase">{event.date} · {event.time}</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
             <MapPin size={14} className="text-amber-500" />
             <span className="text-[10px] font-black text-white uppercase truncate">{event.location}</span>
          </div>
       </div>

       <div className="flex items-center justify-between border-t border-white/5 pt-6 relative">
          <div className="flex items-center gap-1.5">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border border-black bg-slate-800 flex items-center justify-center text-[7px] font-black text-white">+{i*100}</div>)}
             </div>
             <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest ml-1">Going</span>
          </div>
          <button onClick={() => onRegister(event.title)}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20">
             Register Now <ChevronRight size={14} />
          </button>
       </div>
    </motion.div>
  );
}

export default function EventsHub() {
  const { user } = useAuth();
  const { push } = useToast();
  const [tab, setTab] = useState('events'); // events | clubs | my-tickets
  const [search, setSearch] = useState('');

  const handleRegister = (title) => {
    push({ type: 'success', title: 'Registration Success', body: `Your digital pass for ${title} has been generated in "My Tickets".` });
  };

  return (
    <DashboardLayout title="Events & Clubs" role={user?.role || 'STUDENT'}>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
             <Calendar size={28} className="text-indigo-500" /> Campus Pulse
          </h2>
          <p className="text-slate-400 mt-1">Discover technical summits, cultural fests, and innovative student clubs.</p>
        </div>
        <div className="flex gap-2 bg-[#080808] p-1 rounded-2xl border border-white/5 self-stretch md:self-auto">
          {['events', 'clubs', 'my-tickets'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 md:flex-none px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
              {t === 'events' ? 'Highlights' : t === 'my-tickets' ? 'My Wallet' : t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'events' && (
        <div className="space-y-8">
           <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                 <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for Tech Summits, Fests or Challenges..."
                   className="w-full bg-[#080808] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold placeholder:text-slate-700" />
              </div>
              <div className="flex gap-2">
                 {['All', 'Technical', 'Cultural', 'Sports'].map(f => (
                   <button key={f} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all whitespace-nowrap">
                      {f}
                   </button>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {UPCOMING_EVENTS.filter(e => e.title.toLowerCase().includes(search.toLowerCase())).map(event => (
                <EventCard key={event.id} event={event} onRegister={handleRegister} />
              ))}
              <div className="p-8 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-white/30 transition-all min-h-[400px]">
                 <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-600 group-hover:text-indigo-400 group-hover:scale-110 transition-all"><Plus size={32}/></div>
                 <h4 className="text-sm font-black text-slate-600 uppercase mt-4 tracking-widest group-hover:text-white transition-colors">Submit Event Proposal</h4>
                 <p className="text-[10px] text-slate-700 mt-1 font-bold">Pitch your own club event.</p>
              </div>
           </div>
        </div>
      )}

      {tab === 'clubs' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           <div className="lg:col-span-1 space-y-6">
              <div className="p-6 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20">
                 <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Innovation Score</h4>
                 <div className="flex items-end justify-between mb-2">
                    <p className="text-4xl font-black text-white">#04</p>
                    <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider mb-2">Campus Rank</p>
                 </div>
                 <p className="text-[10px] text-slate-500 font-bold leading-relaxed">GDSC VITAM currently leads the innovation stack with 12 successful workshops.</p>
              </div>
              <div className="p-6 rounded-[2rem] bg-[#080808] border border-white/5 space-y-4">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Benefits</h4>
                 {[
                   { l: 'Certification', i: Award, c: 'text-amber-500' },
                   { l: 'Network', i: Globe, c: 'text-blue-400' },
                   { l: 'Governance', i: Target, c: 'text-emerald-400' },
                 ].map(b => (
                    <div key={b.l} className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><b.i size={14} className={b.c}/></div>
                       <span className="text-[10px] font-black text-slate-300 uppercase">{b.l}</span>
                    </div>
                 ))}
              </div>
           </div>

           <div className="lg:col-span-3 space-y-4">
              {CAMPUS_CLUBS.map((club, i) => (
                <motion.div key={club.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-3xl bg-[#080808] border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl font-black text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">{club.name[0]}</div>
                      <div>
                         <h3 className="text-sm font-black text-white uppercase tracking-tight">{club.name}</h3>
                         <div className="flex gap-4 text-[9px] text-slate-600 font-black uppercase mt-1">
                            <span>{club.members} Members</span>
                            <span>{club.type}</span>
                            <span>Lead: {club.lead}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      {club.active && <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest">Hiring</div>}
                      <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-white hover:bg-white/10 transition-all">
                         View Details
                      </button>
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      )}

      {tab === 'my-tickets' && (
        <div className="max-w-2xl mx-auto space-y-6">
           <div className="p-8 rounded-[3rem] bg-indigo-500/10 border border-indigo-500/30 relative overflow-hidden flex flex-col items-center justify-center text-center py-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32" />
              <Ticket size={56} className="text-indigo-500/30 mb-4" />
              <h3 className="text-xl font-black text-white">Digital Pass Wallet</h3>
              <p className="text-slate-500 mt-2 text-sm font-bold">Your registrations for Tech Summit and Robotic Battle are secured. Use your Digital ID card for scanning at the venue.</p>
              <button onClick={() => window.location.href='/student/id-card'} className="mt-8 px-8 py-4 bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl font-mono flex items-center gap-2">
                 OPEN DIGITAL ID <ExternalLink size={14}/>
              </button>
           </div>
           
           <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Target size={16}/>
                <span className="text-[10px] font-black uppercase tracking-widest">Entry Policies</span>
              </div>
              <ul className="space-y-2">
                {["Tickets are non-transferable", "Carry physical ID (if asked) for major fests", "Entry closes 15 mins after start", "Registration required for certification"].map(r => (
                  <li key={r} className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-600" /> {r}
                  </li>
                ))}
              </ul>
           </div>
        </div>
      )}
    </DashboardLayout>
  );
}
