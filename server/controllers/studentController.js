const Student = require("../models/Student");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Notice = require("../models/Notice");
const Timetable = require("../models/Timetable");
const Result = require("../models/Result");
const Syllabus = require("../models/Syllabus");
const Placement = require("../models/Placement");
const Fee = require("../models/Fee");
const Bus = require("../models/Bus");
const { normalizeImageUrl } = require("../utils/mediaConfig");
const { respondWithServerError } = require("../utils/respondWithServerError");

const allowDemoFallbacks = () => (
    process.env.MOCK_MODE === "true" ||
    process.env.ALLOW_DEMO_FALLBACKS === "true" ||
    process.env.NODE_ENV !== "production"
);

const dashboardFallback = (req) => ({
    degraded: true,
    name: req.user ? req.user.name : "Vitam Scholar",
    attendance: 87,
    notices: [
        { _id: "1", title: "Semester Exams Postponed", content: "The final exams for Semester 4 have been moved to next week.", date: new Date(), type: "alert" },
        { _id: "2", title: "Hackathon Registration Open", content: "Join the VITAM Tech Hackathon 2026. Register now!", date: new Date(), type: "sync" }
    ],
    nextClass: "Software Engineering - 10:00 AM",
    faculty: "Dr. Arvind Rao",
    semesterProgress: 65,
    gpaTrend: [7.8, 8.1, 8.42],
    projectedGPA: 8.55,
    upcomingEvents: [
        { id: 1, title: "Mini Project Submission", time: "Tomorrow, 11:59 PM", type: "deadlines" },
        { id: 1, title: "Tech Quiz 02", time: "Fri, 02:00 PM", type: "academic" },
        { id: 1, title: "Guest Lecture: AI Ethics", time: "Sat, 10:00 AM", type: "events" }
    ]
});

const academicsFallback = {
    degraded: true,
    results: [
        {
            semester: 3,
            subjects: [
                { name: "Software Engineering", internal: 28, lab: 18, viva: 9, semesterMarks: 85 },
                { name: "Computer Networks", internal: 25, lab: 19, viva: 10, semesterMarks: 90 },
                { name: "Operating Systems", internal: 22, lab: 15, viva: 8, semesterMarks: 72 }
            ]
        }
    ],
    syllabus: [
        { name: "Software Engineering", materials: ["SE_V1.pdf", "Agile_intro.docx"] },
        { name: "Computer Networks", materials: ["TCP_IP.pdf"] }
    ]
};

const financeFallback = {
    degraded: true,
    total: 120000,
    paid: 80000,
    due: 40000,
    receipts: []
};

const busFallback = [
    { _id: "1", route: "Rout-A (City Center)", time: "08:00 AM", driver: "Rajesh Kumar", status: "On Time" },
    { _id: "2", route: "Route-B (Scholar's Park)", time: "08:15 AM", driver: "Suresh Singh", status: "Delayed" }
];

const PORTAL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const portalCoursesFallback = [
    { code: "CS301", name: "Database Management Systems", credits: 4, attendance: 92, grade: "A", faculty: "Dr. Kavita Rao" },
    { code: "CS302", name: "Operating Systems", credits: 4, attendance: 88, grade: "A-", faculty: "Prof. Nikhil Verma" },
    { code: "CS303", name: "Computer Networks", credits: 3, attendance: 95, grade: "A+", faculty: "Dr. Maria Thomas" },
    { code: "CS304", name: "Software Engineering", credits: 3, attendance: 85, grade: "B+", faculty: "Prof. Arvind Menon" },
    { code: "MA301", name: "Probability and Statistics", credits: 3, attendance: 90, grade: "A", faculty: "Dr. Shruti Das" }
];

