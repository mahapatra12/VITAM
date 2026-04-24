import { useEffect, useRef, useState } from 'react';
import { getDeferredRootMargin } from '../../utils/runtimeProfile';

const SectionFallback = ({ minHeight }) => (
  <div className="glass-card animate-pulse overflow-hidden p-5" style={{ minHeight }}>
    <div className="flex items-center justify-between gap-4">
      <div className="h-5 w-40 rounded-full bg-white/10" />
      <div className="h-8 w-24 rounded-xl bg-white/10" />
    </div>
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      <div className="h-20 rounded-2xl bg-white/5" />
      <div className="h-20 rounded-2xl bg-white/5" />
    </div>
    <div className="mt-5 h-40 rounded-[1.75rem] bg-slate-950/60" />
  </div>
);

export default function DeferredSection({
  children,
  className = '',
  minHeight = 280,
  rootMargin,
  eager = false,
  once = true,
  fallback = null
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(() => eager || typeof window === 'undefined');
  const observerMargin = rootMargin || getDeferredRootMargin();

  useEffect(() => {
    if (eager || isVisible) {
      return undefined;
    }

    const node = ref.current;
    if (!node || typeof IntersectionObserver !== 'function') {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) {
          return;
        }

        setIsVisible(true);
        if (once) {
          observer.disconnect();
        }
      },
      { rootMargin: observerMargin, threshold: 0.01 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [eager, isVisible, observerMargin, once]);

  const visibilityStyle = isVisible
    ? {
      contentVisibility: 'auto',
      containIntrinsicSize: `1px ${Math.max(minHeight, 220)}px`
    }
    : { minHeight };

  return (
    <section ref={ref} className={className} style={visibilityStyle}>
      {isVisible ? children : (fallback || <SectionFallback minHeight={minHeight} />)}
    </section>
  );
}
