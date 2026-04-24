import { getDashboardPathForUser } from './routing';
import { warmProtectedShell } from './protectedShellWarmup';

const loadProtectedAppRoutes = () => import('../routes/ProtectedAppRoutes');
const loadSecuritySetup = () => import('../pages/auth/SecuritySetup');
const loadAdminRouter = () => import('../components/AdminRouter');
const loadChairmanDashboard = () => import('../pages/admin/ChairmanDashboard');
const loadDirectorDashboard = () => import('../pages/admin/DirectorDashboard');
const loadPrincipalDashboard = () => import('../pages/admin/PrincipalDashboard');
const loadFinanceDashboard = () => import('../pages/admin/FinanceDashboard');
const loadHodDashboard = () => import('../pages/hod/Dashboard');
const loadFacultyDashboard = () => import('../pages/faculty/Dashboard');
const loadStudentDashboard = () => import('../pages/student/Dashboard');

const AUTH_ROUTE_LOADERS = {
  '/setup': [loadSecuritySetup],
  '/admin/dashboard': [loadProtectedAppRoutes, loadAdminRouter],
  '/chairman/dashboard': [loadProtectedAppRoutes, loadChairmanDashboard],
  '/director/dashboard': [loadProtectedAppRoutes, loadDirectorDashboard],
  '/admin/principal-dashboard': [loadProtectedAppRoutes, loadPrincipalDashboard],
  '/admin/finance-dashboard': [loadProtectedAppRoutes, loadFinanceDashboard],
  '/hod/dashboard': [loadProtectedAppRoutes, loadHodDashboard],
  '/faculty/dashboard': [loadProtectedAppRoutes, loadFacultyDashboard],
  '/student/dashboard': [loadProtectedAppRoutes, loadStudentDashboard]
};

const runLoader = async (loader) => {
  if (typeof loader !== 'function') {
    return;
  }

  try {
    await loader();
  } catch {
    // Auth-transition preloads should stay silent.
  }
};

const warmRouteLoaders = async (path) => {
  const loaders = AUTH_ROUTE_LOADERS[path] || [];
  await Promise.all(loaders.map((loader) => runLoader(loader)));
};

export const prefetchSetupRoute = async () => {
  await warmRouteLoaders('/setup');
};

export const prefetchPostAuthRouteForUser = async (user) => {
  if (!user) {
    return;
  }

  const path = getDashboardPathForUser(user);
  await Promise.all([
    warmProtectedShell(),
    warmRouteLoaders(path)
  ]);

  try {
    const { prefetchDataForPath } = await import('./routePrefetch');
    await prefetchDataForPath(path, user);
  } catch {
    // Keep auth handoff resilient even if background data warmup fails.
  }
};
