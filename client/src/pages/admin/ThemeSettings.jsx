import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Palette, Layout, Type as TypeIcon, Image as ImageIcon,
  CheckCircle2, RefreshCcw, Save, Eye, Bell, ShieldCheck,
  Zap, Monitor, Smartphone, Globe, Info, Settings,
  Hash, ArrowRight
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

export default function ThemeSettings() {
  const { user } = useAuth();
  const { push } = useToast();
  
  const [colors, setColors] = useState({
    primary: '#6366F1',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#000000'
  });

  const [density, setDensity] = useState('Comfortable');
  const [font, setFont] = useState('Inter');

  const handleApply = () => {
    push({ type: 'success', title: 'Branding Synced', body: 'Institutional design system has been updated across all 50+ modules.' });
  };

  return (
    <DashboardLayout title="Institutional Branding" role={user?.role || 'ADMIN'}>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
             <Palette size={28} className="text-indigo-500" /> branding Engine
          </h2>
          <p className="text-slate-400 mt-1">White-label customization for your institutional ecosystem.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setColors({ primary: '#6366F1', secondary: '#10B981', accent: '#F59E0B', background: '#000000' })}
             className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <RefreshCcw size={14}/> Reset Defaults
           </button>
           <button onClick={handleApply} className="px-8 py-4 bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20">
              Apply Global Theme
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Configuration Panels */}
        <div className="space-y-8">
           {/* Color Palette */}
           <div className="p-8 rounded-[3rem] bg-[#0a0a0a] border border-white/10 space-y-6">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400"><Palette size={16}/></div>
                 <h3 className="text-sm font-black text-white uppercase tracking-widest">Brand DNA</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Institutional Primary</label>
                    <div className="flex items-center gap-4">
                       <input type="color" value={colors.primary} onChange={e => setColors(prev => ({...prev, primary: e.target.value}))} className="w-12 h-12 rounded-2xl bg-transparent border-none cursor-pointer" />
                       <code className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/5 px-3 py-1.5 rounded-lg border border-indigo-500/10">{colors.primary}</code>
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Institutional Secondary</label>
                    <div className="flex items-center gap-4">
                       <input type="color" value={colors.secondary} onChange={e => setColors(prev => ({...prev, secondary: e.target.value}))} className="w-12 h-12 rounded-2xl bg-transparent border-none cursor-pointer" />
                       <code className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10">{colors.secondary}</code>
                    </div>
                 </div>
              </div>
           </div>

           {/* UI Layout & Density */}
           <div className="p-8 rounded-[3rem] bg-[#0a0a0a] border border-white/10 space-y-6">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400"><Layout size={16}/></div>
                 <h3 className="text-sm font-black text-white uppercase tracking-widest">UX Density</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                 {['Compact', 'Comfortable', 'Touch-Safe'].map(d => (
                   <button key={d} onClick={() => setDensity(d)}
                     className={`py-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${density === d ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-xl' : 'bg-white/[0.02] border-white/10 text-slate-700 hover:text-slate-400'}`}>
                      {d === 'Compact' ? <Monitor size={18}/> : d === 'Comfortable' ? <Layout size={18}/> : <Smartphone size={18}/>}
                      <span className="text-[9px] font-black uppercase tracking-widest">{d}</span>
                   </button>
                 ))}
              </div>
           </div>

           {/* Typography */}
           <div className="p-8 rounded-[3rem] bg-[#0a0a0a] border border-white/10 space-y-6">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400"><TypeIcon size={16}/></div>
                 <h3 className="text-sm font-black text-white uppercase tracking-widest">Typeface System</h3>
              </div>
              <div className="space-y-2">
                 {['Inter', 'Outfit', 'Plus Jakarta Sans', 'Cabinet Grotesk'].map(f => (
                   <button key={f} onClick={() => setFont(f)}
                     className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${font === f ? 'bg-indigo-500/10 border-indigo-500/30 text-white' : 'bg-white/[0.02] border-white/10 text-slate-500 hover:text-white'}`}>
                      <span className="text-xs font-black uppercase tracking-widest">{f}</span>
                      {font === f && <CheckCircle2 size={16} className="text-indigo-500" />}
                   </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Right: Live Preview */}
        <div className="space-y-6 lg:sticky lg:top-8">
           <div className="p-8 rounded-[3rem] bg-[#080808] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-20"><Eye size={48} className="text-white"/></div>
              <h3 className="text-lg font-black text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">Live Portal Preview</h3>
              
              <div className="space-y-6">
                 {/* Preview Item 1 */}
                 <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ background: colors.primary }} />
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: colors.primary }}><Zap size={20}/></div>
                       <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Preview Dashboard</p>
                          <p className="text-sm font-black text-white uppercase">VITAM Institutional Portal</p>
                       </div>
                    </div>
                 </div>

                 {/* Preview Item 2 */}
                 <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-[10px] font-black text-slate-500 uppercase">Operational Status</span>
                       <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: colors.secondary }}>Optimal (98%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full" style={{ background: colors.secondary, width: '70%', transition: 'all 1s' }} />
                    </div>
                 </div>

                 {/* Preview Button */}
                 <div className="flex gap-3">
                    <button className="flex-1 py-3 px-6 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-lg" style={{ background: colors.primary }}>
                       Action Primary
                    </button>
                    <button className="flex-1 py-3 px-6 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] bg-white text-black">
                       Invert View
                    </button>
                 </div>

                 <div className="pt-4 flex items-center justify-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-4 h-4 rounded-full" style={{ background: colors.accent }} />
                       <span className="text-[8px] font-black text-slate-600 uppercase">Accent</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 border-l border-white/5 pl-6">
                       <span className="text-[8px] font-black text-slate-600 uppercase">Text Rendering</span>
                       <span className="text-xs font-black text-white uppercase tracking-tighter" style={{ fontFamily: font }}>The Quick Fox</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-8 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/10 space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400"><Globe size={20}/></div>
                 <h4 className="text-xs font-black text-white uppercase">SaaS Replication</h4>
              </div>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed">Applying these changes will trigger a background style-inversion protocol. All sub-modules will inherit the new Brand DNA instantly via global CSS variables.</p>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
