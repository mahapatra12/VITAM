const PORTAL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const STUDENT_PORTAL_DAYS = PORTAL_DAYS;

export const DEFAULT_TIMETABLE = {
  Monday: [
    { time: '09:00 - 10:00', subject: 'Database Management Systems', room: 'A-301', faculty: 'Dr. Kavita Rao' },
    { time: '10:15 - 11:15', subject: 'Operating Systems', room: 'B-205', faculty: 'Prof. Nikhil Verma' },
    { time: '11:45 - 13:15', subject: 'DBMS Lab', room: 'Lab-3', faculty: 'Academic Lab Team' }
  ],
  Tuesday: [
    { time: '09:00 - 10:00', subject: 'Computer Networks', room: 'A-102', faculty: 'Dr. Maria Thomas' },
    { time: '10:15 - 11:15', subject: 'Software Engineering', room: 'B-301', faculty: 'Prof. Arvind Menon' },
    { time: '14:00 - 16:00', subject: 'Networks Lab', room: 'Lab-1', faculty: 'Academic Lab Team' }
  ],
  Wednesday: [
    { time: '09:00 - 10:00', subject: 'Probability and Statistics', room: 'C-201', faculty: 'Dr. Shruti Das' },
    { time: '10:15 - 11:15', subject: 'Database Management Systems', room: 'A-301', faculty: 'Dr. Kavita Rao' },
    { time: '11:45 - 12:45', subject: 'Operating Systems', room: 'B-205', faculty: 'Prof. Nikhil Verma' }
  ],
  Thursday: [
    { time: '09:00 - 10:00', subject: 'Computer Networks', room: 'A-102', faculty: 'Dr. Maria Thomas' },
    { time: '10:15 - 11:15', subject: 'Software Engineering', room: 'B-301', faculty: 'Prof. Arvind Menon' },
    { time: '14:00 - 16:00', subject: 'Operating Systems Lab', room: 'Lab-2', faculty: 'Academic Lab Team' }
  ],
  Friday: [
    { time: '09:00 - 10:00', subject: 'Probability and Statistics', room: 'C-201', faculty: 'Dr. Shruti Das' },
    { time: '10:15 - 11:15', subject: 'Seminar and Mentoring', room: 'Auditorium', faculty: 'Mentoring Cell' }
  ]
};

export const DEFAULT_COURSES = [
  { code: 'CS301', name: 'Database Management Systems', credits: 4, attendance: 92, grade: 'A', faculty: 'Dr. Kavita Rao' },
  { code: 'CS302', name: 'Operating Systems', credits: 4, attendance: 88, grade: 'A-', faculty: 'Prof. Nikhil Verma' },
  { code: 'CS303', name: 'Computer Networks', credits: 3, attendance: 95, grade: 'A+', faculty: 'Dr. Maria Thomas' },
  { code: 'CS304', name: 'Software Engineering', credits: 3, attendance: 85, grade: 'B+', faculty: 'Prof. Arvind Menon' },
  { code: 'MA301', name: 'Probability and Statistics', credits: 3, attendance: 90, grade: 'A', faculty: 'Dr. Shruti Das' }
];

export const DEFAULT_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Mid-Semester Assessments Window',
    date: 'April 24, 2026',
    type: 'exam',
    content: 'Assessment slots open from April 24 to April 29. Confirm hall allocation from the academic office dashboard.'
  },
  {
    id: 2,
    title: 'Industry Workshop: Full-Stack Systems',
    date: 'April 22, 2026',
    type: 'event',
    content: 'Hands-on workshop with engineering mentors from product teams. Registration closes after 120 seats.'
  },
  {
    id: 3,
    title: 'Extended Library Research Hours',
    date: 'April 20, 2026',
    type: 'notice',
    content: 'The library research wing will remain open until 11:30 PM throughout evaluation week.'
  }
];

export const DEFAULT_ASSIGNMENTS = [
  { course: 'DBMS', title: 'Query Optimization Workbook', due: 'April 23, 2026', status: 'pending' },
  { course: 'OS', title: 'Process Scheduling Simulation', due: 'April 25, 2026', status: 'submitted' },
  { course: 'Networks', title: 'Protocol Trace Analysis', due: 'April 26, 2026', status: 'pending' },
  { course: 'SE', title: 'Requirements Documentation', due: 'April 21, 2026', status: 'graded', grade: 'A' }
];

export const DEFAULT_FINANCE = {
  total: 125000,
  paid: 85000,
  pending: 40000,
  dueDate: 'April 30, 2026',
  breakdown: [
    { item: 'Tuition Fee', amount: 90000 },
    { item: 'Hostel Fee', amount: 25000 },
    { item: 'Library Fee', amount: 5000 },
    { item: 'Lab Fee', amount: 5000 }
  ],
  receipts: []
};