const portalAssignmentsFallback = [
    { course: "DBMS", title: "Query Optimization Workbook", due: "April 23, 2026", status: "pending" },
    { course: "OS", title: "Process Scheduling Simulation", due: "April 25, 2026", status: "submitted" },
    { course: "Networks", title: "Protocol Trace Analysis", due: "April 26, 2026", status: "pending" },
    { course: "SE", title: "Requirements Documentation", due: "April 21, 2026", status: "graded", grade: "A" }
];

const portalFinanceBreakdown = (total = 125000) => {
    const safeTotal = Math.max(0, Number(total) || 125000);
    return [
        { item: "Tuition Fee", amount: Math.round(safeTotal * 0.72) },
        { item: "Hostel Fee", amount: Math.round(safeTotal * 0.2) },
        { item: "Library Fee", amount: Math.round(safeTotal * 0.04) },
        { item: "Lab Fee", amount: safeTotal - Math.round(safeTotal * 0.72) - Math.round(safeTotal * 0.2) - Math.round(safeTotal * 0.04) }
    ];
};

const formatLongDate = (value) => {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
        return "April 20, 2026";
    }

    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
};

const formatShortCode = (branch, index) => {
    const initials = String(branch || "CS")
        .split(/[\s/&-]+/)
        .map((part) => String(part || "").trim().charAt(0))
        .join("")
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 3) || "SUB";

    return `${initials}${301 + index}`;
};

const marksToGrade = (score = 0) => {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B+";
    if (score >= 60) return "B";
    if (score >= 50) return "C";
    return "D";
};

const normalizeAttendance = (value, fallback = 82) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
        return fallback;
    }

    return Math.max(0, Math.min(100, Math.round(numeric)));
};

const mapNoticeType = (type) => {
    if (type === "alert") return "exam";
    if (type === "sync") return "event";
    return "notice";
};

const getCurrentPortalDay = () => {
    const day = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return PORTAL_DAYS.includes(day) ? day : "Monday";
};

const buildTimetableMap = (entries = []) => {
    const timetable = PORTAL_DAYS.reduce((accumulator, day) => {
        accumulator[day] = [];
        return accumulator;
    }, {});

    entries.forEach((entry) => {
        if (!entry?.day || !PORTAL_DAYS.includes(entry.day)) {
            return;
        }

        timetable[entry.day] = Array.isArray(entry.slots)
            ? entry.slots.map((slot) => ({
                time: slot.time || "09:00 - 10:00",
                subject: slot.subject || "General Session",
                room: slot.room || "Main Block",
                faculty: slot.faculty || "Academic Office"
            }))
            : [];
    });

    return timetable;
};

const buildPortalCourses = ({ student, results, attendance }) => {
    const latestResult = Array.isArray(results) && results.length > 0
        ? [...results].sort((left, right) => Number(right.semester || 0) - Number(left.semester || 0))[0]
        : null;

    if (!latestResult?.subjects?.length) {
        return portalCoursesFallback.map((course) => ({
            ...course,
            attendance: normalizeAttendance(course.attendance, attendance)
        }));
    }

    const fallbackAttendance = normalizeAttendance(student?.attendancePercentage, attendance);

    return latestResult.subjects.map((subject, index) => {
        const numericScore = Number(subject?.semesterMarks || subject?.internal || 0);
        return {
            code: formatShortCode(student?.branch, index),
            name: subject?.name || `Subject ${index + 1}`,
            credits: index < 2 ? 4 : 3,
            attendance: normalizeAttendance(fallbackAttendance - index * 2, fallbackAttendance),
            grade: marksToGrade(numericScore),
            faculty: "Academic Office",
            score: numericScore
        };
    });
};

const buildPortalFinance = (fee) => {
    const total = Number(fee?.total) || 125000;
    const paid = Number(fee?.paid) || 0;
    const pending = Math.max(0, Number(fee?.due ?? (total - paid)) || 0);

    return {
        total,
        paid,
        pending,
        dueDate: "April 30, 2026",
        breakdown: portalFinanceBreakdown(total),
        receipts: Array.isArray(fee?.receipts) ? fee.receipts : []
    };
};

