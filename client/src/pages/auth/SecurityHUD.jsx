import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Fingerprint,
  KeyRound,
  Pencil,
  RefreshCw,
  ShieldCheck,
  ShieldX,
  Smartphone,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import ActionDialog from '../../components/ui/ActionDialog';

const getServerMessage = (err, fallback) =>
  err?.response?.data?.msg || err?.response?.data?.error || err?.message || fallback;

const formatTimestamp = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'Unknown';
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const SecurityHUD = () => {
  const { user, registerBiometrics, authStatus, logout } = useAuth();
  const navigate = useNavigate();
  const uid = user?.id || user?._id;

  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState(null);
  const [devices, setDevices] = useState([]);
  const [identityScore, setIdentityScore] = useState({
    score: 0,
    status: 'Unknown',
    recommendation: 'Security telemetry unavailable.'
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [deviceDialog, setDeviceDialog] = useState({ open: false, nickname: '' });
  const [renameDeviceDialog, setRenameDeviceDialog] = useState({ open: false, credentialId: '', nickname: '' });
  const [removeDeviceDialog, setRemoveDeviceDialog] = useState({ open: false, credentialId: '', nickname: '' });
  const [panicDialogOpen, setPanicDialogOpen] = useState(false);

  const canUseWebAuthn = Boolean(authStatus?.webAuthn);
  const securityPaused = authStatus?.signInAvailable === false;
  const deviceCap = settings?.deviceCap || 2;
  const deviceCapReached = devices.length >= deviceCap;

  const securityTier = useMemo(() => {
    if (!settings) return 'Loading';
    if (settings.isBiometricEnabled && settings.isTwoFactorEnabled) return 'Strong';
    if (settings.isBiometricEnabled || settings.isTwoFactorEnabled) return 'Standard';
    return 'Basic';
  }, [settings]);

  const applySecuritySnapshot = ({ settings: nextSettings, score, credentials }) => {
    if (nextSettings) {
      setSettings(nextSettings);
    }
    if (score) {
      setIdentityScore(score);
    }
    if (Array.isArray(credentials)) {
      setDevices(credentials);
    }
  };

  const fetchSecurityData = async () => {
    if (!uid) {
      setLoading(false);
      return;
    }

    try {
      const [logsRes, settingsRes, scoreRes, credsRes] = await Promise.all([
        api.get(`/auth/security-logs/${uid}`),
        api.get(`/auth/get-security-settings/${uid}`, {
          cache: {
            maxAge: 20000,
            staleWhileRevalidate: true,
            revalidateAfter: 9000,
            persist: true,
            onUpdate: (response) => applySecuritySnapshot({ settings: response?.data })
          }
        }),
        api.get(`/auth/get-identity-score/${uid}`, {
          cache: {
            maxAge: 20000,
            staleWhileRevalidate: true,
            revalidateAfter: 9000,
            persist: true,
            onUpdate: (response) => applySecuritySnapshot({ score: response?.data })
          }
        }).catch(() => ({
          data: { score: 0, status: 'Unknown', recommendation: 'Identity score unavailable.' }
        })),
        api.get(`/auth/credentials/${uid}`, {
          cache: {
            maxAge: 20000,
            staleWhileRevalidate: true,
            revalidateAfter: 9000,
            persist: true,
            onUpdate: (response) => applySecuritySnapshot({ credentials: response?.data?.credentials || [] })
          }
        }).catch(() => ({ data: { credentials: [] } }))
      ]);

      setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
      setSettings(settingsRes.data || {});
      setIdentityScore(scoreRes.data || { score: 0, status: 'Unknown', recommendation: 'Unavailable' });
      setDevices(Array.isArray(credsRes.data?.credentials) ? credsRes.data.credentials : []);
    } catch (err) {
      setMsg({ type: 'error', text: getServerMessage(err, 'Unable to load security data right now.') });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, [uid]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSecurityData();
  };

  const handleToggleMFA = async (type) => {
    if (!settings || !uid) return;
    if (securityPaused) {
      setMsg({ type: 'error', text: authStatus?.reason || 'Security controls are temporarily unavailable.' });
      return;
    }

    const enablingBiometric = type === 'biometric' && !settings.isBiometricEnabled;
    if (enablingBiometric && !canUseWebAuthn) {
      setMsg({ type: 'error', text: 'Passkeys are unavailable until RP_ID and ORIGIN are configured.' });
      return;
    }
    if (enablingBiometric && devices.length === 0) {
      setMsg({ type: 'error', text: 'Register at least one passkey before enabling passkey protection.' });
      return;
    }

    try {
      setActionLoading(type);
      const payload = { userId: uid };
      if (type === 'biometric') {
        payload.isBiometricEnabled = !settings.isBiometricEnabled;
      } else {
        payload.isTwoFactorEnabled = !settings.isTwoFactorEnabled;
      }

      const { data } = await api.post('/auth/update-security-settings', payload);
      if (data?.settings) {
        setSettings((prev) => ({ ...(prev || {}), ...data.settings }));
      }
      setMsg({ type: 'success', text: 'Security settings updated.' });
    } catch (err) {
      setMsg({ type: 'error', text: getServerMessage(err, 'Unable to update security settings.') });
    } finally {
      setActionLoading('');
    }
  };

  const handleRegisterDevice = () => {
    if (securityPaused) {
      setMsg({ type: 'error', text: authStatus?.reason || 'Security controls are temporarily unavailable.' });
      return;
    }
    if (!canUseWebAuthn) {
      setMsg({ type: 'error', text: 'Passkeys are unavailable until RP_ID and ORIGIN are configured.' });
      return;
    }
    if (deviceCapReached) {
      setMsg({ type: 'error', text: `Device limit reached (${deviceCap}). Remove one device to continue.` });
      return;
    }

    setDeviceDialog({ open: true, nickname: '' });
  };

  const handleDeviceDialogSubmit = async () => {
    if (!uid) return;
    const nickname = deviceDialog.nickname.trim() || undefined;

    try {
      setActionLoading('register-device');
      await registerBiometrics(uid, nickname);
      setDeviceDialog({ open: false, nickname: '' });
      setMsg({ type: 'success', text: 'Passkey registered successfully.' });
      handleRefresh();
    } catch (err) {
      setMsg({ type: 'error', text: getServerMessage(err, 'Passkey registration failed.') });
    } finally {
      setActionLoading('');
    }
  };

  const handleRemoveDevice = (credentialId) => {
    const current = devices.find((device) => device.id === credentialId);
    setRemoveDeviceDialog({
      open: true,
      credentialId,
      nickname: current?.nickname || 'Device'
    });
  };

  const handleRenameDevice = (credentialId) => {
    const current = devices.find((device) => device.id === credentialId);
    setRenameDeviceDialog({
      open: true,
      credentialId,
      nickname: current?.nickname || ''
    });
  };

  const confirmRemoveDevice = async () => {
    try {
      setActionLoading(`remove:${removeDeviceDialog.credentialId}`);
      await api.post('/auth/remove-credential', {
        userId: uid,
        credentialId: removeDeviceDialog.credentialId
      });
      setRemoveDeviceDialog({ open: false, credentialId: '', nickname: '' });
      setMsg({ type: 'success', text: 'Device removed successfully.' });
      handleRefresh();
    } catch (err) {
      setMsg({ type: 'error', text: getServerMessage(err, 'Unable to remove this device.') });
    } finally {
      setActionLoading('');
    }
  };

  const confirmRenameDevice = async () => {
    const nextNickname = renameDeviceDialog.nickname.trim();
    if (!nextNickname) {
      setMsg({ type: 'error', text: 'Device name cannot be empty.' });
      return;
    }

    try {
      setActionLoading(`rename:${renameDeviceDialog.credentialId}`);
      await api.post('/auth/rename-credential', {
        userId: uid,
        credentialId: renameDeviceDialog.credentialId,
        nickname: nextNickname
      });
      setRenameDeviceDialog({ open: false, credentialId: '', nickname: '' });
      setMsg({ type: 'success', text: 'Device name updated.' });
      handleRefresh();
    } catch (err) {
      setMsg({ type: 'error', text: getServerMessage(err, 'Unable to rename this device.') });
    } finally {
      setActionLoading('');
    }
  };

  const confirmPanicLockout = async () => {
    if (!uid) return;
    try {
      setActionLoading('panic');
      await api.post('/auth/revoke-all-sessions', { userId: uid });
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setMsg({ type: 'error', text: getServerMessage(err, 'Unable to revoke sessions right now.') });
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Security" role={user?.role}>
        <div className="mx-auto max-w-4xl">
          <div className="glass-card p-8 text-center">
            <RefreshCw size={20} className="mx-auto mb-3 animate-spin text-blue-300" />
            <p className="text-sm text-slate-300">Loading security controls...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Security" role={user?.role}>
      <div className="mx-auto w-full max-w-6xl space-y-6 pb-12">
        {msg.text && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              msg.type === 'error'
                ? 'border-rose-400/30 bg-rose-500/10 text-rose-200'
                : msg.type === 'warning'
                  ? 'border-amber-400/30 bg-amber-500/10 text-amber-200'
                  : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
            }`}
          >
            {msg.text}
          </div>
        )}

        {securityPaused && (
          <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <AlertTriangle size={16} className="mr-2 inline" />
            {authStatus?.reason || 'Sign-in and security controls are temporarily unavailable.'}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="glass-card p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">Identity Score</p>
            <p className="mt-2 text-3xl font-extrabold text-white">{identityScore.score}%</p>
            <p className="mt-1 text-sm text-slate-300">{identityScore.status}</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">Security Tier</p>
            <p className="mt-2 text-2xl font-bold text-white">{securityTier}</p>
            <p className="mt-1 text-sm text-slate-300">{identityScore.recommendation}</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">Actions</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                className="btn-secondary flex-1 justify-center"
                disabled={refreshing}
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button type="button" onClick={() => setPanicDialogOpen(true)} className="btn-secondary flex-1 justify-center">
                <ShieldX size={14} />
                Lockout
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="glass-card p-5">
            <h2 className="text-lg font-bold text-white">Security Controls</h2>
            <p className="mt-1 text-sm text-slate-300">Configure 2FA and passkey protection for this account.</p>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-slate-700/70 bg-slate-900/50 p-3">
                <div>
                  <p className="text-sm font-semibold text-white">Authenticator (TOTP)</p>
                  <p className="text-xs text-slate-400">Enable one-time verification codes.</p>
                </div>
                <button
                  type="button"
                  disabled={actionLoading === '2fa'}
                  onClick={() => handleToggleMFA('2fa')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    settings?.isTwoFactorEnabled ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-700/70 text-slate-200'
                  }`}
                >
                  {settings?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-700/70 bg-slate-900/50 p-3">
                <div>
                  <p className="text-sm font-semibold text-white">Passkey (WebAuthn)</p>
                  <p className="text-xs text-slate-400">Require trusted registered devices.</p>
                </div>
                <button
                  type="button"
                  disabled={actionLoading === 'biometric'}
                  onClick={() => handleToggleMFA('biometric')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    settings?.isBiometricEnabled ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-700/70 text-slate-200'
                  }`}
                >
                  {settings?.isBiometricEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRegisterDevice}
              disabled={Boolean(actionLoading) || securityPaused || !canUseWebAuthn || deviceCapReached}
              className="btn-primary mt-4 w-full justify-center disabled:opacity-60"
            >
              <Smartphone size={16} />
              {actionLoading === 'register-device'
                ? 'Registering device...'
                : deviceCapReached
                  ? `Device limit reached (${deviceCap})`
                  : 'Register New Device'}
            </button>
            <p className="mt-2 text-xs text-slate-400">
              Registered devices: {devices.length}/{deviceCap}
            </p>
          </section>

          <section className="glass-card p-5">
            <h2 className="text-lg font-bold text-white">Registered Devices</h2>
            {devices.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">No passkeys registered yet.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between rounded-lg border border-slate-700/70 bg-slate-900/50 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{device.nickname || 'Device'}</p>
                      <p className="text-xs text-slate-400">Last used: {formatTimestamp(device.lastUsed)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRenameDevice(device.id)}
                        className="btn-secondary px-3 py-2 text-xs"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveDevice(device.id)}
                        className="btn-secondary px-3 py-2 text-xs"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="glass-card p-5">
          <h2 className="text-lg font-bold text-white">Security Activity</h2>
          {logs.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">No security events available.</p>
          ) : (
            <div className="custom-scrollbar mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {logs.map((log, idx) => (
                <div
                  key={log?._id || log?.id || `${log?.timestamp || 'log'}-${idx}`}
                  className="flex items-start justify-between rounded-lg border border-slate-700/70 bg-slate-900/50 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{log.event || 'Security Event'}</p>
                    <p className="text-xs text-slate-300">{log.details || 'No details'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-300">{log.status || 'Unknown'}</p>
                    <p className="text-[11px] text-slate-400">{formatTimestamp(log.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <ActionDialog
        open={deviceDialog.open}
        title="Register Trusted Device"
        description="Set an optional device name and continue the passkey prompt."
        confirmLabel="Register Device"
        cancelLabel="Cancel"
        tone="info"
        loading={actionLoading === 'register-device'}
        confirmDisabled={deviceCapReached || securityPaused || !canUseWebAuthn}
        onClose={() => setDeviceDialog({ open: false, nickname: '' })}
        onConfirm={handleDeviceDialogSubmit}
      >
        <label className="block space-y-2">
          <span className="text-xs uppercase tracking-wide text-slate-300">Device name</span>
          <input
            type="text"
            value={deviceDialog.nickname}
            onChange={(e) => setDeviceDialog((p) => ({ ...p, nickname: e.target.value }))}
            placeholder="For example: Office Laptop"
            className="premium-input px-3 py-2"
            maxLength={50}
          />
        </label>
      </ActionDialog>

      <ActionDialog
        open={renameDeviceDialog.open}
        title="Rename Device"
        description="Update the label to identify this passkey clearly."
        confirmLabel="Save Name"
        cancelLabel="Cancel"
        tone="info"
        loading={actionLoading === `rename:${renameDeviceDialog.credentialId}`}
        confirmDisabled={!renameDeviceDialog.nickname.trim()}
        onClose={() => setRenameDeviceDialog({ open: false, credentialId: '', nickname: '' })}
        onConfirm={confirmRenameDevice}
      >
        <input
          type="text"
          value={renameDeviceDialog.nickname}
          onChange={(e) => setRenameDeviceDialog((p) => ({ ...p, nickname: e.target.value }))}
          placeholder="Device nickname"
          className="premium-input px-3 py-2"
          maxLength={50}
        />
      </ActionDialog>

      <ActionDialog
        open={removeDeviceDialog.open}
        title="Remove Device"
        description={`This will remove passkey access for "${removeDeviceDialog.nickname}".`}
        confirmLabel="Remove Device"
        cancelLabel="Cancel"
        tone="danger"
        loading={actionLoading === `remove:${removeDeviceDialog.credentialId}`}
        onClose={() => setRemoveDeviceDialog({ open: false, credentialId: '', nickname: '' })}
        onConfirm={confirmRemoveDevice}
      />

      <ActionDialog
        open={panicDialogOpen}
        title="Revoke All Sessions"
        description="This action signs out all active sessions and clears device credentials."
        confirmLabel="Revoke Sessions"
        cancelLabel="Cancel"
        tone="danger"
        loading={actionLoading === 'panic'}
        onClose={() => setPanicDialogOpen(false)}
        onConfirm={confirmPanicLockout}
      />
    </DashboardLayout>
  );
};

export default SecurityHUD;
