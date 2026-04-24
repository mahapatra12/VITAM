import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function NeuralBackground() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null, radius: 150 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    // Create nodes
    const nodes = [];
    const numNodes = Math.floor((width * height) / 12000); // Higher density
    
    for (let i = 0; i < numNodes; i++) {
        nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            baseX: Math.random() * width,
            baseY: Math.random() * height,
            radius: Math.random() * 2 + 0.5
        });
    }

    const maxDistance = 160;
    let animationFrameId;

    const render = () => {
        ctx.clearRect(0, 0, width, height);
        
        // Update positions
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            
            // Mouse Repulsion Physics
            if (mouseRef.current.x != null && mouseRef.current.y != null) {
              const dx = mouseRef.current.x - node.x;
              const dy = mouseRef.current.y - node.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance < mouseRef.current.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (mouseRef.current.radius - distance) / mouseRef.current.radius;
                const pushX = forceDirectionX * force * 5;
                const pushY = forceDirectionY * force * 5;
                
                node.x -= pushX;
                node.y -= pushY;
              }
            }

            // Normal drift
            node.x += node.vx;
            node.y += node.vy;
            
            // Bounce
            if (node.x < 0 || node.x > width) node.vx *= -1;
            if (node.y < 0 || node.y > height) node.vy *= -1;
            
            // Draw node
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.7)'; // Sky blue for cyber feel
            ctx.fill();
            
            // Draw connections between nodes
            for (let j = i + 1; j < nodes.length; j++) {
                const otherNode = nodes[j];
                const dx = node.x - otherNode.x;
                const dy = node.y - otherNode.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < maxDistance) {
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(otherNode.x, otherNode.y);
                    const opacity = 1 - (distance / maxDistance);
                    ctx.strokeStyle = `rgba(56, 189, 248, ${opacity * 0.25})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            // Draw connection to cursor
            if (mouseRef.current.x != null && mouseRef.current.y != null) {
              const dxMouse = node.x - mouseRef.current.x;
              const dyMouse = node.y - mouseRef.current.y;
              const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
              if (distanceMouse < mouseRef.current.radius) {
                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
                const opacity = 1 - (distanceMouse / mouseRef.current.radius);
                ctx.strokeStyle = `rgba(56, 189, 248, ${opacity * 0.4})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
              }
            }
        }
        
        animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    const handleResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
        cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-auto z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#02040a] via-[#050b14] to-[#040810] z-0" />
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full z-10 mix-blend-screen opacity-80"
      />
      <motion.div
        animate={{ 
            boxShadow: ['inset 0 0 120px rgba(0,0,0,0.8)', 'inset 0 0 180px rgba(0,0,0,0.95)', 'inset 0 0 120px rgba(0,0,0,0.8)']
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 z-20 pointer-events-none"
      />
    </div>
  );
}
