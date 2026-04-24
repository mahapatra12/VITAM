const debugBiometrics = import.meta.env.VITE_DEBUG_BIOMETRICS === 'true';

export const startBiometricEnrollment = async (userId) => {
  // Prototype: Use WebAuthn API to create a credential
  if (!window.PublicKeyCredential) {
    if (debugBiometrics) {
      console.error("Biometric authentication not supported.");
    }
    return null;
  }
  
  // This is a simplified mock of what a real WebAuthn enrollment would look like
  if (debugBiometrics) {
    console.log("Starting biometric enrollment for user:", userId);
  }
  return "mock-biometric-id-12345";
};

export const verifyBiometric = async (userId) => {
  // Prototype: Simulate a biometric verification delay
  return new Promise((resolve) => {
    setTimeout(() => {
      if (debugBiometrics) {
        console.log("Biometric verified for user:", userId);
      }
      resolve(true);
    }, 1500);
  });
};
