import { Suspense, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Brain,
  Calendar,
  ClipboardCheck,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard, GlassSkeleton, StatCard } from '../../components/ui/DashboardComponents';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import ActionDialog from '../../components/ui/ActionDialog';
import DeferredSection from '../../components/ui/DeferredSection';
import api, { MOCK_DATA } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import SystemStatusPanel from '../../components/ui/SystemStatusPanel';
import CommandFeed from '../../components/ui/CommandFeed';
import { useHealth } from '../../context/HealthContext';
import { useToast } from '../../components/ui/ToastSystem';
import Telemetry from '../../utils/telemetry';
import lazySimple from '../../utils/lazySimple';
import { cancelIdleTask, scheduleIdleTask } from '../../utils/idleTask';

const TEACHING_PRIORITIES = [
  { label: 'Attendance audit', description: 'Sync classroom presence logs', color: 'bg-blue-600', icon: Zap },
  { label: 'Integrity monitoring', description: 'Active exam security protocol', color: 'bg-emerald-600', icon: ShieldCheck },
  { label: 'Student outreach', description: 'Issue directives to at-risk learners', color: 'bg-indigo-600', icon: Users },
  { label: 'Curriculum audit', description: 'Verify pedagogical coverage velocity', color: 'bg-slate-800', icon: BookOpen }
];

const FacultyInsightsSection = lazySimple(() => import('./sections/FacultyInsightsSection'));

