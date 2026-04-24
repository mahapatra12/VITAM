import { Suspense, useEffect, useMemo, useState, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Award,
  Bell,
  BookOpen,
  Brain,
  CalendarDays,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  GraduationCap,
  Library,
  RefreshCcw,
  ShieldCheck,
  TrendingUp,
  Users
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard, GlassSkeleton, StatCard } from '../../components/ui/DashboardComponents';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import api from '../../utils/api';
import DeferredSection from '../../components/ui/DeferredSection';
import { useHealth } from '../../context/HealthContext';
import { useToast } from '../../components/ui/ToastSystem';
import Telemetry from '../../utils/telemetry';
import lazySimple from '../../utils/lazySimple';
import { cancelIdleTask, scheduleIdleTask } from '../../utils/idleTask';
import { prefetchRoutePath } from '../../utils/routePrefetch';
import { announceNavigationStart } from '../../utils/navigationSignals';

const StudentRoadmapSection = lazySimple(() => import('./sections/StudentRoadmapSection'));
const StudentAnalyticsSection = lazySimple(() => import('./sections/StudentAnalyticsSection'));
const StudentToolsSection = lazySimple(() => import('./sections/StudentToolsSection'));

const DEFAULT_TIMETABLE = {
  Monday: [
    { time: '09:00 - 10:00', subject: 'Database Management Systems', room: 'A-301', faculty: 'Dr. Kavita Rao' },
    { time: '10:15 - 11:15', subject: 'Operating Systems', room: 'B-205', faculty: 'Prof. Nikhil Verma' },
    { time: '11:45 - 13:15', subject: 'DBMS Lab', room: 'Lab-3', faculty: 'Academic Lab Team' }
  ],
  Tuesday: [
    { time: '09:00 - 10:00', subject: 'Computer Networks', room: 'A-102', faculty: 'Dr. Maria Thomas' },
    { time: '10:15 - 11:15', subject: 'Software Engineering', room: 'B-301', faculty: 'Prof. Arvind Menon' },
    { time: '14:00 - 16:00', subject: 'Networks Lab', room: 'Lab-1', faculty: 'Academic Lab Team' }
  ],
  Wednesday: [
    { time: '09:00 - 10:00', subject: 'Probability and Statistics', room: 'C-201', faculty: 'Dr. Shruti Das' },
    { time: '10:15 - 11:15', subject: 'Database Management Systems', room: 'A-301', faculty: 'Dr. Kavita Rao' },
    { time: '11:45 - 12:45', subject: 'Operating Systems', room: 'B-205', faculty: 'Prof. Nikhil Verma' }
  ],
  Thursday: [
    { time: '09:00 - 10:00', subject: 'Computer Networks', room: 'A-102', faculty: 'Dr. Maria Thomas' },
    { time: '10:15 - 11:15', subject: 'Software Engineering', room: 'B-301', faculty: 'Prof. Arvind Menon' },
    { time: '14:00 - 16:00', subject: 'Operating Systems Lab', room: 'Lab-2', faculty: 'Academic Lab Team' }
  ],
  Friday: [
    { time: '09:00 - 10:00', subject: 'Probability and Statistics', room: 'C-201', faculty: 'Dr. Shruti Das' },
    { time: '10:15 - 11:15', subject: 'Seminar and Mentoring', room: 'Auditorium', faculty: 'Mentoring Cell' }
  ]
};

