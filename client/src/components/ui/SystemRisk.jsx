import { useEffect, useRef, useState } from 'react';

const debugFractal = import.meta.env.VITE_DEBUG_CANVAS === 'true';

/**
 * FractalVariance — Canvas Mandelbrot-inspired fractal that morphs
 * in real-time based on a variance value (0–100).
 * Higher variance = more chaotic, fractured boundaries.
 * Lower variance = smooth, converging structure.
 */
export default function FractalVariance({ variance = 12, className = '' }) {
  const [contextLost, setContextLost] = useState(false);
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const tRef      = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      tRef.current += 0.012;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Map variance to fractal parameters
      const maxIter  = Math.max(8, 30 - Math.floor(variance * 0.22)); // less iterations = rougher
      const zoom     = 2.8 + Math.sin(tRef.current * 0.3) * 0.4;
      const cx       = -0.5 + Math.sin(tRef.current * 0.15) * (0.001 + variance * 0.0005);
      const cy       = Math.cos(tRef.current * 0.12) * (0.001 + variance * 0.0004);
      const hueBase  = (tRef.current * 20 + variance * 2) % 360;

      const imgData  = ctx.createImageData(W, H);
      const data     = imgData.data;

      for (let py = 0; py < H; py++) {
        for (let px = 0; px < W; px++) {
          const x0 = cx + (px / W - 0.5) * zoom * (W / H);
          const y0 = cy + (py / H - 0.5) * zoom;

          let x = 0, y = 0, iter = 0;
          while (x*x + y*y <= 4 && iter < maxIter) {
            const xt = x*x - y*y + x0;
            y = 2*x*y + y0;
            x = xt;
            iter++;
          }

          const i = (py * W + px) * 4;
          if (iter === maxIter) {
            data[i] = 2; data[i+1] = 6; data[i+2] = 23; data[i+3] = 255;
          } else {
            const t = iter / maxIter;
            const hue = (hueBase + t * 200) % 360;
            // HSL → RGB
            const s = 0.85, l = 0.3 + t * 0.45;
            const c2 = (1 - Math.abs(2*l - 1)) * s;
            const x2 = c2 * (1 - Math.abs((hue / 60) % 2 - 1));
            const m  = l - c2/2;
            let r=0,g=0,b=0;
            if      (hue < 60)  { r=c2; g=x2; b=0; }
            else if (hue < 120) { r=x2; g=c2; b=0; }
            else if (hue < 180) { r=0;  g=c2; b=x2; }
            else if (hue < 240) { r=0;  g=x2; b=c2; }
            else if (hue < 300) { r=x2; g=0;  b=c2; }
            else                { r=c2; g=0;  b=x2; }
            data[i]   = Math.round((r+m)*255);
            data[i+1] = Math.round((g+m)*255);
            data[i+2] = Math.round((b+m)*255);
            data[i+3] = Math.round(160 + t * 90);
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);

      // Vignette overlay
      const vignette = ctx.createRadialGradient(W/2, H/2, H*0.15, W/2, H/2, H*0.8);
      vignette.addColorStop(0, 'rgba(2,6,23,0)');
      vignette.addColorStop(1, 'rgba(2,6,23,0.85)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);

      animRef.current = requestAnimationFrame(draw);
    };

    if (!contextLost) {
      draw();
    }

    const handleContextLost = (e) => {
      e.preventDefault();
      setContextLost(true);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (debugFractal) {
        console.warn('[FractalEntropy] Canvas 2D context lost. Pausing animation loop.');
      }
    };

    const handleContextRestored = () => {
      if (debugFractal) {
        console.info('[FractalEntropy] Canvas 2D context restored. Re-syncing render loop.');
      }
      setContextLost(false);
      draw();
    };

    canvas.addEventListener('contextlost', handleContextLost);
    canvas.addEventListener('contextrestored', handleContextRestored);

    return () => { 
      ro.disconnect(); 
      if (animRef.current) cancelAnimationFrame(animRef.current); 
      canvas.removeEventListener('contextlost', handleContextLost);
      canvas.removeEventListener('contextrestored', handleContextRestored);
    };
  }, [variance, contextLost]);

  return (
    <div className={`relative overflow-hidden rounded-3xl ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Variance label overlay */}
      <div className="absolute bottom-6 left-6 flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)] ${variance > 40 ? 'bg-amber-500' : variance > 20 ? 'bg-blue-400' : 'bg-emerald-500'}`} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 italic">
          Variance: {variance.toFixed(1)} · {variance < 20 ? 'OPTIMAL' : variance < 40 ? 'INSTITUTIONAL DRIFT' : 'VARIANCE ALERT'}
        </span>
      </div>
      <div className="absolute top-6 right-6">
        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.5em] italic">Architecture Variance Model</p>
      </div>
      {contextLost && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-md">
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse border border-red-500/30 px-4 py-2 bg-red-500/10 rounded-xl">
            GPU Context Lost · Attempting Recovery
          </p>
        </div>
      )}
    </div>
  );
}
