import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const TOKEN_KEY = 'vitam_token';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user session from localStorage or API on app start
  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        if (storedToken) {
          try {
            console.log("[Auth] Session detected, verifying identity...");
            const { data } = await api.get('/auth/profile');
            if (!cancelled && data && data.user) {
              setUser(data.user);
            }
          } catch (err) {
            console.warn("[Auth] Session expired or server offline - clearing token", err.message);
            if (!cancelled) {
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem('vitam_user');
            }
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          console.log("[Auth] Initialization complete.");
        }
      }
    };

    initAuth();

    // Safety Timeout: Force-resolve loading state after 1.5 seconds to prevent infinite spinner
    const safety = setTimeout(() => {
      if (!cancelled) {
        setLoading(false);
        console.log("[Auth] Safety mount triggered (Cold Start Buffer).");
      }
    }, 10000);

    return () => {
      cancelled = true;
      clearTimeout(safety);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      // In multi-step flow, token comes only after WebAuthn; just return data
      return data; // { requires2FA, userId, qrCode, totpSecret, ... }
    } catch (err) {
      throw new Error(err?.response?.data?.msg || 'Invalid credentials');
    }
  };

  const verify2FA = async (userId, otpToken) => {
    try {
      const { data } = await api.post('/auth/verify-2fa', { userId, token: otpToken });
      return data; // { requiresBiometric }
    } catch (err) {
      throw new Error(err?.response?.data?.msg || 'Invalid OTP');
    }
  };

  const verifyBiometric = async (userId, biometricToken) => {
    try {
      const { data } = await api.post('/auth/verify-biometric', { userId, biometricToken });
      const authToken = data.token;
      const authUser = data.user;
      localStorage.setItem(TOKEN_KEY, authToken);
      localStorage.setItem('vitam_user', JSON.stringify(authUser));
      setUser(authUser);
      return authUser;
    } catch (err) {
      throw new Error('Biometric failed');
    }
  };

  const registerBiometrics = async (userId) => {
    try {
      const { startRegistration } = await import('@simplewebauthn/browser');
      const { data: options } = await api.post('/auth/register-options', { userId });
      const attResp = await startRegistration(options);
      const { data: verification } = await api.post('/auth/verify-registration', {
        userId,
        body: attResp
      });
      return verification.verified;
    } catch (err) {
      throw new Error(err?.response?.data?.msg || 'Biometric registration failed');
    }
  };

  const authenticateBiometrics = async (userId) => {
    try {
      const { startAuthentication } = await import('@simplewebauthn/browser');
      const { data: options } = await api.post('/auth/auth-options', { userId });
      const authResp = await startAuthentication(options);
      const { data: verification } = await api.post('/auth/verify-auth', {
        userId,
        body: authResp
      });

      if (verification.verified) {
        const authToken = verification.token;
        const authUser = verification.user;
        localStorage.setItem(TOKEN_KEY, authToken);
        localStorage.setItem('vitam_user', JSON.stringify(authUser));
        setUser(authUser);
        return authUser;
      }
      throw new Error('Authentication failed');
    } catch (err) {
      console.error('Authentication failed:', err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('vitam_user');
  };

  const completeSetup = async (userId) => {
    try {
      const { data } = await api.post('/auth/complete-setup', { userId });
      const authToken = data.token;
      const authUser = data.user;
      localStorage.setItem(TOKEN_KEY, authToken);
      localStorage.setItem('vitam_user', JSON.stringify(authUser));
      setUser(authUser);
      return authUser;
    } catch (err) {
      throw new Error(err?.response?.data?.msg || 'Failed to complete setup');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      verify2FA,
      registerBiometrics,
      authenticateBiometrics,
      verifyBiometric,
      completeSetup,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
