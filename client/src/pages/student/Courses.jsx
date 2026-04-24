import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  GraduationCap,
  PlayCircle,
  Sparkles
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard, StatCard } from '../../components/ui/DashboardComponents';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import ActionDialog from '../../components/ui/ActionDialog';
import { useToast } from '../../components/ui/ToastSystem';
import api from '../../utils/api';
import {
  DEFAULT_PORTAL_DATA,
  buildCourseFocus,
  buildCourseProgress,
  buildCourseResources,
  findCourseNextLecture,
  normalizePortalData
} from '../../utils/studentPortalData';

export default function StudentCourses() {
  const { push } = useToast();
  const [resourceModal, setResourceModal] = useState(null);
  const [continueModal, setContinueModal] = useState(null);
  const [portalData, setPortalData] = useState(DEFAULT_PORTAL_DATA);
  const [loading, setLoading] = useState(true);

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

  const courses = useMemo(() => portalData.courses.map((course) => ({
    ...course,
    progress: buildCourseProgress(course),
    nextLecture: findCourseNextLecture(course, portalData.timetable),
    focus: buildCourseFocus(course),
    resources: buildCourseResources(course)
  })), [portalData.courses, portalData.timetable]);

  const completedCourses = useMemo(() => courses.filter((course) => course.progress >= 96).length, [courses]);
  const avgProgress = useMemo(() => (
    courses.length ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length) : 0
  ), [courses]);

  const bestMomentumCourse = courses[0];
  const attentionCourse = [...courses].sort((left, right) => left.progress - right.progress)[0];

  const handleLaunch = () => {
    push({
      type: 'success',
      title: 'Course session ready',
      body: `The study flow for ${continueModal?.name || 'this course'} is ready for deeper content integration.`
    });
    setContinueModal(null);
  };

  if (loading) {
    return (
      <DashboardLayout title="Academic Journey" role="STUDENT">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-600/30 border-t-blue-600 shadow-2xl shadow-blue-600/20" />
          <p className="animate-pulse text-[11px] font-black uppercase tracking-[0.6em] text-slate-500">
            Course workspace synchronization
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Academic Journey" role="STUDENT">
      <WorkspaceHero
        eyebrow="Courses workspace"
        title="Active curriculum management"
        description="Monitor live course progress, open learning resources, and continue from the next recommended session through a cleaner academic workspace."
        icon={GraduationCap}
        badges={[
          `${courses.length} enrolled courses`,
          `${completedCourses} completed`,
          `${avgProgress}% average progress`
        ]}
        stats={[
          { label: 'Enrolled', value: String(courses.length) },
          { label: 'Completed', value: String(completedCourses) },
          { label: 'Average progress', value: `${avgProgress}%` },
          { label: 'Current semester', value: portalData.profile.semesterLabel }
        ]}
        aside={(
          <div className="glass-panel h-full p-6 md:p-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
              Semester focus
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Learning momentum is healthy
            </h3>
            <div className="mt-6 space-y-3">
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Best momentum
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  {bestMomentumCourse
                    ? `${bestMomentumCourse.name} is your strongest-performing course right now with ${bestMomentumCourse.progress}% momentum.`
                    : 'Your strongest course will appear here once the course matrix is synchronized.'}
                </p>
              </div>
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Attention area
                </p>
                <p className="mt-3 text-sm leading-6 text-amber-300">
                  {attentionCourse
                    ? `${attentionCourse.name} still needs steady weekly progress to stay aligned with your semester target.`
                    : 'No attention lane detected.'}
                </p>
              </div>
            </div>
          </div>
        )}
      />

      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard title="Courses" value={String(courses.length)} icon={BookOpen} trend="Current load" />
        <StatCard title="Completed" value={String(completedCourses)} icon={CheckCircle2} trend="Finished" />
        <StatCard title="Average Progress" value={`${avgProgress}%`} icon={Sparkles} trend="Stable" />
        <StatCard title="Target GPA" value={portalData.cgpa} icon={GraduationCap} trend="Current CGPA" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {courses.map((course) => (
          <GlassCard
            key={course.code}
            title={course.name}
            subtitle={`${course.code} / ${course.faculty}`}
            icon={BookOpen}
          >
            <div className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full border border-white/6 bg-slate-950/60">
                  <div
                    className={`h-full rounded-full ${course.progress >= 96 ? 'bg-emerald-400' : 'bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400'}`}
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="surface-card p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                    Next lecture
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-black text-white">
                    <Clock3 size={14} className="text-blue-200" />
                    {course.nextLecture}
                  </p>
                </div>
                <div className="surface-card p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                    Focus topic
                  </p>
                  <p className="mt-2 text-sm font-black text-white">
                    {course.focus}
                  </p>
                </div>
              </div>

              {course.progress >= 96 ? (
                <div className="rounded-[1.4rem] border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <p className="flex items-center gap-2 text-sm font-black text-emerald-200">
                    <CheckCircle2 size={16} />
                    Course completed successfully
                  </p>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setResourceModal(course)}
                  className="btn-secondary flex-1 justify-center"
                >
                  <FileText size={14} />
                  View resources
                </button>
                <button
                  type="button"
                  onClick={() => setContinueModal(course)}
                  className="btn-primary flex-1 justify-center"
                >
                  <PlayCircle size={14} />
                  Continue course
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <ActionDialog
        open={Boolean(resourceModal)}
        tone="info"
        title={resourceModal ? `${resourceModal.name} resources` : 'Course resources'}
        description="Browse synchronized lecture materials, notes, and revision assets for this course."
        confirmLabel="Close"
        cancelLabel="Done"
        onConfirm={() => setResourceModal(null)}
        onClose={() => setResourceModal(null)}
      >
        <div className="space-y-3">
          {(resourceModal?.resources || []).map((item) => (
            <div key={item} className="surface-card flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">
                  {item}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Ready for connected content delivery
                </p>
              </div>
              <button type="button" className="btn-secondary">
                <ExternalLink size={14} />
                Open
              </button>
            </div>
          ))}
        </div>
      </ActionDialog>

      <ActionDialog
        open={Boolean(continueModal)}
        tone={continueModal?.progress >= 96 ? 'info' : 'default'}
        title={continueModal?.progress >= 96 ? 'Course already completed' : `Continue ${continueModal?.name || 'course'}`}
        description={continueModal?.progress >= 96
          ? 'This course has already reached completion. You can still reopen materials for revision or reference.'
          : 'Resume from the next recommended learning step and keep your weekly academic progress on track.'}
        confirmLabel={continueModal?.progress >= 96 ? 'Close' : 'Launch session'}
        cancelLabel="Back"
        onConfirm={continueModal?.progress >= 96 ? () => setContinueModal(null) : handleLaunch}
        onClose={() => setContinueModal(null)}
      >
        {continueModal ? (
          <div className="space-y-4">
            <div className="surface-card p-4">
              <div className="mb-2 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                <span>Progress</span>
                <span>{continueModal.progress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full border border-white/6 bg-slate-950/60">
                <div
                  className={`h-full rounded-full ${continueModal.progress >= 96 ? 'bg-emerald-400' : 'bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400'}`}
                  style={{ width: `${continueModal.progress}%` }}
                />
              </div>
            </div>

            <div className="surface-card p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                Recommended next step
              </p>
              <p className="mt-2 text-sm font-black text-white">
                {continueModal.progress >= 96 ? 'Revision and retention review' : continueModal.focus}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                {continueModal.nextLecture}
              </p>
            </div>
          </div>
        ) : null}
      </ActionDialog>
    </DashboardLayout>
  );
}
