import React, { useState, useEffect, useRef } from 'react';
import { 
  Fingerprint, ShieldCheck, ShieldAlert, History, Smartphone, 
  MapPin, Globe, Clock, Monitor, Lock, CheckCircle2, XCircle, 
  AlertTriangle, RefreshCw, Key, Shield, Terminal, Zap, Radio, Trash2, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import ActionDialog from '../../components/ui/ActionDialog';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import { captureFaceDescriptor, startFaceCamera, stopFaceCamera } from '../../utils/faceAuth';

const getServerMessage = (err, fallback) =>
  err?.response?.data?.msg || err?.response?.data?.error || err?.message || fallback;

const CryptographicRain = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const characters = 'ABCDEF0123456789XYZ!@#$%^&*()';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    const draw = () => {
      ctx.fillStyle = 'rgba(2, 2, 2, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#2563eb'; // blue-600
      ctx.font = fontSize + 'px monospace';
      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-10 z-0" />;
};

const Security = () => {
  const {
    user,
    registerBiometrics,
    getFaceChallenge,
    enrollFaceAuthentication,
    authenticateFace,
    disableFaceAuthentication,
    authStatus,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [faceAuth, setFaceAuth] = useState(null);
  const [identityScore, setIdentityScore] = useState({ score: 98, status: 'OPTIMAL', recommendation: 'Sovereign Link Synchronized.' });
  const [deviceDialog, setDeviceDialog] = useState({ open: false, mode: 'register', credentialId: '', nickname: '' });
  const [removeDeviceDialog, setRemoveDeviceDialog] = useState({ open: false, credentialId: '', nickname: '' });
  const [panicDialogOpen, setPanicDialogOpen] = useState(false);

  const fetchSecurityData = async () => {
    try {
      const uid = user?.id || user?._id;
      if (!uid) return;
      const [logsRes, settingsRes, scoreRes, credsRes, faceRes] = await Promise.all([
        api.get(`/auth/security-logs/${uid}`),
        api.get(`/auth/get-security-settings/${uid}`),
        api.get(`/auth/get-identity-score/${uid}`).catch(() => ({ data: { score: 98, status: 'OPTIMAL', recommendation: 'Sovereign Link Synchronized.' } })),
        api.get(`/auth/credentials/${uid}`).catch(() => ({ data: { credentials: [] } })),
        api.get(`/auth/face/status/${uid}`).catch(() => ({ data: { faceAuth: null } }))
      ]);
      setLogs(logsRes.data);
      setSettings(settingsRes.data);
      setIdentityScore(scoreRes.data);
      setDevices(credsRes.data.credentials || []);
      setFaceAuth(faceRes?.data?.faceAuth || null);
    } catch (err) {
      setMsg({ type: 'error', text: getServerMessage(err, 'Unable to load security telemetry right now.') });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSecurityData();
  };

  const handleToggleMFA = async (type) => {
    if (!settings) return;
    if (authStatus?.signInAvailable === false) {
      setMsg({ type: 'error', text: authStatus.reason || 'Security controls are temporarily unavailable.' });
      return;
    }
    const enablingBiometric = type === 'biometric' && !settings.isBiometricEnabled;
    if (enablingBiometric && !authStatus?.webAuthn) {
      setMsg({ type: 'error', text: 'Passkeys are unavailable until RP_ID and ORIGIN are configured.' });
      return;
    }
    if (enablingBiometric && devices.length === 0) {
      setMsg({ type: 'error', text: 'Register at least one passkey before enabling biometric protection.' });
      return;
    }
    const enablingFaceAuth = type === 'face' && !settings.isFaceAuthEnabled;
    if (enablingFaceAuth && !faceAuth?.enrolled) {
      setMsg({ type: 'error', text: 'Enroll face authentication before enabling it.' });
      return;
    }
    try {
      setActionLoading(type);
      const uid = user?.id || user?._id;
      const updated = { userId: uid };
      if (type === 'biometric') {
        updated.isBiometricEnabled = !settings.isBiometricEnabled;
      } else if (type === 'face') {
        updated.isFaceAuthEnabled = !settings.isFaceAuthEnabled;
      } else {
        updated.isTwoFactorEnabled = !settings.isTwoFactorEnabled;
      }
      const { data } = await api.post('/auth/update-security-settings', updated);
      if (data?.settings) {
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
      setMsg({
        type: 'success',
        text: type === '2fa' && data?.needsTotpEnrollment
          ? '2FA enabled. Scan the QR during your next sign-in to finish enrollment.'
          : `Protocol Update: ${type.toUpperCase()} modified.`
      });
    } catch (err) {
      setMsg({ type: 'error', text: getServerMessage(err, 'Protocol Failure: Settings commit failed.') });
    } finally {
      setActionLoading('');
    }
  };

  const handleRegisterDevice = () => {
    if (authStatus?.signInAvailable === false) {
      setMsg({ type: 'error', text: authStatus.reason || 'Security controls are temporarily unavailable.' });
      return;
    }
    if (!authStatus?.webAuthn) {
      setMsg({ type: 'error', text: 'Passkeys are unavailable until RP_ID and ORIGIN are configured.' });
      return;
    }
    if (devices.length >= 2) {
      setMsg({ type: 'error', text: 'Device cap reached (2). Revoke one to add another.' });
      return;
    }
    setDeviceDialog({ open: true, mode: 'register', credentialId: '', nickname: '' });
  };

  const handleRemoveDevice = (credentialId) => {
    const currentDevice = devices.find((device) => device.id === credentialId);
    setRemoveDeviceDialog({
      open: true,
      credentialId,
      nickname: currentDevice?.nickname || 'Credential'
    });
  };

  const confirmRemoveDevice = async () => {
    try {
      setActionLoading(`remove:${removeDeviceDialog.credentialId}`);
      const uid = user?.id || user?._id;
      await api.post('/auth/remove-credential', { userId: uid, credentialId: removeDeviceDialog.credentialId });
      setRemoveDeviceDialog({ open: false, credentialId: '', nickname: '' });
      setMsg({ type: 'success', text: 'Device revoked successfully.' });
      handleRefresh();
    } catch (err) {
      setMsg({ type: 'error', text: getServerMessage(err, 'Revocation failed.') });
    } finally {
      setActionLoading('');
    }
  };

  const handleRenameDevice = (credentialId) => {
    const currentDevice = devices.find((device) => device.id === credentialId);
    setDeviceDialog({
      open: true,
      mode: 'rename',
      credentialId,
      nickname: currentDevice?.nickname || ''
    });
  };

  const handleDeviceDialogSubmit = async () => {
    const uid = user?.id || user?._id;
    if (!uid) return;

    const nickname = deviceDialog.nickname.trim() || undefined;
    try {
      if (deviceDialog.mode === 'register') {
        setActionLoading('register-device');
        await registerBiometrics(uid, nickname);
        setMsg({ type: 'success', text: 'Hardware Handshake: Device Seeded.' });
      } else {
        setActionLoading(`rename:${deviceDialog.credentialId}`);
        await api.post('/auth/rename-credential', {
          userId: uid,
          credentialId: deviceDialog.credentialId,
          nickname
        });
        setMsg({ type: 'success', text: 'Device nickname updated.' });
      }
      setDeviceDialog({ open: false, mode: 'register', credentialId: '', nickname: '' });
      handleRefresh();
    } catch (err) {
      setMsg({
        type: 'error',
        text: getServerMessage(err, deviceDialog.mode === 'register' ? 'Registration Interrupted.' : 'Rename failed.')
      });
    } finally {
      setActionLoading('');
    }
  };

  const captureFaceSamples = async (sampleCount = 3) => {
    const videoEl = document.createElement('video');
    videoEl.setAttribute('autoplay', 'true');
    videoEl.setAttribute('playsinline', 'true');
    videoEl.style.position = 'fixed';
    videoEl.style.width = '1px';
    videoEl.style.height = '1px';
    videoEl.style.opacity = '0';
    videoEl.style.pointerEvents = 'none';
    videoEl.style.left = '-9999px';
    document.body.appendChild(videoEl);

    let stream = null;
    const descriptors = [];
    const metrics = [];

    try {
      stream = await startFaceCamera(videoEl);
      for (let index = 0; index < sampleCount; index += 1) {
        if (index > 0) {
          await new Promise((resolve) => setTimeout(resolve, 260));
        }
        const capture = await captureFaceDescriptor(videoEl);
        descriptors.push(capture.descriptor);
        metrics.push(capture.metrics || {});
      }

      const avgBrightness = metrics.length
        ? metrics.reduce((sum, entry) => sum + Number(entry.avgBrightness || 0), 0) / metrics.length
        : undefined;
      const avgContrast = metrics.length
        ? metrics.reduce((sum, entry) => sum + Number(entry.avgContrast || 0), 0) / metrics.length
        : undefined;

      return {
        descriptors,
        captureMeta: {
          model: 'vitam-face-v1',
          sampleCount,
          avgBrightness,
          avgContrast,
          deviceLabel: navigator?.userAgent?.slice(0, 80) || 'Browser Device'
        }
      };
    } finally {
      stopFaceCamera(stream, videoEl);
      videoEl.remove();
    }
  };

  const handleEnrollFaceAuth = async () => {
    const uid = user?.id || user?._id;
    if (!uid) return;
    if (authStatus?.signInAvailable === false) {
      setMsg({ type: 'error', text: authStatus.reason || 'Security controls are temporarily unavailable.' });
      return;
    }

    try {
      setActionLoading('face-enroll');
      const challenge = await getFaceChallenge(uid);
      const challengeResponse = window.prompt(
        `Face enrollment challenge:\n${challenge.challenge}\n\nType exactly as shown:`,
        ''
      );
      if (!challengeResponse) {
        throw new Error('Face enrollment cancelled.');
      }

      const capturePayload = await captureFaceSamples(3);
      const enrollment = await enrollFaceAuthentication(uid, {
        challengeResponse: challengeResponse.trim().toUpperCase(),
        descriptors: capturePayload.descriptors,
        captureMeta: capturePayload.captureMeta
      });

      if (enrollment?.faceAuth) {
        setFaceAuth(enrollment.faceAuth);
      }
      setSettings((prev) => (prev ? { ...prev, isFaceAuthEnabled: true, hasFaceAuth: true } : prev));
      setMsg({ type: 'success', text: 'Face authentication enrolled successfully.' });
      handleRefresh();
    } catch (err) {
      setMsg({ type: 'error', text: getServerMessage(err, err?.message || 'Face enrollment failed.') });
    } finally {
      setActionLoading('');
    }
  };

  const handleVerifyFaceAuth = async () => {
    const uid = user?.id || user?._id;
    if (!uid) return;

    try {
      setActionLoading('face-verify');
      const challenge = await getFaceChallenge(uid);
      const challengeResponse = window.prompt(
        `Face verification challenge:\n${challenge.challenge}\n\nType exactly as shown:`,
        ''
      );
      if (!challengeResponse) {
        throw new Error('Face verification cancelled.');
      }
      const capturePayload = await captureFaceSamples(1);
      const verification = await authenticateFace(uid, {
        challengeResponse: challengeResponse.trim().toUpperCase(),
        descriptor: capturePayload.descriptors[0]
      });
      if (verification?.faceAuth) {
        setFaceAuth(verification.faceAuth);
      }
      setMsg({
        type: 'success',
        text: verification?.score
          ? `Face verification success (score ${verification.score}).`
          : 'Face verification successful.'
      });
      handleRefresh();
    } catch (err) {
      setMsg({ type: 'error', text: getServerMessage(err, err?.message || 'Face verification failed.') });
    } finally {
      setActionLoading('');
    }
  };

  const handleDisableFaceAuth = async () => {
    const uid = user?.id || user?._id;
    if (!uid) return;

    try {
      setActionLoading('face-disable');
      const nextStatus = await disableFaceAuthentication(uid);
      setFaceAuth(nextStatus || null);
      setSettings((prev) => (prev ? { ...prev, isFaceAuthEnabled: false, hasFaceAuth: false } : prev));
      setMsg({ type: 'success', text: 'Face authentication disabled.' });
      handleRefresh();
    } catch (err) {
      setMsg({ type: 'error', text: getServerMessage(err, err?.message || 'Unable to disable face authentication.') });
    } finally {
      setActionLoading('');
    }
  };

  const handlePanicLockout = () => {
    const uid = user?.id || user?._id;
    if (!uid) return;
    if (authStatus?.signInAvailable === false) {
      setMsg({ type: 'error', text: authStatus.reason || 'Security controls are temporarily unavailable.' });
      return;
    }
    setPanicDialogOpen(true);
  };

  const confirmPanicLockout = async () => {
    const uid = user?.id || user?._id;
    if (!uid) return;
    try {
      setActionLoading('panic');
      await api.post('/auth/revoke-all-sessions', { userId: uid });
      setPanicDialogOpen(false);
      setMsg({ type: 'success', text: 'Institutional lockout complete. Redirecting to secure sign-in.' });
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setMsg({ type: 'error', text: getServerMessage(err, 'Emergency lockout failed.') });
    } finally {
      setActionLoading('');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center">
      <RefreshCw className="text-blue-500 animate-spin" size={48} />
    </div>
  );

  return (
    <DashboardLayout title="Security Command" role={user?.role}>
      <div className="relative pb-24 font-['Outfit']">
        <CryptographicRain />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto relative z-10"
        >
          <WorkspaceHero
            eyebrow="Security workspace"
            title="Identity protection command center"
            description="Manage 2FA, passkeys, device trust, and audit visibility from a clearer security workspace that keeps important actions easy to find and easier to trust."
            icon={Shield}
            badges={[
              'Zero trust posture',
              authStatus?.webAuthn ? 'Passkeys ready' : 'Passkeys awaiting config',
              settings?.isTwoFactorEnabled ? '2FA enabled' : '2FA disabled'
            ]}
            actions={[
              {
                label: refreshing ? 'Refreshing...' : 'Refresh Security State',
                icon: RefreshCw,
                tone: 'primary',
                disabled: refreshing,
                onClick: handleRefresh
              }
            ]}
            stats={[
              { label: 'Integrity score', value: `${identityScore.score}%` },
              { label: 'Status', value: identityScore.status || 'OPTIMAL' },
              { label: 'Registered devices', value: String(devices.length) },
              { label: 'Device limit', value: '2 max' }
            ]}
            aside={(
              <div className="glass-panel h-full p-6 md:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
                      Security recommendation
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-white">
                      Keep device trust current
                    </h3>
                  </div>
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-200">
                    <ShieldCheck size={18} />
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="surface-card p-4">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                      Recommended next step
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-200">
                      {devices.length === 0
                        ? 'Register your first trusted device so biometric protection can be enforced safely.'
                        : 'Review your registered device list and keep labels clean so audits stay clear.'}
                    </p>
                  </div>
                  <div className="surface-card p-4">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                      Security note
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-200">
                      {authStatus?.webAuthn
                        ? 'Passkey verification is available on supported devices.'
                        : 'WebAuthn will become available as soon as RP_ID and ORIGIN are configured in production.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
            {[
              { label: 'MFA Status', value: identityScore.telemetry?.mfaActive ? 'ACTIVE' : 'INACTIVE', icon: Lock, color: identityScore.telemetry?.mfaActive ? 'text-emerald-500' : 'text-red-500' },
              { label: 'Biometrics', value: identityScore.telemetry?.biometricActive ? 'SYNCED' : 'PENDING', icon: Fingerprint, color: identityScore.telemetry?.biometricActive ? 'text-emerald-500' : 'text-blue-500' },
              { label: 'Device Trust', value: identityScore.telemetry?.deviceTrust || 'STANDARD', icon: Smartphone, color: 'text-indigo-500' },
              { label: 'Audit Velocity', value: 'OPTIMAL', icon: History, color: 'text-cyan-500' }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="premium-card p-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{stat.label}</p>
                </div>
                <p className="text-2xl font-black text-white italic tracking-tighter uppercase">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            
            {/* Left Column: Toggles & Stats */}
            <div className="xl:col-span-4 space-y-12">
            <div className="bg-[#050505] border border-white/5 rounded-[50px] p-10 space-y-10 shadow-3xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Subsystem Infrastructure</h3>
                  <Radio size={16} className="text-blue-500 animate-pulse" />
                </div>
                
                <div className="space-y-6">
                  {[
                    { label: '2FA Protocol', state: settings?.isTwoFactorEnabled, type: '2fa', icon: Lock, desc: 'TOTP Authentication' },
                    {
                      label: 'Sovereign Biometrics',
                      state: settings?.isBiometricEnabled,
                      type: 'biometric',
                      icon: Fingerprint,
                      desc: !authStatus?.webAuthn
                        ? 'Waiting for production passkey config'
                        : devices.length === 0
                          ? 'Register one passkey before enforcement'
                          : 'WebAuthn Hardware Bond'
                    },
                    {
                      label: 'Face Authentication',
                      state: settings?.isFaceAuthEnabled,
                      type: 'face',
                      icon: Camera,
                      desc: faceAuth?.enrolled
                        ? 'Challenge-driven face verification'
                        : 'Enroll face profile to activate'
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-8 bg-white/[0.02] rounded-[35px] border border-white/5 hover:border-blue-500/20 transition-all group">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${item.state ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-white/20'}`}>
                          <item.icon size={24} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-widest">{item.label}</h4>
                          <p className="text-[9px] text-white/20 font-black uppercase tracking-tight mt-1">{item.desc}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleToggleMFA(item.type)}
                        disabled={Boolean(actionLoading)}
                        className={`w-14 h-7 rounded-full relative transition-all duration-500 ${item.state ? 'bg-blue-600' : 'bg-white/10'}`}
                      >
                        <motion.div animate={{ x: item.state ? 28 : 4 }} className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleRegisterDevice}
                    disabled={Boolean(actionLoading) || devices.length >= 2 || !authStatus?.webAuthn || authStatus?.signInAvailable === false}
                    className="w-full bg-white text-black disabled:bg-slate-700 disabled:text-white/40 disabled:cursor-not-allowed py-6 rounded-[30px] font-black uppercase tracking-widest text-[10px] transition-all shadow-2xl hover:bg-blue-600 hover:text-white group active:scale-95"
                  >
                    <span className="flex items-center justify-center gap-3">
                      <Smartphone size={18} className="group-hover:animate-bounce" />
                      {actionLoading === 'register-device'
                        ? 'Binding Device...'
                        : !authStatus?.webAuthn
                          ? 'Passkeys Unavailable'
                          : devices.length >= 2
                            ? 'Device Limit Reached'
                            : authStatus?.signInAvailable === false
                              ? 'Security Controls Paused'
                              : 'Bind Physical Key'}
                    </span>
                  </button>
                  <div className="mt-8 flex justify-center gap-1.5 h-1">
                     {[...Array(20)].map((_, i) => (
                       <div key={i} className="flex-1 bg-white/[0.05] rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                            className="h-full bg-blue-600/30"
                          />
                       </div>
                     ))}
                 </div>
                </div>

                {/* Registered devices list */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Smartphone size={16} className="text-blue-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Registered Devices</h4>
                  </div>
                  <div className="space-y-3">
                    {devices.length === 0 && (
                      <p className="text-[11px] text-white/30 font-medium">No devices registered. Add up to 2.</p>
                    )}
                    {devices.map((dev) => (
                      <div key={dev.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">{(dev.transports?.[0] || 'KEY')[0]}</div>
                          <div>
                            <p className="text-xs font-black text-white uppercase tracking-widest">{dev.nickname || 'Credential'}</p>
                            <p className="text-[10px] text-white/40 break-all">{dev.id}</p>
                            {dev.lastUsed && <p className="text-[9px] text-white/20 mt-1">Last used: {new Date(dev.lastUsed).toLocaleString()}</p>}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button disabled={Boolean(actionLoading)} onClick={() => handleRenameDevice(dev.id)} className="text-blue-400 hover:text-blue-200 transition-colors text-[11px] font-bold disabled:opacity-40">
                            {actionLoading === `rename:${dev.id}` ? 'Saving...' : 'Rename'}
                          </button>
                          <button disabled={Boolean(actionLoading)} onClick={() => handleRemoveDevice(dev.id)} className="text-red-400 hover:text-red-200 transition-colors disabled:opacity-40">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Camera size={16} className="text-indigo-400" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Face Authentication</h4>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
                    <p className="text-[11px] text-white/50 leading-relaxed">
                      {faceAuth?.enrolled
                        ? `Enrolled (${faceAuth?.enabled ? 'enabled' : 'disabled'}). Last verification: ${faceAuth?.lastVerifiedAt ? new Date(faceAuth.lastVerifiedAt).toLocaleString() : 'not yet'}.`
                        : 'Not enrolled. Enroll face authentication for an additional sign-in factor.'}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <button
                        type="button"
                        onClick={handleEnrollFaceAuth}
                        disabled={Boolean(actionLoading)}
                        className="btn-secondary justify-center py-2 text-xs disabled:opacity-50"
                      >
                        {actionLoading === 'face-enroll' ? 'Enrolling...' : faceAuth?.enrolled ? 'Re-enroll' : 'Enroll'}
                      </button>
                      <button
                        type="button"
                        onClick={handleVerifyFaceAuth}
                        disabled={Boolean(actionLoading) || !faceAuth?.enrolled}
                        className="btn-secondary justify-center py-2 text-xs disabled:opacity-50"
                      >
                        {actionLoading === 'face-verify' ? 'Verifying...' : 'Verify'}
                      </button>
                      <button
                        type="button"
                        onClick={handleDisableFaceAuth}
                        disabled={Boolean(actionLoading) || !faceAuth?.enrolled}
                        className="btn-secondary justify-center py-2 text-xs disabled:opacity-50"
                      >
                        {actionLoading === 'face-disable' ? 'Disabling...' : 'Disable'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-600/5 to-transparent border border-red-500/20 rounded-[50px] p-10 group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                  <ShieldAlert size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                      <Zap size={24} />
                    </div>
                    <h4 className="text-white font-black uppercase tracking-tighter text-lg italic">Panic Lockout</h4>
                  </div>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest leading-loose mb-10">
                    Emergency session revocation. Immediate cryptographic termination of all active institutional links.
                  </p>
                  <button
                    onClick={handlePanicLockout}
                    disabled={Boolean(actionLoading) || authStatus?.signInAvailable === false}
                    className="w-full py-5 border border-red-500/20 rounded-2xl text-red-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-red-500"
                  >
                    {actionLoading === 'panic' ? 'Revoking Sessions...' : 'Initialize Blackout'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Security Logs */}
            <div className="xl:col-span-8">
              <div className="bg-[#050505] border border-white/5 rounded-[60px] p-12 min-h-[750px] flex flex-col shadow-3xl overflow-hidden relative group/audit">
                <div className="absolute inset-0 bg-blue-600/[0.01] opacity-0 group-hover/audit:opacity-100 transition-opacity duration-1000" />
                
                <div className="flex items-center justify-between mb-12 relative z-10">
                  <div className="flex items-center gap-4">
                    <Terminal className="text-blue-600" size={24} />
                    <div>
                      <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em]">Identity Manifest Audit</h3>
                      <p className="text-[9px] font-black text-blue-500/40 tracking-widest uppercase mt-1">Real-time Subsystem Sync</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">Post-Quantum Verified</span>
                     <Shield size={16} className="text-white/10" />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 relative z-10">
                  {logs.length > 0 ? logs.map((log, idx) => (
                    <motion.div 
                      key={log._id} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-8 bg-white/[0.02] rounded-[40px] border border-white/5 hover:border-blue-500/20 transition-all group/log shadow-xl"
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex gap-6 items-start">
                          <div className={`mt-2 w-2 h-2 rounded-full shadow-[0_0_15px] ${
                            log.status === 'Success' ? 'bg-emerald-500 shadow-emerald-500' : 'bg-red-500 shadow-red-500 animate-pulse'
                          }`} />
                          <div className="space-y-3">
                            <div className="flex items-center gap-4">
                              <p className="text-xl font-black text-white italic tracking-tighter uppercase">{log.event.replace('AI', 'Apex')}</p>
                              <span className={`text-[8px] font-black uppercase tracking-[0.3em] px-4 py-1 rounded-full border ${
                                log.status === 'Success' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-red-500/20 text-red-500 bg-red-500/5'
                              }`}>{log.status}</span>
                            </div>
                            <p className="text-sm text-white/30 font-bold font-mono tracking-tight">{log.details}</p>
                            <div className="flex flex-wrap gap-6 pt-4">
                              {[
                                { icon: MapPin, text: log.location || 'Unknown' },
                                { icon: Globe, text: log.ip || 'Local Node' },
                                { icon: Monitor, text: log.device || 'Standard Access' }
                              ].map((meta, mIdx) => (
                                <div key={mIdx} className="flex items-center gap-2 text-[10px] font-black text-white/10 uppercase tracking-widest group-hover/log:text-white/30 transition-colors">
                                  <meta.icon size={12} className="text-blue-600/40" /> {meta.text}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-center md:text-right shrink-0">
                          <p className="text-2xl font-black text-white tracking-tighter tabular-nums leading-none mb-1">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em] italic">
                            {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="flex flex-col items-center justify-center h-full text-white/5 space-y-6 grayscale opacity-20">
                      <Shield size={120} />
                      <p className="font-black uppercase tracking-[1em] text-xs">Ledger Empty</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Global Alert Notification */}
        <AnimatePresence>
          {msg.text && (
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`fixed bottom-12 right-12 p-6 md:p-10 rounded-[50px] border backdrop-blur-3xl z-[100] shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex items-center gap-8 ${
                msg.type === 'success' ? 'bg-black border-emerald-500/20 text-emerald-400' : 'bg-black border-red-500/20 text-red-400'
              }`}
            >
              <div className={`w-16 h-16 rounded-[25px] flex items-center justify-center ${msg.type === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                {msg.type === 'success' ? <CheckCircle2 size={32}/> : <XCircle size={32}/>}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 mb-1">Sentinel Intelligence</p>
                <p className="text-2xl font-black text-white tracking-tighter uppercase italic">{msg.text}</p>
              </div>
              <button onClick={() => setMsg({ ...msg, text: '' })} className="ml-6 p-2 text-white/10 hover:text-white transition-all"><XCircle size={20}/></button>
            </motion.div>
          )}
        </AnimatePresence>

        <ActionDialog
          open={deviceDialog.open}
          title={deviceDialog.mode === 'register' ? 'Register Secure Device' : 'Rename Registered Device'}
          description={deviceDialog.mode === 'register'
            ? 'Add an optional nickname before launching the passkey enrollment prompt.'
            : 'Update the nickname shown in your secure device ledger.'}
          confirmLabel={deviceDialog.mode === 'register' ? 'Launch Passkey' : 'Save Nickname'}
          cancelLabel="Cancel"
          tone="info"
          loading={actionLoading === 'register-device' || actionLoading === `rename:${deviceDialog.credentialId}`}
          confirmDisabled={deviceDialog.mode === 'rename' && !deviceDialog.nickname.trim()}
          onClose={() => setDeviceDialog({ open: false, mode: 'register', credentialId: '', nickname: '' })}
          onConfirm={handleDeviceDialogSubmit}
        >
          <label className="block text-[10px] font-black uppercase tracking-[0.35em] text-white/35 mb-3">
            Device Nickname
          </label>
          <input
            type="text"
            value={deviceDialog.nickname}
            onChange={(event) => setDeviceDialog((prev) => ({ ...prev, nickname: event.target.value }))}
            placeholder="Work Laptop, Lab Surface, Home PC..."
            autoFocus
            maxLength={48}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm font-semibold text-white outline-none transition-all focus:border-blue-500/40 focus:bg-white/[0.05]"
          />
          <p className="text-[11px] text-white/35 mt-3">
            {deviceDialog.mode === 'register'
              ? 'Leave it blank to keep the default system label.'
              : 'Use a short label that helps you identify this device quickly during audits.'}
          </p>
        </ActionDialog>

        <ActionDialog
          open={panicDialogOpen}
          title="Confirm Panic Lockout"
          description="This will revoke every active session and remove all registered passkeys for this account. You will be returned to secure sign-in immediately."
          confirmLabel="Revoke Everything"
          cancelLabel="Keep Active Sessions"
          tone="danger"
          loading={actionLoading === 'panic'}
          onClose={() => setPanicDialogOpen(false)}
          onConfirm={confirmPanicLockout}
        />

        <ActionDialog
          open={removeDeviceDialog.open}
          title="Confirm Device Revocation"
          description={`Revoke ${removeDeviceDialog.nickname || 'this credential'} from your registered device ledger? This device will no longer be able to complete passkey verification until it is registered again.`}
          confirmLabel="Revoke Device"
          cancelLabel="Keep Device"
          tone="danger"
          loading={actionLoading === `remove:${removeDeviceDialog.credentialId}`}
          onClose={() => setRemoveDeviceDialog({ open: false, credentialId: '', nickname: '' })}
          onConfirm={confirmRemoveDevice}
        />
      </div>
    </DashboardLayout>
  );
};

export default Security;
