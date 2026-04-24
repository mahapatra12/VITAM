import { useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Globe,
  KeyRound,
  Mail,
  Monitor,
  Moon,
  Palette,
  Phone,
  Save,
  Settings as SettingsIcon,
  Shield,
  Smartphone,
  Sun,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../components/ui/ToastSystem';
import { safeLocalStorage } from '../../utils/browserStorage';

const ACCENT_COLORS = [
  { name: 'Blue', value: '#3b82f6', className: 'bg-blue-500' },
  { name: 'Indigo', value: '#6366f1', className: 'bg-indigo-500' },
  { name: 'Rose', value: '#f43f5e', className: 'bg-rose-500' },
  { name: 'Emerald', value: '#10b981', className: 'bg-emerald-500' },
  { name: 'Amber', value: '#f59e0b', className: 'bg-amber-500' }
];

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Alerts', icon: Bell },
  { id: 'api', label: 'Sync Keys', icon: KeyRound }
];

function Toggle({ value, onChange, color = 'bg-blue-600' }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all ${value ? color : 'bg-slate-800'}`}
    >
      <motion.span
        animate={{ x: value ? 24 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="h-4 w-4 rounded-full bg-white shadow-md"
      />
    </button>
  );
}

function SettingRow({ icon: Icon, title, subtitle, children, iconTone = 'text-blue-200 bg-blue-500/10 border-blue-500/20' }) {
  return (
    <div className="surface-card flex items-center justify-between gap-5 p-5">
      <div className="flex min-w-0 items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${iconTone}`}>
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-black text-white">
            {title}
          </h4>
          {subtitle ? (
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      <div className="shrink-0">
        {children}
      </div>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const [accentColor, setAccentColor] = useState(() => safeLocalStorage.getItem('vitam-accent') || '#3b82f6');
  const [fontSize, setFontSize] = useState(() => safeLocalStorage.getItem('vitam-fontsize') || 'normal');
  const [reduceMotion, setReduceMotion] = useState(() => safeLocalStorage.getItem('vitam-reducemotion') === 'true');

  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);

  const [twoFactor, setTwoFactor] = useState(true);
  const [biometrics, setBiometrics] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  const [profileName, setProfileName] = useState(user?.name || 'Institutional Identity');
  const [profilePhone, setProfilePhone] = useState('+91 98765 43210');
  const [profileCity, setProfileCity] = useState('VITAM Campus');

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor);
    safeLocalStorage.setItem('vitam-accent', accentColor);
    safeLocalStorage.setItem('vitam-fontsize', fontSize);
    document.documentElement.style.fontSize = fontSize === 'large' ? '18px' : fontSize === 'small' ? '14px' : '16px';
    safeLocalStorage.setItem('vitam-reducemotion', String(reduceMotion));
  }, [accentColor, fontSize, reduceMotion]);

  const handleSave = () => {
    setSaved(true);
    push({
      type: 'success',
      title: 'Settings Saved',
      body: 'Your experience preferences and control settings were synchronized successfully.'
    });
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <DashboardLayout title="Institutional Settings" role={user?.role || 'USER'}>
      <WorkspaceHero
        eyebrow="Settings workspace"
        title="Personalize the platform around your work"
        description="Control appearance, security preferences, alerts, and account presentation from one place without losing the calm premium feel of the app."
        icon={SettingsIcon}
        badges={[
          theme === 'dark' ? 'Dark mode active' : theme === 'light' ? 'Light mode active' : 'System theme sync',
          twoFactor ? '2FA preferred' : '2FA relaxed',
          reduceMotion ? 'Reduced motion' : 'Full motion'
        ]}
        actions={[
          {
            label: saved ? 'Saved' : 'Save Preferences',
            icon: saved ? CheckCircle2 : Save,
            tone: 'primary',
            onClick: handleSave
          }
        ]}
        stats={[
          { label: 'User', value: user?.name || 'Institutional Identity' },
          { label: 'Email', value: user?.email || 'identity@vitam.internal' },
          { label: 'Theme', value: theme },
          { label: 'Session timeout', value: `${sessionTimeout} min` }
        ]}
        aside={(
          <div className="glass-panel h-full p-6 md:p-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
              Personal experience state
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Settings tuned for clarity
            </h3>
            <div className="mt-6 space-y-3">
              {[
                { label: 'Notifications', value: notifPush ? 'Live' : 'Muted' },
                { label: 'Biometrics', value: biometrics ? 'Preferred' : 'Off' },
                { label: 'Accent', value: ACCENT_COLORS.find((color) => color.value === accentColor)?.name || 'Custom' }
              ].map((item) => (
                <div key={item.label} className="surface-card flex items-center justify-between p-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                    {item.label}
                  </span>
                  <span className="text-sm font-black text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      />

      <div className="mb-8 flex flex-wrap gap-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`${active ? 'status-pill border-blue-500/25 bg-blue-500/10 text-blue-200' : 'status-pill'} transition-all`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'profile' ? (
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <GlassCard title="Profile Preferences" subtitle="Personal details shown across the product">
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                { label: 'Display Name', value: profileName, onChange: setProfileName, icon: User },
                { label: 'Official Email', value: user?.email || 'identity@vitam.internal', onChange: () => {}, icon: Mail, readOnly: true },
                { label: 'Phone', value: profilePhone, onChange: setProfilePhone, icon: Phone },
                { label: 'Campus / City', value: profileCity, onChange: setProfileCity, icon: Globe }
              ].map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.label} className="surface-card p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 text-blue-200">
                        <Icon size={16} />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
                        {field.label}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                      readOnly={field.readOnly}
                      className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition-all ${
                        field.readOnly
                          ? 'cursor-not-allowed border-white/5 bg-white/[0.03] text-slate-400'
                          : 'border-white/10 bg-slate-950/70 text-white focus:border-blue-500/40'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard title="Identity Actions" subtitle="Quick account-side controls">
            <div className="mt-4 space-y-4">
              <button
                type="button"
                onClick={() => push({ type: 'warning', title: 'Account Removal', body: 'Contact the institutional administrator to decommission this identity.' })}
                className="btn-secondary w-full justify-center border-red-500/20 bg-red-500/5 text-red-300 hover:border-red-500/30 hover:bg-red-500/10"
              >
                Decommission Identity
              </button>
              <button
                type="button"
                onClick={() => push({ type: 'info', title: 'Session Reset', body: 'A request to refresh your active sessions has been prepared.' })}
                className="btn-secondary w-full justify-center"
              >
                Refresh Active Sessions
              </button>
            </div>
          </GlassCard>
        </div>
      ) : null}

      {activeTab === 'security' ? (
        <div className="grid gap-8 lg:grid-cols-2">
          <GlassCard title="Authentication Controls" subtitle="Choose how you sign in">
            <div className="mt-4 space-y-4">
              <SettingRow icon={Smartphone} title="Multi-factor authentication" subtitle="Authenticator or secondary verification" iconTone="text-blue-200 bg-blue-500/10 border-blue-500/20">
                <Toggle value={twoFactor} onChange={setTwoFactor} />
              </SettingRow>
              <SettingRow icon={Shield} title="Biometric preference" subtitle="Passkey, biometric, or WebAuthn compatible flows" iconTone="text-indigo-200 bg-indigo-500/10 border-indigo-500/20">
                <Toggle value={biometrics} onChange={setBiometrics} color="bg-indigo-600" />
              </SettingRow>
            </div>
          </GlassCard>

          <GlassCard title="Session Policies" subtitle="Comfort and security balance">
            <div className="mt-4 space-y-4">
              <SettingRow icon={Monitor} title="Session timeout" subtitle="Automatic sign-out interval" iconTone="text-emerald-200 bg-emerald-500/10 border-emerald-500/20">
                <select
                  value={sessionTimeout}
                  onChange={(event) => setSessionTimeout(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-white outline-none"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="60">60 min</option>
                </select>
              </SettingRow>
            </div>
          </GlassCard>
        </div>
      ) : null}

      {activeTab === 'appearance' ? (
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <GlassCard title="Theme Modes" subtitle="Choose how the interface feels">
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[
                { id: 'dark', label: 'Dark', icon: Moon, preview: 'bg-slate-950' },
                { id: 'light', label: 'Light', icon: Sun, preview: 'bg-white' },
                { id: 'system', label: 'System', icon: Monitor, preview: 'bg-gradient-to-br from-slate-950 via-slate-500 to-white' }
              ].map((option) => {
                const Icon = option.icon;
                const active = theme === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setTheme(option.id)}
                    className={`surface-card flex flex-col items-center gap-4 p-6 transition-all ${active ? 'border-blue-500/30 bg-blue-500/10' : ''}`}
                  >
                    <div className={`h-14 w-14 rounded-3xl border border-white/10 ${option.preview}`} />
                    <div className="flex items-center gap-2 text-white">
                      <Icon size={16} className={active ? 'text-blue-200' : 'text-slate-400'} />
                      <span className="text-sm font-black">{option.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard title="Accent and Motion" subtitle="Fine-tune visual energy">
            <div className="mt-4 space-y-5">
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
                  Accent Color
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setAccentColor(color.value)}
                      className={`h-12 w-12 rounded-3xl border-4 transition-all ${color.className} ${accentColor === color.value ? 'scale-110 border-white shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                      aria-label={color.name}
                    />
                  ))}
                </div>
              </div>

              <SettingRow icon={Monitor} title="Font scale" subtitle="Comfortable reading size" iconTone="text-blue-200 bg-blue-500/10 border-blue-500/20">
                <select
                  value={fontSize}
                  onChange={(event) => setFontSize(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-white outline-none"
                >
                  <option value="small">Small</option>
                  <option value="normal">Normal</option>
                  <option value="large">Large</option>
                </select>
              </SettingRow>

              <SettingRow icon={Monitor} title="Reduce motion" subtitle="Calmer transitions and softer animation" iconTone="text-amber-200 bg-amber-500/10 border-amber-500/20">
                <Toggle value={reduceMotion} onChange={setReduceMotion} color="bg-amber-500" />
              </SettingRow>
            </div>
          </GlassCard>
        </div>
      ) : null}

      {activeTab === 'notifications' ? (
        <div className="grid gap-8 lg:grid-cols-2">
          <GlassCard title="Alert Channels" subtitle="Choose how updates reach you">
            <div className="mt-4 space-y-4">
              <SettingRow icon={Bell} title="In-app alerts" subtitle="Show live toast and panel notifications" iconTone="text-indigo-200 bg-indigo-500/10 border-indigo-500/20">
                <Toggle value={notifPush} onChange={setNotifPush} color="bg-indigo-600" />
              </SettingRow>
              <SettingRow icon={Mail} title="Email digest" subtitle="Daily summary of important updates" iconTone="text-blue-200 bg-blue-500/10 border-blue-500/20">
                <Toggle value={notifEmail} onChange={setNotifEmail} />
              </SettingRow>
              <SettingRow icon={Phone} title="SMS escalation" subtitle="Critical notices only" iconTone="text-emerald-200 bg-emerald-500/10 border-emerald-500/20">
                <Toggle value={notifSMS} onChange={setNotifSMS} color="bg-emerald-600" />
              </SettingRow>
            </div>
          </GlassCard>
        </div>
      ) : null}

      {activeTab === 'api' ? (
        <GlassCard title="Integration Keys" subtitle="Connected production nodes">
          <div className="mt-4 space-y-4">
            {[
              { name: 'Core Production Node', key: 'sk_live_vtm_sync_2291x8f7a...0...', status: 'Operational' },
              { name: 'Intelligence Webhook', key: 'wh_vtm_analytics_8a7b6c5d4...', status: 'Operational' }
            ].map((item) => (
              <div key={item.name} className="surface-card p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white">
                      {item.name}
                    </h4>
                    <p className="mt-2 text-xs font-mono text-slate-400">
                      {item.key}
                    </p>
                  </div>
                  <span className="status-pill border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      ) : null}
    </DashboardLayout>
  );
}
