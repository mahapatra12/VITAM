import { motion } from 'framer-motion';
import { Activity, ArrowRight, ShieldAlert, ShieldCheck, Zap } from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { useNavigate } from 'react-router-dom';

const MODE_LABELS = {
  CAMPUS: 'Campus operational status',
  DEPARTMENT: 'Departmental resource sync',
  PERSONAL: 'Verified academic profile',
  INSTITUTIONAL: 'Institutional status monitor'
};

export default function SystemStatusPanel({ mode = 'INSTITUTIONAL' }) {
  const { health } = useHealth();
  const navigate = useNavigate();
  const isHealthy = Boolean(health?.isHealthy);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => navigate('/admin/integrity')}
      className="premium-card w-full p-5 text-left"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
            {MODE_LABELS[mode] || MODE_LABELS.INSTITUTIONAL}
          </p>
          <h3 className="mt-2 text-xl font-black text-white">
            {isHealthy ? 'System healthy and synchronized' : 'Action required for stabilization'}
          </h3>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${isHealthy ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/20 bg-rose-500/10 text-rose-300'}`}>
          {isHealthy ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="surface-card p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
            Health index
          </p>
          <div className="mt-2 flex items-center gap-2 text-white">
            <Activity size={16} className="text-blue-300" />
            <span className="text-2xl font-black">
              {isHealthy ? '99.98%' : '84.22%'}
            </span>
          </div>
        </div>

        <div className="surface-card p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
            System variance
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Zap size={16} className={health.variance > 50 ? 'text-rose-300' : 'text-blue-300'} />
            <span className={`text-2xl font-black ${health.variance > 50 ? 'text-rose-200' : 'text-white'}`}>
              {health.variance}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm font-bold text-blue-200">
        Open integrity room
        <ArrowRight size={15} />
      </div>
    </motion.button>
  );
}
