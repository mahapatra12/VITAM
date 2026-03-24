import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/Login';
import SecuritySetup from './pages/auth/SecuritySetup';
import AdminDashboard from './pages/admin/Dashboard';
import AdminRouter from './components/AdminRouter';
import ChairmanDashboard from './pages/admin/ChairmanDashboard';
import DirectorDashboard from './pages/admin/DirectorDashboard';
import AdminUsers from './pages/admin/Users';
import AdminAnalytics from './pages/admin/Analytics';
import SystemTopology from './pages/admin/SystemTopology';
import HodDashboard from './pages/hod/Dashboard';
import HodFaculty from './pages/hod/FacultyList';
import HodCourses from './pages/hod/CourseMatrix';
import HodResearch from './pages/hod/Research';
import ExamResults from './pages/admin/ExamResults';
import CertificateAdmin from './pages/admin/CertificateAdmin';
import StudentRiskAnalytics from './pages/admin/StudentRiskAnalytics';
import ScholarshipAdmin from './pages/admin/ScholarshipAdmin';
import HostelAdmin from './pages/admin/HostelAdmin';
import PlacementAdmin from './pages/admin/PlacementAdmin';
import EventAdmin from './pages/admin/EventAdmin';
import TransitAdmin from './pages/admin/TransitAdmin';
import ExecutiveCommand from './pages/admin/ExecutiveCommand';
import ThemeSettings from './pages/admin/ThemeSettings';
import AssetManagement from './pages/admin/AssetManagement';
import PredictiveAnalytics from './pages/admin/PredictiveAnalytics';
import ResourceOptimization from './pages/admin/ResourceOptimization';
import Governance from './pages/admin/Governance';
import FacultyDashboard from './pages/faculty/Dashboard';
import ResearchBureau from './pages/faculty/ResearchBureau';
import FacultyAssignments from './pages/faculty/Assignments';
import FacultyStudents from './pages/faculty/Students';
import FacultyTimetable from './pages/faculty/Timetable';
import FacultyAttendance from './pages/faculty/AttendanceMark';
import Announcements from './pages/common/Announcements';
import LeaveManagement from './pages/common/LeaveManagement';
import StudentLibrary from './pages/student/Library';
import FacultyQuiz from './pages/faculty/QuizBuilder';
import StudentQuizzes from './pages/student/Quizzes';
import StudentCertificates from './pages/student/Certificates';
import StaffDirectory from './pages/common/StaffDirectory';
import StudentScholarship from './pages/student/Scholarship';
import StudentHostel from './pages/student/Hostel';
import StudentPlacement from './pages/student/Placement';
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/auth/Profile';
import StudentSecurity from './pages/auth/Security';
import StudentAttendance from './pages/student/Attendance';
import StudentSyllabus from './pages/student/Syllabus';
import StudentTimetable from './pages/student/Timetable';
import StudentAcademicScore from './pages/student/AcademicScore';
import StudentBus from './pages/student/BusSchedule';
import StudentAI from './pages/student/AIAssistant';
import DigitalID from './pages/common/DigitalID';
import EventsHub from './pages/common/Events';
import TransitService from './pages/common/Transit';
import StudentFinance from './pages/student/Finance';
import SecurityPage from './pages/auth/Security';
import ProfilePage from './pages/auth/Profile';
import CommandHub from './components/CommandHub';
import VITABot from './components/VITABot';
import ProtectedRoute from './components/ProtectedRoute';
import PagePlaceholder from './pages/PagePlaceholder';

import { AuthProvider, useAuth } from './context/AuthContext';
import { LocalizationProvider } from './context/LocalizationContext';
import { ToastProvider } from './components/ui/ToastSystem';
import { ThemeProvider } from './context/ThemeContext';
import Settings from './pages/common/Settings';
import Calendar from './pages/common/Calendar';
import AlumniDashboard from './pages/alumni/AlumniDashboard';
import AlumniJobs from './pages/alumni/Jobs';
import ParentDashboard from './pages/parent/Dashboard';
import LiveTelemetry from './components/ui/LiveTelemetry';
import GlobalGamification from './components/ui/GlobalGamification';
import Landing from './pages/public/Landing';
import Vault from './pages/common/Vault';
import CampusMap from './pages/common/CampusMap';
import AnalyticsHub from './pages/common/AnalyticsHub';
import NotFound from './pages/common/NotFound';
import Grievance from './pages/common/Grievance';

