import React, { useRef, useEffect } from 'react';

const NeuroWaveOverlay = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const mouse = { x: 0, y: 0, vX: 0, vY: 0, lastX: 0, lastY: 0 };
    const points = [];
    const pointCount = 12;
    const spring = 0.05;
    const friction = 0.9;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const init = () => {
      points.length = 0;
      for (let i = 0; i < pointCount; i++) {
        points.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          vX: 0,
          vY: 0
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update mouse velocity
      mouse.vX = mouse.x - mouse.lastX;
      mouse.vY = mouse.y - mouse.lastY;
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;

      // Update points (Chain effect)
      let targetX = mouse.x;
      let targetY = mouse.y;

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 0; i < pointCount; i++) {
        const p = points[i];
        p.vX += (targetX - p.x) * spring;
        p.vY += (targetY - p.y) * spring;
        p.vX *= friction;
        p.vY *= friction;
        p.x += p.vX;
        p.y += p.vY;

        targetX = p.x;
        targetY = p.y;

        if (i > 0) {
          const prev = points[i - 1];
          const cx = (prev.x + p.x) / 2;
          const cy = (prev.y + p.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, cx, cy);
        }
      }

      ctx.strokeStyle = 'rgba(37, 99, 235, 0.15)';
      ctx.lineWidth = 40;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.strokeStyle = 'rgba(37, 99, 235, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-[1] opacity-60 mix-blend-screen"
    />
  );
};

export default NeuroWaveOverlay;
