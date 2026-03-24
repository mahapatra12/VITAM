import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Fingerprint, QrCode, ArrowRight, CheckCircle2, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SecuritySetup = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { verify2FA, registerBiometrics, completeSetup } = useAuth();

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // If user navigated here directly without login state, send them back
  if (!state || !state.userId) {
    navigate('/login');
    return null;
  }

  const { userId, qrCode, totpSecret, totpLabel } = state;

  const handleCopy = () => {
    navigator.clipboard.writeText(totpSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verify2FA(userId, otp);
      setStep(2); // Move to biometrics
    } catch (err) {
      setError(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometric = async () => {
    setError('');
    setLoading(true);
    try {
      await registerBiometrics(userId);
      setStep(3); // Setup complete
    } catch (err) {
      setError('Biometric registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const user = await completeSetup(userId);
      // Navigate based on role
      const role = user.role.toLowerCase();
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'chairman') navigate('/chairman/dashboard');
      else if (role === 'director') navigate('/director/dashboard');
      else if (role === 'faculty') navigate('/faculty/dashboard');
      else if (role === 'student') navigate('/student/dashboard');
      else navigate('/login');
    } catch (err) {
      setError('Failed to finalize setup.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020813] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Security Initialization
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Step {step} of 3
        </p>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </motion.div>
        )}

        <div className="mt-8 bg-[#0a0f1c]/80 backdrop-blur-xl py-8 px-4 shadow-2xl border border-gray-800 rounded-2xl sm:px-10">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: TOTP SETUP */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-6">
                  <div className="bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                    <QrCode className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Authenticator Setup</h3>
                  <p className="text-sm text-gray-400 mt-2">Scan this QR code with Google Authenticator or Apple Passwords.</p>
                </div>

                <div className="flex justify-center mb-6 bg-white p-2 rounded-xl">
                  {qrCode ? (
                    <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                  ) : (
                    <div className="w-48 h-48 bg-gray-100 animate-pulse rounded-lg"></div>
                  )}
                </div>

                <div className="mb-6">
                  <p className="text-xs text-gray-400 text-center mb-2">Or enter manual setup key:</p>
                  <div className="flex items-center justify-between bg-[#111827] border border-gray-800 rounded-lg p-3">
                    <code className="text-blue-400 text-sm tracking-wider font-mono bg-transparent">{totpSecret}</code>
                    <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors">
                      {copied ? <CheckCircle2 className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <form onSubmit={handle2FA}>
                  <div className="mb-6">
                    <input
                      type="text"
                      className="w-full bg-[#111827] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-center tracking-[0.5em] font-mono text-xl"
                      placeholder="000000"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-lg border border-transparent text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify Code'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 2: BIOMETRIC SETUP */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-8">
                  <div className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <Fingerprint className="h-10 w-10 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Sovereign Biometrics</h3>
                  <p className="text-sm text-gray-400 mt-3 leading-relaxed">
                    Register your device fingerprint or facial recognition for instant secure access in the future.
                  </p>
                </div>

                <button
                  onClick={handleBiometric}
                  disabled={loading}
                  className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg border border-transparent text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Register Device Fingerprint'}
                </button>
                <div className="mt-6 text-center">
                  <button onClick={() => setStep(3)} className="text-xs text-gray-500 hover:text-gray-300">
                    Skip for now
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: FINISH */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="text-center mb-8">
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="mx-auto w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.5)] mb-6"
                  >
                    <Shield className="h-12 w-12 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">System Secured</h3>
                  <p className="text-gray-400">Institutional Gateway authorized.</p>
                </div>

                <button
                  onClick={handleFinish}
                  disabled={loading}
                  className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg border border-transparent text-sm font-bold text-gray-900 bg-white hover:bg-gray-100 disabled:opacity-50 transition-all duration-300"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /> : (
                    <>
                      Enter Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SecuritySetup;
