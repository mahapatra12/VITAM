import { safeLocalStorage } from './browserStorage';
import { getDashboardPathForUser } from './routing';
import api from './api';
import { cancelIdleTask, scheduleIdleTask } from './idleTask';
import { warmProtectedShell } from './protectedShellWarmup';
import {
  getNavigationPrefetchBudgetMs,
  shouldRunBackgroundTasks,
  shouldRunHoverPrefetch
} from './runtimeProfile';

const loadProtectedAppRoutes = () => import('../routes/ProtectedAppRoutes');
const loadAdminRouter = () => import('../components/AdminRouter');
const loadSecuritySetup = () => import('../pages/auth/SecuritySetup');
const loadChairmanDashboard = () => import('../pages/admin/ChairmanDashboard');
const loadDirectorDashboard = () => import('../pages/admin/DirectorDashboard');
const loadPrincipalDashboard = () => import('../pages/admin/PrincipalDashboard');
const loadFinanceDashboard = () => import('../pages/admin/FinanceDashboard');
const loadAdminUsers = () => import('../pages/admin/Users');
const loadAdminAnalytics = () => import('../pages/admin/Analytics');
const loadExamResults = () => import('../pages/admin/ExamResults');
const loadHodDashboard = () => import('../pages/hod/Dashboard');
const loadFacultyDashboard = () => import('../pages/faculty/Dashboard');
const loadStudentDashboard = () => import('../pages/student/Dashboard');
const loadStudentAttendance = () => import('../pages/student/Attendance');
const loadStudentCourses = () => import('../pages/student/Courses');
const loadStudentTimetable = () => import('../pages/student/Timetable');
const loadStudentAcademicScore = () => import('../pages/student/AcademicScore');
const loadStudentFees = () => import('../pages/student/Fees');
const loadStudentLibrary = () => import('../pages/student/Library');
const loadStudentPlacement = () => import('../pages/student/Placement');
const loadStudentQuizzes = () => import('../pages/student/Quizzes');
const loadStudentCertificates = () => import('../pages/student/Certificates');
const loadStudentScholarship = () => import('../pages/student/Scholarship');
const loadStudentHostel = () => import('../pages/student/Hostel');
const loadStudentFinance = () => import('../pages/student/Finance');
const loadStudentBus = () => import('../pages/student/BusSchedule');
const loadStudentSyllabus = () => import('../pages/student/Syllabus');
const loadStudentAIAssistant = () => import('../pages/student/AIAssistant');
const loadProfilePage = () => import('../pages/auth/Profile');
const loadSecurityPage = () => import('../pages/auth/SecurityHUD');
const loadTransitAdmin = () => import('../pages/admin/TransitAdmin');
const loadPlacementAdmin = () => import('../pages/admin/PlacementAdmin');
const loadPredictiveAnalytics = () => import('../pages/admin/PredictiveAnalytics');
const loadGovernance = () => import('../pages/admin/Governance');
const loadSettings = () => import('../pages/common/Settings');
const loadStaffDirectory = () => import('../pages/common/StaffDirectory');

const DASHBOARD_CACHE_MS = 30000;
const PROFILE_CACHE_MS = 20000;
const prefetchTimestamps = new Map();
const PUBLIC_APP_PATHS = new Set(['/', '/login', '/setup']);