const DEFAULT_COURSES = [
  { code: 'CS301', name: 'Database Management Systems', credits: 4, attendance: 92, grade: 'A', faculty: 'Dr. Kavita Rao' },
  { code: 'CS302', name: 'Operating Systems', credits: 4, attendance: 88, grade: 'A-', faculty: 'Prof. Nikhil Verma' },
  { code: 'CS303', name: 'Computer Networks', credits: 3, attendance: 95, grade: 'A+', faculty: 'Dr. Maria Thomas' },
  { code: 'CS304', name: 'Software Engineering', credits: 3, attendance: 85, grade: 'B+', faculty: 'Prof. Arvind Menon' },
  { code: 'MA301', name: 'Probability and Statistics', credits: 3, attendance: 90, grade: 'A', faculty: 'Dr. Shruti Das' }
];

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Mid-Semester Assessments Window',
    date: 'April 24, 2026',
    type: 'exam',
    content: 'Assessment slots open from April 24 to April 29. Confirm hall allocation from the academic office dashboard.'
  },
  {
    id: 2,
    title: 'Industry Workshop: Full-Stack Systems',
    date: 'April 22, 2026',
    type: 'event',
    content: 'Hands-on workshop with engineering mentors from product teams. Registration closes after 120 seats.'
  },
  {
    id: 3,
    title: 'Extended Library Research Hours',
    date: 'April 20, 2026',
    type: 'notice',
    content: 'The library research wing will remain open until 11:30 PM throughout evaluation week.'
  }
];

const DEFAULT_ASSIGNMENTS = [
  { course: 'DBMS', title: 'Query Optimization Workbook', due: 'April 23, 2026', status: 'pending' },
  { course: 'OS', title: 'Process Scheduling Simulation', due: 'April 25, 2026', status: 'submitted' },
  { course: 'Networks', title: 'Protocol Trace Analysis', due: 'April 26, 2026', status: 'pending' },
  { course: 'SE', title: 'Requirements Documentation', due: 'April 21, 2026', status: 'graded', grade: 'A' }
];

const DEFAULT_FINANCE = {
  total: 125000,
  paid: 85000,
  pending: 40000,
  dueDate: 'April 30, 2026',
  breakdown: [
    { item: 'Tuition Fee', amount: 90000 },
    { item: 'Hostel Fee', amount: 25000 },
    { item: 'Library Fee', amount: 5000 },
    { item: 'Lab Fee', amount: 5000 }
  ]
};

const DEFAULT_PORTAL_DATA = {
  name: 'Verified Academic Identity',
  attendance: '92%',
  cgpa: '8.82',
  completion: '74%',
  rank: '12',
  announcements: DEFAULT_ANNOUNCEMENTS,
  timetable: DEFAULT_TIMETABLE,
  today: 'Monday',
  courses: DEFAULT_COURSES,
  assignments: DEFAULT_ASSIGNMENTS,
  finance: DEFAULT_FINANCE,
  profile: {
    institutionalId: 'VTM-S-2026-942',
    program: 'B.Tech Computer Science',
    semesterLabel: '6th Semester',
    branch: 'Computer Science',
    placementReadiness: '94.2%'
  },
  aiCoach: 'Academic insight: your consistency remains strong. Prioritize algorithmic revision, stay ahead on lab submissions, and reserve one focused session for placement aptitude practice this week.'
};

const getAnnouncementTone = (type) => {
  if (type === 'exam') {
    return 'border-rose-400/30 bg-rose-500/10 text-rose-200';
  }
  if (type === 'event') {
    return 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200';
  }
  return 'border-amber-400/30 bg-amber-500/10 text-amber-200';
};

const getGradeTone = (grade = '') => {
  if (/A\+?|S/i.test(grade)) {
    return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200';
  }
  if (/B\+?/i.test(grade)) {
    return 'border-blue-400/30 bg-blue-500/10 text-blue-200';
  }
  return 'border-amber-400/30 bg-amber-500/10 text-amber-200';
};

const getCurrentWeekday = () => {
  const weekday = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  return Object.prototype.hasOwnProperty.call(DEFAULT_TIMETABLE, weekday) ? weekday : 'Monday';
};