export const DEFAULT_PORTAL_DATA = {
  name: 'Verified Academic Identity',
  attendance: '92%',
  cgpa: '8.82',
  completion: '74%',
  rank: '12',
  announcements: DEFAULT_ANNOUNCEMENTS,
  timetable: DEFAULT_TIMETABLE,
  today: 'Monday',
  courses: DEFAULT_COURSES,
  assignments: DEFAULT_ASSIGNMENTS,
  finance: DEFAULT_FINANCE,
  profile: {
    institutionalId: 'VTM-S-2026-942',
    program: 'B.Tech Computer Science',
    semesterLabel: '6th Semester',
    branch: 'Computer Science',
    placementReadiness: '94.2%'
  },
  aiCoach: 'Academic insight: your consistency remains strong. Prioritize algorithmic revision, stay ahead on lab submissions, and reserve one focused session for placement aptitude practice this week.'
};

export const getCurrentPortalDay = () => {
  const weekday = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  return PORTAL_DAYS.includes(weekday) ? weekday : 'Monday';
};

const parseSingleTime = (value) => {
  const normalized = String(value || '').trim().toUpperCase();
  if (!normalized) {
    return null;
  }

  const match = normalized.match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/);
  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3];

  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  }
  if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  return (hours * 60) + minutes;
};

const parseTimeRange = (range) => {
  const [startRaw, endRaw] = String(range || '').split('-').map((part) => part.trim());
  const start = parseSingleTime(startRaw);
  const end = parseSingleTime(endRaw);

  if (start == null || end == null) {
    return null;
  }

  return { start, end };
};

export const buildTimetableStatus = (slot, day, now = new Date()) => {
  const today = getCurrentPortalDay();
  const dayIndex = PORTAL_DAYS.indexOf(day);
  const todayIndex = PORTAL_DAYS.indexOf(today);

  if (dayIndex === -1 || todayIndex === -1) {
    return 'Standby';
  }

  if (dayIndex < todayIndex) {
    return 'Completed';
  }

  if (dayIndex > todayIndex) {
    return 'Standby';
  }

  const parsedRange = parseTimeRange(slot?.time);
  if (!parsedRange) {
    return 'Standby';
  }

  const nowMinutes = (now.getHours() * 60) + now.getMinutes();
  if (nowMinutes >= parsedRange.end) {
    return 'Completed';
  }
  if (nowMinutes >= parsedRange.start && nowMinutes < parsedRange.end) {
    return 'In Session';
  }

  return 'Standby';
};

export const enrichTimetableForDay = (day, slots = [], now = new Date()) => (
  (Array.isArray(slots) ? slots : []).map((slot) => ({
    ...slot,
    status: buildTimetableStatus(slot, day, now)
  }))
);

export const normalizeTimetable = (timetable = {}) => {
  const nextTimetable = { ...DEFAULT_TIMETABLE };
  Object.entries(timetable || {}).forEach(([day, classes]) => {
    if (!Object.prototype.hasOwnProperty.call(nextTimetable, day)) {
      return;
    }

    nextTimetable[day] = Array.isArray(classes) && classes.length > 0
      ? classes.map((classItem) => ({
          time: classItem.time || '09:00 - 10:00',
          subject: classItem.subject || 'General Session',
          room: classItem.room || 'Main Block',
          faculty: classItem.faculty || 'Academic Office'
        }))
      : DEFAULT_TIMETABLE[day];
  });

  return nextTimetable;
};

export const normalizeCourses = (courses = []) => {
  if (!Array.isArray(courses) || courses.length === 0) {
    return DEFAULT_COURSES;
  }

  return courses.map((course, index) => ({
    code: course.code || `SUB${index + 1}`,
    name: course.name || `Subject ${index + 1}`,
    credits: Number(course.credits) || (index < 2 ? 4 : 3),
    attendance: Number(course.attendance) || 82,
    grade: course.grade || 'B+',
    faculty: course.faculty || 'Academic Office'
  }));
};

export const normalizeAnnouncements = (announcements = []) => {
  if (!Array.isArray(announcements) || announcements.length === 0) {
    return DEFAULT_ANNOUNCEMENTS;
  }

  return announcements.map((announcement, index) => ({
    id: announcement.id || index + 1,
    title: announcement.title || 'Institutional update',
    date: announcement.date || 'April 20, 2026',
    type: announcement.type || 'notice',
    content: announcement.content || 'Review the latest notice in the student portal.'
  }));
};

export const normalizeAssignments = (assignments = []) => {
  if (!Array.isArray(assignments) || assignments.length === 0) {
    return DEFAULT_ASSIGNMENTS;
  }

  return assignments.map((assignment) => ({
    course: assignment.course || 'GEN',
    title: assignment.title || 'Course activity',
    due: assignment.due || 'April 30, 2026',
    status: assignment.status || 'pending',
    grade: assignment.grade || ''
  }));
};

