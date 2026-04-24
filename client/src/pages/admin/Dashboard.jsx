import { Suspense, useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ClipboardPlus,
  Copy,
  Database,
  DatabaseZap,
  HardDrive,
  KeyRound,
  Lock,
  RefreshCcw,
  Server,
  Shield,
  Users,
  UserPlus,
  Wifi
} from 'lucide-react';
import api from '../../utils/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard, GlassSkeleton, StatCard } from '../../components/ui/DashboardComponents';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import { useToast } from '../../components/ui/ToastSystem';
import ActionDialog from '../../components/ui/ActionDialog';
import DeferredSection from '../../components/ui/DeferredSection';
import { useHealth } from '../../context/HealthContext';
import { useNavigate } from 'react-router-dom';
import { writeClipboardText } from '../../utils/clipboard';
import lazySimple from '../../utils/lazySimple';
import { cancelIdleTask, scheduleIdleTask } from '../../utils/idleTask';

const ROLE_OPTIONS = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'FACULTY', label: 'Faculty' },
  { value: 'admin', label: 'Admin' },
  { value: 'chairman', label: 'Chairman' },
  { value: 'director', label: 'Director' }
];

const ADMIN_SUBROLE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'principal', label: 'Principal' },
  { value: 'vice_principal', label: 'Vice Principal' },
  { value: 'finance', label: 'Finance' },
  { value: 'hod', label: 'HOD' },
  { value: 'exam', label: 'Exam' },
  { value: 'placement', label: 'Placement' },
  { value: 'bus', label: 'Bus' }
];

const AdminObservabilitySection = lazySimple(() => import('./sections/AdminObservabilitySection'));

const formatRoleLabel = (role, subRole) => {
  const base = String(role || '').toLowerCase();
  const detail = String(subRole || 'none').toLowerCase();

  if (base === 'admin' && detail !== 'none') {
    return `ADMIN (${detail.replace(/_/g, ' ').toUpperCase()})`;
  }

  return String(role || 'unknown').replace(/_/g, ' ').toUpperCase();
};

const createSuggestedPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
  let out = '';
  for (let i = 0; i < 12; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
};