const normalizeTimetable = (timetable = {}) => {
  const nextTimetable = { ...DEFAULT_TIMETABLE };
  Object.entries(timetable || {}).forEach(([day, classes]) => {
    if (!Object.prototype.hasOwnProperty.call(nextTimetable, day)) {
      return;
    }

    nextTimetable[day] = Array.isArray(classes) && classes.length > 0
      ? classes.map((classItem) => ({
          time: classItem.time || '09:00 - 10:00',
          subject: classItem.subject || 'General Session',
          room: classItem.room || 'Main Block',
          faculty: classItem.faculty || 'Academic Office'
        }))
      : DEFAULT_TIMETABLE[day];
  });

  return nextTimetable;
};

const normalizeCourses = (courses = []) => {
  if (!Array.isArray(courses) || courses.length === 0) {
    return DEFAULT_COURSES;
  }

  return courses.map((course, index) => ({
    code: course.code || `SUB${index + 1}`,
    name: course.name || `Subject ${index + 1}`,
    credits: Number(course.credits) || (index < 2 ? 4 : 3),
    attendance: Number(course.attendance) || 82,
    grade: course.grade || 'B+',
    faculty: course.faculty || 'Academic Office'
  }));
};

const normalizeAnnouncements = (announcements = []) => {
  if (!Array.isArray(announcements) || announcements.length === 0) {
    return DEFAULT_ANNOUNCEMENTS;
  }

  return announcements.map((announcement, index) => ({
    id: announcement.id || index + 1,
    title: announcement.title || 'Institutional update',
    date: announcement.date || 'April 20, 2026',
    type: announcement.type || 'notice',
    content: announcement.content || 'Review the latest notice in the student portal.'
  }));
};

const normalizeAssignments = (assignments = []) => {
  if (!Array.isArray(assignments) || assignments.length === 0) {
    return DEFAULT_ASSIGNMENTS;
  }

  return assignments.map((assignment) => ({
    course: assignment.course || 'GEN',
    title: assignment.title || 'Course activity',
    due: assignment.due || 'April 30, 2026',
    status: assignment.status || 'pending',
    grade: assignment.grade || ''
  }));
};

const normalizeFinance = (finance = {}) => {
  const total = Number(finance.total) || DEFAULT_FINANCE.total;
  const paid = Number(finance.paid) || DEFAULT_FINANCE.paid;
  const pending = Math.max(0, Number(finance.pending ?? finance.due) || Math.max(0, total - paid));

  return {
    total,
    paid,
    pending,
    dueDate: finance.dueDate || DEFAULT_FINANCE.dueDate,
    breakdown: Array.isArray(finance.breakdown) && finance.breakdown.length > 0 ? finance.breakdown : DEFAULT_FINANCE.breakdown
  };
};

const normalizePortalData = (payload = {}) => {
  const normalizedCourses = normalizeCourses(payload.courses);

  return {
    name: payload.name || DEFAULT_PORTAL_DATA.name,
    attendance: String(payload.attendance || DEFAULT_PORTAL_DATA.attendance),
    cgpa: String(payload.cgpa || DEFAULT_PORTAL_DATA.cgpa),
    completion: String(payload.completion || DEFAULT_PORTAL_DATA.completion),
    rank: String(payload.rank || DEFAULT_PORTAL_DATA.rank),
    announcements: normalizeAnnouncements(payload.announcements),
    timetable: normalizeTimetable(payload.timetable),
    today: payload.today || getCurrentWeekday(),
    courses: normalizedCourses,
    assignments: normalizeAssignments(payload.assignments),
    finance: normalizeFinance(payload.finance),
    profile: {
      institutionalId: payload.profile?.institutionalId || DEFAULT_PORTAL_DATA.profile.institutionalId,
      program: payload.profile?.program || DEFAULT_PORTAL_DATA.profile.program,
      semesterLabel: payload.profile?.semesterLabel || DEFAULT_PORTAL_DATA.profile.semesterLabel,
      branch: payload.profile?.branch || DEFAULT_PORTAL_DATA.profile.branch,
      placementReadiness: payload.profile?.placementReadiness || DEFAULT_PORTAL_DATA.profile.placementReadiness
    },
    aiCoach: payload.aiCoach || DEFAULT_PORTAL_DATA.aiCoach,
    coursesCount: normalizedCourses.length
  };
};

