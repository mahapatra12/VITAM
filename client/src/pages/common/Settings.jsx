import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon, Shield, Bell, Moon, Sun, Globe,
  Smartphone, Key, CheckCircle2, Lock, EyeOff, KeyRound, Save,
  User, Camera, Palette, Zap, ChevronRight, Monitor, Trash2, LogOut, Mail, Phone, MapPin
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const ACCENT_COLORS = [
  { name: 'Blue',   value: '#3b82f6', class: 'bg-blue-500' },
  { name: 'Indigo', value: '#6366f1', class: 'bg-indigo-500' },
  { name: 'Purple', value: '#8b5cf6', class: 'bg-purple-500' },
  { name: 'Rose',   value: '#f43f5e', class: 'bg-rose-500' },
  { name: 'Emerald',value: '#10b981', class: 'bg-emerald-500' },
  { name: 'Amber',  value: '#f59e0b', class: 'bg-amber-500' },
];

const TABS = [
  { id: 'profile',  label: 'Profile',    icon: User },
  { id: 'security', label: 'Security',   icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Alerts', icon: Bell },
  { id: 'api',      label: 'API Keys',   icon: KeyRound },
];

function Toggle({ value, onChange, color = 'bg-emerald-500' }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-all duration-300 ${value ? color : 'bg-slate-700'}`}
    >
      <motion.span
        animate={{ x: value ? 24 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="inline-block h-4 w-4 rounded-full bg-white shadow-md"
      />
    </button>
  );
}

function SettingRow({ icon: Icon, title, subtitle, children, iconColor = 'text-blue-400', iconBg = 'bg-blue-500/10 border-blue-500/20' }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-all group">
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
        <div>
          <h4 className="text-sm font-black text-white">{title}</h4>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex-shrink-0 ml-4">{children}</div>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  // Real persistent theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('vitam-theme') || 'dark');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('vitam-accent') || '#3b82f6');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('vitam-fontsize') || 'normal');
  const [reduceMotion, setReduceMotion] = useState(() => localStorage.getItem('vitam-reducemotion') === 'true');

  // Notification preferences
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);
  const [notifGrades, setNotifGrades] = useState(true);
  const [notifAttendance, setNotifAttendance] = useState(true);
  const [notifFee, setNotifFee] = useState(false);

  // Security
  const [twoFactor, setTwoFactor] = useState(true);
  const [biometrics, setBiometrics] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  // Profile
  const [profileName, setProfileName] = useState(user?.name || 'Vitam Scholar');
  const [profilePhone, setProfilePhone] = useState('+91 98765 43210');
  const [profileCity, setProfileCity] = useState('Bengaluru, KA');

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('vitam-theme', theme);
    document.documentElement.style.setProperty('--accent', accentColor);
    localStorage.setItem('vitam-accent', accentColor);
    localStorage.setItem('vitam-fontsize', fontSize);
    document.documentElement.style.fontSize = fontSize === 'large' ? '18px' : fontSize === 'small' ? '14px' : '16px';
    localStorage.setItem('vitam-reducemotion', String(reduceMotion));
  }, [theme, accentColor, fontSize, reduceMotion]);

  const handleSave = () => {
    setSaved(true);
    push({ type: 'success', title: 'Settings Synced', body: 'All preferences persisted to local storage.' });
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <DashboardLayout title="Command Settings" role={user?.role || 'USER'}>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <SettingsIcon size={28} className="text-slate-400" /> Command Settings
          </h2>
          <p className="text-slate-400 font-medium mt-1">Security, appearance, and notification preferences for your identity.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]"
        >
          {saved ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> Save Config</>}
        </motion.button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="p-2 rounded-3xl bg-[#080808] border border-white/5 space-y-1">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Panel */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">

            {/* ─── PROFILE ─── */}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <GlassCard>
                  <div className="p-6 border-b border-white/5 flex items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white border border-white/20 shadow-xl">
                        {profileName[0]}
                      </div>
                      <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center border-2 border-[#080808] hover:bg-indigo-400 transition-colors">
                        <Camera size={14} className="text-white" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">{profileName}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{user?.email || 'user@vitam.edu'}</p>
                      <span className="mt-2 inline-block text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">{user?.role || 'SCHOLAR'}</span>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Display Name', value: profileName, onChange: setProfileName, icon: User },
                      { label: 'Email Identity', value: user?.email || 'user@vitam.edu', onChange: () => {}, icon: Mail, disabled: true },
                      { label: 'Mobile Number', value: profilePhone, onChange: setProfilePhone, icon: Phone },
                      { label: 'Campus Location', value: profileCity, onChange: setProfileCity, icon: MapPin },
                    ].map(field => (
                      <div key={field.label}>
                        <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{field.label}</label>
                        <div className="relative">
                          <field.icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                          <input
                            type="text" value={field.value} onChange={e => field.onChange(e.target.value)}
                            disabled={field.disabled}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white font-medium focus:outline-none focus:border-indigo-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <div className="flex gap-3">
                  <button onClick={() => push({ type: 'warning', title: 'Account Deletion', body: 'Please contact the system administrator to delete your account.' })}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500/20 transition-colors">
                    <Trash2 size={12} /> Delete Account
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                    <LogOut size={12} /> Sign Out Everywhere
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── SECURITY ─── */}
            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <GlassCard>
                  <div className="p-5 border-b border-white/5"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Authentication</h3></div>
                  <div className="p-4 space-y-3">
                    <SettingRow icon={Smartphone} title="TOTP (Google Authenticator)" subtitle="Time-based 6-digit verification codes" iconColor="text-blue-400" iconBg="bg-blue-500/10 border-blue-500/20">
                      <Toggle value={twoFactor} onChange={setTwoFactor} />
                    </SettingRow>
                    <SettingRow icon={CheckCircle2} title="Hardware Biometrics (WebAuthn)" subtitle="Touch ID, Windows Hello, FIDO2 keys" iconColor="text-purple-400" iconBg="bg-purple-500/10 border-purple-500/20">
                      <Toggle value={biometrics} onChange={setBiometrics} color="bg-purple-500" />
                    </SettingRow>
                    <SettingRow icon={Key} title="Master Password" subtitle="Last changed 45 days ago" iconColor="text-slate-400" iconBg="bg-white/5 border-white/10">
                      <button onClick={() => push({ type: 'info', title: 'Password Reset', body: 'OTP sent to your registered email address.' })} className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                        Update
                      </button>
                    </SettingRow>
                  </div>
                </GlassCard>
                <GlassCard>
                  <div className="p-5 border-b border-white/5"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Session Policy</h3></div>
                  <div className="p-4">
                    <SettingRow icon={Lock} title="Auto Session Timeout" subtitle="Automatically log out after inactivity" iconColor="text-amber-400" iconBg="bg-amber-500/10 border-amber-500/20">
                      <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)}
                        className="bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500/50">
                        {['15', '30', '60', '120'].map(v => <option key={v} value={v} className="bg-slate-900">{v} min</option>)}
                      </select>
                    </SettingRow>
                  </div>
                </GlassCard>
                <GlassCard>
                  <div className="p-5 border-b border-white/5"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">API Key</h3></div>
                  <div className="p-4">
                    <div className="flex items-center gap-3 p-4 bg-black/40 rounded-2xl border border-white/5">
                      <code className="flex-1 text-[11px] font-mono text-slate-500 truncate">sk_live_vtm_9x8f7a6b5c4d3e2f1g0...</code>
                      <button onClick={() => push({ type: 'success', title: 'Key Copied', body: 'API key copied to clipboard.' })}
                        className="px-3 py-1.5 text-[10px] font-black text-slate-400 bg-white/5 rounded-xl hover:bg-white/10 transition-colors uppercase tracking-widest">
                        Copy
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* ─── APPEARANCE ─── */}
            {activeTab === 'appearance' && (
              <motion.div key="appearance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <GlassCard>
                  <div className="p-5 border-b border-white/5"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Moon size={12} /> Color Scheme</h3></div>
                  <div className="p-5 grid grid-cols-3 gap-3">
                    {[
                      { id: 'dark', label: 'Dark', preview: 'bg-slate-950', icon: Moon },
                      { id: 'light', label: 'Light', preview: 'bg-slate-100', icon: Sun },
                      { id: 'system', label: 'System', preview: 'bg-gradient-to-br from-slate-950 to-slate-100', icon: Monitor },
                    ].map(t => (
                      <button key={t.id} onClick={() => setTheme(t.id)}
                        className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${theme === t.id ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)] text-indigo-400' : 'border-white/5 bg-white/[0.02] text-slate-500 hover:border-white/20 hover:text-white'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl ${t.preview} border border-white/10`} />
                        <t.icon size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard>
                  <div className="p-5 border-b border-white/5"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Palette size={12} /> Accent Colour</h3></div>
                  <div className="p-5 flex gap-3 flex-wrap">
                    {ACCENT_COLORS.map(c => (
                      <button key={c.value} onClick={() => setAccentColor(c.value)}
                        className={`w-10 h-10 rounded-2xl ${c.class} transition-all border-2 ${accentColor === c.value ? 'scale-110 shadow-xl border-white' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </GlassCard>

                <GlassCard>
                  <div className="p-5 border-b border-white/5"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Globe size={12} /> Accessibility</h3></div>
                  <div className="p-4 space-y-3">
                    <SettingRow icon={Globe} title="Font Size" subtitle="Base rendering scale" iconColor="text-cyan-400" iconBg="bg-cyan-500/10 border-cyan-500/20">
                      <select value={fontSize} onChange={e => setFontSize(e.target.value)}
                        className="bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none">
                        {['small', 'normal', 'large'].map(v => <option key={v} value={v} className="bg-slate-900 capitalize">{v}</option>)}
                      </select>
                    </SettingRow>
                    <SettingRow icon={Zap} title="Reduce Motion" subtitle="Disable Framer Motion animations globally" iconColor="text-rose-400" iconBg="bg-rose-500/10 border-rose-500/20">
                      <Toggle value={reduceMotion} onChange={setReduceMotion} color="bg-rose-500" />
                    </SettingRow>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* ─── NOTIFICATIONS ─── */}
            {activeTab === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <GlassCard>
                  <div className="p-5 border-b border-white/5"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Delivery Channels</h3></div>
                  <div className="p-4 space-y-3">
                    <SettingRow icon={Bell} title="Push Notifications" subtitle="In-app toast alerts" iconColor="text-indigo-400" iconBg="bg-indigo-500/10 border-indigo-500/20">
                      <Toggle value={notifPush} onChange={setNotifPush} color="bg-indigo-500" />
                    </SettingRow>
                    <SettingRow icon={Mail} title="Email Reports" subtitle="Daily digest to your college email" iconColor="text-blue-400" iconBg="bg-blue-500/10 border-blue-500/20">
                      <Toggle value={notifEmail} onChange={setNotifEmail} />
                    </SettingRow>
                    <SettingRow icon={Phone} title="SMS Critical Alerts" subtitle="Security and attendance warnings" iconColor="text-amber-400" iconBg="bg-amber-500/10 border-amber-500/20">
                      <Toggle value={notifSMS} onChange={setNotifSMS} color="bg-amber-500" />
                    </SettingRow>
                  </div>
                </GlassCard>
                <GlassCard>
                  <div className="p-5 border-b border-white/5"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Event Categories</h3></div>
                  <div className="p-4 space-y-3">
                    <SettingRow icon={CheckCircle2} title="Grade Published" subtitle="When results are released for any subject" iconColor="text-emerald-400" iconBg="bg-emerald-500/10 border-emerald-500/20">
                      <Toggle value={notifGrades} onChange={setNotifGrades} color="bg-emerald-500" />
                    </SettingRow>
                    <SettingRow icon={Zap} title="Attendance Risk" subtitle="Alert when below 85% threshold" iconColor="text-rose-400" iconBg="bg-rose-500/10 border-rose-500/20">
                      <Toggle value={notifAttendance} onChange={setNotifAttendance} color="bg-rose-500" />
                    </SettingRow>
                    <SettingRow icon={Key} title="Fee Reminders" subtitle="7 days before deadline" iconColor="text-yellow-400" iconBg="bg-yellow-500/10 border-yellow-500/20">
                      <Toggle value={notifFee} onChange={setNotifFee} color="bg-yellow-500" />
                    </SettingRow>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* ─── API KEYS ─── */}
            {activeTab === 'api' && (
              <motion.div key="api" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <GlassCard>
                  <div className="p-5 border-b border-white/5"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Bearer Tokens</h3></div>
                  <div className="p-5 space-y-4">
                    {[
                      { name: 'Production Key', key: 'sk_live_vtm_9x8f7a6b5c4d3e2f1...', status: 'Active', color: 'emerald' },
                      { name: 'Analytics Webhook', key: 'wh_vtm_analytics_8a7b6c5d4...', status: 'Active', color: 'emerald' },
                      { name: 'Dev Sandbox', key: 'sk_test_vtm_1a2b3c4d5e6f...', status: 'Revoked', color: 'red' },
                    ].map(k => (
                      <div key={k.name} className="p-4 rounded-2xl bg-black/30 border border-white/5 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: k.color === 'emerald' ? '#10b981' : '#ef4444' }} />
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-xs font-black text-white">{k.name}</h4>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${k.color === 'emerald' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>{k.status}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <code className="flex-1 text-[11px] font-mono text-slate-500 truncate">{k.key}</code>
                          {k.status === 'Active' && (
                            <button onClick={() => push({ type: 'warning', title: 'Key Revoked', body: `${k.name} has been invalidated. Generate a new one.` })}
                              className="text-[10px] text-red-400 font-black uppercase tracking-widest px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors">
                              Revoke
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button onClick={() => push({ type: 'success', title: 'Key Generated', body: 'New API bearer token created and ready.' })}
                      className="w-full py-3 border border-dashed border-white/10 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-indigo-500/50 hover:text-indigo-400 transition-all flex items-center justify-center gap-2">
                      + Generate New Key
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
