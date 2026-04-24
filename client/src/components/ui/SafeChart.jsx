/**
 * VITAM Safe Responsive Chart Container
 * 
 * Wraps Recharts' ResponsiveContainer with a ResizeObserver guard.
 * This eliminates the "width(-1) and height(-1) should be greater than 0"
 * console warning by only rendering the chart once the container has positive dimensions.
 */
import { useRef, useState, useLayoutEffect } from 'react';
import { ResponsiveContainer } from 'recharts';

/**
 * Drop-in replacement for ResponsiveContainer that suppresses the -1 dimension warning.
 * Usage: Same as ResponsiveContainer — just replace the import.
 */
export default function SafeChart({ children, height = 280, minHeight, className = '', ...props }) {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Check immediately
    if (el.offsetWidth > 0 && el.offsetHeight > 0) {
      setReady(true);
      return;
    }

    // Otherwise wait for ResizeObserver
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height: h } = entry.contentRect;
        if (width > 0 && h > 0) {
          setReady(true);
          ro.disconnect();
          break;
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height: minHeight || height, minHeight: minHeight || height, width: '100%', position: 'relative' }}
    >
      {ready ? (
        <ResponsiveContainer width="100%" height="100%" {...props}>
          {children}
        </ResponsiveContainer>
      ) : (
        // Skeleton placeholder while waiting for container size
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500/30 rounded-full animate-pulse"
              style={{ width: '60%' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