const StudentPortalTabs = ({ currentView, onChange, pending, views }) => (
  <div className="mb-8 flex flex-wrap gap-3">
    {views.map(({ key, label, icon: Icon, badge }) => {
      const isActive = key === currentView;
      return (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`group inline-flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
            isActive
              ? 'border-cyan-400/40 bg-cyan-500/12 text-white shadow-[0_10px_30px_rgba(34,211,238,0.14)]'
              : 'border-white/8 bg-white/[0.03] text-slate-300 hover:border-cyan-400/25 hover:bg-cyan-500/8 hover:text-white'
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-colors ${
              isActive ? 'bg-cyan-500/18 text-cyan-200' : 'bg-slate-900/80 text-slate-400 group-hover:text-cyan-200'
            }`}
          >
            <Icon size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.24em]">{label}</p>
            {badge && <p className="mt-1 text-[10px] text-slate-400">{badge}</p>}
          </div>
          {isActive && pending && <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />}
        </button>
      );
    })}
  </div>
);

const PortalActionStrip = ({ currentView, onOpenWorkspace, pending, views }) => {
  const activeView = views.find((view) => view.key === currentView) || views[0];

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/8 bg-white/[0.03] p-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Workspace handoff</p>
        <h3 className="mt-2 text-lg font-black text-white">{activeView.label}</h3>
        <p className="mt-1 text-sm text-slate-400">
          Open the dedicated module when you want deeper controls, richer charts, and full student workflows.
        </p>
      </div>
      <button
        type="button"
        disabled={pending || currentView === 'overview'}
        onClick={() => onOpenWorkspace(activeView.route)}
        className="btn-secondary justify-center px-5 py-3 text-[11px] font-black uppercase tracking-[0.22em] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {activeView.action}
      </button>
    </div>
  );
};

