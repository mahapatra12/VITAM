import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  Clock3,
  MapPin,
  Navigation,
  UserRound,
  X
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard, StatCard } from '../../components/ui/DashboardComponents';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import api from '../../utils/api';
import {
  DEFAULT_PORTAL_DATA,
  STUDENT_PORTAL_DAYS,
  enrichTimetableForDay,
  getCurrentPortalDay,
  normalizePortalData
} from '../../utils/studentPortalData';

const statusTone = (status) => {
  if (status === 'In Session') {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
  }

  if (status === 'Completed') {
    return 'border-slate-600/40 bg-slate-800/60 text-slate-300';
  }

  return 'border-blue-500/20 bg-blue-500/10 text-blue-200';
};

function ScheduleCard({ slot, onNavigate }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="surface-card p-5 md:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.05] text-blue-200">
            <Clock3 size={22} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xl font-black text-white">
                {slot.subject}
              </p>
              <span className={`rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] ${statusTone(slot.status)}`}>
                {slot.status}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <UserRound size={14} className="text-slate-500" />
                {slot.faculty}
              </span>
              <button
                type="button"
                onClick={() => onNavigate(slot)}
                className="flex items-center gap-2 text-blue-200 transition-colors hover:text-white"
              >
                <MapPin size={14} />
                {slot.room}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[280px]">
          <div className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
              Class time
            </p>
            <p className="mt-2 text-lg font-black text-white">
              {slot.time}
            </p>
          </div>
          <button type="button" onClick={() => onNavigate(slot)} className="btn-secondary justify-center">
            <Navigation size={14} />
            Room guide
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Timetable() {
  const [portalData, setPortalData] = useState(DEFAULT_PORTAL_DATA);
  const [selectedDay, setSelectedDay] = useState(getCurrentPortalDay());
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [navSlot, setNavSlot] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadPortalData = async () => {
      try {
        const { data } = await api.get('/student/portal', {
          cache: {
            maxAge: 30000,
            staleWhileRevalidate: true,
            revalidateAfter: 12000,
            persist: true,
            onUpdate: (response) => setPortalData(normalizePortalData(response?.data))
          }
        });
        setPortalData(normalizePortalData(data));
      } catch {
        setPortalData(DEFAULT_PORTAL_DATA);
      } finally {
        setLoading(false);
      }
    };

    loadPortalData();
  }, []);

  useEffect(() => {
    if (portalData?.today) {
      setSelectedDay(portalData.today);
    }
  }, [portalData.today]);

  const schedule = useMemo(
    () => enrichTimetableForDay(selectedDay, portalData.timetable?.[selectedDay] || [], currentTime),
    [currentTime, portalData.timetable, selectedDay]
  );

  const liveToday = portalData.today || getCurrentPortalDay();
  const todaySchedule = useMemo(
    () => enrichTimetableForDay(liveToday, portalData.timetable?.[liveToday] || [], currentTime),
    [currentTime, liveToday, portalData.timetable]
  );

  const nextSlot = schedule.find((slot) => slot.status !== 'Completed') || schedule[0];
  const currentDayNextSlot = todaySchedule.find((slot) => slot.status !== 'Completed') || todaySchedule[0];
  const inSessionCount = schedule.filter((slot) => slot.status === 'In Session').length;
  const completedCount = schedule.filter((slot) => slot.status === 'Completed').length;
  const totalWeeklyClasses = STUDENT_PORTAL_DAYS.reduce(
    (sum, day) => sum + (portalData.timetable?.[day]?.length || 0),
    0
  );
  const dayProgressLabel = schedule.length ? `${completedCount}/${schedule.length} completed` : 'No classes';

  if (loading) {
    return (
      <DashboardLayout title="Weekly Schedule" role="STUDENT">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-600/30 border-t-blue-600 shadow-2xl shadow-blue-600/20" />
          <p className="animate-pulse text-[11px] font-black uppercase tracking-[0.6em] text-slate-500">
            Timetable synchronization
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Weekly Schedule" role="STUDENT">
      <WorkspaceHero
        eyebrow="Timetable workspace"
        title="Daily academic timeline"
        description="Check live class flow, faculty, room movement, and the next active session from a timetable layout designed to stay fast and easy to scan on both laptop and mobile."
        icon={CalendarDays}
        badges={[
          `${selectedDay} selected`,
          `${schedule.length} classes scheduled`,
          `${inSessionCount} live now`
        ]}
        stats={[
          { label: 'Current time', value: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          { label: 'Next class', value: nextSlot?.time || '--' },
          { label: 'Weekly load', value: String(totalWeeklyClasses) },
          { label: 'Progress', value: dayProgressLabel }
        ]}
        aside={(
          <div className="glass-panel h-full p-6 md:p-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
              Next movement
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              {currentDayNextSlot?.subject || 'No active class'}
            </h3>
            <div className="mt-6 space-y-3">
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Program lane
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  {portalData.profile.program} | {portalData.profile.semesterLabel}
                </p>
              </div>
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Navigation note
                </p>
                <p className="mt-3 text-sm leading-6 text-emerald-300">
                  Use room guide before the bell window starts so room changes feel smoother across blocks.
                </p>
              </div>
            </div>
          </div>
        )}
      />

      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard title="Classes Today" value={String(todaySchedule.length)} icon={CalendarDays} color="bg-blue-500" trend="Academic load" />
        <StatCard title="In Session" value={String(inSessionCount)} icon={Clock3} color="bg-emerald-500" trend="Live now" />
        <StatCard title="Completed" value={String(completedCount)} icon={Clock3} color="bg-slate-700" trend="Finished" />
        <StatCard title="Next Room" value={nextSlot?.room || '--'} icon={MapPin} color="bg-violet-500" trend="Movement ready" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <GlassCard title="Week Selector" subtitle="Jump between live day schedules">
          <div className="flex flex-wrap gap-2">
            {STUDENT_PORTAL_DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={selectedDay === day ? 'btn-primary' : 'btn-secondary'}
              >
                {day}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard title="Day Focus" subtitle="What to remember" icon={Navigation}>
          <div className="space-y-3">
            {[
              currentDayNextSlot
                ? `${currentDayNextSlot.subject} is the next high-priority movement on your current schedule.`
                : 'No immediate class lane is active right now.',
              `${portalData.profile.branch} students can use this space as the quick handoff view before moving to labs or lecture rooms.`,
              'Completed classes remain visible so your daily flow stays easy to track.'
            ].map((item) => (
              <div key={item} className="surface-card flex items-start gap-3 p-4">
                <div className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                <p className="text-sm leading-6 text-slate-200">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard title={`${selectedDay} Schedule`} subtitle="Live class timeline and room movement">
        <div className="space-y-4">
          {schedule.length ? (
            schedule.map((slot) => (
              <ScheduleCard key={`${selectedDay}-${slot.time}-${slot.subject}`} slot={slot} onNavigate={setNavSlot} />
            ))
          ) : (
            <div className="surface-card p-6 text-sm leading-7 text-slate-300">
              No classes are scheduled for {selectedDay}. The timetable will update automatically when academic scheduling changes.
            </div>
          )}
        </div>
      </GlassCard>

      <AnimatePresence>
        {navSlot ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(3,8,20,0.78)] p-4 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 12 }}
              className="premium-card relative w-full max-w-2xl overflow-hidden p-6 md:p-8"
            >
              <button
                type="button"
                onClick={() => setNavSlot(null)}
                className="absolute right-5 top-5 rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 text-slate-500 transition-all hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
                <div className="glass-panel p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-blue-500/20 bg-blue-500/10 text-blue-200">
                    <Navigation size={24} />
                  </div>
                  <h3 className="mt-5 text-2xl font-black text-white">
                    {navSlot.subject}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    Move toward {navSlot.room} for the next session. This route card is ready for indoor map integration and guided navigation.
                  </p>
                  <div className="mt-5 space-y-3">
                    <div className="surface-card p-4">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                        Faculty
                      </p>
                      <p className="mt-2 text-sm font-black text-white">
                        {navSlot.faculty}
                      </p>
                    </div>
                    <div className="surface-card p-4">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                        Start time
                      </p>
                      <p className="mt-2 text-sm font-black text-white">
                        {navSlot.time}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-6">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
                    Route guidance
                  </p>
                  <div className="mt-5 rounded-[1.8rem] border border-emerald-500/18 bg-emerald-500/8 p-5">
                    <p className="text-lg font-black text-white">
                      {navSlot.room}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-200">
                      Proceed through the nearest main corridor, then follow the block signage toward the academic wing. Indoor routing can be attached here when live map support is enabled.
                    </p>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="surface-card p-4">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                        Estimated walk
                      </p>
                      <p className="mt-2 text-sm font-black text-white">
                        4 to 6 min
                      </p>
                    </div>
                    <div className="surface-card p-4">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                        Status
                      </p>
                      <p className="mt-2 text-sm font-black text-white">
                        {navSlot.status}
                      </p>
                    </div>
                  </div>
                  <button type="button" className="btn-primary mt-6 w-full justify-center">
                    <Navigation size={14} />
                    Start guided route
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </DashboardLayout>
  );
}
