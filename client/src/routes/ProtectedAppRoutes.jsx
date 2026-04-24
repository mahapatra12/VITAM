import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import lazySimple from '../utils/lazySimple';

const AdminRouter = lazySimple(() => import('../components/AdminRouter'));
const ChairmanDashboard = lazySimple(() => import('../pages/admin/ChairmanDashboard'));
const DirectorDashboard = lazySimple(() => import('../pages/admin/DirectorDashboard'));
const PrincipalDashboard = lazySimple(() => import('../pages/admin/PrincipalDashboard'));
const FinanceDashboard = lazySimple(() => import('../pages/admin/FinanceDashboard'));
const AdminUsers = lazySimple(() => import('../pages/admin/Users'));
const AdminAnalytics = lazySimple(() => import('../pages/admin/Analytics'));
const ExamResults = lazySimple(() => import('../pages/admin/ExamResults'));
const HodDashboard = lazySimple(() => import('../pages/hod/Dashboard'));
const FacultyDashboard = lazySimple(() => import('../pages/faculty/Dashboard'));
const StudentDashboard = lazySimple(() => import('../pages/student/Dashboard'));
const StudentAttendance = lazySimple(() => import('../pages/student/Attendance'));
const StudentCourses = lazySimple(() => import('../pages/student/Courses'));
const StudentTimetable = lazySimple(() => import('../pages/student/Timetable'));
const StudentAcademicScore = lazySimple(() => import('../pages/student/AcademicScore'));
const StudentFees = lazySimple(() => import('../pages/student/Fees'));
const StudentLibrary = lazySimple(() => import('../pages/student/Library'));
const StudentPlacement = lazySimple(() => import('../pages/student/Placement'));
const StudentQuizzes = lazySimple(() => import('../pages/student/Quizzes'));
const StudentCertificates = lazySimple(() => import('../pages/student/Certificates'));
const StudentScholarship = lazySimple(() => import('../pages/student/Scholarship'));
const StudentHostel = lazySimple(() => import('../pages/student/Hostel'));
const StudentFinance = lazySimple(() => import('../pages/student/Finance'));
const StudentBusSchedule = lazySimple(() => import('../pages/student/BusSchedule'));
const StudentSyllabus = lazySimple(() => import('../pages/student/Syllabus'));
const StudentAIAssistant = lazySimple(() => import('../pages/student/AIAssistant'));
const StudentProfilePage = lazySimple(() => import('../pages/student/Profile'));
const ProfilePage = lazySimple(() => import('../pages/auth/Profile'));
const SecurityPage = lazySimple(() => import('../pages/auth/SecurityHUD'));
const TransitAdmin = lazySimple(() => import('../pages/admin/TransitAdmin'));
const PlacementAdmin = lazySimple(() => import('../pages/admin/PlacementAdmin'));
const PredictiveAnalytics = lazySimple(() => import('../pages/admin/PredictiveAnalytics'));
const Governance = lazySimple(() => import('../pages/admin/Governance'));
const Settings = lazySimple(() => import('../pages/common/Settings'));
const StaffDirectory = lazySimple(() => import('../pages/common/StaffDirectory'));
const NotFound = lazySimple(() => import('../pages/common/NotFound'));

const withProtection = (element) => (
  <ProtectedRoute>
    {element}
  </ProtectedRoute>
);

export default function ProtectedAppRoutes() {
  return (
    <Routes>
      <Route path="/admin/dashboard" element={withProtection(<AdminRouter />)} />
      <Route path="/chairman/dashboard" element={withProtection(<ChairmanDashboard />)} />
      <Route path="/director/dashboard" element={withProtection(<DirectorDashboard />)} />
      <Route path="/admin/principal-dashboard" element={withProtection(<PrincipalDashboard />)} />
      <Route path="/admin/finance-dashboard" element={withProtection(<FinanceDashboard />)} />
      <Route path="/admin/users" element={withProtection(<AdminUsers />)} />
      <Route path="/admin/analytics" element={withProtection(<AdminAnalytics />)} />
      <Route path="/admin/exam-results" element={withProtection(<ExamResults />)} />
      <Route path="/admin/transit" element={withProtection(<TransitAdmin />)} />
      <Route path="/admin/placement" element={withProtection(<PlacementAdmin />)} />
      <Route path="/admin/predictive" element={withProtection(<PredictiveAnalytics />)} />
      <Route path="/admin/governance" element={withProtection(<Governance />)} />
      <Route path="/hod/dashboard" element={withProtection(<HodDashboard />)} />
      <Route path="/faculty/dashboard" element={withProtection(<FacultyDashboard />)} />
      <Route path="/student/dashboard" element={withProtection(<StudentDashboard />)} />
      <Route path="/student/attendance" element={withProtection(<StudentAttendance />)} />
      <Route path="/student/courses" element={withProtection(<StudentCourses />)} />
      <Route path="/student/timetable" element={withProtection(<StudentTimetable />)} />
      <Route path="/student/grades" element={withProtection(<StudentAcademicScore />)} />
      <Route path="/student/fees" element={withProtection(<StudentFees />)} />
      <Route path="/student/library" element={withProtection(<StudentLibrary />)} />
      <Route path="/student/placement" element={withProtection(<StudentPlacement />)} />
      <Route path="/student/quizzes" element={withProtection(<StudentQuizzes />)} />
      <Route path="/student/certificates" element={withProtection(<StudentCertificates />)} />
      <Route path="/student/scholarship" element={withProtection(<StudentScholarship />)} />
      <Route path="/student/hostel" element={withProtection(<StudentHostel />)} />
      <Route path="/student/finance" element={withProtection(<StudentFinance />)} />
      <Route path="/student/bus" element={withProtection(<StudentBusSchedule />)} />
      <Route path="/student/syllabus" element={withProtection(<StudentSyllabus />)} />
      <Route path="/student/ai-assistant" element={withProtection(<StudentAIAssistant />)} />
      <Route path="/student/profile" element={withProtection(<StudentProfilePage />)} />
      <Route path="/profile" element={withProtection(<ProfilePage />)} />
      <Route path="/security" element={withProtection(<SecurityPage />)} />
      <Route path="/directory" element={withProtection(<StaffDirectory />)} />
      <Route path="/settings" element={withProtection(<Settings />)} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
