import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5100/api';
export const SOCKET_URL = API_BASE.replace('/api', '');

const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
});

// Automatically attach JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vitam_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock data for offline/mock mode fallback
export const MOCK_DATA = {
  admin: {
    totalStudents: '1,284',
    activeFaculty: '84',
    atRiskStudents: '12',
    enrollmentGrowth: '15%',
  },
  hod: {
    totalFaculty: '24',
    totalStudents: '840',
    courseCompletion: '92%',
  },
  faculty: {
    allocatedCourses: '4',
    totalStudents: '120',
    attendanceAvg: '88%',
    pendingGrading: '18',
  },
  student: {
    cgpa: '3.74',
    attendance: '94%',
    nextTarget: 'Sem 6',
    classesToday: '4',
  },
};

export default api;