function AppContent() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-black text-slate-200 selection:bg-blue-500/30">
      {/* {loading && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px]">Institutional Node Initializing...</p>
        </div>
      )} */}
      <CommandHub />
      <VITABot />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={<SecuritySetup />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin/topology" element={<ProtectedRoute><SystemTopology /></ProtectedRoute>} />
        <Route path="/admin/exam-results" element={<ProtectedRoute><ExamResults /></ProtectedRoute>} />
        
        {/* Super Admin Routes */}
        <Route path="/chairman/dashboard" element={<ProtectedRoute><ChairmanDashboard /></ProtectedRoute>} />
        <Route path="/director/dashboard" element={<ProtectedRoute><DirectorDashboard /></ProtectedRoute>} />
        
        {/* HOD Routes */}
        <Route path="/hod/dashboard" element={<ProtectedRoute><HodDashboard /></ProtectedRoute>} />
        <Route path="/hod/faculty" element={<ProtectedRoute><HodFaculty /></ProtectedRoute>} />
        <Route path="/hod/courses" element={<ProtectedRoute><HodCourses /></ProtectedRoute>} />
        <Route path="/hod/research" element={<ProtectedRoute><HodResearch /></ProtectedRoute>} />
        
        {/* Faculty Routes */}
        <Route path="/faculty/dashboard" element={<ProtectedRoute><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/faculty/assignments" element={<ProtectedRoute><FacultyAssignments /></ProtectedRoute>} />
        <Route path="/faculty/students" element={<ProtectedRoute><FacultyStudents /></ProtectedRoute>} />
        <Route path="/faculty/timetable" element={<ProtectedRoute><FacultyTimetable /></ProtectedRoute>} />
        <Route path="/faculty/attendance" element={<ProtectedRoute><FacultyAttendance /></ProtectedRoute>} />
        
        {/* Global Hub Routes */}
        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><CampusMap /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsHub /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/vault" element={<ProtectedRoute><Vault /></ProtectedRoute>} />
        
        {/* Student Routes */}
        <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/student/security" element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} />
        <Route path="/student/attendance" element={<ProtectedRoute><StudentAttendance /></ProtectedRoute>} />
        <Route path="/student/syllabus" element={<ProtectedRoute><StudentSyllabus /></ProtectedRoute>} />
        <Route path="/student/timetable" element={<ProtectedRoute><StudentTimetable /></ProtectedRoute>} />
        <Route path="/student/academic-score" element={<ProtectedRoute><StudentAcademicScore /></ProtectedRoute>} />
        <Route path="/student/bus-schedule" element={<ProtectedRoute><StudentBus /></ProtectedRoute>} />
        <Route path="/student/ai-assistant" element={<ProtectedRoute><StudentAI /></ProtectedRoute>} />

        {/* Alumni Routes */}
        <Route path="/alumni/dashboard" element={<ProtectedRoute><AlumniDashboard /></ProtectedRoute>} />
        <Route path="/alumni/jobs" element={<ProtectedRoute><AlumniJobs /></ProtectedRoute>} />
        
        <Route path="/parent/dashboard" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />

        <Route path="/student/placement" element={<ProtectedRoute><StudentPlacement /></ProtectedRoute>} />
        <Route path="/student/finance" element={<ProtectedRoute><StudentFinance /></ProtectedRoute>} />
        
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/security" element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} />
        <Route path="/grievance" element={<ProtectedRoute><Grievance /></ProtectedRoute>} />
        <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
        <Route path="/leave" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
        <Route path="/student/library" element={<ProtectedRoute><StudentLibrary /></ProtectedRoute>} />
        <Route path="/faculty/quiz" element={<ProtectedRoute><FacultyQuiz /></ProtectedRoute>} />
        <Route path="/student/quizzes" element={<ProtectedRoute><StudentQuizzes /></ProtectedRoute>} />
        <Route path="/student/certificates" element={<ProtectedRoute><StudentCertificates /></ProtectedRoute>} />
        <Route path="/directory" element={<ProtectedRoute><StaffDirectory /></ProtectedRoute>} />
        <Route path="/admin/certificates" element={<ProtectedRoute><CertificateAdmin /></ProtectedRoute>} />
        <Route path="/admin/student-risk" element={<ProtectedRoute><StudentRiskAnalytics /></ProtectedRoute>} />
        <Route path="/admin/scholarships" element={<ProtectedRoute><ScholarshipAdmin /></ProtectedRoute>} />
        <Route path="/admin/hostel" element={<ProtectedRoute><HostelAdmin /></ProtectedRoute>} />
        <Route path="/admin/placement" element={<ProtectedRoute><PlacementAdmin /></ProtectedRoute>} />
        <Route path="/admin/events" element={<ProtectedRoute><EventAdmin /></ProtectedRoute>} />
        <Route path="/admin/transit" element={<ProtectedRoute><TransitAdmin /></ProtectedRoute>} />
        <Route path="/admin/executive" element={<ProtectedRoute><ExecutiveCommand /></ProtectedRoute>} />
        <Route path="/admin/assets" element={<ProtectedRoute><AssetManagement /></ProtectedRoute>} />
        <Route path="/admin/predictive" element={<ProtectedRoute><PredictiveAnalytics /></ProtectedRoute>} />
        <Route path="/admin/resources" element={<ProtectedRoute><ResourceOptimization /></ProtectedRoute>} />
        <Route path="/admin/branding" element={<ProtectedRoute><ThemeSettings /></ProtectedRoute>} />
        <Route path="/admin/governance" element={<ProtectedRoute><Governance /></ProtectedRoute>} />
        <Route path="/faculty/research" element={<ProtectedRoute><ResearchBureau /></ProtectedRoute>} />
        <Route path="/id-card" element={<ProtectedRoute><DigitalID /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><EventsHub /></ProtectedRoute>} />
        <Route path="/transit" element={<ProtectedRoute><TransitService /></ProtectedRoute>} />
        <Route path="/student/scholarships" element={<ProtectedRoute><StudentScholarship /></ProtectedRoute>} />
        <Route path="/student/hostel" element={<ProtectedRoute><StudentHostel /></ProtectedRoute>} />
        
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <GlobalGamification />
      <LiveTelemetry />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <LocalizationProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </LocalizationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
