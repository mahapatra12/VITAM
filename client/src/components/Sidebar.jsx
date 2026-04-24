import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  Award,
  BookOpen,
  Brain,
  Bus,
  CreditCard,
  FileText,
  Fingerprint,
  FlaskConical,
  Landmark,
  LayoutDashboard,
  LogOut,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  User,
  Users,
  X,
  Zap,
  ClipboardCheck,
  CalendarDays,
  Banknote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';
import { canAccessPath, getEffectiveRole } from '../utils/routing';
import { prefetchRoutePath } from '../utils/routePrefetch';
import { announceNavigationStart } from '../utils/navigationSignals';

const isPathActive = (pathname, path) => pathname === path || pathname.startsWith(`${path}/`);

const Sidebar = ({ role = 'ADMIN', isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { lang, t } = useLocalization();

  const currentRole = (user ? getEffectiveRole(user) : role).toUpperCase();
  const roleLabel = currentRole === 'ADMIN' && user?.subRole && user.subRole !== 'none'
    ? user.subRole.replace(/_/g, ' ').toUpperCase()
    : currentRole;

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const preparePath = (path, mode = 'hover') => {
    void prefetchRoutePath(path, user, { mode });
  };

  const menuItems = {
    ADMIN: [
      { name: t('dashboard'), icon: LayoutDashboard, path: '/admin/dashboard' },
      { name: t('user_control'), icon: Users, path: '/admin/users' },
      { name: t('risk_analytics'), icon: ShieldCheck, path: '/admin/analytics' },
      { name: t('exam_results'), icon: FileText, path: '/admin/exam-results' },
      { name: t('placement_hub'), icon: Target, path: '/admin/placement' },
      { name: t('fleet_manager'), icon: Bus, path: '/admin/transit' },
      { name: t('predictive_analytics'), icon: Zap, path: '/admin/predictive' },
      { name: t('governance_hub'), icon: Landmark, path: '/admin/governance' },
      { name: t('profile'), icon: User, path: '/profile' },
      { name: t('security'), icon: Fingerprint, path: '/security' }
    ],
    CHAIRMAN: [
      { name: t('strategic_view'), icon: LayoutDashboard, path: '/chairman/dashboard' },
      { name: t('executive_command'), icon: ShieldAlert, path: '/admin/executive' },
      { name: t('governance_hub'), icon: Landmark, path: '/admin/governance' },
      { name: t('ai_ceo_insights'), icon: Brain, path: '/admin/predictive' },
      { name: t('profile'), icon: User, path: '/profile' },
      { name: t('security'), icon: Fingerprint, path: '/security' }
    ],
    DIRECTOR: [
      { name: t('operational_view'), icon: LayoutDashboard, path: '/director/dashboard' },
      { name: t('executive_command'), icon: ShieldAlert, path: '/admin/executive' },
      { name: t('resource_telemetry'), icon: Activity, path: '/admin/resources' },
      { name: t('profile'), icon: User, path: '/profile' },
      { name: t('security'), icon: Fingerprint, path: '/security' }
    ],
    HOD: [
      { name: t('dashboard'), icon: LayoutDashboard, path: '/hod/dashboard' },
      { name: t('faculty_list'), icon: Users, path: '/hod/faculty' },
      { name: t('course_matrix'), icon: BookOpen, path: '/hod/courses' },
      { name: t('research'), icon: FlaskConical, path: '/hod/research' },
      { name: t('profile'), icon: User, path: '/profile' },
      { name: t('security'), icon: Fingerprint, path: '/security' }
    ],
    PRINCIPAL: [
      { name: t('institutional_audit'), icon: LayoutDashboard, path: '/admin/principal-dashboard' },
      { name: t('system_security'), icon: Shield, path: '/admin/immune' },
      { name: t('user_control'), icon: Users, path: '/admin/users' },
      { name: t('profile'), icon: User, path: '/profile' },
      { name: t('security'), icon: Fingerprint, path: '/security' }
    ],
    VICE_PRINCIPAL: [
      { name: t('institutional_audit'), icon: LayoutDashboard, path: '/admin/principal-dashboard' },
      { name: t('exam_results'), icon: FileText, path: '/admin/exam-results' },
      { name: t('profile'), icon: User, path: '/profile' },
      { name: t('security'), icon: Fingerprint, path: '/security' }
    ],
    FINANCE: [
      { name: t('financial_dashboard'), icon: LayoutDashboard, path: '/admin/finance-dashboard' },
      { name: t('payment_tracking'), icon: Banknote, path: '/admin/bulk-import' },
      { name: t('scholarships'), icon: Award, path: '/admin/scholarships' },
      { name: t('profile'), icon: User, path: '/profile' },
      { name: t('security'), icon: Fingerprint, path: '/security' }
    ],
    FACULTY: [
      { name: t('dashboard'), icon: LayoutDashboard, path: '/faculty/dashboard' },
      { name: t('assignments'), icon: ClipboardCheck, path: '/faculty/assignments' },
      { name: t('time_table'), icon: CalendarDays, path: '/faculty/timetable' },
      { name: t('profile'), icon: User, path: '/profile' },
      { name: t('security'), icon: Fingerprint, path: '/security' }
    ],
    ALUMNI: [
      { name: t('dashboard'), icon: LayoutDashboard, path: '/alumni/dashboard' },
      { name: t('profile'), icon: User, path: '/profile' },
      { name: t('security'), icon: Fingerprint, path: '/security' }
    ],
    PARENT: [
      { name: t('dashboard'), icon: LayoutDashboard, path: '/parent/dashboard' },
      { name: t('profile'), icon: User, path: '/profile' },
      { name: t('security'), icon: Fingerprint, path: '/security' }
    ],
    STUDENT: [
      {
        category: t('academic'),
        items: [
          { name: t('dashboard'), icon: LayoutDashboard, path: '/student/dashboard' },
          { name: t('attendance'), icon: Activity, path: '/student/attendance' },
          { name: 'Courses', icon: BookOpen, path: '/student/courses' },
          { name: t('time_table'), icon: CalendarDays, path: '/student/timetable' },
          { name: t('syllabus'), icon: BookOpen, path: '/student/syllabus' },
          { name: 'Grades', icon: Award, path: '/student/grades' }
        ]
      },
      {
        category: 'Student services',
        items: [
          { name: 'Fees', icon: CreditCard, path: '/student/fees' },
          { name: 'Finance', icon: Banknote, path: '/student/finance' },
          { name: 'Library', icon: BookOpen, path: '/student/library' },
          { name: 'Hostel', icon: ShieldCheck, path: '/student/hostel' },
          { name: 'Transport', icon: Bus, path: '/student/bus' },
          { name: 'Certificates', icon: FileText, path: '/student/certificates' }
        ]
      },
      {
        category: 'Growth',
        items: [
          { name: 'Placement', icon: Target, path: '/student/placement' },
          { name: 'Quizzes', icon: ClipboardCheck, path: '/student/quizzes' },
          { name: 'Scholarship', icon: Award, path: '/student/scholarship' },
          { name: t('profile'), icon: User, path: '/profile' },
          { name: t('security'), icon: Fingerprint, path: '/security' },
          { name: t('ai_assistant'), icon: Brain, path: '/student/ai-assistant' }
        ]
      }
    ]
  };

  const filteredMenu = useMemo(() => {
    if (currentRole === 'STUDENT') {
      return (menuItems[currentRole] || [])
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => canAccessPath(user, item.path))
        }))
        .filter((section) => section.items.length > 0);
    }
    return (menuItems[currentRole] || []).filter((item) => canAccessPath(user, item.path));
  }, [currentRole, lang, user]);

  const goToPath = (path) => {
    if (!path || isPathActive(location.pathname, path)) {
      if (window.innerWidth < 1024) onClose();
      return;
    }

    announceNavigationStart({ path, source: 'sidebar' });
    void prefetchRoutePath(path, user, { mode: 'navigation' });
    navigate(path);
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-md lg:hidden"
          />
        )}
      </AnimatePresence>
      <aside className={`fixed inset-y-0 left-0 z-[60] w-[18rem] transition-all duration-500 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-[#0f2027]/80 backdrop-blur-3xl border-r border-white/5" />
        <div className="relative flex h-full flex-col px-6 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00c6ff] to-[#0072ff] flex items-center justify-center shadow-lg shadow-[#00c6ff]/20">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">VITAM</h2>
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-300">Campus Portal</p>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden text-white/40 hover:text-white"><X size={20}/></button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-8">
            <nav className="space-y-2">
              {currentRole === 'STUDENT' ? (
                filteredMenu.map(section => (
                  <div key={section.category} className="space-y-3">
                    <p className="px-4 text-[9px] font-black uppercase tracking-[0.4em] text-white/20">{section.category}</p>
                    {section.items.map(item => (
                      <button
                        key={item.path}
                        onClick={() => goToPath(item.path)}
                        onMouseEnter={() => preparePath(item.path, 'hover')}
                        onFocus={() => preparePath(item.path, 'intent')}
                        onTouchStart={() => preparePath(item.path, 'intent')}
                        className={`sidebar-link ${isPathActive(location.pathname, item.path) ? 'active' : ''}`}
                      >
                        <item.icon size={18} />
                        <span className="text-[11px] font-bold uppercase tracking-widest">{item.name}</span>
                      </button>
                    ))}
                  </div>
                ))
              ) : (
                filteredMenu.map(item => (
                  <button
                    key={item.path}
                    onClick={() => goToPath(item.path)}
                    onMouseEnter={() => preparePath(item.path, 'hover')}
                    onFocus={() => preparePath(item.path, 'intent')}
                    onTouchStart={() => preparePath(item.path, 'intent')}
                    className={`sidebar-link ${isPathActive(location.pathname, item.path) ? 'active' : ''}`}
                  >
                    <item.icon size={18} />
                    <span className="text-[11px] font-bold uppercase tracking-widest">{item.name}</span>
                  </button>
                ))
              )}
            </nav>
          </div>

          <div className="mt-auto pt-8 border-t border-white/5">
            <div className="glass-card bg-white/[0.03] p-4 mb-6">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#00c6ff]/20 flex items-center justify-center text-[#00c6ff]"><User size={14}/></div>
                  <div className="min-w-0">
                     <p className="text-[11px] font-bold text-white truncate">{user?.name}</p>
                     <p className="text-[9px] font-black uppercase text-[#00c6ff]/60 tracking-wider font-mono">{roleLabel}</p>
                  </div>
               </div>
            </div>
            <button onClick={handleSignOut} className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-xs font-black uppercase tracking-widest">
              Logout <LogOut size={16}/>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
