import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  MapPin, Clock, Users, Plus, Target, Presentation, Sparkles
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useAuth } from '../../context/AuthContext';
import AIChat from '../../components/AIChat';

const MOCK_EVENTS = [
  { id: 1, title: 'Autonomous Status Board Review', type: 'Administrative', date: 15, time: '10:00 AM', location: 'Senate Hall', color: 'purple' },
  { id: 2, title: 'AI/ML Hackathon Finals', type: 'Academic', date: 18, time: '09:00 AM', location: 'Innovation Hub', color: 'blue' },
  { id: 3, title: 'TCS Placement Drive', type: 'Career', date: 22, time: '08:30 AM', location: 'Auditorium', color: 'emerald' },
  { id: 4, title: 'Mid-Semester Examinations', type: 'Exam', date: 28, time: '10:00 AM', location: 'All Blocks', color: 'amber' },
];

export default function MasterCalendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <DashboardLayout title="Institutional Calendar" role={user?.role || "USER"}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight">Master Schedule</h2>
           <p className="text-slate-400 font-medium mt-1">Cross-departmental event and academic telemetry</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]">
          <Plus size={18} /> Dispatch Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
        
        {/* Calendar Grid */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GlassCard className="p-0 overflow-hidden">
             
             {/* Header */}
             <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-800/20">
               <h3 className="text-2xl font-black text-white">{monthNames[currentDate.getMonth()]} <span className="text-slate-500">{currentDate.getFullYear()}</span></h3>
               <div className="flex gap-2">
                 <button onClick={handlePrevMonth} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700"><ChevronLeft size={20}/></button>
                 <button onClick={handleNextMonth} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700"><ChevronRight size={20}/></button>
               </div>
             </div>

             {/* Days of Week */}
             <div className="grid grid-cols-7 border-b border-white/5 bg-slate-900/50">
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                 <div key={day} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                   {day}
                 </div>
               ))}
             </div>

             {/* Dynamic Calendar Grid */}
             <div className="grid grid-cols-7 auto-rows-[120px] bg-slate-800/10">
               {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                 <div key={`empty-${i}`} className="border-r border-b border-white/5 opacity-50 bg-slate-900/30" />
               ))}
               
               {Array.from({ length: daysInMonth }).map((_, i) => {
                 const dayNumber = i + 1;
                 const dayEvents = MOCK_EVENTS.filter(e => e.date === dayNumber && currentDate.getMonth() === 2); // specific for mock match
                 const isToday = dayNumber === 15; // mock today

                 return (
                   <div key={dayNumber} className={`relative p-2 border-r border-b border-white/5 transition-colors hover:bg-white/5 group ${isToday ? 'bg-blue-500/5' : ''}`}>
                     <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-slate-400 group-hover:text-white'}`}>
                       {dayNumber}
                     </span>
                     
                     <div className="mt-2 space-y-1">
                       {dayEvents.map(evt => (
                         <div key={evt.id} className={`px-2 py-1 text-[9px] font-black truncate rounded bg-${evt.color}-500/20 text-${evt.color}-400 border border-${evt.color}-500/20 cursor-pointer hover:bg-${evt.color}-500/30 transition-all`}>
                           {evt.title}
                         </div>
                       ))}
                     </div>
                   </div>
                 );
               })}
             </div>
          </GlassCard>
        </div>

        {/* Agenda Feed */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <GlassCard title="Incoming Events" subtitle="Near-term schedule telemetry" icon={CalendarIcon}>
             <div className="mt-4 space-y-4">
               {MOCK_EVENTS.map((evt, i) => (
                 <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   key={evt.id} 
                   className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-white/10 hover:bg-slate-800/60 transition-all group cursor-pointer"
                 >
                   <div className="flex justify-between items-start mb-3">
                     <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-${evt.color}-500/10 text-${evt.color}-400`}>
                       {evt.type}
                     </span>
                     <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-white transition-colors">{monthNames[currentDate.getMonth()].slice(0,3)} {evt.date}</span>
                   </div>
                   
                   <h4 className="text-sm font-black text-white tracking-tight mb-3 group-hover:text-blue-400 transition-colors">{evt.title}</h4>
                   
                   <div className="space-y-1.5">
                     <div className="flex items-center gap-2 text-xs text-slate-400">
                       <Clock size={12} className="text-slate-500" /> {evt.time}
                     </div>
                     <div className="flex items-center gap-2 text-xs text-slate-400">
                       <MapPin size={12} className="text-slate-500" /> {evt.location}
                     </div>
                   </div>
                 </motion.div>
               ))}
             </div>
             
             <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
                <h4 className="text-xs font-black text-white flex items-center gap-2 mb-1"><Sparkles size={14} className="text-blue-400"/> AI Coordinator</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">VITAM AI detects a schedule conflict on the 28th between Mid-Sems and the external placement drive. Resolution sequence initiated.</p>
             </div>
          </GlassCard>
        </div>
      </div>

      {user?.role === 'STUDENT' && <AIChat role="student" />}
    </DashboardLayout>
  );
}