export default function FacultyDashboard() {
  const { user } = useAuth();
  const { health } = useHealth();
  const { push } = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState(MOCK_DATA.faculty);
  const [directiveDraft, setDirectiveDraft] = useState({
    title: '',
    dueDate: '',
    weighting: '50'
  });

  const handleAcademicAction = (action) => {
    Telemetry.info(`[Academic Action] Faculty initiated: ${action}`);
    push({
      type: 'info',
      title: 'Action Directive Issued',
      body: `Institutional directive [${action}] is now being synchronized across all course nodes.`
    });
  };

  const applyFacultyStats = (payload) => {
    setStats(payload || MOCK_DATA.faculty);
  };

  useEffect(() => {
    api.get('/faculty/dashboard', {
      cache: {
        maxAge: 30000,
        staleWhileRevalidate: true,
        revalidateAfter: 12000,
        persist: true,
        onUpdate: (response) => applyFacultyStats(response?.data)
      }
    }).then(({ data }) => applyFacultyStats(data)).catch(() => {});
  }, []);

  useEffect(() => {
    const handle = scheduleIdleTask(() => {
      void FacultyInsightsSection.preload?.();
    }, 1400, 450);

    return () => cancelIdleTask(handle);
  }, []);

  const analyzeGrading = async () => {
    setLoading(true);
    setReport(null);
    try {
      const { data } = await api.post('/ai/generate-report', { type: 'GRADING_INSIGHTS', data: stats });
      setReport(data.report);
    } catch {
      setReport(
        'Institutional Performance Analysis - Summary\n\nRecommendation: Apply +3% normalization to the assessment based on class performance distribution.\n\n3 students identified for proactive academic counseling.\n\nProjected Semester Completion Rate: 94.2%.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDirective = () => {
    push({
      type: 'success',
      title: 'Directive Prepared',
      body: directiveDraft.title
        ? `${directiveDraft.title} has been staged for faculty release.`
        : 'A new instructional directive has been staged for release.'
    });
    setShowCreateModal(false);
    setDirectiveDraft({ title: '', dueDate: '', weighting: '50' });
  };

  return (
    <DashboardLayout title="Faculty Operations Portal" role="FACULTY">
      <WorkspaceHero
        eyebrow="Faculty workspace"
        title={`Teaching command center for ${user?.name || 'faculty operations'}`}
        description="Coordinate grading, attendance, course delivery, and support interventions from a calmer view that helps you act faster across every class cycle."
        icon={ShieldCheck}
        badges={[
          health.variance > 40 ? 'Variance detected' : 'Operationally synchronized',
          'AI-assisted grading',
          `${stats.totalStudents || '120'} learner records`
        ]}
        actions={[
          {
            label: 'New Directive',
            icon: Plus,
            tone: 'secondary',
            onClick: () => setShowCreateModal(true)
          },
          {
            label: loading ? 'Analyzing...' : 'Strategic Synthesis',
            icon: Sparkles,
            tone: 'primary',
            disabled: loading,
            onClick: analyzeGrading
          }
        ]}
        stats={[
          { label: 'Allocated courses', value: stats.allocatedCourses || '4' },
          { label: 'Student coverage', value: stats.totalStudents || '120' },
          { label: 'Attendance average', value: stats.attendanceAvg || '88%' },
          { label: 'Pending grading', value: stats.pendingGrading || '18' }
        ]}
        aside={(
          <div className="space-y-4">
            <SystemStatusPanel mode="DEPARTMENT" />
            <div className="surface-card p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                Faculty insight
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Three students are trending toward intervention review. Publishing one directive today will clear the highest-priority academic backlog.
              </p>
            </div>
          </div>
        )}
      />

      <div className="mb-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
        <StatCard title="Assigned Courses" value={stats.allocatedCourses || '4'} icon={BookOpen} color="bg-blue-600" trend="Active Cycle" />
        <StatCard title="Total Students" value={stats.totalStudents || '120'} icon={Users} color="bg-emerald-600" trend="Enrollment Stable" />
        <StatCard title="Avg Attendance" value={stats.attendanceAvg || '88%'} icon={Calendar} color="bg-indigo-600" trend="-1.2% variance" />
        <StatCard title="Pending Grading" value={stats.pendingGrading || '18'} icon={ClipboardCheck} color="bg-amber-600" trend="Due soon" />
      </div>

      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="premium-card group relative mb-12 overflow-hidden p-8 md:p-10"
          >
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl transition-all duration-500 group-hover:bg-blue-500/20" />
            <button
              type="button"
              onClick={() => setReport(null)}
              className="absolute right-6 top-6 rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-500 transition-all hover:text-white"
            >
              <X size={18} />
            </button>
            <div className="mb-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">
              <Brain size={20} className="text-indigo-500" />
              Strategic Architecture Synthesis
            </div>
            <p className="whitespace-pre-wrap text-lg leading-relaxed text-slate-200">
              {report}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <DeferredSection className="mb-12" minHeight={420}>
        <Suspense fallback={<GlassSkeleton className="h-[420px]" />}>
          <FacultyInsightsSection />
        </Suspense>
      </DeferredSection>

      <DeferredSection className="mb-12" minHeight={360}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <GlassCard title="Academic Control Bridge" subtitle="Instructional performance management" className="lg:col-span-2">
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              {TEACHING_PRIORITIES.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => handleAcademicAction(action.label)}
                  className="surface-card group flex items-center gap-5 p-5 text-left transition-all hover:border-blue-500/20 hover:bg-white/10"
                >
                  <div className={`rounded-2xl p-4 text-white shadow-2xl transition-transform group-hover:scale-110 ${action.color}`}>
                    <action.icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight text-white">
                      {action.label}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {action.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>

          <CommandFeed className="premium-card p-6" limit={6} filter={['INFO']} />
        </div>
      </DeferredSection>

      <ActionDialog
        open={showCreateModal}
        title="Prepare Instructional Directive"
        description="Create a clean directive draft for assignments, assessments, or classroom operations without leaving the faculty workspace."
        confirmLabel="Issue Directive"
        cancelLabel="Close"
        tone="info"
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleCreateDirective}
      >
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.26em] text-slate-400">
              Directive title
            </label>
            <input
              type="text"
              value={directiveDraft.title}
              onChange={(event) => setDirectiveDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="e.g. AI-401 Lab Report"
              className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-5 py-4 text-white outline-none transition-all placeholder:text-slate-500 focus:border-blue-500/40"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.26em] text-slate-400">
                Submission timeline
              </label>
              <input
                type="date"
                value={directiveDraft.dueDate}
                onChange={(event) => setDirectiveDraft((current) => ({ ...current, dueDate: event.target.value }))}
                className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-5 py-4 text-white outline-none transition-all focus:border-blue-500/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.26em] text-slate-400">
                Assessment weighting
              </label>
              <input
                type="number"
                value={directiveDraft.weighting}
                onChange={(event) => setDirectiveDraft((current) => ({ ...current, weighting: event.target.value }))}
                className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-5 py-4 text-white outline-none transition-all focus:border-blue-500/40"
              />
            </div>
          </div>
        </div>
      </ActionDialog>
    </DashboardLayout>
  );
}
