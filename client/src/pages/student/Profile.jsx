import { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, ShieldCheck, Download, Mail, Phone, MapPin, Briefcase, Sparkles, User } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import AIChat from '../../components/AIChat';

export default function StudentProfile() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert('Digital ID Card Vector downloaded successfully.');
    }, 1500);
  };

  return (
    <DashboardLayout title="Digital Identity Vault" role="STUDENT">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight">Student Identity Vector</h2>
        <p className="text-slate-400 font-medium mt-1">NFC-ready digital ID and secure profile parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
        
        {/* Interactive 3D ID Card */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <motion.div 
            whileHover={{ rotateY: 10, rotateX: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-full aspect-[1/1.5] rounded-[2rem] bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between group cursor-pointer perspective-1000"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Holographic overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/5 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            {/* Header */}
            <div className="flex justify-between items-start relative z-10 text-white translate-z-10">
              <div>
                <h3 className="text-xl font-black tracking-widest text-slate-200">VITAM</h3>
                <p className="text-[8px] uppercase tracking-[0.3em] text-slate-500 font-bold">Autonomous Inst.</p>
              </div>
              <ShieldCheck size={28} className="text-blue-500" />
            </div>

            {/* Photo & ID */}
            <div className="flex flex-col items-center relative z-10 translate-z-20">
              <div className="w-28 h-28 rounded-full border-4 border-slate-800 bg-slate-900 shadow-[0_0_30px_rgba(59,130,246,0.2)] mb-4 overflow-hidden flex items-center justify-center">
                 <User size={48} className="text-slate-600" />
                 {/* Imagine an img tag here */}
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Aman Singh</h2>
              <p className="text-xs text-blue-400 font-mono mt-1 font-bold">22B81A0512</p>
              <div className="mt-3 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">B.Tech · CSE (AI/ML)</p>
              </div>
            </div>

            {/* Footer QR */}
            <div className="flex justify-between items-end relative z-10 translate-z-10">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Valid Till</p>
                <p className="text-sm text-slate-300 font-mono font-bold">MAY 2026</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-lg p-1">
                <QrCode className="w-full h-full text-slate-900" />
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <button 
            onClick={handleDownload} disabled={downloading}
            className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-sm hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {downloading ? (
              <span className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> Generating Encrypted PDF...</span>
            ) : (
              <span className="flex items-center gap-2"><Download size={18} /> Download Digital ID Vault</span>
            )}
          </button>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GlassCard title="Cryptographic Identity Profile" subtitle="Institute verified personal vectors" icon={ShieldCheck}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-800/40 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Institutional Email</p>
                    <p className="text-sm font-bold text-white mt-0.5">student@vitam.edu.in</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-800/40 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Secure Contact</p>
                    <p className="text-sm font-mono text-white mt-0.5">+91 98765 43210</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-800/40 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                    <Briefcase size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Placement Status</p>
                    <p className="text-sm font-bold text-emerald-400 mt-0.5">Cleared Level 1 (TCS)</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-800/40 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Hostel / Logistics</p>
                    <p className="text-sm font-bold text-white mt-0.5">Block B, Room 402</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard title="System Permissions" subtitle="Current role authorization matrix">
             <div className="mt-4 flex flex-wrap gap-2">
                {['Library Access: Active', 'Lab Equipment: Level 2', 'WiFi Registry: Connected', 'Exam Hall Ticket: Cleared', 'Transport API: Paused'].map(perm => (
                  <span key={perm} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-[10px] font-black tracking-wider uppercase text-slate-300">
                    {perm}
                  </span>
                ))}
             </div>
          </GlassCard>
        </div>
      </div>
      
      <AIChat role="student" />
    </DashboardLayout>
  );
}
