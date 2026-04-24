import { useState } from 'react';
import {
  Briefcase,
  Download,
  Mail,
  MapPin,
  Phone,
  QrCode,
  ShieldCheck,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import AIChat from '../../components/AIChat';
import { useToast } from '../../components/ui/ToastSystem';

const STUDENT_PERMISSIONS = [
  'Library access active',
  'Lab equipment level 2',
  'Wi-Fi registry connected',
  'Exam hall status cleared',
  'Transport sync paused'
];

export default function StudentProfile() {
  const { push } = useToast();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      push({
        type: 'success',
        title: 'Digital ID Ready',
        body: 'Your digital identity vault export has been generated successfully.'
      });
    }, 1500);
  };

  return (
    <DashboardLayout title="Digital Identity Vault" role="STUDENT">
      <WorkspaceHero
        eyebrow="Student identity"
        title="Digital identity vault"
        description="Present your student identity, verified details, and digital campus access from a cleaner card-style workspace that feels modern and easier to use."
        icon={ShieldCheck}
        badges={[
          'NFC-ready profile',
          'Identity verified',
          'Placement signal active'
        ]}
        actions={[
          {
            label: downloading ? 'Generating...' : 'Download Digital ID',
            icon: Download,
            tone: 'primary',
            disabled: downloading,
            onClick: handleDownload
          }
        ]}
        stats={[
          { label: 'Student ID', value: '22B81A0512' },
          { label: 'Program', value: 'B.Tech CSE (AI/ML)' },
          { label: 'Status', value: 'Verified' },
          { label: 'Valid through', value: 'May 2026' }
        ]}
        aside={(
          <div className="glass-panel h-full p-6 md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
                  Smart ID card
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  Campus-ready profile card
                </h3>
              </div>
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-200">
                <QrCode size={18} />
              </div>
            </div>

            <motion.div
              whileHover={{ y: -3 }}
              className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-5 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xl font-black tracking-widest text-slate-200">
                    VITAM
                  </p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.28em] text-slate-500">
                    Autonomous Institute
                  </p>
                </div>
                <ShieldCheck size={24} className="text-blue-300" />
              </div>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-500">
                  <User size={34} />
                </div>
                <div>
                  <p className="text-lg font-black text-white">
                    Aman Singh
                  </p>
                  <p className="mt-1 text-sm font-bold text-blue-300">
                    22B81A0512
                  </p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    B.Tech CSE (AI/ML)
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-end justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    Valid till
                  </p>
                  <p className="mt-1 text-sm font-black text-white">
                    MAY 2026
                  </p>
                </div>
                <div className="rounded-xl bg-white p-2">
                  <QrCode className="h-10 w-10 text-slate-900" />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      />

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard title="Identity Profile" subtitle="Verified student vectors" icon={ShieldCheck}>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              { label: 'Institutional Email', value: 'student@vitam.edu.in', icon: Mail },
              { label: 'Secure Contact', value: '+91 98765 43210', icon: Phone },
              { label: 'Placement Status', value: 'Cleared Level 1 (TCS)', icon: Briefcase },
              { label: 'Hostel / Logistics', value: 'Block B, Room 402', icon: MapPin }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="surface-card p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 text-blue-200">
                      <Icon size={16} />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-sm font-black text-white">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard title="System Permissions" subtitle="Current authorization matrix">
          <div className="mt-4 flex flex-wrap gap-3">
            {STUDENT_PERMISSIONS.map((permission) => (
              <span key={permission} className="status-pill">
                {permission}
              </span>
            ))}
          </div>
        </GlassCard>
      </div>

      <AIChat role="student" />
    </DashboardLayout>
  );
}
