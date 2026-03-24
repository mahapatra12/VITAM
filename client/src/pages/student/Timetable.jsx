import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, User, ChevronRight, Zap, Globe, Cpu, Navigation, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../utils/api';

const ScheduleSlot = ({ slot, onNavigate }) => (
  <motion.div 
    whileHover={{ x: 10 }}
    className={`p-8 rounded-[40px] border shadow-2xl relative overflow-hidden group flex flex-col md:flex-row md:items-center gap-10 transition-colors ${slot.status === 'In Session' ? 'bg-[#0a0a0a] border-appleBlue/20 shadow-appleBlue/5' : 'bg-[#0a0a0a] border-white/5'}`}
  >
    {slot.status === 'In Session' && (
      <div className="absolute left-0 top-0 w-2 h-full bg-appleBlue animate-pulse" />
    )}
    
    <div className="w-full md:w-32 shrink-0">
      <div className={`p-4 rounded-2xl flex items-center justify-center gap-3 ${slot.status === 'In Session' ? 'bg-appleBlue text-white' : 'bg-appleBlue/10 text-appleBlue'}`}>
        <Clock size={16} />
        <span className="text-sm font-black tabular-nums">{slot.time}</span>
      </div>
    </div>
    
    <div className="flex-1 space-y-2">
       <div className="flex items-center gap-3">
          <Cpu size={14} className="text-apple-text-secondary dark:text-white/20" />
          <p className="text-[10px] font-black uppercase tracking-widest text-apple-text-secondary dark:text-white/20">Scheduled Class</p>
       </div>
       <h3 className={`text-2xl font-black tracking-tight italic uppercase transition-colors ${slot.status === 'In Session' ? 'text-appleBlue' : 'text-white group-hover:text-appleBlue'}`}>{slot.subject}</h3>
       <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
             <User size={12} className="text-appleBlue/40" />
             <span className="text-xs font-bold text-white/40">{slot.faculty}</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer group/loc" onClick={() => onNavigate(slot)}>
             <MapPin size={12} className="text-appleBlue/40 group-hover/loc:text-appleBlue transition-colors" />
             <span className="text-xs font-bold text-white/40 group-hover/loc:text-white transition-colors">{slot.room}</span>
          </div>
       </div>
    </div>
    
    <div className="flex gap-4 md:ml-auto">
       <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest italic border ${slot.status === 'In Session' ? 'bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-black/5 dark:bg-white/5 text-white/20 border-white/5'}`}>
          {slot.status || 'Standby'}
       </div>
       <button onClick={() => onNavigate(slot)} className="p-4 bg-white/5 rounded-2xl text-white/20 hover:text-appleBlue transition-all">
          <Navigation size={18} />
       </button>
    </div>
  </motion.div>
);

const Timetable = () => {
  const [schedule, setSchedule] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  const [loading, setLoading] = useState(true);
  const [navSlot, setNavSlot] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await api.get('/timetable/branch/' + (localStorage.getItem('branch') || 'CSE') + '/' + (localStorage.getItem('semester') || '3'));
        if (res.data && res.data.slots) {
           setSchedule(res.data.slots);
        } else {
          setSchedule([
            { time: "09:00 AM", subject: "Quantum Logic", faculty: "Dr. Rivera", room: "VAULT-01", status: "Completed" },
            { time: "11:00 AM", subject: "Neural Networks", faculty: "Prof. Sato", room: "NODE-402", status: "In Session" },
            { time: "01:30 PM", subject: "Institutional Ethics", faculty: "Admin Alpha", room: "CORRIDOR-A", status: "Standby" },
            { time: "03:30 PM", subject: "System Security", faculty: "Dr. Stern", room: "VAULT-04", status: "Standby" },
          ]);
        }
      } catch (err) {
        setSchedule([
          { time: "09:00 AM", subject: "Quantum Logic", faculty: "Dr. Rivera", room: "VAULT-01", status: "Completed" },
          { time: "11:00 AM", subject: "Neural Networks", faculty: "Prof. Sato", room: "NODE-402", status: "In Session" },
          { time: "01:30 PM", subject: "Institutional Ethics", faculty: "Admin Alpha", room: "CORRIDOR-A", status: "Standby" },
          { time: "03:30 PM", subject: "System Security", faculty: "Dr. Stern", room: "VAULT-04", status: "Standby" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [selectedDay]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <DashboardLayout title="Weekly Schedule" role="STUDENT">
      <div className="relative min-h-screen p-4 md:p-10 space-y-12 max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-10">
           <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping shadow-[0_0_10px_#a855f7]" />
                <span className="text-[11px] font-black uppercase tracking-[0.8em] text-apple-text-secondary dark:text-white/40">Temporal State: Synchronized</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-apple-text-primary dark:text-white tracking-tight">Daily <span className="text-appleBlue">Schedule</span></h1>
              <p className="text-sm font-bold text-apple-text-secondary dark:text-white/20 uppercase tracking-[0.4em] max-w-xl">
                View your daily class schedule, faculty details, and room assignments.
              </p>
           </div>
           
           <div className="text-right space-y-2">
              <div className="px-6 py-3 bg-appleBlue/10 border border-appleBlue/30 rounded-2xl">
                 <p className="text-[10px] font-black text-appleBlue uppercase tracking-widest">NEXT CLASS: 14m 22s</p>
              </div>
              <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter tabular-nums">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Institutional Temporal Node</p>
           </div>
        </div>

        {/* Day Selector */}
        <div className="flex flex-wrap gap-4 p-4 bg-black/5 dark:bg-white/5 rounded-[35px] border border-black/5 dark:border-white/5 backdrop-blur-xl">
          {days.map((day) => (
            <button 
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.3em] transition-all ${selectedDay === day ? 'bg-appleBlue text-white shadow-xl shadow-appleBlue/20 scale-105' : 'text-apple-text-secondary dark:text-white/20 hover:text-white hover:bg-white/5'}`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Schedule List */}
        <div className="space-y-8 pb-20">
          {schedule.map((slot, i) => (
            <ScheduleSlot key={i} slot={slot} onNavigate={setNavSlot} />
          ))}
        </div>

        {/* Global Navigation Overlay */}
        <AnimatePresence>
          {navSlot && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-3xl flex items-center justify-center p-6"
            >
               <motion.div 
                 initial={{ scale: 0.9, y: 20 }}
                 animate={{ scale: 1, y: 0 }}
                 className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[50px] p-12 relative overflow-hidden group"
               >
                  <div className="absolute top-0 right-0 p-8">
                     <button onClick={() => setNavSlot(null)} className="p-4 bg-white/5 rounded-full text-white">
                        <X size={24} />
                     </button>
                  </div>
                  
                  <div className="space-y-10">
                     <div className="flex items-center gap-6">
                        <div className="p-6 bg-appleBlue rounded-[30px] text-white">
                           <Navigation size={32} />
                        </div>
                        <div>
                           <h3 className="text-2xl font-black text-white uppercase italic">{navSlot.subject}</h3>
                           <p className="text-[10px] font-black text-appleBlue uppercase tracking-[0.4em]">{navSlot.room}</p>
                        </div>
                     </div>

                     <div className="p-10 bg-white/5 rounded-[40px] border border-white/5 relative overflow-hidden text-center space-y-6">
                        <div className="p-4 bg-white/5 rounded-2xl inline-flex items-center gap-4 text-emerald-500">
                           <MapPin size={24} />
                           <span className="text-xl font-black italic uppercase tracking-tighter">BLOCK-C // LEVEL 04</span>
                        </div>
                        <p className="text-xs font-bold text-white/30 leading-relaxed max-w-sm mx-auto">
                           Proceed through the South Corridor. The room is adjacent to the Quantum Simulation Lab.
                        </p>
                        <div className="pt-6">
                           <button className="w-full py-5 bg-appleBlue text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-appleBlue/20">Sync AR Navigation</button>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default Timetable;
