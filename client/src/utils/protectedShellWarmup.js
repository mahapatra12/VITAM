let protectedShellPromise = null;

const loadThemeProvider = () => import('../context/ThemeContext');
const loadLocalizationProvider = () => import('../context/LocalizationContext');
const loadToastProvider = () => import('../components/ui/ToastSystem');
const loadHealthProvider = () => import('../context/HealthContext');
const loadDashboardLayout = () => import('../layouts/DashboardLayout');

const SHELL_LOADERS = [
  loadThemeProvider,
  loadLocalizationProvider,
  loadToastProvider,
  loadHealthProvider,
  loadDashboardLayout
];

export const warmProtectedShell = async () => {
  if (!protectedShellPromise) {
    protectedShellPromise = Promise.allSettled(
      SHELL_LOADERS.map((loader) => loader())
    );
  }

  await protectedShellPromise;
};
