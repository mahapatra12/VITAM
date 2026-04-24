import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Shield, Activity, Target } from 'lucide-react';
import { institutionalAudio } from '../../utils/InstitutionalAudio';

const RecursiveAudit = ({ logs = [] }) => {
  const [scanning, setScanning] = useState(false);
  const [scanIndex, setScanIndex] = useState(-1);

  useEffect(() => {
    if (logs.length > 0 && !scanning) {
       setScanning(true);
       setScanIndex(0);
    }
  }, [logs]);

  useEffect(() => {
    if (scanning && scanIndex < logs.length) {
       const timer = setTimeout(() => {
          setScanIndex(prev => prev + 1);
          institutionalAudio.playBeep(220 + (scanIndex * 20), 0.05);
          if (scanIndex === logs.length - 1) {
             setScanning(false);
             institutionalAudio.playSuccess();
          }
       }, 300);
       return () => clearTimeout(timer);
    }
  }, [scanning, scanIndex, logs.length]);

  return (
    <div className="absolute inset-x-12 top-24 bottom-12 pointer-events-none z-20 overflow-hidden">
       {/* The Scanline */}
       <AnimatePresence>
          {scanning && (
            <motion.div 
               animate={{ top: `${(scanIndex / logs.length) * 100}%` }}
               transition={{ duration: 0.3 }}
               className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent shadow-[0_0_20px_#2563eb]"
            >
               <div className="absolute right-0 -top-6 bg-blue-600 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest text-white shadow-xl">
                  VALIDATING BLOCK {scanIndex}
               </div>
            </motion.div>
          )}
       </AnimatePresence>

       {/* Validation Indicators (Mocked over the logs) */}
       <div className="relative w-full h-full">
          {logs.map((log, i) => (
             <div 
               key={log?._id || log?.id || `${log?.timestamp || 'audit'}-${i}`} 
               className="absolute w-6 h-6 -left-12 flex items-center justify-center transition-all duration-500"
               style={{ top: `${(i / logs.length) * 100}%` }}
             >
                {i <= scanIndex && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500 shadow-emerald-500/20 shadow-xl">
                     <CheckCircle2 size={14} />
                  </motion.div>
                )}
             </div>
          ))}
       </div>
    </div>
  );
};

export default RecursiveAudit;
