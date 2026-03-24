import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Brain, ShieldCheck, Zap, ArrowRight, Network } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-hidden relative selection:bg-blue-500/30">
      {/* Background Gradients & Grids */}
      <div className="absolute inset-0 bg-[#020202] pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[150px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            <Brain size={20} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tight tracking-widest uppercase">VITAM <span className="text-blue-500">OS</span></span>
        </div>
        <div className="flex items-center gap-6">
           <a href="#architecture" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors hidden md:block">Architecture</a>
           <button 
             onClick={() => navigate('/login')}
             className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-widest border border-white/10 transition-all backdrop-blur-md"
           >
             Institutional Login
           </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-4 text-center mt-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-8 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <Sparkles size={14} /> Production Build v2.0 Live
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] mb-6">
            The Autonomous <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
              Campus Engine.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mb-12 leading-relaxed">
            VITAM OS is not a web portal. It is a highly advanced 13-node telemetry engine combining artificial intelligence, WebAuthn security, and real-time operational data into a single unified college infrastructure.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 group hover:scale-105"
            >
              Access Global Grid <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => document.getElementById('architecture').scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black text-sm transition-all border border-white/10 flex items-center justify-center gap-2"
            >
              <Network size={16} /> View Topology Matrix
            </button>
          </div>
        </motion.div>
      </main>

      {/* Feature Grid */}
      <section id="architecture" className="relative z-10 py-20 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <motion.div whileHover={{ y: -10 }} className="p-8 rounded-3xl bg-slate-900/50 border border-white/5 backdrop-blur-xl">
             <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-6">
               <ShieldCheck size={28} className="text-blue-400" />
             </div>
             <h3 className="text-xl font-black tracking-tight mb-3">Enterprise Security</h3>
             <p className="text-sm text-slate-400 leading-relaxed font-medium">Equipped with 3D Holographic Identity generation, WebAuthn Biometric handshakes, and strict multi-tenant JWT routing parameters.</p>
           </motion.div>
           
           <motion.div whileHover={{ y: -10 }} className="p-8 rounded-3xl bg-slate-900/50 border border-white/5 backdrop-blur-xl">
             <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-6">
               <Network size={28} className="text-purple-400" />
             </div>
             <h3 className="text-xl font-black tracking-tight mb-3">13-Node Architecture</h3>
             <p className="text-sm text-slate-400 leading-relaxed font-medium">A massive interconnected ecosystem mapping distinct operational access for Students, Faculty, Finance, Parents, Alumni, and the Executive Board.</p>
           </motion.div>

           <motion.div whileHover={{ y: -10 }} className="p-8 rounded-3xl bg-slate-900/50 border border-white/5 backdrop-blur-xl">
             <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6">
               <Zap size={28} className="text-emerald-400" />
             </div>
             <h3 className="text-xl font-black tracking-tight mb-3">Real-Time Telemetry</h3>
             <p className="text-sm text-slate-400 leading-relaxed font-medium">Autonomous Live Events engine, Framer Motion physical grid calendars, and Kanban execution boards running natively in the browser.</p>
           </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-20 py-10 text-center relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
          Deployable via Docker, AWS, and Vercel. Engineered for the VITAM Board of Directors.
        </p>
      </footer>
    </div>
  );
}
