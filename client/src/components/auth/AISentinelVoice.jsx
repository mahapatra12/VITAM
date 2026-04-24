import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Activity } from 'lucide-react';
import { institutionalAudio } from '../../utils/InstitutionalAudio';

const AISentinelVoice = ({ recommendation, autoSpeak = false }) => {
  const [speaking, setSpeaking] = useState(false);
  const [available, setAvailable] = useState(false);

  const speak = useCallback((text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const synthesis = window.speechSynthesis;
    if (synthesis.speaking) {
      synthesis.cancel();
      setSpeaking(false);
      return;
    }

    const message = text || recommendation || "Institutional integrity optimal. Sovereign link established.";
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.85;
    utterance.pitch = 0.7;
    utterance.volume = 0.8;

    const voices = synthesis.getVoices();
    // Prioritize institutional sounding voices
    const priorityVoice = voices.find(v =>
      v.name.includes('Google UK English Male') ||
      v.name.includes('Arthur') ||
      v.name.includes('Daniel') ||
      v.name.includes('Samantha')
    );
    if (priorityVoice) utterance.voice = priorityVoice;

    utterance.onstart = () => {
      setSpeaking(true);
      institutionalAudio.playPulse(0.1);
    };
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    synthesis.speak(utterance);
  }, [recommendation]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setAvailable(true);
      if (autoSpeak) {
        const timer = setTimeout(() => speak(), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [autoSpeak, speak]);

  return (
    <div className="flex flex-col gap-4">
      <button 
        type="button"
        onClick={() => speak()}
        disabled={!available}
        className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-500 overflow-hidden relative group ${
          speaking 
          ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_30px_#2563eb40]' 
          : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/5'
        }`}
      >
        <div className="relative">
          {speaking ? <Activity size={16} className="animate-pulse" /> : available ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono italic">
          {speaking ? 'Broadcasting Directive' : available ? 'Awaiting Verbal Link' : 'Voice Unavailable'}
        </span>
        
        {speaking && (
           <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/20 animate-[loading_2s_infinite]">
              <motion.div animate={{ scaleX: [0, 1, 0] }} className="h-full bg-white origin-left" />
           </div>
        )}
      </button>

      {speaking && (
        <div className="flex gap-1 justify-center opacity-40">
           {[...Array(5)].map((_, i) => (
             <div key={i} className="w-1 h-3 bg-blue-500 animate-[bounce_0.5s_infinite]" style={{ animationDelay: `${i*0.1}s` }} />
           ))}
        </div>
      )}
    </div>
  );
};

export default AISentinelVoice;