const OverviewPanel = ({ portalData, studentName, stats }) => {
  const today = portalData.today || getCurrentWeekday();
  const todaysClasses = portalData.timetable[today] || [];
  const pendingAssignments = portalData.assignments.filter((assignment) => assignment.status === 'pending');

  return (
    <div className="space-y-8">
      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <GlassCard
          title={`Today's classes - ${today}`}
          subtitle="Your live class runway for the current academic day"
          icon={Clock}
        >
          <div className="mt-6 space-y-4">
            {todaysClasses.map((classItem) => (
              <div
                key={`${classItem.time}-${classItem.subject}`}
                className="flex flex-col gap-4 rounded-3xl border border-white/8 bg-slate-950/80 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-300">{classItem.time}</p>
                  <h4 className="mt-2 text-lg font-bold text-white">{classItem.subject}</h4>
                  <p className="mt-1 text-sm text-slate-400">Venue: {classItem.room}</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
                  Live class lane <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard
          title="Academic rhythm"
          subtitle="Signals that matter this week"
          icon={Brain}
        >
          <div className="mt-6 grid gap-4">
            <div className="rounded-3xl border border-emerald-400/15 bg-emerald-500/8 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-300">Attendance pulse</p>
              <p className="mt-3 text-3xl font-black text-white">{stats.attendance}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">You are safely above the institutional attendance threshold this cycle.</p>
            </div>
            <div className="rounded-3xl border border-blue-400/15 bg-blue-500/8 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">Current CGPA</p>
              <p className="mt-3 text-3xl font-black text-white">{stats.cgpa}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">Steady performance. Continue momentum in systems and problem-solving modules.</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Profile anchor</p>
              <p className="mt-3 text-base font-bold text-white">{studentName}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">Keep your student profile and security setup current for uninterrupted access.</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassCard
          title="Pending assignments"
          subtitle="Current submissions that still need action"
          icon={FileText}
        >
          <div className="mt-6 space-y-4">
            {pendingAssignments.map((assignment) => (
              <div
                key={`${assignment.course}-${assignment.title}`}
                className="flex flex-col gap-4 rounded-3xl border border-white/8 bg-slate-950/80 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">{assignment.course}</p>
                  <h4 className="mt-2 text-base font-bold text-white">{assignment.title}</h4>
                  <p className="mt-1 text-sm text-slate-400">Due by {assignment.due}</p>
                </div>
                <button type="button" className="btn-secondary px-4 py-2 text-xs font-black uppercase tracking-[0.2em]">
                  Review
                </button>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard
          title="Recent announcements"
          subtitle="Exams, workshops, and institutional notices"
          icon={Bell}
        >
          <div className="mt-6 space-y-4">
            {portalData.announcements.slice(0, 3).map((announcement) => (
              <article
                key={announcement.id}
                className="rounded-3xl border border-white/8 bg-white/[0.03] p-5 transition-colors hover:border-cyan-400/25"
              >
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${getAnnouncementTone(announcement.type)}`}>
                    {announcement.type}
                  </span>
                  <span className="text-xs text-slate-500">{announcement.date}</span>
                </div>
                <h4 className="text-lg font-bold text-white">{announcement.title}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-300">{announcement.content}</p>
              </article>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

const CoursesPanel = ({ courses }) => (
  <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
    {courses.map((course) => (
      <motion.article
        key={course.code}
        whileHover={{ y: -4 }}
        className="glass-card p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200">
              {course.code}
            </span>
            <h3 className="mt-4 text-xl font-black tracking-tight text-white">{course.name}</h3>
            <p className="mt-2 text-sm text-slate-400">{course.credits} credits - {course.faculty}</p>
          </div>
          <span className={`rounded-2xl border px-3 py-2 text-sm font-black ${getGradeTone(course.grade)}`}>
            {course.grade}
          </span>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-400">Attendance</span>
              <span className="font-bold text-white">{course.attendance}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full border border-white/8 bg-slate-950">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${course.attendance}%` }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Current standing</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Strong consistency in this module. Keep assignment submissions on schedule to protect grade stability.
            </p>
          </div>
        </div>
      </motion.article>
    ))}
  </div>
);

const TimetablePanel = ({ timetable }) => (
  <div className="grid gap-5 xl:grid-cols-5">
    {Object.entries(timetable).map(([day, classes]) => (
      <GlassCard key={day} title={day} subtitle={`${classes.length} scheduled sessions`} className="p-0">
        <div className="space-y-4 p-5">
          {classes.map((classItem) => (
            <div
              key={`${day}-${classItem.time}-${classItem.subject}`}
              className="rounded-3xl border border-white/8 bg-slate-950/80 p-4"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">{classItem.time}</p>
              <h4 className="mt-2 text-base font-bold text-white">{classItem.subject}</h4>
              <p className="mt-2 text-sm text-slate-400">{classItem.room}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    ))}
  </div>
);

const GradesPanel = ({ cgpa, courses }) => (
  <div className="space-y-8">
    <GlassCard className="overflow-hidden p-0">
      <div className="rounded-[1.5rem] bg-gradient-to-br from-[#0c6cf2] via-[#1567dd] to-[#4538a8] p-8 md:p-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-100/80">Academic performance</p>
        <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-4xl font-black text-white md:text-6xl">{cgpa}</h2>
            <p className="mt-2 text-sm text-cyan-100/80">Current cumulative GPA across active modules</p>
          </div>
          <div className="w-full max-w-xs">
            <div className="mb-2 flex items-center justify-between text-sm text-cyan-100/80">
              <span>GPA index</span>
              <span>{cgpa}/10</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/15">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(10, Number(cgpa) || 0)) * 10}%` }}
                className="h-full rounded-full bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    </GlassCard>

    <GlassCard title="Module grade ledger" subtitle="Latest classroom performance snapshot" icon={Award}>
      <div className="mt-6 overflow-hidden rounded-3xl border border-white/8">
        <div className="hidden grid-cols-[1fr_2fr_0.8fr_0.8fr] gap-4 bg-white/[0.04] px-5 py-4 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400 md:grid">
          <div>Code</div>
          <div>Course</div>
          <div>Credits</div>
          <div>Grade</div>
        </div>
        {courses.map((course) => (
          <div
            key={course.code}
            className="grid gap-3 border-t border-white/8 bg-slate-950/70 px-5 py-4 md:grid-cols-[1fr_2fr_0.8fr_0.8fr] md:items-center"
          >
            <div className="text-sm font-bold text-cyan-200">{course.code}</div>
            <div className="text-sm text-white">{course.name}</div>
            <div className="text-sm text-slate-400">{course.credits}</div>
            <div>
              <span className={`inline-flex rounded-2xl border px-3 py-1.5 text-sm font-black ${getGradeTone(course.grade)}`}>
                {course.grade}
              </span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  </div>
);

const FeesPanel = ({ finance }) => (
  <div className="space-y-8">
    <div className="grid gap-6 md:grid-cols-3">
      {[
        { label: 'Total fee', value: `Rs ${finance.total.toLocaleString()}`, tone: 'text-white' },
        { label: 'Paid', value: `Rs ${finance.paid.toLocaleString()}`, tone: 'text-emerald-300' },
        { label: 'Pending', value: `Rs ${finance.pending.toLocaleString()}`, tone: 'text-amber-300' }
      ].map((item) => (
        <GlassCard key={item.label}>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">{item.label}</p>
          <p className={`mt-4 text-3xl font-black ${item.tone}`}>{item.value}</p>
        </GlassCard>
      ))}
    </div>

    <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
      <GlassCard title="Fee breakdown" subtitle="Current semester financial structure" icon={CreditCard}>
        <div className="mt-6 space-y-4">
          {finance.breakdown.map((item) => (
            <div
              key={item.item}
              className="flex items-center justify-between rounded-3xl border border-white/8 bg-slate-950/80 px-5 py-4"
            >
              <span className="text-sm text-slate-300">{item.item}</span>
              <span className="text-base font-black text-white">Rs {item.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard title="Next payment checkpoint" subtitle={`Due by ${finance.dueDate}`} icon={ShieldCheck}>
        <div className="mt-6 space-y-5">
          <div className="rounded-3xl border border-amber-400/20 bg-amber-500/8 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-amber-200">Payment status</p>
            <p className="mt-3 text-3xl font-black text-white">Pending - Rs {finance.pending.toLocaleString()}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">Complete the remaining payment before the due date to avoid access restrictions in campus services.</p>
          </div>
          <button type="button" className="btn-premium w-full justify-center px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em]">
            Proceed to payment
          </button>
        </div>
      </GlassCard>
    </div>
  </div>
);

const StudentPortalContent = ({ currentView, portalData, studentName, stats }) => {
  if (currentView === 'courses') {
    return <CoursesPanel courses={portalData.courses} />;
  }
  if (currentView === 'timetable') {
    return <TimetablePanel timetable={portalData.timetable} />;
  }
  if (currentView === 'grades') {
    return <GradesPanel cgpa={stats.cgpa} courses={portalData.courses} />;
  }
  if (currentView === 'fees') {
    return <FeesPanel finance={portalData.finance} />;
  }

  return <OverviewPanel portalData={portalData} studentName={studentName} stats={stats} />;
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { health } = useHealth();
  const { push } = useToast();
  const [portalData, setPortalData] = useState(DEFAULT_PORTAL_DATA);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [currentView, setCurrentView] = useState('overview');
  const [isPortalPending, startPortalTransition] = useTransition();
  const [aiCoach, setAiCoach] = useState(DEFAULT_PORTAL_DATA.aiCoach);

  const studentName = portalData.name || 'Verified Academic Identity';
  const stats = useMemo(() => ({
    attendance: portalData.attendance || '92%',
    cgpa: portalData.cgpa || '8.82',
    completion: portalData.completion || '74%',
    rank: portalData.rank || '12'
  }), [portalData]);

  const portalViews = useMemo(() => ([
    { key: 'overview', label: 'Overview', icon: TrendingUp, badge: 'Live', route: '/student/dashboard', action: 'Stay on overview' },
    { key: 'courses', label: 'Courses', icon: BookOpen, badge: String(portalData.courses.length), route: '/student/courses', action: 'Open full courses workspace' },
    { key: 'timetable', label: 'Timetable', icon: CalendarDays, route: '/student/timetable', action: 'Open full timetable workspace' },
    { key: 'grades', label: 'Grades', icon: Award, route: '/student/grades', action: 'Open full grades workspace' },
    { key: 'fees', label: 'Fees', icon: CreditCard, badge: portalData.finance.pending > 0 ? 'Due' : 'Clear', route: '/student/fees', action: 'Open full fee workspace' }
  ]), [portalData.courses.length, portalData.finance.pending]);

  const applyPortalPayload = (payload) => {
    const normalized = normalizePortalData(payload);
    setPortalData(normalized);
    setAiCoach(normalized.aiCoach || DEFAULT_PORTAL_DATA.aiCoach);
  };

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        const { data } = await api.get('/student/portal', {
          cache: {
            maxAge: 30000,
            staleWhileRevalidate: true,
            revalidateAfter: 12000,
            persist: true,
            onUpdate: (response) => applyPortalPayload(response?.data)
          }
        });
        applyPortalPayload(data);
      } catch {
        applyPortalPayload(DEFAULT_PORTAL_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchPortalData();
  }, []);

  useEffect(() => {
    const handle = scheduleIdleTask(() => {
      void StudentRoadmapSection.preload?.();
      void StudentAnalyticsSection.preload?.();
      void StudentToolsSection.preload?.();
    }, 1400, 450);

    return () => cancelIdleTask(handle);
  }, []);

  const handleDataSync = async () => {
    setSyncing(true);
    try {
      const { data } = await api.get('/student/portal');
      applyPortalPayload(data);
      Telemetry.info(`[Student Portal] Manual sync completed for ${studentName}`);
      push({
        type: 'success',
        title: 'Profile synchronized',
        body: 'Your academic overview, timetable, and finance indicators have been refreshed.'
      });
    } catch {
      push({
        type: 'warning',
        title: 'Sync fallback active',
        body: 'The live refresh could not complete, so the dashboard is still using the latest safe snapshot.'
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleViewChange = (view) => {
    startPortalTransition(() => {
      setCurrentView(view);
    });
  };

  const handleOpenWorkspace = (path) => {
    if (!path || path === '/student/dashboard') {
      return;
    }

    announceNavigationStart({ path, source: 'student-portal' });
    void prefetchRoutePath(path, null, { mode: 'navigation' });
    navigate(path);
  };

  if (loading) {
    return (
      <DashboardLayout title="Student Dashboard" role="STUDENT">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-600/30 border-t-blue-600 shadow-2xl shadow-blue-600/20" />
          <p className="animate-pulse text-[11px] font-black uppercase tracking-[0.6em] text-slate-500">
            Institutional synchronization active
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Student Operations Portal" role="STUDENT">
      <WorkspaceHero
        eyebrow="Student workspace"
        title={`Welcome back, ${studentName}`}
        description="A cleaner college portal experience for daily student work: classes, grades, fees, and announcements in one responsive space that feels fast and focused."
        icon={GraduationCap}
        badges={[
          'Verified identity',
          `Attendance ${stats.attendance}`,
          `CGPA ${stats.cgpa}`
        ]}
        actions={[
          {
            label: syncing ? 'Syncing workspace' : 'Synchronize profile',
            icon: RefreshCcw,
            tone: 'primary',
            onClick: handleDataSync
          }
        ]}
        stats={[
          { label: 'Institutional ID', value: portalData.profile.institutionalId },
          { label: 'Current semester', value: portalData.profile.semesterLabel },
          { label: 'Courses active', value: String(portalData.courses.length) },
          { label: 'System state', value: health.isHealthy ? 'Stable' : 'Observing' }
        ]}
        aside={(
          <div className="glass-panel h-full p-6 md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
                  Student intelligence layer
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  Calm, fast, and ready for the day
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                <ShieldCheck size={20} />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="surface-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                    Placement readiness
                  </span>
                  <span className="text-sm font-black text-emerald-300">{portalData.profile.placementReadiness}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full border border-white/5 bg-slate-950/70">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: portalData.profile.placementReadiness }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500"
                  />
                </div>
              </div>

              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  AI guidance
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  {aiCoach}
                </p>
              </div>
            </div>
          </div>
        )}
      />

      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard title="Attendance" value={stats.attendance} icon={TrendingUp} trend="HEALTHY" />
        <StatCard title="Current CGPA" value={stats.cgpa} icon={Award} trend="+0.42" />
        <StatCard title="Progression" value={stats.completion} icon={Clock} trend="ON TRACK" />
        <StatCard title="Institutional Rank" value={stats.rank} icon={ShieldCheck} trend="TOP BAND" />
      </div>

      <StudentPortalTabs currentView={currentView} onChange={handleViewChange} pending={isPortalPending} views={portalViews} />
      <PortalActionStrip currentView={currentView} onOpenWorkspace={handleOpenWorkspace} pending={isPortalPending} views={portalViews} />

      <div className="mb-10">
        <StudentPortalContent currentView={currentView} portalData={portalData} studentName={studentName} stats={stats} />
      </div>

      {currentView === 'overview' && (
        <>
          <DeferredSection className="mb-10" minHeight={520}>
            <Suspense fallback={<GlassSkeleton className="h-[520px]" />}>
              <StudentRoadmapSection />
            </Suspense>
          </DeferredSection>

          <DeferredSection className="mb-10" minHeight={420}>
            <Suspense fallback={<GlassSkeleton className="h-[420px]" />}>
              <StudentAnalyticsSection />
            </Suspense>
          </DeferredSection>

          <DeferredSection minHeight={560}>
            <Suspense
              fallback={(
                <div className="space-y-10">
                  <GlassSkeleton className="h-[220px]" />
                  <GlassSkeleton className="h-[320px]" />
                </div>
              )}
            >
              <StudentToolsSection />
            </Suspense>
          </DeferredSection>
        </>
      )}

      {currentView !== 'overview' && (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <GlassCard title="Student services" subtitle="Fast links to everyday support" icon={Users}>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Library services', icon: Library, helper: 'Access research timing and issue support' },
                { label: 'Announcements', icon: Bell, helper: 'Track academic and event notices quickly' },
                { label: 'Assignments', icon: FileText, helper: 'Review pending work and grading status' },
                { label: 'ID and profile', icon: CreditCard, helper: 'Keep student identity records current' }
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/12 text-cyan-200">
                    <item.icon size={18} />
                  </div>
                  <h4 className="mt-4 text-base font-bold text-white">{item.label}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.helper}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard title="Advisory note" subtitle="What to focus on next" icon={Brain}>
            <div className="mt-6 rounded-3xl border border-cyan-400/15 bg-cyan-500/8 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200">Recommended action</p>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                Use this portal section to check deadlines, attendance drift, and academic standing before moving into deeper student tools from the main sidebar.
              </p>
            </div>
          </GlassCard>
        </div>
      )}
    </DashboardLayout>
  );
}