const buildPortalAnnouncements = (notices = []) => {
    if (!Array.isArray(notices) || notices.length === 0) {
        return [
            {
                id: 1,
                title: "Semester Orientation",
                date: "April 20, 2026",
                type: "notice",
                content: "Welcome to the active academic cycle. Review your timetable and assignment lane from the dashboard."
            }
        ];
    }

    return notices.slice(0, 4).map((notice, index) => ({
        id: notice._id || notice.id || index + 1,
        title: notice.title || "Institution Update",
        date: formatLongDate(notice.date),
        type: mapNoticeType(notice.type),
        content: notice.content || "Review this update in the institution notice center."
    }));
};

const buildPortalFallback = (req) => ({
    degraded: true,
    name: req.user ? req.user.name : "Vitam Scholar",
    attendance: "87%",
    cgpa: "8.55",
    completion: "65%",
    rank: "12",
    announcements: [
        {
            id: 1,
            title: "Semester Exams Postponed",
            date: formatLongDate(new Date()),
            type: "exam",
            content: "The current assessment window has been moved by one week. Review updated slot allocation soon."
        },
        {
            id: 2,
            title: "Hackathon Registration Open",
            date: formatLongDate(new Date()),
            type: "event",
            content: "Join the VITAM Tech Hackathon 2026. Register now from the student innovation workspace."
        }
    ],
    timetable: buildTimetableMap([]),
    courses: portalCoursesFallback,
    assignments: portalAssignmentsFallback,
    finance: buildPortalFinance(financeFallback),
    profile: {
        institutionalId: "VTM-S-2026-942",
        program: "B.Tech Computer Science",
        semesterLabel: "6th Semester",
        branch: "Computer Science",
        placementReadiness: "94.2%"
    },
    aiCoach: "Academic insight: your momentum is stable. Focus on algorithmic revision and keep assignment cadence steady this week."
});

const getStudentPortalSnapshot = async (req) => {
    const studentId = req.user.id;
    if (studentId.includes("mock")) {
        throw new Error("Mock ID");
    }

    const student = await Student.findOne({ userId: studentId }).lean();
    if (!student) {
        if (allowDemoFallbacks()) {
            return buildPortalFallback(req);
        }

        const missingStudentError = new Error("Student profile not found");
        missingStudentError.status = 404;
        throw missingStudentError;
    }

    const today = getCurrentPortalDay();

    const [attendanceRows, notices, timetableEntries, results, fee] = await Promise.all([
        Attendance.aggregate([
            { $match: { studentId: req.user.id } },
            { $group: { _id: null, percentage: { $avg: { $cond: ["$present", 100, 0] } } } }
        ]),
        Notice.find().sort({ date: -1 }).limit(5).lean(),
        Timetable.find({ branch: student.branch, semester: student.semester }).lean(),
        Result.find({ studentId: req.user.id }).sort({ semester: -1 }).lean(),
        Fee.findOne({ studentId: req.user.id }).lean()
    ]);

    const attendanceValue = normalizeAttendance(
        attendanceRows && attendanceRows[0] ? attendanceRows[0].percentage : student.attendancePercentage,
        82
    );
    const courses = buildPortalCourses({
        student,
        results,
        attendance: attendanceValue
    });
    const timetable = buildTimetableMap(timetableEntries);
    const todayClasses = timetable[today] && timetable[today].length > 0 ? timetable[today] : (buildPortalFallback(req).timetable[today] || []);
    const finance = buildPortalFinance(fee);
    const cgpaValue = Number(student.cgpa) > 0
        ? Number(student.cgpa)
        : (results[0]?.subjects?.length
            ? Math.min(10, Number((results[0].subjects.reduce((sum, subject) => sum + Number(subject.semesterMarks || 0), 0) / results[0].subjects.length / 10).toFixed(2)))
            : 8.55);
    const completionValue = Math.max(20, Math.min(100, Math.round((Number(student.semester || 1) / 8) * 100)));

    return {
        name: req.user ? req.user.name : "Vitam Scholar",
        attendance: `${attendanceValue}%`,
        cgpa: cgpaValue.toFixed(2),
        completion: `${completionValue}%`,
        rank: cgpaValue >= 9 ? "4" : cgpaValue >= 8.5 ? "12" : cgpaValue >= 8 ? "24" : "48",
        announcements: buildPortalAnnouncements(notices),
        timetable,
        courses,
        assignments: portalAssignmentsFallback,
        finance,
        profile: {
            institutionalId: student.rollNo || student.registrationNo || student.enrollmentNumber || "VTM-S-2026-942",
            program: student.branch ? `B.Tech ${student.branch}` : "B.Tech Computer Science",
            semesterLabel: `${student.semester || 6}${student.semester === 1 ? "st" : student.semester === 2 ? "nd" : student.semester === 3 ? "rd" : "th"} Semester`,
            branch: student.branch || "Computer Science",
            placementReadiness: cgpaValue >= 8.5 ? "94.2%" : cgpaValue >= 8 ? "88.0%" : "80.5%"
        },
        aiCoach: cgpaValue >= 8.5
            ? "Academic insight: momentum is strong. Focus on revision depth, timed problem-solving, and placement aptitude consistency."
            : "Academic insight: stabilize coursework this week, prioritize pending submissions, and use focused study windows to recover momentum."
    };
};

