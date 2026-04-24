import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, Zap, Cpu, ShieldCheck } from 'lucide-react';

const SynapticMonitor = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const time = new Date().toLocaleTimeString([], { hour12: false });
      const latency = Math.floor(Math.random() * 20) + 10;
      const drift = (Math.random() * 0.5).toFixed(2);
      const pressure = Math.floor(Math.random() * 40) + 20;
      
      setData(prev => {
        const next = [...prev, { time, latency, drift: parseFloat(drift), pressure }];
        if (next.length > 20) return next.slice(1);
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#050505]/60 backdrop-blur-3xl border border-white/5 rounded-[50px] p-10 h-full relative overflow-hidden group shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <Activity size={180} className="text-blue-500" />
      </div>

      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
            <Activity size={24} className="animate-pulse" />
          </div>
          <div>
             <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Synaptic Drift Telemetry</h3>
             <p className="text-[9px] font-black text-blue-500/40 uppercase tracking-widest mt-1 italic">Neural Synchronization: Continuous</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {['CPU', 'MEM', 'NET'].map(stat => (
             <div key={stat} className="flex flex-col items-end">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">{stat}</span>
                <span className="text-[10px] font-black text-white uppercase italic leading-none">{(Math.random() * 30 + 10).toFixed(1)}%</span>
             </div>
           ))}
        </div>
      </div>

      <div className="h-64 mt-10 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide domain={[0, 100]} />
            <Tooltip 
               contentStyle={{ backgroundColor: 'rgba(5, 5, 5, 0.9)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '1rem', fontSize: '10px', color: '#fff', fontWeight: 'bold' }} 
               itemStyle={{ color: '#2563eb', padding: '0 4px' }}
            />
            <Area type="monotone" dataKey="latency" stroke="#2563eb" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={2} isAnimationActive={false} />
            <Area type="monotone" dataKey="pressure" stroke="#10b981" fillOpacity={0} strokeWidth={1} strokeDasharray="3 3" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-10 grid grid-cols-3 gap-6 relative z-10">
         <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-2 leading-none">Latency</span>
            <div className="flex items-baseline gap-2">
               <span className="text-3xl font-black text-white leading-none tabular-nums tracking-tighter italic">{data[data.length-1]?.latency || 0}</span>
               <span className="text-[9px] font-black text-blue-500 uppercase italic">ms</span>
            </div>
         </div>
         <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-2 leading-none">Synaptic Drift</span>
            <div className="flex items-baseline gap-2">
               <span className="text-3xl font-black text-white leading-none tabular-nums tracking-tighter italic">{data[data.length-1]?.drift || 0}</span>
               <span className="text-[9px] font-black text-emerald-500 uppercase italic">δ</span>
            </div>
         </div>
         <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-2 leading-none">Pressure</span>
            <div className="flex items-baseline gap-2">
               <span className="text-3xl font-black text-slate-700 leading-none tabular-nums tracking-tighter italic">{data[data.length-1]?.pressure || 0}</span>
               <span className="text-[9px] font-black text-white/10 uppercase italic">%</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SynapticMonitor;