const ROUTE_LOADERS = {
  '/setup': loadSecuritySetup,
  '/admin/dashboard': loadAdminRouter,
  '/chairman/dashboard': loadChairmanDashboard,
  '/director/dashboard': loadDirectorDashboard,
  '/admin/principal-dashboard': loadPrincipalDashboard,
  '/admin/finance-dashboard': loadFinanceDashboard,
  '/admin/users': loadAdminUsers,
  '/admin/analytics': loadAdminAnalytics,
  '/admin/exam-results': loadExamResults,
  '/admin/transit': loadTransitAdmin,
  '/admin/placement': loadPlacementAdmin,
  '/admin/predictive': loadPredictiveAnalytics,
  '/admin/governance': loadGovernance,
  '/hod/dashboard': loadHodDashboard,
  '/faculty/dashboard': loadFacultyDashboard,
  '/student/dashboard': loadStudentDashboard,
  '/student/attendance': loadStudentAttendance,
  '/student/courses': loadStudentCourses,
  '/student/timetable': loadStudentTimetable,
  '/student/grades': loadStudentAcademicScore,
  '/student/fees': loadStudentFees,
  '/student/library': loadStudentLibrary,
  '/student/placement': loadStudentPlacement,
  '/student/quizzes': loadStudentQuizzes,
  '/student/certificates': loadStudentCertificates,
  '/student/scholarship': loadStudentScholarship,
  '/student/hostel': loadStudentHostel,
  '/student/finance': loadStudentFinance,
  '/student/bus': loadStudentBus,
  '/student/syllabus': loadStudentSyllabus,
  '/student/ai-assistant': loadStudentAIAssistant,
  '/profile': loadProfilePage,
  '/security': loadSecurityPage,
  '/settings': loadSettings,
  '/directory': loadStaffDirectory
};

const COMMON_PATHS = ['/profile', '/security'];

