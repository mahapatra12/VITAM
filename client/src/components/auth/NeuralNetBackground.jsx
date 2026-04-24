import React, { useRef, useEffect } from 'react';

const NeuralNetBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Volumetric Depth (v29.1) Architecture
    let layers = [
      { count: 40, speed: 0.1, size: [0.5, 1.2], opacity: 0.1, blur: 4 }, // Background
      { count: 60, speed: 0.4, size: [1.2, 2.5], opacity: 0.25, blur: 0 }, // Midground
      { count: 20, speed: 0.9, size: [2.5, 5.0], opacity: 0.5, blur: 2 }   // Foreground
    ];
    
    let particles = [];
    const mouse = { x: null, y: null, radius: 300 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init(); // Re-init particle distribution
    };

    class VolumetricParticle {
      constructor(layerIdx) {
        const layer = layers[layerIdx];
        this.layerIdx = layerIdx;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * (layer.size[1] - layer.size[0]) + layer.size[0];
        this.speedX = (Math.random() - 0.5) * layer.speed;
        this.speedY = (Math.random() - 0.5) * layer.speed;
        this.baseOpacity = layer.opacity;
        this.color = `rgba(0, 198, 255, ${this.baseOpacity})`;
        this.blur = layer.blur;
      }

      update(intensity = 1.0) {
        // Parallax Mouse Interaction
        if (mouse.x !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            let force = (mouse.radius - distance) / mouse.radius;
            // Particles in front (layer 2) react more than back (layer 0)
            let factor = (this.layerIdx + 1) * 2;
            this.x -= (dx / distance) * force * factor;
            this.y -= (dy / distance) * force * factor;
          }
        }
        
        this.x += this.speedX * intensity;
        this.y += this.speedY * intensity;

        if (this.x > canvas.width + 50) this.x = -50;
        if (this.x < -50) this.x = canvas.width + 50;
        if (this.y > canvas.height + 50) this.y = -50;
        if (this.y < -50) this.y = canvas.height + 50;
      }

      draw() {
        ctx.fillStyle = this.color;
        if (this.blur > 0) ctx.filter = `blur(${this.blur}px)`;
        else ctx.filter = 'none';

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      layers.forEach((layer, idx) => {
        for (let i = 0; i < layer.count; i++) {
          particles.push(new VolumetricParticle(idx));
        }
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Connections (Connectivity resides in Midground only for clarity)
      connect();

      for (const particle of particles) {
        particle.update();
        particle.draw();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    const connect = () => {
      const midgroundIndices = particles
        .map((p, i) => p.layerIdx === 1 ? i : -1)
        .filter(i => i !== -1);

      for (let i = 0; i < midgroundIndices.length; i++) {
        const p1 = particles[midgroundIndices[i]];
        for (let j = i + 1; j < midgroundIndices.length; j++) {
          const p2 = particles[midgroundIndices[j]];
          
          let dx = p1.x - p2.x;
          let dy = p1.y - p2.y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 250) {
            let opacity = (1 - distance / 250) * 0.12;
            
            ctx.strokeStyle = `rgba(0, 198, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
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
      className="fixed inset-0 pointer-events-none z-[-1] opacity-70 bg-transparent"
    />
  );
};

export default NeuralNetBackground;