exports.getPortalSnapshot = async (req, res) => {
    try {
        const snapshot = await getStudentPortalSnapshot(req);
        res.json(snapshot);
    } catch (err) {
        console.error("getPortalSnapshot error:", err);
        if (allowDemoFallbacks()) {
            return res.json(buildPortalFallback(req));
        }

        if (err?.status === 404) {
            return res.status(404).json({ msg: "Student profile not found" });
        }

        return respondWithServerError(req, res, err, {
            logLabel: "Get Student Portal Snapshot Error",
            msg: "Unable to load the student portal right now"
        });
    }
};

exports.getDashboard = async (req, res) => {
    try {
        const studentId = req.user.id;
        if (studentId.includes("mock")) throw new Error("Mock ID");
        const student = await Student.findOne({ userId: studentId });
        
        if (!student) {
            if (allowDemoFallbacks()) {
                return res.json(dashboardFallback(req));
            }
            return res.status(404).json({ msg: "Student profile not found" });
        }

        // Attendance aggregate
        const attendance = await Attendance.aggregate([
            { $match: { studentId: req.user.id } },
            { $group: { _id: null, percentage: { $avg: { $cond: ["$present", 100, 0] } } } }
        ]);

        const notices = await Notice.find().sort({ date: -1 }).limit(5);

        // Get upcoming class (simplified: first class of today after current time)
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = days[new Date().getDay()];
        const timetable = await Timetable.findOne({ branch: student.branch, semester: student.semester, day: today });
        
        let nextClass = null;
        if (timetable && timetable.slots.length > 0) {
            // In a real app, we'd compare time strings. Here we just take the first one for the demo.
            nextClass = timetable.slots[0];
        }

        res.json({
            name: req.user ? req.user.name : "Vitam Scholar",
            attendance: attendance && attendance[0] ? Math.round(attendance[0].percentage) : 82, 
            notices: notices && notices.length > 0 ? notices : [
                { _id: "1", title: "Semester Orientation", content: "Welcome to the new academic session. Orientation is on Monday.", date: new Date(), type: "sync" }
            ],
            nextClass: nextClass ? `${nextClass.subject} - ${nextClass.time}` : "Software Engineering - 10:00 AM",
            faculty: nextClass ? nextClass.faculty : "Dr. Arvind Rao",
            semesterProgress: 65,
            gpaTrend: [7.8, 8.1, 8.42],
            projectedGPA: 8.55,
            upcomingEvents: [
                { id: 1, title: "Mini Project Submission", time: "Tomorrow, 11:59 PM", type: "deadlines" },
                { id: 1, title: "Tech Quiz 02", time: "Fri, 02:00 PM", type: "academic" },
                { id: 1, title: "Guest Lecture: AI Ethics", time: "Sat, 10:00 AM", type: "events" }
            ]
        });
    } catch (err) {
        console.error("getDashboard error:", err);
        if (allowDemoFallbacks()) {
            return res.json(dashboardFallback(req));
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Get Student Dashboard Error",
            msg: "Unable to load the student dashboard right now"
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        if (req.user.id.includes("mock")) throw new Error("Mock ID");
        const student = await Student.findOne({ userId: req.user.id });
        if (!student) return res.status(404).json({ msg: "Student not found" });
        
        res.json({
            name: req.user.name,
            rollNo: student.rollNo,
            registrationNo: student.registrationNo,
            branch: student.branch,
            mobile: student.mobile,
            aadhaar: student.aadhaar,
            dob: student.dob,
            profileImage: student.profileImage
        });
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Get Student Profile Error",
            msg: "Unable to load student profile right now"
        });
    }
};

