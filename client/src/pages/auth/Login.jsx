import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Fingerprint, Mail, Lock, Sparkles, ChevronDown, ChevronUp, Copy, CheckCheck, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';


const LoginPage = () => {
  const [step, setStep]           = useState(1);
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [otp, setOtp]             = useState('');
  const [error, setError]         = useState('');
  const [userId, setUserId]       = useState(null);
  const [qrCode, setQrCode]       = useState(null);          // base64 PNG
  const [totpSecret, setTotpSecret] = useState(null);        // base32 for manual entry
  const [totpLabel, setTotpLabel]   = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [copiedEmail, setCopiedEmail]     = useState('');
  const [showPass, setShowPass]           = useState(false);
  const [loading, setLoading]             = useState(false);

  const { login, verify2FA, registerBiometrics, authenticateBiometrics, verifyBiometric: authVerifyBiometric } = useAuth();
  const navigate = useNavigate();


  // ── Step 1: Password login (calls backend directly to get QR code back) ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);

      // Store IDs and data regardless of step
      setUserId(data.userId);
      setQrCode(data.qrCode || null);
      setTotpSecret(data.totpSecret || null);
      setTotpLabel(data.totpLabel || 'VITAM AI');
      setHasBiometrics(data.hasBiometrics);

      if (data.isFirstLogin) {
        // Redirect to full-screen security setup
        navigate('/setup', {
          state: {
            userId: data.userId,
            qrCode: data.qrCode,
            totpSecret: data.totpSecret,
            totpLabel: data.totpLabel
          }
        });
      } else if (data.requires2FA) {
        setStep(2);
      } else if (data.requiresBiometric) {
        setStep(3);
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: TOTP verification (real Google Authenticator code) ──
  const handle2FA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-2fa', {
        userId,
        token: otp.trim(),
      });
      if (data.token && data.user) {
        navigate(`/${data.user.role.toLowerCase()}/dashboard`);
        return;
      }
      if (data.requiresBiometric) {
        setHasBiometrics(data.hasBiometrics);
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid OTP code. Please check Google Authenticator.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Biometric flows ──
  const handleRegisterBiometricFlow = async () => {
    setLoading(true);
    setError('');
    try {
      const verified = await registerBiometrics(userId);
      if (verified) {
        // After registration, proceed to dashboard
        const user = await authVerifyBiometric(userId, 'biometric-registered');
        navigate(`/${user.role.toLowerCase()}/dashboard`);
      }
    } catch (err) {
      setError(err.message || 'Biometric registration failed. Your device might not support WebAuthn or it was cancelled.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthBiometricFlow = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await authenticateBiometrics(userId);
      navigate(`/${user.role.toLowerCase()}/dashboard`);
    } catch (err) {
      setError('Biometric authentication failed. Please try again or use the simulation below.');
    } finally {
      setLoading(false);
    }
  };


  const copySecret = () => {
    if (totpSecret) {
      navigator.clipboard.writeText(totpSecret);
      setCopiedEmail('secret');
      setTimeout(() => setCopiedEmail(''), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--apple-bg)] flex items-center justify-center p-6 transition-colors duration-500">
      <div className="w-full max-w-md space-y-4">


        {/* Main Auth Card */}
        <div className="apple-card p-10 glass relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-appleBlue"></div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-appleBlue mx-auto mb-4 flex items-center justify-center shadow-xl shadow-appleBlue/30 overflow-hidden relative group">
              <Sparkles className="text-white group-hover:scale-125 transition-transform" size={32} />
              <motion.div 
                   className="absolute inset-0 bg-white/20"
                   initial={{ x: '-100%' }}
                   animate={{ x: '100%' }}
                   transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-[var(--apple-text-primary)]">VITAM</h1>
            <p className="text-[var(--apple-text-secondary)] mt-1 font-black uppercase tracking-widest text-[9px]">Sovereign Institutional Portal</p>
          </div>

          <AnimatePresence mode="wait">

            {/* ── Step 1: Email + Password ── */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <div>
                  <label className="block text-[10px] font-black text-[var(--apple-text-secondary)] uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-[var(--apple-text-secondary)]" size={18} />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-[var(--apple-bg)]/50 border border-[var(--apple-border)] rounded-2xl focus:ring-2 focus:ring-appleBlue/20 outline-none text-[var(--apple-text-primary)] font-bold transition-all"
                      placeholder="name@college.edu" required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[var(--apple-text-secondary)] uppercase tracking-widest mb-2">Password Cluster</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-[var(--apple-text-secondary)]" size={18} />
                    <input
                      type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 bg-[var(--apple-bg)]/50 border border-[var(--apple-border)] rounded-2xl focus:ring-2 focus:ring-appleBlue/20 outline-none text-[var(--apple-text-primary)] font-bold transition-all"
                      placeholder="••••••••" required
                    />
                    <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-4 top-3.5 text-[var(--apple-text-secondary)] hover:text-appleBlue transition-colors">
                      {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                </div>
                {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
                <button type="submit" disabled={loading} className="w-full apple-btn-primary py-3 disabled:opacity-60">
                  {loading ? 'Signing in…' : 'Sign In →'}
                </button>
              </motion.form>
            )}

            {/* ── Step 2: TOTP — QR code + 6-digit input ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="text-center">
                  <Shield className="mx-auto text-appleBlue mb-2" size={36} />
                  <h3 className="text-xl font-bold text-slate-800">Two-Factor Authentication</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Scan the QR code with <strong>Google Authenticator</strong> or <strong>Apple Passwords</strong>, then enter the 6-digit code.
                  </p>
                </div>

                {/* QR Code */}
                {qrCode && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-white border-2 border-slate-100 rounded-2xl shadow-sm inline-block">
                      <img src={qrCode} alt="Scan with Google Authenticator" className="w-44 h-44" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium text-center">
                      Scan once — future logins use the same code
                    </p>

                    {/* Manual entry section */}
                    <div className="w-full bg-slate-50 rounded-2xl p-3 text-center">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">Or enter key manually</p>
                      <div className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                        <code className={`text-xs font-mono text-slate-700 flex-1 text-left break-all ${showSecret ? '' : 'blur-sm select-none'}`}>
                          {totpSecret}
                        </code>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => setShowSecret(p => !p)} className="text-slate-400 hover:text-appleBlue p-1">
                            {showSecret ? <EyeOff size={14}/> : <Eye size={14}/>}
                          </button>
                          <button onClick={copySecret} className="text-slate-400 hover:text-appleBlue p-1">
                            {copiedEmail === 'secret' ? <CheckCheck size={14} className="text-green-500"/> : <Copy size={14}/>}
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Account: <span className="font-semibold">{totpLabel}</span> · Time-based (TOTP)</p>
                    </div>
                  </div>
                )}

                {/* OTP Input form */}
                <form onSubmit={handle2FA} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2 text-center">
                      Enter the 6-digit code from your authenticator app
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full text-center text-3xl tracking-[0.5em] py-3 bg-slate-50 border-2 border-slate-200 focus:border-appleBlue rounded-apple focus:ring-2 focus:ring-appleBlue/20 outline-none font-bold"
                      maxLength={6}
                      placeholder="──────"
                      required
                      autoFocus
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-red-500 text-xs font-medium bg-red-50 rounded-xl p-3">
                      <RefreshCw size={12}/>
                      <span>{error}</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full apple-btn-primary py-3 disabled:opacity-50"
                  >
                    {loading ? 'Verifying…' : 'Verify Code →'}
                  </button>
                </form>

                <button onClick={() => { setStep(1); setError(''); setOtp(''); }} className="w-full text-xs text-slate-400 hover:text-appleBlue transition-colors text-center font-medium">
                  ← Back to login
                </button>
              </motion.div>
            )}

            {/* ── Step 3: Biometric ── */}
            {step === 3 && (
              <motion.div
                         className="space-y-12 text-center relative spatial-depth"
              >
                {/* Sovereign Scanning Interface */}
                <div className="relative mx-auto w-48 h-48 mb-12">
                   <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-0 border-2 border-dashed border-appleBlue/30 rounded-full"
                   />
                   <div className="absolute inset-4 crystal rounded-[50px] flex items-center justify-center holographic-gate overflow-hidden bg-white shadow-2xl">
                      <Fingerprint className="w-20 h-20 text-appleBlue animate-pulse" />
                      <div className="biometric-scan-line" />
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.4, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-appleBlue/10"
                      />
                   </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-appleBlue italic">Sovereign Handshake Initiated</span>
                  </div>
                  <h3 className="text-5xl font-black text-[var(--apple-text-primary)] tracking-tighter uppercase italic leading-none">
                    Citadel <span className="text-appleBlue">ID</span>
                  </h3>
                  <p className="text-[9px] text-[var(--apple-text-secondary)] font-black tracking-[0.2em] uppercase max-w-[280px] mx-auto italic leading-relaxed">
                    "Institutional Gateway 01: Multi-pass ocular and tactile biometric synthesis in progress."
                  </p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
                  </motion.div>
                )}

                <div className="flex flex-col gap-6">
                  {hasBiometrics ? (
                    <button
                      onClick={handleAuthBiometricFlow}
                      disabled={loading}
                      className="w-full py-6 bg-slate-900 text-white rounded-[35px] font-black uppercase tracking-[0.4em] text-[10px] shadow-[0_30px_60px_rgba(0,0,0,0.3)] hover:bg-black transition-all disabled:opacity-50"
                    >
                      {loading ? '🔓 SYNCHRONIZING...' : 'ESTABLISH SOVEREIGN LINK'}
                    </button>
                  ) : (
                    <button
                      onClick={handleRegisterBiometricFlow}
                      disabled={loading}
                      className="w-full py-6 bg-appleBlue text-white rounded-[35px] font-black uppercase tracking-[0.4em] text-[10px] shadow-[0_30px_60px_rgba(0,113,227,0.3)] hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      {loading ? '🔐 ENCRYPTING NODE...' : 'INITIALIZE SOVEREIGN KEY'}
                    </button>
                  )}

                </div>
              </motion.div>
            )}

          </AnimatePresence>

          <p className="text-center text-[9px] font-black uppercase tracking-[0.4em] text-[var(--apple-text-secondary)] mt-8 opacity-40">
            Secure Session managed by VITAM Sovereign Shield
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
