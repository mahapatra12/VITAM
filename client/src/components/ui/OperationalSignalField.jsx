import { useEffect, useRef, useState } from 'react';

const PARTICLE_COUNT = 180;
const debugCanvas = import.meta.env.VITE_DEBUG_CANVAS === 'true';

function createParticle(w, h) {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 0.6 + 0.1;
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: Math.random() * 1.8 + 0.4,
    alpha: Math.random() * 0.7 + 0.2,
    hue: Math.random() * 60 + 200, // blue→purple range
    life: Math.random() * 200 + 100,
    age: 0,
  };
}

export default function OperationalSignalField({ className = '', intensity = 1 }) {
  const [contextLost, setContextLost] = useState(false);
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particles.current = Array.from({ length: Math.floor(PARTICLE_COUNT * intensity) }, () =>
        createParticle(canvas.width, canvas.height)
      );
      setIsReady(true);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let frame = 0;
    const draw = () => {
      frame++;
      const W = canvas.width;
      const H = canvas.height;

      // Fade trail
      ctx.fillStyle = 'rgba(2, 6, 23, 0.18)';
      ctx.fillRect(0, 0, W, H);

      particles.current.forEach((p, i) => {
        // Drift + subtle vortex pull toward center
        const dx = W / 2 - p.x;
        const dy = H / 2 - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        p.vx += (dx / dist) * 0.002;
        p.vy += (dy / dist) * 0.002;

        // Dampen to keep speed reasonable
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.2) { p.vx *= 0.98; p.vy *= 0.98; }

        p.x += p.vx;
        p.y += p.vy;
        p.age++;

        // Recycle particle
        if (p.age > p.life || p.x < 0 || p.x > W || p.y < 0 || p.y > H) {
          particles.current[i] = createParticle(W, H);
          return;
        }

        const lifeRatio = 1 - p.age / p.life;
        const alpha = p.alpha * lifeRatio;

        // Draw glowing dot
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        gradient.addColorStop(0, `hsla(${p.hue + frame * 0.1}, 90%, 75%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${p.hue + frame * 0.1}, 90%, 55%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Connection lines between nearby particles
        for (let j = i + 1; j < particles.current.length; j++) {
          const q = particles.current[j];
          const ex = p.x - q.x;
          const ey = p.y - q.y;
          const d = ex * ex + ey * ey;
          if (d < 6400) { // 80px²
            const lineAlpha = (1 - d / 6400) * 0.12 * lifeRatio;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `hsla(${p.hue}, 80%, 65%, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    if (!contextLost) {
      draw();
    }

    const handleContextLost = (e) => {
      e.preventDefault();
      setContextLost(true);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (debugCanvas) {
        console.warn('[OperationalSignalField] Canvas 2D context lost. Pausing animation loop.');
      }
    };

    const handleContextRestored = () => {
      if (debugCanvas) {
        console.info('[OperationalSignalField] Canvas 2D context restored. Rebuilding particles.');
      }
      resize();
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
  }, [intensity, contextLost]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: isReady ? 1 : 0, transition: 'opacity 1s ease' }}
    />
  );
}