exports.updateProfileImage = async (req, res) => {
    try {
        const profileImage = normalizeImageUrl(req.body?.profileImage, {
            allowEmpty: false,
            code: "INVALID_PROFILE_IMAGE",
            field: "Profile image"
        });

        const student = await Student.findOneAndUpdate(
            { userId: req.user.id },
            { profileImage },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({
                code: "STUDENT_NOT_FOUND",
                msg: "Student profile not found",
                ...(req.id ? { requestId: req.id } : {})
            });
        }

        await User.findByIdAndUpdate(
            req.user.id,
            { profilePhoto: profileImage },
            { new: false }
        );

        res.json({
            msg: "Profile image updated",
            profileImage: student.profileImage
        });
    } catch (err) {
        if (err?.status && err?.code) {
            return res.status(err.status).json({
                code: err.code,
                msg: err.message,
                ...(req.id ? { requestId: req.id } : {})
            });
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Update Profile Image Error",
            msg: "Unable to update the profile image right now"
        });
    }
};

exports.getAcademics = async (req, res) => {
    try {
        if (req.user.id.includes("mock")) throw new Error("Mock ID");
        const student = await Student.findOne({ userId: req.user.id });
        if (!student) {
            return res.json({ results: [], syllabus: [] });
        }
        
        const results = await Result.find({ studentId: req.user.id });
        const syllabus = await Syllabus.find({ course: student.branch, semester: student.semester });
        
        res.json({ results, syllabus });
    } catch (err) {
        console.error("getAcademics error:", err);
        if (allowDemoFallbacks()) {
            return res.json(academicsFallback);
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Get Student Academics Error",
            msg: "Unable to load academic records right now"
        });
    }
};

exports.getFinance = async (req, res) => {
    try {
        if (req.user.id.includes("mock")) throw new Error("Mock ID");
        const fee = await Fee.findOne({ studentId: req.user.id });
        res.json(fee || { total: 80000, paid: 50000, due: 30000, receipts: [] });
    } catch (err) {
        if (allowDemoFallbacks()) {
            return res.json(financeFallback);
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Get Student Finance Error",
            msg: "Unable to load finance details right now"
        });
    }
};

exports.getBusSchedule = async (req, res) => {
    try {
        const buses = await Bus.find();
        res.json(buses);
    } catch (err) {
        if (allowDemoFallbacks()) {
            return res.json(busFallback);
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Get Bus Schedule Error",
            msg: "Unable to load bus schedule right now"
        });
    }
};

exports.getPlacement = async (req, res) => {
    try {
        if (req.user.id.includes("mock")) throw new Error("Mock ID");
        const placement = await Placement.findOne({ studentId: req.user.id });
        res.json(placement || { domain: "Not Selected", trainingProgress: 0 });
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Get Placement Error",
            msg: "Unable to load placement details right now"
        });
    }
};
