import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * TiltCard — wraps children with a 3D CSS perspective tilt
 * that responds to mouse position. Adds a specular highlight.
 */
export default function TiltCard({ children, className = '', maxTilt = 12, scale = 1.02 }) {
  const cardRef = useRef(null);
  const rafRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top)  / rect.height - 0.5;

      const rotX = -y * maxTilt * 2;
      const rotY =  x * maxTilt * 2;

      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;

      // Specular highlight position
      const shine = card.querySelector('.tilt-shine');
      if (shine) {
        shine.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,0.07) 0%, transparent 60%)`;
      }
    });
  }, [maxTilt, scale]);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)`;
    const shine = card.querySelector('.tilt-shine');
    if (shine) shine.style.background = 'transparent';
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-100 ease-out ${className}`}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      {/* Specular shine layer */}
      <div
        className="tilt-shine absolute inset-0 rounded-[inherit] pointer-events-none z-10 transition-all duration-200"
        style={{ borderRadius: 'inherit' }}
      />
      {children}
    </div>
  );
}