export default function AdminDashboard() {
  const { push } = useToast();
  const { health } = useHealth();
  const navigate = useNavigate();
  const [sysAI, setSysAI] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedDialogOpen, setSeedDialogOpen] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [provisionedPassword, setProvisionedPassword] = useState('');
  const [recentUsers, setRecentUsers] = useState([]);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'STUDENT',
    subRole: 'none',
    autoGeneratePassword: true,
    password: ''
  });

  const isAdminRole = userForm.role === 'admin';
  const canCreateUser = useMemo(() => {
    const hasIdentity = userForm.name.trim().length >= 2 && userForm.email.trim().length >= 5;
    const hasPassword = userForm.autoGeneratePassword || userForm.password.trim().length >= 6;
    const hasSubRole = !isAdminRole || Boolean(userForm.subRole);
    return hasIdentity && hasPassword && hasSubRole;
  }, [isAdminRole, userForm]);

  const applyRecentUsers = (payload) => {
    const users = Array.isArray(payload) ? payload : [];
    setRecentUsers(users.slice(0, 8));
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await api.get('/admin/users', {
        params: { limit: 50 },
        cache: {
          maxAge: 30000,
          staleWhileRevalidate: true,
          revalidateAfter: 12000,
          persist: true,
          onUpdate: (response) => applyRecentUsers(response?.data)
        }
      });
      applyRecentUsers(data);
    } catch (err) {
      push({
        type: 'warning',
        title: 'User registry unavailable',
        body: err.response?.data?.msg || err.message || 'Unable to load users right now.'
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    simulateAI();
    void loadUsers();
  }, []);

  useEffect(() => {
    const handle = scheduleIdleTask(() => {
      void AdminObservabilitySection.preload?.();
    }, 1400, 450);

    return () => cancelIdleTask(handle);
  }, []);

  const simulateAI = () => {
    setRefreshing(true);
    setSysAI('');
    setTimeout(() => {
      setSysAI('Institutional infrastructure analysis complete. Network latency is within optimal bounds (24ms). Security layer flagged 3 unauthorized access attempts and institutional mitigation protocols remain active. Automated record synchronization contributed to temporary CPU load increase, so load balancing is recommended during the next sync window.');
      setRefreshing(false);
    }, 1500);
  };

  const handleSyncTelemetry = async () => {
    setSeeding(true);
    try {
      await api.post('/admin/seed-telemetry');
      setSeedDialogOpen(false);
      push({
        type: 'success',
        title: 'System Infrastructure Sync',
        body: 'Institutional datasets and system analytics have been synchronized successfully.'
      });
    } catch (err) {
      push({
        type: 'error',
        title: 'Synchronization Failed',
        body: err.response?.data?.msg || err.message || 'Unable to synchronize institutional datasets at this time.'
      });
    } finally {
      setSeeding(false);
    }
  };

  const updateUserForm = (field, value) => {
    setUserForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'role' && value !== 'admin') {
        next.subRole = 'none';
      }
      if (field === 'autoGeneratePassword' && value) {
        next.password = '';
      }
      return next;
    });
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    if (!canCreateUser || creatingUser) return;

    setCreatingUser(true);
    setProvisionedPassword('');
    setCopiedPassword(false);

    try {
      const payload = {
        name: userForm.name.trim(),
        email: userForm.email.trim().toLowerCase(),
        role: userForm.role,
        subRole: isAdminRole ? userForm.subRole : 'none',
        autoGeneratePassword: userForm.autoGeneratePassword
      };

      if (!userForm.autoGeneratePassword) {
        payload.password = userForm.password.trim();
      }

      const { data } = await api.post('/admin/users', payload);
      setProvisionedPassword(data?.provisionedPassword || '');
      setUserForm({
        name: '',
        email: '',
        role: 'STUDENT',
        subRole: 'none',
        autoGeneratePassword: true,
        password: ''
      });
      await loadUsers();
      push({
        type: 'success',
        title: 'Portal user created',
        body: data?.provisionedPassword
          ? 'User created. Share the temporary password securely and enforce password reset on first login.'
          : 'User created successfully.'
      });
    } catch (err) {
      push({
        type: 'error',
        title: 'Failed to create user',
        body: err.response?.data?.msg || err.message || 'Unable to create user right now.'
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleCopyPassword = async () => {
    if (!provisionedPassword) return;
    try {
      await writeClipboardText(provisionedPassword);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 1200);
    } catch (err) {
      push({
        type: 'warning',
        title: 'Clipboard unavailable',
        body: err.message || 'Unable to copy temporary password.'
      });
    }
  };

  return (
    <DashboardLayout title="System Administration" role="ADMIN">
      <WorkspaceHero
        eyebrow="Admin workspace"
        title="Infrastructure command center"
        description="Monitor operational health, inspect security posture, and coordinate platform-wide diagnostics from a cleaner control room built for fast, high-confidence decisions."
        icon={Server}
        badges={[
          health.isHealthy ? 'Integrity optimal' : 'Security attention needed',
          `Variance ${health.variance}%`,
          'Diagnostics active'
        ]}
        actions={[
          {
            label: seeding ? 'Syncing...' : 'Synchronize Datasets',
            icon: DatabaseZap,
            tone: 'secondary',
            disabled: seeding,
            onClick: () => setSeedDialogOpen(true)
          },
          {
            label: refreshing ? 'Analyzing...' : 'Run Diagnostics',
            icon: RefreshCcw,
            tone: 'primary',
            disabled: refreshing,
            onClick: simulateAI
          }
        ]}
        stats={[
          { label: 'Uptime', value: '99.98%' },
          { label: 'Variance', value: `${health.variance}%` },
          { label: 'AI state', value: refreshing ? 'Refreshing' : 'Ready' },
          { label: 'Security posture', value: health.isHealthy ? 'Protected' : 'Reviewing' }
        ]}
        aside={(
          <button
            type="button"
            onClick={() => navigate('/admin/security')}
            className="glass-panel h-full w-full p-6 text-left transition-all hover:border-blue-500/30"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
                  Security State
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  {health.isHealthy ? 'System integrity is optimal' : 'Active anomaly review'}
                </h3>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${health.isHealthy ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/20 bg-rose-500/10 text-rose-300'}`}>
                <Lock size={20} />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  System variance
                </p>
                <p className={`mt-2 text-2xl font-black ${health.variance > 70 ? 'text-rose-300' : 'text-emerald-300'}`}>
                  {health.variance}%
                </p>
              </div>
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Next action
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Open the security command room to review alerts, session controls, and passkey readiness.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-sm font-bold text-blue-200">
              Review security command room
              <CheckCircle2 size={16} />
            </div>
          </button>
        )}
      />

      <div className="mb-12 grid grid-cols-2 gap-8 lg:grid-cols-4">
        <StatCard title="Institutional Uptime" value="99.98%" icon={Server} color="bg-emerald-600" trend="Stable" />
        <StatCard title="Network Traffic" value="89.2k" icon={Wifi} color="bg-blue-600" trend="+12.4%" />
        <StatCard title="Memory Allocation" value="12.4GB" icon={HardDrive} color="bg-indigo-600" trend="71.2%" />
        <StatCard title="Security Events" value="14" icon={Shield} color="bg-rose-600" trend="Clear" />
      </div>

      <DeferredSection className="mb-10" minHeight={360}>
        <Suspense fallback={<GlassSkeleton className="h-[760px]" />}>
          <AdminObservabilitySection />
        </Suspense>
      </DeferredSection>

      <div className="mb-10 grid grid-cols-1 gap-10 xl:grid-cols-[1.4fr_1fr]">
        <GlassCard
          title="User Onboarding"
          subtitle="Create new college portal accounts with role-aware defaults and secure temporary access."
          icon={UserPlus}
        >
          <form onSubmit={handleCreateUser} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Full Name</span>
              <input
                type="text"
                className="premium-input py-3"
                placeholder="Enter user full name"
                value={userForm.name}
                onChange={(event) => updateUserForm('name', event.target.value)}
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Institution Email</span>
              <input
                type="email"
                className="premium-input py-3"
                placeholder="name@vitam.edu.in"
                value={userForm.email}
                onChange={(event) => updateUserForm('email', event.target.value.trimStart())}
                onBlur={() => updateUserForm('email', userForm.email.trim().toLowerCase())}
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Role</span>
              <select
                className="premium-input py-3"
                value={userForm.role}
                onChange={(event) => updateUserForm('role', event.target.value)}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Admin Sub-role</span>
              <select
                className="premium-input py-3"
                value={userForm.subRole}
                onChange={(event) => updateUserForm('subRole', event.target.value)}
                disabled={!isAdminRole}
              >
                {ADMIN_SUBROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-3 md:col-span-2">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={userForm.autoGeneratePassword}
                  onChange={(event) => updateUserForm('autoGeneratePassword', event.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                />
                Auto-generate temporary password
              </label>

              {!userForm.autoGeneratePassword && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    type="text"
                    className="premium-input py-3"
                    placeholder="Set temporary password (min 6 chars)"
                    value={userForm.password}
                    onChange={(event) => updateUserForm('password', event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => updateUserForm('password', createSuggestedPassword())}
                    className="btn-secondary justify-center px-4 py-3"
                  >
                    <KeyRound size={14} />
                    Generate
                  </button>
                </div>
              )}
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={!canCreateUser || creatingUser}
                className="btn-primary px-5 py-3 disabled:opacity-60"
              >
                <ClipboardPlus size={15} />
                {creatingUser ? 'Creating user...' : 'Create User Account'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/users')}
                className="btn-secondary px-5 py-3"
              >
                <Users size={15} />
                Open User Registry
              </button>
            </div>
          </form>

          {provisionedPassword && (
            <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-200">
                Temporary Password
              </p>
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-950/70 p-2">
                <code className="flex-1 truncate text-sm text-emerald-200">{provisionedPassword}</code>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  <Copy size={13} />
                  {copiedPassword ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </GlassCard>

        <GlassCard
          title="Recent User Activity"
          subtitle="Latest identities provisioned in the portal"
          icon={Users}
        >
          <div className="mt-4 space-y-3">
            {loadingUsers && (
              <p className="text-sm text-slate-400">Loading users...</p>
            )}
            {!loadingUsers && recentUsers.length === 0 && (
              <p className="text-sm text-slate-400">No users available yet.</p>
            )}
            {!loadingUsers && recentUsers.map((portalUser) => (
              <div
                key={portalUser.id || portalUser._id || portalUser.email}
                className="rounded-xl border border-white/5 bg-slate-950/60 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{portalUser.name}</p>
                    <p className="truncate text-[11px] text-slate-400">{portalUser.email}</p>
                  </div>
                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-200">
                    {formatRoleLabel(portalUser.role, portalUser.subRole)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard title="System Intelligence" subtitle="Autonomous structural analysis and health monitoring" icon={Database} className="mb-10">
        <div className="mt-6">
          <AnimatePresence mode="wait">
            {sysAI ? (
              <p className="text-base leading-relaxed text-blue-300">
                "{sysAI}"
              </p>
            ) : (
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 animate-ping rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
                  Analyzing Institutional Architecture...
                </span>
              </div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>

      <ActionDialog
        open={seedDialogOpen}
        title="Synchronize Institutional Datasets"
        description="Refresh demo analytics and re-synchronize infrastructure telemetry for fees, attendance, and performance monitoring."
        confirmLabel="Synchronize"
        cancelLabel="Discard"
        tone="warning"
        loading={seeding}
        onClose={() => setSeedDialogOpen(false)}
        onConfirm={handleSyncTelemetry}
      />
    </DashboardLayout>
  );
}
