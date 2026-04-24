import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Info, ShieldAlert, Sparkles, X } from 'lucide-react';

const TONE_STYLES = {
  default: {
    icon: Info,
    badge: 'bg-white/8 text-slate-200 border-white/10',
    halo: 'from-white/12 via-blue-500/10 to-transparent',
    confirm: 'btn-primary'
  },
  info: {
    icon: Sparkles,
    badge: 'bg-blue-500/12 text-blue-200 border-blue-500/20',
    halo: 'from-blue-500/18 via-cyan-400/12 to-transparent',
    confirm: 'btn-primary'
  },
  danger: {
    icon: ShieldAlert,
    badge: 'bg-rose-500/12 text-rose-200 border-rose-500/20',
    halo: 'from-rose-500/18 via-rose-400/12 to-transparent',
    confirm: 'rounded-2xl bg-rose-500 px-5 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-white transition-all hover:bg-rose-400'
  },
  warning: {
    icon: AlertTriangle,
    badge: 'bg-amber-500/12 text-amber-100 border-amber-500/20',
    halo: 'from-amber-500/18 via-orange-400/12 to-transparent',
    confirm: 'rounded-2xl bg-amber-400 px-5 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-950 transition-all hover:bg-amber-300'
  }
};

export default function ActionDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
  loading = false,
  confirmDisabled = false,
  tone = 'default',
  children
}) {
  const style = TONE_STYLES[tone] || TONE_STYLES.default;
  const Icon = style.icon;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event) => {
      if (event.key === 'Escape' && !loading) {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, loading, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(3,8,20,0.72)] px-4 py-6 backdrop-blur-2xl"
          onClick={(event) => {
            if (event.target === event.currentTarget && !loading) {
              onClose?.();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            className="premium-card relative w-full max-w-xl overflow-hidden p-0"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${style.halo}`} />

            <div className="relative z-10 p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border ${style.badge}`}>
                    <Icon size={22} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.26em] text-slate-400">
                      Action confirmation
                    </p>
                    <h3 className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">
                      {title}
                    </h3>
                    {description ? (
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                        {description}
                      </p>
                    ) : null}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => !loading && onClose?.()}
                  disabled={loading}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 text-slate-500 transition-all hover:text-white disabled:opacity-40"
                >
                  <X size={18} />
                </button>
              </div>

              {children ? (
                <div className="mt-6 rounded-[28px] border border-white/8 bg-slate-950/55 p-4 sm:p-5">
                  {children}
                </div>
              ) : null}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => !loading && onClose?.()}
                  disabled={loading}
                  className="btn-secondary justify-center disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading || confirmDisabled}
                  className={`${style.confirm} justify-center disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  {loading ? 'Processing...' : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
