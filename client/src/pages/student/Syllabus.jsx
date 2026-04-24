import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Download,
  Eye,
  FileText,
  Layers3,
  Search,
  Sparkles,
  Users,
  X
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard, StatCard } from '../../components/ui/DashboardComponents';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import api from '../../utils/api';

const DEFAULT_UNITS = [1, 2, 3, 4, 5];

const FALLBACK_SYLLABUS = [
  { name: 'Advanced Algorithms', materials: ['Intro to Algos.pdf', 'Complexity Notes.docx', 'Practice Sheet 1.pdf'] },
  { name: 'Quantum Computing Foundations', materials: ['Qubits 101.pdf', 'Entanglement Notes.pdf', 'Quantum Lab Tasks.pdf'] },
  { name: 'Cyber Security Systems', materials: ['Security Frameworks.pdf', 'Threat Modeling Guide.pdf'] },
  { name: 'Cloud Architecture', materials: ['Cloud Patterns.pdf', 'Deployment Case Studies.pdf', 'Design Checklist.pdf'] }
];

function SubjectCard({ subject, onStudy }) {
  const [completedUnits, setCompletedUnits] = useState([1, 2]);
  const progress = Math.round((completedUnits.length / DEFAULT_UNITS.length) * 100);

  const toggleUnit = (unit) => {
    setCompletedUnits((previous) => (
      previous.includes(unit)
        ? previous.filter((item) => item !== unit)
        : [...previous, unit].sort((a, b) => a - b)
    ));
  };

  return (
    <motion.div whileHover={{ y: -3 }} className="glass-panel p-6 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-blue-500/20 bg-blue-500/10 text-blue-200">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
              Subject module
            </p>
            <h3 className="mt-2 text-xl font-black text-white">
              {subject.name}
            </h3>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-300">
          {progress}% ready
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
          <span>Unit progress</span>
          <span>{completedUnits.length}/{DEFAULT_UNITS.length}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full border border-white/6 bg-slate-950/60">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {DEFAULT_UNITS.map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => toggleUnit(unit)}
              className={`rounded-2xl border px-3 py-3 text-[10px] font-extrabold uppercase tracking-[0.18em] transition-all ${
                completedUnits.includes(unit)
                  ? 'border-blue-500/30 bg-blue-500 text-white'
                  : 'border-white/8 bg-slate-950/45 text-slate-400 hover:border-white/16 hover:text-white'
              }`}
            >
              U{unit}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {(subject.materials || []).map((material) => (
          <div key={material} className="surface-card flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">
                {material}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Ready for preview and download
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button type="button" onClick={() => onStudy(material, subject.name)} className="btn-secondary">
                <Eye size={14} />
                Preview
              </button>
              <button type="button" className="btn-secondary">
                <Download size={14} />
                Save
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onStudy(subject.materials?.[0] || 'Module Overview.pdf', subject.name)}
        className="btn-primary mt-6 w-full justify-center"
      >
        <Sparkles size={14} />
        Open focused study mode
      </button>
    </motion.div>
  );
}

export default function Syllabus() {
  const [syllabus, setSyllabus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [studyItem, setStudyItem] = useState(null);

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const response = await api.get('/student/academics');
        setSyllabus(response.data?.syllabus?.length ? response.data.syllabus : FALLBACK_SYLLABUS);
      } catch (error) {
        setSyllabus(FALLBACK_SYLLABUS);
      } finally {
        setLoading(false);
      }
    };

    fetchSyllabus();
  }, []);

  const filteredSyllabus = useMemo(() => {
    return syllabus.filter((subject) => (
      [subject.name, ...(subject.materials || [])]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase())
    ));
  }, [query, syllabus]);

  const totalMaterials = syllabus.reduce((sum, subject) => sum + (subject.materials?.length || 0), 0);

  return (
    <DashboardLayout title="Course Syllabus" role="STUDENT">
      <WorkspaceHero
        eyebrow="Syllabus workspace"
        title="Structured learning repository"
        description="Browse subjects, preview materials, track your unit readiness, and move into focused study mode from a cleaner academic workspace."
        icon={Layers3}
        badges={[
          loading ? 'Syncing repository' : 'Repository synchronized',
          `${syllabus.length} active subjects`,
          `${totalMaterials} study assets`
        ]}
        stats={[
          { label: 'Subjects', value: String(syllabus.length) },
          { label: 'Materials', value: String(totalMaterials) },
          { label: 'Peers active', value: '128' },
          { label: 'Study readiness', value: '42%' }
        ]}
        aside={(
          <div className="glass-panel h-full p-6 md:p-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
              Learning pulse
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Study flow is stable
            </h3>
            <div className="mt-6 space-y-3">
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Most active area
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  Algorithm and cloud modules are currently the most content-rich sections in this repository snapshot.
                </p>
              </div>
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  AI note
                </p>
                <p className="mt-3 text-sm leading-6 text-emerald-300">
                  Open focused study mode to preview the module context and get a guided summary faster.
                </p>
              </div>
            </div>
          </div>
        )}
      />

      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard title="Subjects" value={String(syllabus.length)} icon={BookOpen} color="bg-blue-500" trend="Academic core" />
        <StatCard title="Materials" value={String(totalMaterials)} icon={FileText} color="bg-emerald-500" trend="Repository" />
        <StatCard title="Live Scholars" value="128" icon={Users} color="bg-violet-500" trend="Collaborative" />
        <StatCard title="Mastery Index" value="42%" icon={Sparkles} color="bg-amber-500" trend="Rising" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <GlassCard title="Find a module" subtitle="Search subjects and resources" icon={Search}>
          <label className="surface-card flex items-center gap-3 px-4 py-3">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search subjects, documents, or topics"
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
          </label>
        </GlassCard>

        <GlassCard title="Study presence" subtitle="Peer learning snapshot" icon={Users}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Algorithms', flow: 'Peak' },
              { name: 'Cyber', flow: 'High' },
              { name: 'Cloud', flow: 'Rising' },
              { name: 'Quantum', flow: 'Focused' }
            ].map((item) => (
              <div key={item.name} className="surface-card p-4">
                <p className="text-sm font-black text-white">
                  {item.name}
                </p>
                <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-300">
                  Flow {item.flow}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={`syllabus-skeleton-${index}`} className="glass-panel h-[360px] animate-pulse" />
          ))
        ) : filteredSyllabus.length > 0 ? (
          filteredSyllabus.map((subject) => (
            <SubjectCard key={subject.name} subject={subject} onStudy={(name, sub) => setStudyItem({ name, sub })} />
          ))
        ) : (
          <div className="glass-panel col-span-full flex min-h-[280px] flex-col items-center justify-center px-6 py-10 text-center">
            <div className="rounded-[1.8rem] border border-blue-500/20 bg-blue-500/10 p-4 text-blue-200">
              <Search size={22} />
            </div>
            <h3 className="mt-5 text-2xl font-black text-white">
              No syllabus match found
            </h3>
            <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
              Try another search keyword to find a subject, document, or learning resource inside the repository.
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {studyItem ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-[rgba(3,8,20,0.82)] backdrop-blur-2xl"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-white/6 px-6 py-5 md:px-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl border border-blue-500/20 bg-blue-500/10 text-blue-200">
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
                      Focused study mode
                    </p>
                    <h2 className="mt-1 text-xl font-black text-white">
                      {studyItem.sub}
                    </h2>
                    <p className="mt-1 text-sm text-blue-200">
                      {studyItem.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStudyItem(null)}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 text-slate-500 transition-all hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid flex-1 gap-6 overflow-auto p-6 md:grid-cols-[1.35fr_0.65fr] md:p-8">
                <div className="premium-card flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] border border-blue-500/20 bg-blue-500/10 text-blue-200">
                    <FileText size={34} />
                  </div>
                  <h3 className="mt-8 text-3xl font-black text-white">
                    Preview workspace ready
                  </h3>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                    This panel is ready for document rendering, annotations, and deep reading mode. For now it shows a clean preview shell instead of a broken placeholder.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button type="button" className="btn-primary">
                      <Download size={14} />
                      Download material
                    </button>
                    <button type="button" className="btn-secondary">
                      <Sparkles size={14} />
                      Generate summary
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <GlassCard title="AI Study Brief" subtitle="Quick module context" icon={Sparkles}>
                    <div className="rounded-[1.5rem] border border-blue-500/18 bg-blue-500/8 p-5">
                      <p className="text-sm leading-7 text-slate-200">
                        This study asset belongs to {studyItem.sub}. Use it to understand the core concepts first, then move into problem solving or revision drills once the summary is clear.
                      </p>
                    </div>
                  </GlassCard>

                  <GlassCard title="Module meta" subtitle="Learning snapshot" icon={BookOpen}>
                    <div className="space-y-3">
                      {[
                        { label: 'Complexity', value: 'Medium to high' },
                        { label: 'Revision need', value: 'Recommended this week' },
                        { label: 'Focus session', value: '45 minutes' }
                      ].map((item) => (
                        <div key={item.label} className="surface-card flex items-center justify-between p-4">
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                            {item.label}
                          </p>
                          <p className="text-sm font-black text-white">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </DashboardLayout>
  );
}
