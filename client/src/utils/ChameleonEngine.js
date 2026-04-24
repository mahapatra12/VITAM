/**
 * Chameleon Engine: Institutional Dynamic Color Scaling
 * Shifts the platform primary colors based on the Security Integrity Score.
 */
export const getInstitutionalColors = (score) => {
  if (score >= 95) {
     return {
       primary: '#2563eb', // Azure (Fortified)
       secondary: '#10b981', // Emerald (Optimal)
       glow: 'rgba(37, 99, 235, 0.4)',
       status: 'Fortified'
     };
  }
  if (score >= 80) {
     return {
       primary: '#06b6d4', // Cyan (Secure)
       secondary: '#3b82f6', // Blue (Stable)
       glow: 'rgba(6, 182, 212, 0.3)',
       status: 'Secure'
     };
  }
  if (score >= 60) {
     return {
       primary: '#f59e0b', // Amber (Warning)
       secondary: '#ef4444', // Red (Pressure)
       glow: 'rgba(245, 158, 11, 0.3)',
       status: 'Vulnerable'
     };
  }
  return {
    primary: '#ef4444', // Crimson (CRITICAL)
    secondary: '#7f1d1d', // Dark Red (Failure)
    glow: 'rgba(239, 68, 68, 0.5)',
    status: 'COMPROMISED'
  };
};

export const applyInstitutionalTheme = (score) => {
   const colors = getInstitutionalColors(score);
   document.documentElement.style.setProperty('--sentinel-primary', colors.primary);
   document.documentElement.style.setProperty('--sentinel-secondary', colors.secondary);
   document.documentElement.style.setProperty('--sentinel-glow', colors.glow);
   return colors;
};
