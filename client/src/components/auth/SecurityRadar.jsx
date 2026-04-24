import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';

const SecurityRadar = ({ score, telemetry }) => {
  const data = [
    { subject: 'MFA Density', A: telemetry?.mfaActive ? 100 : 40, fullMark: 100 },
    { subject: 'Biometric Node', A: telemetry?.biometricActive ? 100 : 0, fullMark: 100 },
    { subject: 'Device Trust', A: telemetry?.deviceTrust === 'High' ? 100 : 60, fullMark: 100 },
    { subject: 'Audit Velocity', A: 85, fullMark: 100 },
    { subject: 'Session Health', A: 90, fullMark: 100 }
  ];

  return (
    <div className="w-full h-[300px] md:h-[400px] relative">
      <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#ffffff10" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#ffffff40', fontSize: 10, fontWeight: 'bold' }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false} 
          />
          <Radar
            name="Institutional Integrity"
            dataKey="A"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.4}
            animationBegin={500}
            animationDuration={2000}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Decorative HUD markers */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500/30" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500/30" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500/30" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500/30" />
    </div>
  );
};

export default SecurityRadar;
