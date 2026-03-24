import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Book, Users, MapPin, CheckCircle2, AlertCircle, ZapIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

const INITIAL_SCHEDULE = {
  Monday:    ['CS301-L', 'CS301-L', null, 'CS401-L', null, 'BREAK', 'CS501-T'],
  Tuesday:   [null, 'CS401-L', 'CS501-T', null, 'CS301-L', 'CS401-T', null],
  Wednesday: ['CS501-T', null, 'CS301-L', 'CS301-L', null, null, 'CS401-L'],
  Thursday:  ['CS401-L', 'CS401-T', null, 'CS501-T', 'CS301-L', null, null],
  Friday:    [null, 'CS501-T', 'CS401-L', null, 'CS301-L', 'CS301-T', null],
};

const SUBJECT_META = {
  'CS301-L': { name: 'Data Structures', type: 'Lecture', room: 'A-201', color: 'from-blue-600 to-indigo-600', border: 'border-blue-500/30', badge: 'bg-blue-500/10 text-blue-400' },
  'CS401-L': { name: 'Operating Systems', type: 'Lecture', room: 'B-104', color: 'from-purple-600 to-violet-600', border: 'border-purple-500/30', badge: 'bg-purple-500/10 text-purple-400' },
  'CS501-T': { name: 'Cloud Computing', type: 'Tutorial', room: 'C-301', color: 'from-emerald-600 to-teal-600', border: 'border-emerald-500/30', badge: 'bg-emerald-500/10 text-emerald-400' },
  'CS301-T': { name: 'DS Lab', type: 'Lab', room: 'Lab-2', color: 'from-amber-600 to-orange-600', border: 'border-amber-500/30', badge: 'bg-amber-500/10 text-amber-400' },
  'CS401-T': { name: 'OS Lab', type: 'Lab', room: 'Lab-1', color: 'from-rose-600 to-pink-600', border: 'border-rose-500/30', badge: 'bg-rose-500/10 text-rose-400' },
  'BREAK': null,
};

const TODAY = DAYS[new Date().getDay() - 1] || 'Monday';

export default function FacultyTimetable() {
  const { user } = useAuth();
  const { push } = useToast();
  const [activeDay, setActiveDay] = useState(TODAY);
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const todaySlots = schedule[activeDay] || [];
  
  const totalWeeklyHours = Object.values(schedule).flat().filter(Boolean).filter(s => s !== 'BREAK').length;
  const todayClasses = todaySlots.filter(Boolean).filter(s => s !== 'BREAK').length;

  const handleMarkDone = (slotIndex) => {
    push({ type: 'success', title: 'Class Logged', body: `${SUBJECT_META[todaySlots[slotIndex]]?.name} attendance marked in digital ledger.` });
    setSelectedSlot(null);
  };

  const handleCancel = (slotIndex) => {
    push({ type: 'warning', title: 'Class Cancelled', body: `${SUBJECT_META[todaySlots[slotIndex]]?.name} — students will be notified automatically.` });
    const updated = { ...schedule };
    updated[activeDay] = [...updated[activeDay]];
    updated[activeDay][slotIndex] = null;
    setSchedule(updated);
    setSelectedSlot(null);
  };

  return (
    <DashboardLayout title="Timetable Management" role={user?.role || 'FACULTY'}>
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Calendar size={28} className="text-indigo-500" />
            Smart Timetable Grid
          </h2>
          <p className="text-slate-400 font-medium mt-1">Interactive scheduling matrix with live conflict detection.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-2">
            <ZapIcon size={14} className="text-amber-400" /> {totalWeeklyHours} hrs/week
          </div>
          <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs font-bold text-indigo-400 flex items-center gap-2">
            <Clock size={14} /> Today: {todayClasses} classes
          </div>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 hiding-scrollbar">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => { setActiveDay(day); setSelectedSlot(null); }}
            className={`flex-shrink-0 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeDay === day ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'}`}
          >
            {day === TODAY ? `${day.slice(0,3)} ★` : day.slice(0, 3)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timetable Grid */}
        <div className="lg:col-span-2 space-y-3">
          {SLOTS.map((slot, i) => {
            const code = todaySlots[i];
            const meta = code ? SUBJECT_META[code] : null;
            const isActive = selectedSlot === i;
            const isBreak = code === 'BREAK';

            return (
              <motion.div
                key={slot}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => code && !isBreak && setSelectedSlot(isActive ? null : i)}
                className={`relative rounded-2xl border overflow-hidden transition-all cursor-pointer ${
                  isBreak ? 'opacity-40 cursor-default' :
                  code ? `${meta.border} hover:border-white/30 ${isActive ? 'ring-2 ring-indigo-500/50 border-indigo-500/50' : ''}` :
                  'border-white/5 border-dashed hover:border-white/20'
                } ${code && !isBreak ? 'bg-white/[0.02]' : 'bg-transparent'}`}
              >
                <div className="flex items-center p-4 gap-4">
                  {/* Time */}
                  <div className="w-16 flex-shrink-0">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{slot}</p>
                    <p className="text-[9px] text-slate-700 font-bold mt-0.5">→ {SLOTS[i+1] || '17:00'}</p>
                  </div>

                  {/* Separator */}
                  <div className="w-px h-10 bg-white/10 flex-shrink-0" />
                  
                  {/* Content */}
                  {isBreak ? (
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">— Lunch Break —</p>
                  ) : code && meta ? (
                    <div className="flex flex-1 items-center gap-4 min-w-0">
                      <div className={`w-1.5 h-10 rounded-full bg-gradient-to-b ${meta.color} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white truncate">{meta.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${meta.badge}`}>{meta.type}</span>
                          <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                            <MapPin size={9} /> {meta.room}
                          </span>
                        </div>
                      </div>
                      <CheckCircle2 size={18} className={isActive ? 'text-indigo-400' : 'text-slate-700'} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-slate-700">
                      <Plus size={16} />
                      <p className="text-xs font-bold">Free Slot</p>
                    </div>
                  )}
                </div>

                {/* Expanded Actions */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-white/5"
                    >
                      <div className="p-4 flex gap-3">
                        <button onClick={() => handleMarkDone(i)} className="flex-1 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2">
                          <CheckCircle2 size={12} /> Mark Complete
                        </button>
                        <button onClick={() => handleCancel(i)} className="flex-1 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2">
                          <AlertCircle size={12} /> Cancel Class
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Weekly Summary Panel */}
        <div className="space-y-4">
          <GlassCard>
            <div className="p-5 border-b border-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Weekly Load Matrix</h3>
            </div>
            <div className="p-5 space-y-3">
              {DAYS.map(day => {
                const count = (schedule[day] || []).filter(s => s && s !== 'BREAK').length;
                const max = 7;
                return (
                  <div key={day} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className={day === activeDay ? 'text-indigo-400 font-black' : 'text-slate-500'}>{day.slice(0,3)}</span>
                      <span className="text-slate-400">{count} classes</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / max) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${day === activeDay ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-slate-600'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-5 border-b border-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Subject Index</h3>
            </div>
            <div className="p-4 space-y-2">
              {Object.entries(SUBJECT_META).filter(([,v]) => v).map(([code, meta]) => (
                <div key={code} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${meta.color}`} />
                  <div>
                    <p className="text-[10px] font-black text-white">{meta.name}</p>
                    <p className="text-[9px] text-slate-500">{meta.type} · {meta.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
