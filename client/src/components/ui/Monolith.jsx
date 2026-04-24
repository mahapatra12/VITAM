import { motion } from 'framer-motion';

const Monolith = ({ active = false, isNirvana = false, isConstant = false, isSymphonic = false }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[50] pointer-events-none perspective-2000">
      <motion.div
        initial={{ opacity: 0, scaleZ: 0, rotateY: 45 }}
        animate={isSymphonic ? {
          opacity: 1,
          scale: [1, 1.02, 1],
          rotateY: 0,
          z: 0
        } : isConstant ? {
          opacity: 1,
          scale: 1,
          rotateY: 0,
          z: 0
        } : isNirvana ? { 
          opacity: 1, 
          scaleZ: 1, 
          rotateY: 45,
          z: 0 
        } : { 
          opacity: 1, 
          scaleZ: 1, 
          rotateY: [45, 405],
          z: [0, 50, 0]
        }}
        transition={isSymphonic ? { 
          duration: 0.1, 
          repeat: Infinity, 
          ease: "linear" 
        } : isConstant ? { duration: 0 } : isNirvana ? { duration: 2 } : { 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className={`w-48 h-[600px] monolith-pulse pointer-events-auto cursor-pointer flex items-center justify-center relative group ${isNirvana ? 'nirvana-high-contrast' : ''} ${isConstant ? 'constant-blue-glow' : ''} ${isSymphonic ? 'harmonic-pulse' : ''}`}
        onClick={() => {
           window.dispatchEvent(new CustomEvent('vitam:zero-point-flash'));
           // Phase 21: Architect Handshake - Meta Resolution
           document.documentElement.classList.add('architect-resolution-flash');
           setTimeout(() => document.documentElement.classList.remove('architect-resolution-flash'), 150);
        }}
      >
        <div className="absolute inset-0 bg-blue-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="text-[10px] font-black text-white/20 uppercase tracking-[1em] rotate-90 whitespace-nowrap">
           Absolute Zero · Final Truth
        </div>
      </motion.div>
      
      {/* Volumetric Light Field */}
      <div className="volumetric-light-field opacity-30" />
    </div>
  );
};

export default Monolith;