export const normalizeFinance = (finance = {}) => {
  const total = Number(finance.total) || DEFAULT_FINANCE.total;
  const paid = Number(finance.paid) || DEFAULT_FINANCE.paid;
  const pending = Math.max(0, Number(finance.pending ?? finance.due) || Math.max(0, total - paid));

  return {
    total,
    paid,
    pending,
    dueDate: finance.dueDate || DEFAULT_FINANCE.dueDate,
    breakdown: Array.isArray(finance.breakdown) && finance.breakdown.length > 0 ? finance.breakdown : DEFAULT_FINANCE.breakdown,
    receipts: Array.isArray(finance.receipts) ? finance.receipts : DEFAULT_FINANCE.receipts
  };
};

export const normalizePortalData = (payload = {}) => {
  const normalizedCourses = normalizeCourses(payload.courses);

  return {
    name: payload.name || DEFAULT_PORTAL_DATA.name,
    attendance: String(payload.attendance || DEFAULT_PORTAL_DATA.attendance),
    cgpa: String(payload.cgpa || DEFAULT_PORTAL_DATA.cgpa),
    completion: String(payload.completion || DEFAULT_PORTAL_DATA.completion),
    rank: String(payload.rank || DEFAULT_PORTAL_DATA.rank),
    announcements: normalizeAnnouncements(payload.announcements),
    timetable: normalizeTimetable(payload.timetable),
    today: payload.today || getCurrentPortalDay(),
    courses: normalizedCourses,
    assignments: normalizeAssignments(payload.assignments),
    finance: normalizeFinance(payload.finance),
    profile: {
      institutionalId: payload.profile?.institutionalId || DEFAULT_PORTAL_DATA.profile.institutionalId,
      program: payload.profile?.program || DEFAULT_PORTAL_DATA.profile.program,
      semesterLabel: payload.profile?.semesterLabel || DEFAULT_PORTAL_DATA.profile.semesterLabel,
      branch: payload.profile?.branch || DEFAULT_PORTAL_DATA.profile.branch,
      placementReadiness: payload.profile?.placementReadiness || DEFAULT_PORTAL_DATA.profile.placementReadiness
    },
    aiCoach: payload.aiCoach || DEFAULT_PORTAL_DATA.aiCoach,
    coursesCount: normalizedCourses.length
  };
};

const gradeWeightMap = {
  'A+': 96,
  A: 90,
  'A-': 84,
  'B+': 78,
  B: 72,
  C: 60,
  D: 45
};

export const buildCourseProgress = (course) => {
  const attendance = Number(course?.attendance) || 0;
  const gradeWeight = gradeWeightMap[String(course?.grade || '').toUpperCase()] || 65;
  return Math.max(20, Math.min(100, Math.round((attendance * 0.6) + (gradeWeight * 0.4))));
};

export const buildCourseFocus = (course) => {
  const attendance = Number(course?.attendance) || 0;
  const grade = String(course?.grade || '');

  if (attendance >= 92 && /A\+?|S/i.test(grade)) {
    return 'High-momentum revision and advanced practice';
  }
  if (attendance < 80) {
    return 'Attendance stabilization and concept recovery';
  }
  if (/B\+?|B|C/i.test(grade)) {
    return 'Targeted reinforcement for upcoming evaluations';
  }
  return 'Steady reinforcement and guided practice';
};

export const buildCourseResources = (course) => [
  `${course.name} lecture deck`,
  `${course.code} revision notes`,
  `${course.name} practice set`,
  `${course.name} faculty handout`,
  `${course.code} assessment archive`
];

export const findCourseNextLecture = (course, timetable) => {
  const courseName = String(course?.name || '').toLowerCase();
  const allSlots = Object.entries(timetable || {}).flatMap(([day, slots]) =>
    (Array.isArray(slots) ? slots : []).map((slot) => ({ ...slot, day }))
  );

  const matchedSlot = allSlots.find((slot) => {
    const slotSubject = String(slot.subject || '').toLowerCase();
    return slotSubject.includes(courseName) || courseName.includes(slotSubject);
  });

  if (!matchedSlot) {
    return 'See timetable workspace';
  }

  return `${matchedSlot.day} · ${matchedSlot.time}`;
};

export const buildFinanceLedger = (finance) => {
  const normalizedFinance = normalizeFinance(finance);
  let paidRemaining = normalizedFinance.paid;
  const receipts = [...normalizedFinance.receipts];

  return normalizedFinance.breakdown.map((item, index) => {
    const isPaid = paidRemaining >= item.amount;
    if (isPaid) {
      paidRemaining -= item.amount;
    }

    return {
      id: `TXN-${String(index + 1).padStart(3, '0')}`,
      date: ['12 Mar 2026', '01 Mar 2026', '15 Aug 2025', '10 Aug 2025', '12 Jun 2026', '20 Jan 2025'][index] || '12 Mar 2026',
      desc: item.item,
      amount: item.amount,
      status: isPaid ? 'Paid' : 'Due',
      receipt: isPaid ? (receipts[index] || `REC-${String(index + 1).padStart(3, '0')}`) : null,
      dueDate: isPaid ? null : normalizedFinance.dueDate
    };
  });
};
