import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, Clock, AlertCircle, FileText, CheckCheck, MapPin, Search, Network, Map, Activity,
  ShieldCheck, Wallet, FileBarChart, MonitorDot, Banknote, Calendar as CalendarIcon, PieChart, Cpu, Briefcase, TrendingUp, Brain, Server, ClipboardCheck,
  Sparkles, Fingerprint, User, Terminal, X, Settings as SettingsIcon, LogOut, ChevronRight, FolderLock, Bus,
  FlaskConical, GraduationCap, BarChart2, MessageSquare, Stamp, AlertTriangle, Bell, CalendarDays,
  Command, Globe, Languages, ChevronDown, Award, Home, Target, Palette, Package, Landmark, ShieldAlert, Zap, CreditCard
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/LocalizationContext';

const Sidebar = ({ role = "ADMIN", isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLocalization();

  const currentRole = user?.role ? user.role.toUpperCase() : role.toUpperCase();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const menuItems = {
    ADMIN: [
      { name: t("dashboard"),           icon: LayoutDashboard, path: "/admin/dashboard" },
      { name: t("user_control"),         icon: Users,           path: "/admin/users" },
      { name: t("bulk_onboarding"),      icon: Database,        path: "/admin/bulk-import" },
      { name: t("risk_analytics"),       icon: ShieldCheck,     path: "/admin/analytics" },
      { name: t("system_topology"),      icon: Network,         path: "/admin/topology" },
      { name: t("exam_results"),         icon: FileText,        path: "/admin/exam-results" },
      { name: t("certificates"),         icon: Stamp,           path: "/admin/certificates" },
      { name: t("student_risk"),         icon: AlertTriangle,   path: "/admin/student-risk" },
      { name: t("scholarships"),         icon: Award,           path: "/admin/scholarships" },
      { name: t("hostel_admin"),         icon: Home,            path: "/admin/hostel" },
      { name: t("placement_hub"),        icon: Target,          path: "/admin/placement" },
      { name: t("event_manager"),        icon: CalendarIcon,    path: "/admin/events" },
      { name: t("fleet_manager"),        icon: Bus,             path: "/admin/transit" },
      { name: t("branding_center"),      icon: Palette,         path: "/admin/branding" },
      { name: t("asset_management"),     icon: Package,         path: "/admin/assets" },
      { name: t("predictive_analytics"), icon: Zap,             path: "/admin/predictive" },
      { name: t("resource_hub"),         icon: Globe,           path: "/admin/resources" },
      { name: t("governance_hub"),       icon: Landmark,        path: "/admin/governance" },
      { name: t("profile"),             icon: User,            path: "/profile" },
      { name: t("security"),            icon: Fingerprint,     path: "/security" },
    ],
    CHAIRMAN: [
      { name: t("strategic_view"), icon: LayoutDashboard, path: "/chairman/dashboard" },
      { name: t("executive_command"), icon: ShieldAlert, path: "/admin/executive" },
      { name: t("governance_hub"),    icon: Landmark,    path: "/admin/governance" },
      { name: t("branding_hub"),      icon: Palette,     path: "/admin/branding" },
      { name: t("financial_growth"),icon: TrendingUp,     path: "/chairman/finance" },
      { name: t("ai_ceo_insights"),icon: Brain,           path: "/chairman/ai" },
      { name: t("profile"),             icon: User,            path: "/profile" },
      { name: t("security"),            icon: Fingerprint,     path: "/security" },
    ],
    DIRECTOR: [
      { name: t("operational_view"),  icon: LayoutDashboard, path: "/director/dashboard" },
      { name: t("executive_command"), icon: ShieldAlert, path: "/admin/executive" },
      { name: t("resource_telemetry"),icon: Activity,        path: "/director/telemetry" },
      { name: t("faculty_analytics"), icon: Users,           path: "/director/faculty" },
      { name: t("profile"),             icon: User,            path: "/profile" },
      { name: t("security"),            icon: Fingerprint,     path: "/security" },
    ],
    HOD: [
      { name: t("dashboard"),      icon: LayoutDashboard, path: "/hod/dashboard" },
      { name: t("faculty_list"),   icon: Users,           path: "/hod/faculty" },
      { name: t("course_matrix"),  icon: BookOpen,        path: "/hod/courses" },
      { name: t("research"),       icon: FlaskConical,    path: "/hod/research" },
      { name: t("student_risk"),   icon: Brain,           path: "/admin/student-risk" },
      { name: t("profile"),             icon: User,            path: "/profile" },
      { name: t("security"),            icon: Fingerprint,     path: "/security" },
    ],
    ALUMNI: [
      { name: t("global_hub"),  icon: LayoutDashboard, path: "/alumni/dashboard" },
      { name: t("career_portal"),icon: Briefcase,       path: "/alumni/jobs" },
      { name: t("profile"),             icon: User,            path: "/profile" },
      { name: t("security"),            icon: Fingerprint,     path: "/security" },
    ],
    PARENT: [
      { name: t("ward_monitor"), icon: LayoutDashboard, path: "/parent/dashboard" },
      { name: t("profile"),             icon: User,            path: "/profile" },
      { name: t("security"),            icon: Fingerprint,     path: "/security" },
    ],
    FACULTY: [
      { name: t("dashboard"),     icon: LayoutDashboard,  path: "/faculty/dashboard" },
      { name: t("assignments"),   icon: ClipboardCheck,   path: "/faculty/assignments" },
      { name: t("syllabus_monitor"), icon: BookOpen,        path: "/faculty/syllabus" },
      { name: t("research_bureau"),  icon: FlaskConical,    path: "/faculty/research" },
      { name: t("attendance"),       icon: Clock,           path: "/faculty/attendance" },
      { name: t("mark_attendance"),icon: CheckCheck,      path: "/faculty/attendance" },
      { name: t("leave_requests"),icon: CalendarDays,     path: "/leave" },
      { name: t("quiz_engine"),   icon: FileText,         path: "/faculty/quiz" },
      { name: t("profile"),             icon: User,            path: "/profile" },
      { name: t("security"),            icon: Fingerprint,     path: "/security" },
    ],
    STUDENT: [
      {
        category: t("academic"),
        items: [
          { name: t("dashboard"),     icon: LayoutDashboard, path: "/student/dashboard" },
          { name: t("attendance"),    icon: Activity,        path: "/student/attendance" },
          { name: t("syllabus"),      icon: BookOpen,        path: "/student/syllabus" },
          { name: t("time_table"),    icon: CalendarIcon,    path: "/student/timetable" },
          { name: t("academic_score"),icon: TrendingUp,      path: "/student/academic-score" },
          { name: t("quizzes"),       icon: ClipboardCheck,  path: "/student/quizzes" },
          { name: t("support"),         icon: ShieldCheck, path: "/support" },
          { name: t("events_clubs"),  icon: Zap,         path: "/events" },
          { name: t("digital_id"),      icon: CreditCard,  path: "/id-card" },
          { name: t("transit"),         icon: Bus,         path: "/transit" },
        ]
      },
      {
        category: t("services"),
        items: [
          { name: t("fees_dues"),     icon: Wallet,       path: "/student/finance" },
          { name: t("library"),         icon: BookOpen,     path: "/student/library" },
          { name: t("certificates"),    icon: FileText,     path: "/student/certificates" },
          { name: t("scholarships"),    icon: Award,        path: "/student/scholarships" },
          { name: t("hostel_life"),     icon: Home,         path: "/student/hostel" },
          { name: t("placement_cell"),  icon: Briefcase,    path: "/student/placement" },
          { name: t("bus_schedule"),    icon: Bus,          path: "/student/bus-schedule" },
        ]
      },
      {
        category: t("personal"),
        items: [
          { name: t("profile"),       icon: User,        path: "/profile" },
          { name: t("security"),      icon: Fingerprint, path: "/security" },
          { name: t("ai_assistant"),  icon: Brain,       path: "/student/ai-assistant" },
        ]
      }
    ],
  };

  const displayName = user?.name || 'Vitam Scholar';
  const displayRole = user?.role ? user.role.toUpperCase() : role.toUpperCase();
  const displaySubRole = user?.subRole && user.subRole !== 'none' ? user.subRole.toUpperCase() : '';

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={`w-64 h-screen bg-[#020202] border-r border-white/5 flex flex-col p-6 fixed left-0 top-0 z-[60] transition-transform duration-500 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        <button
          onClick={onClose}
          className="lg:hidden absolute top-6 right-6 p-2 text-white/30 hover:text-white transition-all"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-4 mb-14 px-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.4)] relative overflow-hidden group cursor-pointer">
             <Sparkles className="text-white relative z-10 transition-transform group-hover:scale-125 group-hover:rotate-12" size={24} />
             <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
             />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white leading-none">VITAM</h1>
            <div className="flex items-center gap-2 mt-1">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
               <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                 {displayRole === 'ADMIN' && displaySubRole ? displaySubRole : displayRole} {t("core")}
               </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto scrollbar-hide py-4 font-['Outfit']">
          {currentRole === "STUDENT" ? (
            menuItems[currentRole].map((section) => (
              <div key={section.category} className="space-y-3">
                <p className="px-4 text-[9px] font-black text-white/20 uppercase tracking-[0.3em] font-['Inter']">{section.category}</p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          navigate(item.path);
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${
                          isActive
                          ? "bg-white/5 border border-white/10 shadow-lg"
                          : "text-white/30 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3 relative z-10">
                          <item.icon size={18} className={`${isActive ? "text-blue-500" : "group-hover:text-white transition-colors"}`} />
                          <span className={`font-bold text-[11px] tracking-tight ${isActive ? "text-white" : ""}`}>{item.name}</span>
                        </div>
                        {isActive && (
                          <motion.div
                            layoutId="activeTabIndicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-full"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            (menuItems[currentRole] || []).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group relative overflow-hidden ${
                    isActive
                    ? "bg-white/5 border border-white/10 shadow-2xl"
                    : "text-white/30 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <item.icon size={20} className={`${isActive ? "text-blue-500" : "group-hover:text-white transition-colors"}`} />
                    <span className={`font-black text-[11px] uppercase tracking-widest ${isActive ? "text-white" : ""}`}>{item.name}</span>
                  </div>
                  <ChevronRight size={14} className={`relative z-10 transition-all ${isActive ? "text-blue-500 translate-x-0" : "opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0"}`} />
                  {isActive && (
                    <motion.div
                      layoutId="activeTabSidebar"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-full"
                    />
                  )}
                </button>
              );
            })
          )}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
           {/* Language Selector */}
          <div className="flex items-center gap-2 bg-white/5 rounded-2xl p-2 border border-white/5">
             <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Globe size={16} />
             </div>
             <div className="flex-1 flex gap-1">
                {['EN', 'OR', 'HI'].map(l => (
                  <button key={l} onClick={() => setLang(l)}
                    className={`flex-1 py-1 rounded-lg text-[9px] font-black transition-all ${lang === l ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                    {l}
                  </button>
                ))}
             </div>
          </div>

          <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group hover:bg-indigo-500 hover:text-white transition-all">
             <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-white/20"><Search size={18}/></div>
             <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-inherit">{t("omni_search")}</p>
                <p className="text-[8px] font-black uppercase opacity-60">Ctrl + K</p>
             </div>
          </button>

          <button onClick={logout} className="w-full flex items-center justify-between p-4 rounded-3xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all border border-red-500/20 group">
            <span className="text-[10px] font-black uppercase tracking-widest">{t('logout')}</span>
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
