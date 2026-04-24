import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import NeuralNetBackground from '../auth/NeuralNetBackground';

export default function WorkspaceHero({
  eyebrow,
  title,
  description,
  icon: Icon,
  badges = [],
  actions = [],
  stats = [],
  aside = null,
  className = ''
}) {
  return (
    <section className={`glass-card mb-12 overflow-hidden p-8 md:p-12 relative ${className}`}>
      {/* Subtle Neural Overlay for Continuity */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none scale-150 rotate-6">
         <NeuralNetBackground />
      </div>

      <div className="relative z-10 grid gap-12 xl:grid-cols-[1.2fr_0.8fr] xl:items-center">
        <div className="min-w-0">
          <div className="mb-8 flex flex-wrap items-center gap-4">
            {Icon && (
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#00c6ff] to-[#0072ff] flex items-center justify-center text-white shadow-xl shadow-[#00c6ff]/20">
                <Icon size={28} />
              </div>
            )}
            {eyebrow && (
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-[#00c6ff]">
                {eyebrow}
              </div>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight italic tracking-tighter">
            {title}
          </h1>

          {description && (
            <p className="mt-6 max-w-3xl text-sm md:text-lg text-white/50 leading-relaxed font-medium">
              {description}
            </p>
          )}

          {badges.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-4">
              {badges.map((badge) => (
                <span key={badge} className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/60">
                  {badge}
                </span>
              ))}
            </div>
          )}

          {actions.length > 0 && (
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              {actions.map((action) => {
                const ActionIcon = action.icon || ArrowRight;
                return (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className="btn-premium px-8 py-4 text-[11px] uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3"
                  >
                    {action.label}
                    <ActionIcon size={16} />
                  </button>
                );
              })}
            </div>
          )}

          {stats.length > 0 && (
            <div className="mt-12 grid gap-4 sm:grid-cols-2 max-w-2xl">
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 group hover:border-[#00c6ff]/30 transition-all"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 group-hover:text-[#00c6ff] transition-colors">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-2xl font-bold text-white italic">
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {aside && <div className="min-w-0 relative z-20">{aside}</div>}
      </div>
    </section>
  );
}