const readStoredUser = () => {
  try {
    const raw = safeLocalStorage.getItem('vitam_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const resolveWarmUser = (options = {}) => {
  const hasExplicitUser = Object.prototype.hasOwnProperty.call(options, 'user');
  if (!hasExplicitUser) {
    return readStoredUser();
  }

  if (options.user) {
    return options.user;
  }

  if (options.pathname && !PUBLIC_APP_PATHS.has(options.pathname)) {
    return readStoredUser();
  }

  return null;
};

const runLoader = async (loader) => {
  if (typeof loader !== 'function') {
    return;
  }

  try {
    await loader();
  } catch {
    // Route prefetch should never block navigation or throw visible errors.
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getPrefetchCooldownMs = (mode) => {
  if (mode === 'navigation') return 0;
  if (mode === 'intent') return 4000;
  if (mode === 'hover') return 8000;
  return 15000;
};

const isProtectedPath = (path = '') => Boolean(path) && !PUBLIC_APP_PATHS.has(path) && path.startsWith('/');

const shouldSkipPrefetch = (path, user, mode) => {
  if (!path) {
    return true;
  }

  if (mode === 'background' && !shouldRunBackgroundTasks()) {
    return true;
  }

  if (mode === 'hover' && !shouldRunHoverPrefetch()) {
    return true;
  }

  if ((mode === 'intent' || mode === 'hover') && typeof document !== 'undefined' && document.visibilityState === 'hidden') {
    return true;
  }

  const cooldownMs = getPrefetchCooldownMs(mode);
  if (cooldownMs <= 0) {
    return false;
  }

  const identity = user?.id || user?._id || 'anonymous';
  const key = `${mode}::${identity}::${path}`;
  const lastRun = prefetchTimestamps.get(key) || 0;
  const now = Date.now();

  if ((now - lastRun) < cooldownMs) {
    return true;
  }

  prefetchTimestamps.set(key, now);
  return false;
};

const createCacheConfig = (maxAge, overrides = {}) => ({ cache: { maxAge, persist: true, ...overrides } });

const runRequestPrefetch = async (request) => {
  if (!request || typeof request.then !== 'function') {
    return;
  }

  try {
    await request;
  } catch {
    // Data prefetch should stay invisible and never block the foreground flow.
  }
};

const buildSecurityRequests = (userId) => {
  if (!userId) {
    return [];
  }

  return [
    api.get(`/auth/get-security-settings/${userId}`, createCacheConfig(PROFILE_CACHE_MS)),
    api.get(`/auth/credentials/${userId}`, createCacheConfig(PROFILE_CACHE_MS)),
    api.get(`/auth/get-identity-score/${userId}`, createCacheConfig(PROFILE_CACHE_MS))
  ];
};

const getDataPrefetcher = (path, user) => {
  const userId = user?.id || user?._id;
  const prefetchers = {
    '/admin/dashboard': () => ([
      api.get('/admin/users', { params: { limit: 50 }, ...createCacheConfig(DASHBOARD_CACHE_MS) })
    ]),
    '/admin/users': () => ([
      api.get('/admin/users', { params: { limit: 200 }, ...createCacheConfig(DASHBOARD_CACHE_MS) })
    ]),
    '/admin/finance-dashboard': () => ([
      api.get('/finance/dashboard', createCacheConfig(DASHBOARD_CACHE_MS))
    ]),
    '/faculty/dashboard': () => ([
      api.get('/faculty/dashboard', createCacheConfig(DASHBOARD_CACHE_MS))
    ]),
    '/student/dashboard': () => ([
      api.get('/student/portal', createCacheConfig(DASHBOARD_CACHE_MS))
    ]),
    '/student/courses': () => ([
      api.get('/student/portal', createCacheConfig(DASHBOARD_CACHE_MS))
    ]),
    '/student/timetable': () => ([
      api.get('/student/portal', createCacheConfig(DASHBOARD_CACHE_MS))
    ]),
    '/student/grades': () => ([
      api.get('/student/portal', createCacheConfig(DASHBOARD_CACHE_MS)),
      api.get('/student/academics', createCacheConfig(DASHBOARD_CACHE_MS))
    ]),
    '/student/fees': () => ([
      api.get('/student/portal', createCacheConfig(DASHBOARD_CACHE_MS))
    ]),
    '/student/finance': () => ([
      api.get('/student/finance', createCacheConfig(DASHBOARD_CACHE_MS))
    ]),
    '/student/bus': () => ([
      api.get('/student/bus', createCacheConfig(DASHBOARD_CACHE_MS))
    ]),
    '/student/placement': () => ([
      api.get('/student/placement', createCacheConfig(DASHBOARD_CACHE_MS))
    ]),
    '/profile': () => ([
      api.get('/auth/profile', createCacheConfig(PROFILE_CACHE_MS))
    ]),
    '/security': () => buildSecurityRequests(userId)
  };

  return prefetchers[path];
};

export const prefetchDataForPath = async (path, user) => {
  const buildRequests = getDataPrefetcher(path, user);
  const requests = typeof buildRequests === 'function' ? buildRequests() : [];
  await Promise.all(requests.map((request) => runRequestPrefetch(request)));
};

export const prefetchRoutePath = async (path, user, options = {}) => {
  const mode = options.mode || 'background';
  if (shouldSkipPrefetch(path, user, mode)) {
    return;
  }

  const loaders = [];
  if (isProtectedPath(path)) {
    loaders.push(warmProtectedShell);
    loaders.push(loadProtectedAppRoutes);
  }
  if (ROUTE_LOADERS[path]) {
    loaders.push(ROUTE_LOADERS[path]);
  }

  const task = Promise.all([
    ...loaders.map((loader) => runLoader(loader)),
    prefetchDataForPath(path, user)
  ]);

  if (mode === 'navigation') {
    await Promise.race([
      task,
      sleep(getNavigationPrefetchBudgetMs())
    ]);
    return;
  }

  await task;
};

export const prefetchRouteForUser = async (user, options = {}) => {
  if (!user) {
    return;
  }

  const dashboardPath = getDashboardPathForUser(user);
  await prefetchRoutePath(dashboardPath, user, {
    mode: options.mode || 'navigation'
  });
};

export const warmCriticalRoutes = (options = {}) => {
  const warmUser = resolveWarmUser(options);
  const currentPath = options.pathname || '';
  const isPublicPath = PUBLIC_APP_PATHS.has(currentPath);
  const dashboardPath = warmUser ? getDashboardPathForUser(warmUser) : null;
  const warmPaths = warmUser
    ? Array.from(new Set([
      ...(!isPublicPath && currentPath ? [currentPath] : []),
      ...COMMON_PATHS,
      ...(dashboardPath ? [dashboardPath] : [])
    ]))
    : [];

  if (!warmPaths.length) {
    return () => { };
  }

  const handle = scheduleIdleTask(() => {
    warmPaths.forEach((path) => {
      void prefetchRoutePath(path, warmUser, { mode: 'background' });
    });
  });

  return () => cancelIdleTask(handle);
};
