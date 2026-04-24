import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Building2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';

const heroStats = [
  { label: 'Managed roles', value: '8+', accent: 'from-blue-500 to-cyan-400' },
  { label: 'Secure sign-in layers', value: '3', accent: 'from-emerald-500 to-teal-400' },
  { label: 'Operational visibility', value: '24/7', accent: 'from-amber-400 to-orange-400' }
];

const roleCards = [
  {
    title: 'Admin Control',
    description: 'Govern users, analytics, finance, security, and institutional operations from one clean workspace.',
    icon: Building2
  },
  {
    title: 'Faculty Flow',
    description: 'Manage assignments, students, schedules, and academic workflows with faster day-to-day navigation.',
    icon: Users
  },
  {
    title: 'Student Experience',
    description: 'Give students a polished portal for identity, attendance, syllabus, AI help, and personal records.',
    icon: GraduationCap
  }
];

const featureCards = [
  {
    title: 'Clear role-based dashboards',
    description: 'Every user lands in a focused workspace built for their role instead of a one-size-fits-all admin panel.',
    icon: BookOpen
  },
  {
    title: 'Modern security journey',
    description: 'Password, authenticator, and passkey flows are integrated into one smoother and more trustworthy experience.',
    icon: ShieldCheck
  },
  {
    title: 'AI-powered assistance',
    description: 'Operational insights and guided actions stay visible without overwhelming the interface.',
    icon: Brain
  }
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--bg-deep)] text-slate-50">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="system-grid opacity-60" />
        <div className="mesh-gradient" />
        <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-blue-500/14 blur-[170px]" />
        <div className="absolute bottom-0 left-0 h-[20rem] w-[20rem] rounded-full bg-amber-400/10 blur-[140px]" />
      </div>

      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#071220]/72 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/20">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-xl font-black text-white">VITAM</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Institution Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn-secondary hidden sm:inline-flex"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Open Portal
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <section className="mx-auto grid min-h-[80vh] max-w-7xl items-center gap-12 py-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="status-pill mb-6 w-fit"
            >
              <Sparkles size={12} />
              Designed for every role
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.05 }}
              className="max-w-4xl text-5xl font-black leading-[1.02] text-white sm:text-6xl lg:text-7xl"
            >
              A sharper, safer, more engaging
              <span className="block bg-gradient-to-r from-blue-300 via-white to-cyan-300 bg-clip-text text-transparent">
                campus operating experience.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.12 }}
              className="mt-6 max-w-2xl text-lg leading-8 text-slate-300"
            >
              VITAM brings administration, academics, identity, AI, and role-based workflows into one premium interface that feels modern, fast, and easy to trust.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.18 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row"
            >
              <button type="button" onClick={() => navigate('/login')} className="btn-primary">
                Enter Dashboard
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary"
              >
                Explore Experience
              </button>
            </motion.div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {heroStats.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 + index * 0.07 }}
                  className="glass-panel p-5"
                >
                  <div className={`mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r ${item.accent}`} />
                  <p className="text-3xl font-black text-white">{item.value}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                    {item.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.12 }}
            className="premium-card p-6 sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="section-kicker mb-2">Live preview</p>
                <h2 className="text-2xl font-black text-white">Role-ready experience</h2>
              </div>
              <div className="status-pill">
                <ShieldCheck size={12} />
                Trusted access
              </div>
            </div>

            <div className="space-y-4">
              {roleCards.map((card) => (
                <div key={card.title} className="surface-card p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/12 text-blue-300">
                      <card.icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">{card.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{card.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section id="roles" className="mx-auto mt-8 max-w-7xl py-16">
          <div className="mb-10 text-center">
            <p className="section-kicker mb-3">Why it feels better</p>
            <h2 className="text-4xl font-black text-white sm:text-5xl">Built to be clear, modern, and easy to use</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featureCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className="premium-card p-8"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-white/[0.05] text-blue-300">
                  <card.icon size={24} />
                </div>
                <h3 className="text-2xl font-black text-white">{card.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
