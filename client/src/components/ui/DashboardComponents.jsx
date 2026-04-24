const getTrendTone = (trend = '') => {
  const value = String(trend);
  if (value.includes('+') || /safe|stable|top|clear|optimal|healthy/i.test(value)) {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
  }
  if (value.includes('-') || /risk|required|critical|alert|high/i.test(value)) {
    return 'border-rose-500/30 bg-rose-500/10 text-rose-200';
  }
  return 'border-blue-500/30 bg-blue-500/10 text-blue-200';
};

export const AnimatedCounter = ({ value = '' }) => {
  const safeValue = value ?? '';
  return <span>{safeValue}</span>;
};

export const StatCard = ({ title, value, icon: Icon, trend }) => (
  <article className="glass-card p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/12 text-blue-200">
            <Icon size={18} />
          </div>
        )}
        <p className="text-xs uppercase tracking-wide text-slate-300">{title}</p>
      </div>
      {trend && <span className={`rounded-full border px-2 py-1 text-[11px] ${getTrendTone(trend)}`}>{trend}</span>}
    </div>
    <p className="mt-3 text-3xl font-extrabold text-white">
      <AnimatedCounter value={value} />
    </p>
  </article>
);

export const GlassCard = ({ children, title, subtitle, icon: Icon, className = '' }) => (
  <section className={`glass-card p-5 ${className}`}>
    {(title || Icon) && (
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/12 text-blue-200">
              <Icon size={16} />
            </div>
          )}
          <div>
            {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
        </div>
      </div>
    )}
    <div>{children}</div>
  </section>
);

export const RefractiveCard = ({ children, className = '' }) => (
  <section className={`glass-card border border-cyan-400/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(8,145,178,0.08)] p-5 ${className}`}>
    {children}
  </section>
);

export const ResourceNode = ({ from, to, strength = 0.5, active = true }) => (
  <div className="glass-card p-4">
    <div className="mb-3 flex items-center justify-between">
      <span className="text-xs text-slate-300">{from} to {to}</span>
      <span className={`h-2 w-2 rounded-full ${active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
    </div>
    <div className="h-2 w-full rounded-full bg-slate-700/70">
      <div
        className="h-2 rounded-full bg-blue-500"
        style={{ width: `${Math.max(0, Math.min(1, strength)) * 100}%` }}
      />
    </div>
  </div>
);

export const GlassSkeleton = ({ className = '' }) => (
  <div className={`glass-card animate-pulse bg-slate-800/50 ${className}`} />
);

export const SystemContainer = ({ children, className = '' }) => (
  <div className={`relative ${className}`}>{children}</div>
);

export default {
  StatCard,
  GlassCard,
  RefractiveCard,
  ResourceNode,
  GlassSkeleton,
  SystemContainer
};
