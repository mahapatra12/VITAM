import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Scan, Lock, Cpu, Activity, Zap, AlertTriangle, CheckCircle2, Eye } from 'lucide-react';

const STAGES = [
  { id: 'init',      label: 'Initializing Neural Scanner',     duration: 800  },
  { id: 'camera',    label: 'Activating Optical Sensor',       duration: 1200 },
  { id: 'detecting', label: 'Detecting Biometric Signature',   duration: 2500 },
  { id: 'mapping',   label: 'Mapping Neural Landmarks',        duration: 2000 },
  { id: 'verifying', label: 'Verifying Institutional Identity', duration: 1500 },
  { id: 'confirmed', label: 'Identity Confirmed',              duration: 800  },
];

const FaceScanner = ({ onComplete }) => {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const streamRef   = useRef(null);
  const frameRef    = useRef(null);
  const mountedRef  = useRef(true);

  const [stageIdx,    setStageIdx]    = useState(0);
  const [progress,    setProgress]    = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [dots,        setDots]        = useState([]);
  const [scanY,       setScanY]       = useState(0);

  // Animate scanning line
  useEffect(() => {
    let anim;
    let dir = 1;
    let y = 0;
    const tick = () => {
      y += dir * 1.5;
      if (y >= 100) dir = -1;
      if (y <= 0)   dir = 1;
      setScanY(y);
      anim = requestAnimationFrame(tick);
    };
    anim = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(anim);
  }, []);

  // Generate randomized biometric dot overlay
  useEffect(() => {
    const generate = () => Array.from({ length: 32 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 1.5 + Math.random() * 3,
      delay: Math.random() * 2,
    }));
    setDots(generate());

    const refreshDots = setInterval(() => {
      if (mountedRef.current) setDots(generate());
    }, 3000);
    return () => clearInterval(refreshDots);
  }, []);

  // Camera initialization
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 320, facingMode: 'user' },
        audio: false,
      });
      if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(() => {});
          if (mountedRef.current) setCameraReady(true);
        };
      }
    } catch {
      if (mountedRef.current) setCameraError(true);
    }
  }, []);

  // Draw camera feed to canvas with overlay
  useEffect(() => {
    if (!cameraReady) return;
    const drawFrame = () => {
      const canvas = canvasRef.current;
      const video  = videoRef.current;
      if (!canvas || !video) return;
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Blue tint overlay
      ctx.fillStyle = 'rgba(37,99,235,0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Scan line
      const lineY = (scanY / 100) * canvas.height;
      const grad = ctx.createLinearGradient(0, lineY - 2, 0, lineY + 2);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, 'rgba(59,130,246,0.9)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, lineY - 2, canvas.width, 4);

      frameRef.current = requestAnimationFrame(drawFrame);
    };
    frameRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(frameRef.current);
  }, [cameraReady, scanY]);

  // Main sequence
  useEffect(() => {
    mountedRef.current = true;

    const run = async () => {
      let elapsed = 0;
      const totalDuration = STAGES.reduce((s, st) => s + st.duration, 0);

      for (let i = 0; i < STAGES.length; i++) {
        if (!mountedRef.current) break;
        setStageIdx(i);

        if (i === 1) await startCamera();

        const stepDuration = STAGES[i].duration;
        const steps = 30;
        const interval = stepDuration / steps;
        const startProgress = (elapsed / totalDuration) * 100;
        const endProgress   = ((elapsed + stepDuration) / totalDuration) * 100;

        for (let s = 0; s <= steps; s++) {
          if (!mountedRef.current) return;
          const p = startProgress + (endProgress - startProgress) * (s / steps);
          setProgress(Math.min(p, 100));
          await new Promise(r => setTimeout(r, interval));
        }
        elapsed += stepDuration;
      }

      if (mountedRef.current) {
        setProgress(100);
        await new Promise(r => setTimeout(r, 400));
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if (onComplete) onComplete();
      }
    };

    run();

    return () => {
      mountedRef.current = false;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []); // eslint-disable-line

  const currentStage = STAGES[Math.min(stageIdx, STAGES.length - 1)];
  const confirmed    = stageIdx >= STAGES.length - 1 && progress >= 99;

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto select-none">
      {/* Scanner Viewport */}
      <div className="relative w-72 h-72 mb-8">
        {/* Corner brackets */}
        {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2',
          'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map((cls, i) => (
          <div key={i} className={`absolute w-8 h-8 border-blue-500/80 ${cls} rounded-sm z-20`} />
        ))}

        {/* Rotating rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 border border-blue-500/10 rounded-full pointer-events-none"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-4 border border-indigo-500/15 rounded-full border-dashed pointer-events-none"
        />

        {/* Main scanner box */}
        <div className="absolute inset-0 border border-blue-500/20 rounded-[2rem] overflow-hidden bg-black/60 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            {confirmed ? (
              <motion.div
                key="confirmed"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full h-full flex flex-col items-center justify-center gap-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                >
                  <CheckCircle2 size={44} />
                </motion.div>
                <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em] italic">Identity Locked</p>
              </motion.div>
            ) : cameraError ? (
              <motion.div
                key="sim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full relative flex items-center justify-center"
              >
                {/* Simulated face silhouette when no camera */}
                <div className="relative w-32 h-40 flex flex-col items-center gap-0">
                  <div className="w-24 h-28 rounded-full bg-blue-500/5 border border-blue-500/20 flex items-center justify-center">
                    <div className="w-16 h-20 rounded-full bg-blue-500/10 border border-blue-400/10" />
                  </div>
                  <div className="w-20 h-12 bg-blue-500/5 border-x border-blue-500/10 rounded-b-full" />
                </div>

                {/* Map dots */}
                {stageIdx >= 2 && dots.slice(0, 18).map(d => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0.6], scale: 1 }}
                    transition={{ delay: d.delay * 0.3, duration: 0.4, repeat: Infinity, repeatType: 'reverse' }}
                    style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size }}
                    className="absolute bg-blue-400 rounded-full shadow-[0_0_4px_#60a5fa]"
                  />
                ))}

                {/* Scan line */}
                {stageIdx >= 1 && (
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_12px_rgba(59,130,246,0.8)] pointer-events-none z-10"
                    style={{ top: `${scanY}%` }}
                  />
                )}
              </motion.div>
            ) : cameraReady ? (
              <motion.div key="cam" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full relative">
                <canvas
                  ref={canvasRef}
                  width={288}
                  height={288}
                  className="w-full h-full object-cover opacity-80"
                />
                <video ref={videoRef} className="hidden" muted playsInline />

                {/* Landmark dots on real feed */}
                {stageIdx >= 3 && dots.slice(0, 24).map(d => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0.4, 1, 0.4], scale: 1 }}
                    transition={{ delay: d.delay * 0.2, duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
                    style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.size * 1.5, height: d.size * 1.5 }}
                    className="absolute bg-blue-400 rounded-full shadow-[0_0_6px_#60a5fa] z-10"
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Eye icon HUD */}
          <div className="absolute top-3 right-3 z-20 text-blue-500/40">
            <Eye size={14} className="animate-pulse" />
          </div>
        </div>

        {/* HUD corners */}
        <div className="absolute -top-3 -right-3 w-10 h-10 bg-black/60 border border-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center z-30">
          <Activity size={16} className="text-blue-500 animate-pulse" />
        </div>
        <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-black/60 border border-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center z-30">
          <Cpu size={16} className="text-indigo-500" />
        </div>
      </div>

      {/* Status & Progress */}
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <motion.p
            key={currentStage.id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic"
          >
            {currentStage.label}
          </motion.p>
          <p className="text-xs font-black text-blue-500 italic tabular-nums">{Math.round(progress)}%</p>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div
            style={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.5)] rounded-full"
          />
        </div>

        {/* Stage indicators */}
        <div className="flex gap-1.5 justify-center pt-1">
          {STAGES.map((s, i) => (
            <div
              key={s.id}
              className={`h-0.5 flex-1 rounded-full transition-all duration-700 ${
                i < stageIdx ? 'bg-blue-500' : i === stageIdx ? 'bg-blue-400 animate-pulse' : 'bg-white/5'
              }`}
            />
          ))}
        </div>

        {/* Info box */}
        <div className="flex items-center gap-3 py-3 px-5 bg-white/[0.02] border border-white/5 rounded-2xl mt-2">
          <Zap size={14} className="text-blue-500 shrink-0" />
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic leading-relaxed">
            {cameraError
              ? 'Camera unavailable — running simulated biometric verification.'
              : 'Neural identity mapped to hardware sensor. Encrypted institutional session active.'}
          </p>
        </div>

        {cameraError && (
          <div className="flex items-center gap-2 text-amber-500/70 justify-center">
            <AlertTriangle size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest italic">Simulation Mode Active</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceScanner;
