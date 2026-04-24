import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, Trash2, CheckCircle2 } from 'lucide-react';
import { institutionalAudio } from '../../utils/InstitutionalAudio';

const SignaturePad = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [shrunk, setShrunk] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
    institutionalAudio.playBeep(440, 0.05);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Particle emission (simulated by small dots in another layer or just audio)
    if (Math.random() > 0.8) institutionalAudio.playBeep(880, 0.01);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    institutionalAudio.playPulse(0.1);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    institutionalAudio.playWarning();
  };

  const submit = () => {
    setShrunk(true);
    institutionalAudio.playSuccess();
    setTimeout(onComplete, 1200);
  };

  return (
    <motion.div 
      animate={{ scale: shrunk ? 0 : 1, opacity: shrunk ? 0 : 1 }}
      className="bg-[#050505]/80 backdrop-blur-3xl border border-white/5 rounded-[50px] p-12 w-full max-w-xl space-y-10 shadow-3xl overflow-hidden relative"
    >
       <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
             <PenTool size={20} className="text-blue-500" />
             <h3 className="text-[12px] font-black text-white/40 uppercase tracking-[0.5em] italic">Sovereign Signature Pad</h3>
          </div>
          <p className="text-[9px] font-black text-blue-500/40 uppercase tracking-widest italic">Identity Anchor: Awaiting</p>
       </div>

       <div className="relative group">
          <canvas 
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
             className="w-full h-64 bg-black/40 rounded-[35px] border-2 border-dashed border-white/5 cursor-crosshair touch-none transition-all group-hover:border-blue-500/20"
          />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5 group-hover:opacity-10 transition-opacity">
             <CheckCircle2 size={120} className="text-blue-500" />
          </div>
       </div>

       <div className="grid grid-cols-2 gap-6 pt-4">
          <button 
            onClick={clear}
            className="py-5 rounded-[30px] border border-white/5 text-[10px] font-black text-white/20 uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center justify-center gap-3 italic"
          >
             <Trash2 size={16} /> Reset Matrix
          </button>
          <button 
            onClick={submit}
            disabled={!hasSignature}
            className="py-5 rounded-[30px] bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-600/30 hover:bg-white hover:text-black transition-all active:scale-95 flex items-center justify-center gap-3 italic disabled:opacity-20"
          >
             Seal Manifest <CheckCircle2 size={18} />
          </button>
       </div>

       <div className="text-center">
          <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em] italic">Quantum Particle Ink v1.0 // Node Sovereign // Institutional Root</p>
       </div>
    </motion.div>
  );
};

export default SignaturePad;
