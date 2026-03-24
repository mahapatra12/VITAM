import { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

// Animated Counter Hook
const AnimatedCounter = ({ value }) => {
  const numericValue = parseFloat(value.toString().replace(/[^0-9.]/g, ''));
  const suffix = value.toString().replace(/[0-9.]/g, '');
  
  if (isNaN(numericValue)) return <span>{value}</span>;

  const spring = useSpring(0, { stiffness: 50, damping: 20, mass: 1 });
  const display = useTransform(spring, (current) => {
    if (Number.isInteger(numericValue)) return Math.floor(current).toLocaleString();
    return current.toFixed(1).toLocaleString();
  });

  useEffect(() => {
    spring.set(numericValue);
  }, [numericValue, spring]);

  return (
    <span className="flex items-center">
      <motion.span>{display}</motion.span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
};

export const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div 
    whileHover={{ y: -6, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="relative p-5 rounded-3xl border border-white/5 bg-slate-900/60 backdrop-blur-xl shadow-2xl flex items-center justify-between group cursor-pointer overflow-hidden"
  >
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${color}`} />
    
    <div>
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 group-hover:text-slate-300 transition-colors">{title}</p>
      <div className="flex items-end gap-3">
        <h4 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
          <AnimatedCounter value={value} />
        </h4>
        {trend && (
          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border mb-1 ${
            trend.includes('+') || trend === 'Safe' || trend === 'Stable' || trend.includes('Top') 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : trend.includes('-') || trend.includes('Risk') || trend.includes('Required')
            ? 'bg-red-500/10 text-red-400 border-red-500/20'
            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
          }`}>
            {trend}
          </span>
        )}
      </div>
    </div>

    <div className={`w-14 h-14 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:bg-opacity-20 border border-white/5`}>
      <Icon className={`${color.replace('bg-', 'text-')} drop-shadow-lg`} size={28} />
    </div>
  </motion.div>
);

export const GlassCard = ({ children, title, subtitle, icon: Icon, className = "" }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`p-6 rounded-[32px] border border-white/5 bg-slate-900/40 backdrop-blur-3xl shadow-2xl shadow-black/50 relative overflow-hidden group ${className}`}
  >
    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    
    {(title || Icon) && (
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
              <Icon size={22} className="text-white/80" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
    )}
    <div className="relative z-10">
      {children}
    </div>
  </motion.div>
);

// Optional default export for compatibility
export default { StatCard, GlassCard };
