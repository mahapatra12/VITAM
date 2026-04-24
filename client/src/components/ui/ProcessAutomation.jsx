import { motion } from 'framer-motion';

const OmegaManifestation = ({ active = false }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="data-matter-shard"
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight,
            scale: 0,
            opacity: 0
          }}
          animate={{ 
            x: [null, Math.random() * window.innerWidth, Math.random() * window.innerWidth],
            y: [null, Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            scale: [0, 1, 0.5],
            opacity: [0, 0.8, 0],
            rotate: [0, 360, 720]
          }}
          transition={{ 
            duration: 10 + Math.random() * 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-blue-500/5 to-transparent opacity-30 animate-pulse" />
    </div>
  );
};

export default OmegaManifestation;
