export const normalizeRole = (value) => String(value || '').toLowerCase();

export const getEffectiveRole = (user) => {
  const role = normalizeRole(user?.role);
  const subRole = normalizeRole(user?.subRole);

  if (['admin', 'superadmin'].includes(role)) {
    if (subRole === 'hod') return 'hod';
    if (subRole === 'finance') return 'finance';
    if (subRole === 'principal') return 'principal';
    if (subRole === 'vice_principal') return 'vice_principal';
  }

  // Normalize uppercase enum values stored in MongoDB (FACULTY, STUDENT)
  if (role === 'faculty') return 'faculty';
  if (role === 'student') return 'student';

  return role;
};

export const getDashboardPathForUser = (user) => {
  const role = getEffectiveRole(user);

  switch (role) {
    case 'chairman':
      return '/chairman/dashboard';
    case 'director':
      return '/director/dashboard';
    case 'principal':
      return '/admin/principal-dashboard';
    case 'vice_principal':
      return '/admin/principal-dashboard';
    case 'finance':
      return '/admin/finance-dashboard';
    case 'admin':
    case 'superadmin':
      return '/admin/dashboard';
    case 'hod':
      return '/hod/dashboard';
    // Handle uppercase variants stored in MongoDB enum
    case 'faculty':
      return '/faculty/dashboard';
    case 'student':
      return '/student/dashboard';
    case 'alumni':
      return '/alumni/dashboard';
    case 'parent':
      return '/parent/dashboard';
    default: {
      // Last-resort: inspect raw role for uppercase variants
      const raw = String(user?.role || '').toLowerCase();
      if (raw === 'faculty') return '/faculty/dashboard';
      if (raw === 'student') return '/student/dashboard';
      if (raw === 'admin' || raw === 'superadmin') return '/admin/dashboard';
      if (raw === 'chairman') return '/chairman/dashboard';
      if (raw === 'director') return '/director/dashboard';
      // Final safe fallback — do NOT return /login here to prevent redirect loops
      return '/student/dashboard';
    }
  }
};

const matchesPathPrefix = (pathname, prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`);

const canUseExecutiveCommand = (user) => {
  const role = normalizeRole(user?.role);
  return ['admin', 'superadmin', 'chairman', 'director'].includes(role);
};

const canUseGovernancePages = (user) => {
  const role = normalizeRole(user?.role);
  return ['admin', 'superadmin', 'chairman'].includes(role);
};

const canUseAnalyticsPages = (user) => {
  const role = normalizeRole(user?.role);
  return ['admin', 'superadmin', 'director'].includes(role);
};

const canUseResourcePages = (user) => {
  const role = normalizeRole(user?.role);
  return ['admin', 'superadmin', 'chairman', 'director'].includes(role);
};

const canUsePredictivePages = (user) => {
  const role = normalizeRole(user?.role);
  return ['admin', 'superadmin', 'chairman'].includes(role);
};

const canUseStudentRiskPages = (user) => {
  const role = normalizeRole(user?.role);
  const subRole = normalizeRole(user?.subRole);
  return ['admin', 'superadmin'].includes(role) || role === 'hod' || subRole === 'hod';
};

const sharedPathMatchers = [
  {
    path: '/admin/executive',
    allow: canUseExecutiveCommand,
  },
  {
    path: '/admin/governance',
    allow: canUseGovernancePages,
  },
  {
    path: '/admin/branding',
    allow: canUseGovernancePages,
  },
  {
    path: '/admin/resources',
    allow: canUseResourcePages,
  },
  {
    path: '/admin/analytics',
    allow: canUseAnalyticsPages,
  },
  {
    path: '/admin/predictive',
    allow: canUsePredictivePages,
  },
  {
    path: '/admin/student-risk',
    allow: canUseStudentRiskPages,
  },
];

const pathMatchers = [
  {
    prefix: '/admin',
    allow: (user) => ['admin', 'superadmin'].includes(normalizeRole(user?.role)),
  },
  {
    prefix: '/chairman',
    allow: (user) => normalizeRole(user?.role) === 'chairman',
  },
  {
    prefix: '/director',
    allow: (user) => normalizeRole(user?.role) === 'director',
  },
  {
    prefix: '/hod',
    allow: (user) => ['admin', 'superadmin'].includes(normalizeRole(user?.role)) && normalizeRole(user?.subRole) === 'hod',
  },
  {
    prefix: '/faculty',
    allow: (user) => ['faculty', 'FACULTY'].includes(user?.role) || normalizeRole(user?.role) === 'faculty',
  },
  {
    prefix: '/student',
    allow: (user) => ['student', 'STUDENT'].includes(user?.role) || normalizeRole(user?.role) === 'student',
  },
  {
    prefix: '/alumni',
    allow: (user) => normalizeRole(user?.role) === 'alumni',
  },
  {
    prefix: '/parent',
    allow: (user) => normalizeRole(user?.role) === 'parent',
  },
];

export const canAccessPath = (user, pathname = '/') => {
  const role = normalizeRole(user?.role);
  const subRole = normalizeRole(user?.subRole);

  const sharedMatcher = sharedPathMatchers.find(({ path }) => matchesPathPrefix(pathname, path));
  if (sharedMatcher) {
    return sharedMatcher.allow(user);
  }

  // Allow specialized sub-roles (HOD, Principal, Finance) to access /admin if they are effectively admins
  if (pathname.startsWith('/admin') && subRole !== 'none' && role === 'admin') {
    return true;
  }

  const matcher = pathMatchers.find(({ prefix }) => matchesPathPrefix(pathname, prefix));
  if (!matcher) return true;
  return matcher.allow(user);
};
