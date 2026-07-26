import { createContext, useContext, useState, useEffect } from 'react';

export const DatabaseContext = createContext();

export const useDatabase = () => useContext(DatabaseContext);

// ─────────────────────────────────────────────
//  Seed Data
// ─────────────────────────────────────────────

const TODAY = new Date();
const fmt = (d) => d.toISOString().split('T')[0];
const daysAgo = (n) => { const d = new Date(TODAY); d.setDate(d.getDate() - n); return fmt(d); };

const INITIAL_STUDENTS = {
  'STU-2024-001': {
    name: 'Alex Johnson',
    id: 'STU-2024-001',
    role: 'student',
    overallAttendance: 72,
    streak: 12,
    totalClasses: 110,
    classesAttended: 79,
    requiredAttendance: 75,
    branch: 'B.Tech CSE',
    year: '3rd Year',
    examScore: 64,
    nextBadge: 'Perfect Month',
    badges: ['7-Day Streak'],
    // timetable: day-of-week (1=Mon..5=Fri) → array of slot strings
    timetable: {
      1: ['09:00 - Data Structures', '11:00 - Operating Systems'],
      2: ['10:00 - Database Systems', '14:00 - Communication Skills'],
      3: ['09:00 - Data Structures', '11:00 - Operating Systems'],
      4: ['10:00 - Database Systems'],
      5: ['09:00 - Data Structures', '13:00 - Communication Skills'],
    },
    subjects: [
      { id: 'CS101', name: 'Data Structures', attendance: 60, classesHeld: 30, classesAttended: 18 },
      { id: 'CS102', name: 'Database Systems', attendance: 86, classesHeld: 28, classesAttended: 24 },
      { id: 'CS103', name: 'Operating Systems', attendance: 66, classesHeld: 32, classesAttended: 21 },
      { id: 'HU101', name: 'Communication Skills', attendance: 80, classesHeld: 20, classesAttended: 16 },
    ],
    // courses: per-course history for faculty logger integration
    courses: {
      CS101: {
        title: 'Data Structures',
        faculty: 'Dr. R. Mehta',
        history: [
          { date: daysAgo(6), slot: '09:00', status: 'Present' },
          { date: daysAgo(5), slot: '09:00', status: 'Absent' },
          { date: daysAgo(3), slot: '09:00', status: 'Present' },
          { date: daysAgo(1), slot: '09:00', status: 'Absent' },
        ],
      },
      CS102: {
        title: 'Database Systems',
        faculty: 'Dr. R. Mehta',
        history: [
          { date: daysAgo(6), slot: '10:00', status: 'Present' },
          { date: daysAgo(4), slot: '10:00', status: 'Present' },
          { date: daysAgo(2), slot: '10:00', status: 'Present' },
        ],
      },
      CS103: {
        title: 'Operating Systems',
        faculty: 'Prof. S. Kumar',
        history: [
          { date: daysAgo(5), slot: '11:00', status: 'Present' },
          { date: daysAgo(3), slot: '11:00', status: 'Absent' },
          { date: daysAgo(1), slot: '11:00', status: 'OD' },
        ],
      },
      HU101: {
        title: 'Communication Skills',
        faculty: 'Dr. P. Nair',
        history: [
          { date: daysAgo(6), slot: '14:00', status: 'Present' },
          { date: daysAgo(4), slot: '13:00', status: 'Present' },
          { date: daysAgo(2), slot: '14:00', status: 'Present' },
        ],
      },
    },
    attendanceTrend: [
      { week: 'Week 1', 'Data Structures': 100, 'Database Systems': 100, 'Operating Systems': 100, 'Communication Skills': 100 },
      { week: 'Week 2', 'Data Structures': 85, 'Database Systems': 95, 'Operating Systems': 80, 'Communication Skills': 90 },
      { week: 'Week 3', 'Data Structures': 75, 'Database Systems': 90, 'Operating Systems': 75, 'Communication Skills': 85 },
      { week: 'Week 4', 'Data Structures': 68, 'Database Systems': 88, 'Operating Systems': 70, 'Communication Skills': 80 },
      { week: 'Week 5', 'Data Structures': 60, 'Database Systems': 86, 'Operating Systems': 66, 'Communication Skills': 80 },
    ],
  },
  'STU-2024-002': {
    name: 'Ananya Sharma',
    id: 'STU-2024-002',
    role: 'student',
    overallAttendance: 88,
    streak: 24,
    totalClasses: 110,
    classesAttended: 97,
    requiredAttendance: 75,
    branch: 'B.Tech CSE',
    year: '3rd Year',
    examScore: 81,
    nextBadge: 'Attendance Scholar',
    badges: ['7-Day Streak', 'Perfect Month', 'Attendance Warrior'],
    timetable: {
      1: ['09:00 - Data Structures', '11:00 - Operating Systems'],
      2: ['10:00 - Database Systems', '14:00 - Communication Skills'],
      3: ['09:00 - Data Structures', '11:00 - Operating Systems'],
      4: ['10:00 - Database Systems'],
      5: ['09:00 - Data Structures', '13:00 - Communication Skills'],
    },
    subjects: [
      { id: 'CS101', name: 'Data Structures', attendance: 87, classesHeld: 30, classesAttended: 26 },
      { id: 'CS102', name: 'Database Systems', attendance: 89, classesHeld: 28, classesAttended: 25 },
      { id: 'CS103', name: 'Operating Systems', attendance: 88, classesHeld: 32, classesAttended: 28 },
      { id: 'HU101', name: 'Communication Skills', attendance: 90, classesHeld: 20, classesAttended: 18 },
    ],
    courses: {
      CS101: {
        title: 'Data Structures',
        faculty: 'Dr. R. Mehta',
        history: [
          { date: daysAgo(6), slot: '09:00', status: 'Present' },
          { date: daysAgo(5), slot: '09:00', status: 'Present' },
          { date: daysAgo(3), slot: '09:00', status: 'Present' },
          { date: daysAgo(1), slot: '09:00', status: 'Present' },
        ],
      },
      CS102: {
        title: 'Database Systems',
        faculty: 'Dr. R. Mehta',
        history: [
          { date: daysAgo(6), slot: '10:00', status: 'Present' },
          { date: daysAgo(4), slot: '10:00', status: 'Present' },
          { date: daysAgo(2), slot: '10:00', status: 'Present' },
        ],
      },
      CS103: {
        title: 'Operating Systems',
        faculty: 'Prof. S. Kumar',
        history: [
          { date: daysAgo(5), slot: '11:00', status: 'Present' },
          { date: daysAgo(3), slot: '11:00', status: 'Present' },
          { date: daysAgo(1), slot: '11:00', status: 'Present' },
        ],
      },
      HU101: {
        title: 'Communication Skills',
        faculty: 'Dr. P. Nair',
        history: [
          { date: daysAgo(6), slot: '14:00', status: 'Present' },
          { date: daysAgo(4), slot: '13:00', status: 'Present' },
          { date: daysAgo(2), slot: '14:00', status: 'Present' },
        ],
      },
    },
    attendanceTrend: [
      { week: 'Week 1', 'Data Structures': 100, 'Database Systems': 100, 'Operating Systems': 100, 'Communication Skills': 100 },
      { week: 'Week 2', 'Data Structures': 95, 'Database Systems': 95, 'Operating Systems': 95, 'Communication Skills': 95 },
      { week: 'Week 3', 'Data Structures': 90, 'Database Systems': 92, 'Operating Systems': 90, 'Communication Skills': 95 },
      { week: 'Week 4', 'Data Structures': 88, 'Database Systems': 90, 'Operating Systems': 88, 'Communication Skills': 90 },
      { week: 'Week 5', 'Data Structures': 87, 'Database Systems': 89, 'Operating Systems': 88, 'Communication Skills': 90 },
    ],
  },
};

const INITIAL_FACULTY = {
  'FAC-2024-001': { id: 'FAC-2024-001', name: 'Dr. R. Mehta', department: 'Computer Science', courses: ['CS101', 'CS102'] },
};

const INITIAL_RECTIFICATIONS = [
  {
    id: 'req-001',
    studentId: 'STU-2024-001',
    studentName: 'Alex Johnson',
    courseCode: 'CS101',
    courseTitle: 'Data Structures',
    date: daysAgo(5),
    slot: '09:00',
    reason: 'Inter-University Hackathon',
    proofName: 'hackathon_invitation.pdf',
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    // legacy aliases for backward compat
    subjectId: 'CS101',
    subjectName: 'Data Structures',
    fileName: 'hackathon_invitation.pdf',
  },
  {
    id: 'req-002',
    studentId: 'STU-2024-001',
    studentName: 'Alex Johnson',
    courseCode: 'CS103',
    courseTitle: 'Operating Systems',
    date: daysAgo(1),
    slot: '11:00',
    reason: 'Medical Leave - Fever',
    proofName: 'medical_certificate.jpg',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    subjectId: 'CS103',
    subjectName: 'Operating Systems',
    fileName: 'medical_certificate.jpg',
  },
];

const INITIAL_SESSION_LOGS = [
  {
    id: 'log-001',
    courseCode: 'CS101',
    date: daysAgo(1),
    slot: '09:00',
    topicsCovered: 'Binary Search Trees — insertion, deletion, traversal algorithms',
    homeworkAssigned: 'Implement a BST with insert, delete, and inorder traversal in C++',
    quizAlert: true,
    absentStudents: ['STU-2024-001'],
  },
  {
    id: 'log-002',
    courseCode: 'CS103',
    date: daysAgo(3),
    slot: '11:00',
    topicsCovered: 'Process Scheduling — Round Robin and Priority Scheduling algorithms',
    homeworkAssigned: 'Simulate Round Robin scheduling for a set of 5 processes with quantum = 3',
    quizAlert: false,
    absentStudents: ['STU-2024-001'],
  },
];

const INITIAL_USERS = {
  'STU-2024-001': { id: 'STU-2024-001', password: 'p@ssword', name: 'Alex Johnson', role: 'student' },
  'STU-2024-002': { id: 'STU-2024-002', password: 'p@ssword', name: 'Ananya Sharma', role: 'student' },
  'FAC-2024-001': { id: 'FAC-2024-001', password: 'p@ssword', name: 'Dr. R. Mehta', role: 'faculty', department: 'Computer Science', courses: ['CS101', 'CS102'] },
  'ADM-2024-001': { id: 'ADM-2024-001', password: 'p@ssword', name: 'Registrar Office', role: 'admin', office: 'Admin Block A' },
};

const INITIAL_CAMPUS_CONFIG = {
  latitude: 28.4595,
  longitude: 77.0266,
  radiusMeters: 200,
  enforceGeofence: true,
};

const DB_KEY = 'attendix_db_state_react';

const initialDbState = {
  students: INITIAL_STUDENTS,
  faculty: INITIAL_FACULTY,
  rectifications: INITIAL_RECTIFICATIONS,
  rectificationRequests: INITIAL_RECTIFICATIONS,
  sessionLogs: INITIAL_SESSION_LOGS,
  campusConfig: INITIAL_CAMPUS_CONFIG,
  users: INITIAL_USERS,
};

// ─────────────────────────────────────────────
//  Provider
// ─────────────────────────────────────────────

export const DatabaseProvider = ({ children }) => {
  const [dbState, setDbState] = useState(() => {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure sessionLogs exists in older stored state
        if (!parsed.sessionLogs) parsed.sessionLogs = INITIAL_SESSION_LOGS;
        // Migrate faculty from array to object if stale localStorage
        if (Array.isArray(parsed.faculty)) {
          const facultyObj = {};
          parsed.faculty.forEach(f => { facultyObj[f.id] = f; });
          parsed.faculty = facultyObj;
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse persisted database state, resetting.', e);
      }
    }
    return initialDbState;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('attendix_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(DB_KEY, JSON.stringify(dbState));
  }, [dbState]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('attendix_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('attendix_current_user');
    }
  }, [currentUser]);

  // ── Auth ──────────────────────────────────────
  const login = (userId, password) => {
    const user = dbState.users[userId];
    if (user && user.password === password) {
      const userProfile = { ...user };
      if (user.role === 'student' && dbState.students[userId]) {
        userProfile.studentDetails = dbState.students[userId];
      }
      setCurrentUser(userProfile);
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveSection('dashboard');
    setIsMobileNavOpen(false);
  };

  // ── Student / Faculty Management ──────────────
  const addStudent = (newStudent) => {
    setDbState(prev => ({
      ...prev,
      students: { ...prev.students, [newStudent.id]: newStudent },
      users: {
        ...prev.users,
        [newStudent.id]: { id: newStudent.id, password: 'p@ssword', name: newStudent.name, role: 'student' },
      },
    }));
  };

  const addFaculty = (newFaculty) => {
    setDbState(prev => ({
      ...prev,
      faculty: {
        ...(prev.faculty || {}),
        [newFaculty.id]: newFaculty,
      },
      users: {
        ...prev.users,
        [newFaculty.id]: {
          id: newFaculty.id,
          password: 'p@ssword',
          name: newFaculty.name,
          role: 'faculty',
          department: newFaculty.department,
          courses: newFaculty.courses || [],
        },
      },
    }));
  };

  const removeStudent = (id) => {
    setDbState(prev => {
      const updatedStudents = { ...prev.students };
      const updatedUsers = { ...prev.users };
      delete updatedStudents[id];
      delete updatedUsers[id];
      return { ...prev, students: updatedStudents, users: updatedUsers };
    });
  };

  const removeFaculty = (id) => {
    setDbState(prev => {
      const updatedFaculty = { ...(prev.faculty || {}) };
      const updatedUsers = { ...prev.users };
      delete updatedFaculty[id];
      delete updatedUsers[id];
      return { ...prev, faculty: updatedFaculty, users: updatedUsers };
    });
  };

  // ── Session Logger ────────────────────────────
  // attendanceMap: { [studentId]: 'Present' | 'Absent' | 'OD' }
  const addSessionLog = (log, attendanceMap) => {
    const newLog = {
      id: `log-${Date.now()}`,
      ...log,
      absentStudents: Object.entries(attendanceMap)
        .filter(([, status]) => status === 'Absent')
        .map(([id]) => id),
    };

    setDbState(prev => {
      const updatedStudents = { ...prev.students };

      Object.entries(attendanceMap).forEach(([studentId, status]) => {
        const student = updatedStudents[studentId];
        if (!student) return;

        // Update aggregate subjects array
        const updatedSubjects = (student.subjects || []).map(sub => {
          if (sub.id !== log.courseCode) return sub;
          const newHeld = sub.classesHeld + 1;
          const newAttended = status !== 'Absent' ? sub.classesAttended + 1 : sub.classesAttended;
          return {
            ...sub,
            classesHeld: newHeld,
            classesAttended: newAttended,
            attendance: Math.round((newAttended / newHeld) * 100),
          };
        });

        const totalHeld = updatedSubjects.reduce((a, s) => a + s.classesHeld, 0);
        const totalAttended = updatedSubjects.reduce((a, s) => a + s.classesAttended, 0);

        // Update courses.history
        const existingCourse = student.courses?.[log.courseCode] || { title: log.courseCode, faculty: '', history: [] };
        const updatedCourses = {
          ...(student.courses || {}),
          [log.courseCode]: {
            ...existingCourse,
            history: [
              ...(existingCourse.history || []),
              { date: log.date, slot: log.slot, status },
            ],
          },
        };

        updatedStudents[studentId] = {
          ...student,
          subjects: updatedSubjects,
          totalClasses: totalHeld,
          classesAttended: totalAttended,
          overallAttendance: totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 0,
          courses: updatedCourses,
        };
      });

      return {
        ...prev,
        sessionLogs: [newLog, ...prev.sessionLogs],
        students: updatedStudents,
      };
    });
  };

  // ── Rectification ─────────────────────────────
  const submitRectification = (request) => {
    const newRequest = {
      id: `req-${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      status: 'pending',
      createdAt: new Date().toISOString(),
      // Normalise field names to spec
      courseCode: request.subjectId || request.courseCode,
      courseTitle: request.subjectName || request.courseTitle,
      proofName: request.fileName || request.proofName,
      // Keep legacy aliases
      subjectId: request.subjectId || request.courseCode,
      subjectName: request.subjectName || request.courseTitle,
      fileName: request.fileName || request.proofName,
      ...request,
    };
    setDbState(prev => ({
      ...prev,
      rectificationRequests: [newRequest, ...prev.rectificationRequests],
    }));
  };

  const resolveRectification = (id, status) => {
    setDbState(prev => {
      const req = prev.rectificationRequests.find(r => r.id === id);
      if (!req) return prev;

      const updatedRequests = prev.rectificationRequests.map(r =>
        r.id === id ? { ...r, status } : r
      );

      if (status !== 'Approved') {
        return { ...prev, rectificationRequests: updatedRequests };
      }

      // If approved → update student course history entry to 'OD' and increment attendance
      const studentId = req.studentId;
      const student = prev.students[studentId];
      if (!student) return { ...prev, rectificationRequests: updatedRequests };

      const courseCode = req.courseCode || req.subjectId;
      const reqDate = req.date;
      const reqSlot = req.slot;

      // Update aggregate subjects
      const updatedSubjects = (student.subjects || []).map(sub => {
        if (sub.id !== courseCode) return sub;
        const newAttended = sub.classesAttended + 1;
        return {
          ...sub,
          classesAttended: newAttended,
          attendance: Math.round((newAttended / sub.classesHeld) * 100),
        };
      });
      const totalHeld = updatedSubjects.reduce((a, s) => a + s.classesHeld, 0);
      const totalAttended = updatedSubjects.reduce((a, s) => a + s.classesAttended, 0);

      // Update courses history: mark matching entry as OD
      const existingCourse = student.courses?.[courseCode] || { history: [] };
      const updatedHistory = existingCourse.history.map(h =>
        h.date === reqDate && (h.slot === reqSlot || !reqSlot) && h.status === 'Absent'
          ? { ...h, status: 'OD' }
          : h
      );

      const updatedStudents = {
        ...prev.students,
        [studentId]: {
          ...student,
          subjects: updatedSubjects,
          totalClasses: totalHeld,
          classesAttended: totalAttended,
          overallAttendance: totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 0,
          courses: {
            ...(student.courses || {}),
            [courseCode]: { ...existingCourse, history: updatedHistory },
          },
        },
      };

      return { ...prev, rectificationRequests: updatedRequests, students: updatedStudents };
    });
  };

  // Legacy aliases used by existing components
  const approveRequest = (requestId) => resolveRectification(requestId, 'Approved');
  const rejectRequest = (requestId) => resolveRectification(requestId, 'Denied');

  // ── Bulk OD Dispatch ──────────────────────────
  // policy: 'Auto-Approve' | 'Expedited-Push'
  const bulkDispatchOD = (eventTitle, date, timeWindow, studentIds, policy) => {
    setDbState(prev => {
      if (policy === 'Auto-Approve') {
        // Auto-approve: update matching timetable slots to OD in courses.history
        const updatedStudents = { ...prev.students };
        studentIds.forEach(sid => {
          const student = updatedStudents[sid];
          if (!student) return;
          const updatedCourses = { ...(student.courses || {}) };
          Object.keys(updatedCourses).forEach(code => {
            const course = updatedCourses[code];
            const updatedHistory = (course.history || []).map(h =>
              h.date === date && h.status === 'Absent' ? { ...h, status: 'OD' } : h
            );
            updatedCourses[code] = { ...course, history: updatedHistory };
          });
          updatedStudents[sid] = { ...student, courses: updatedCourses };
        });
        return { ...prev, students: updatedStudents };
      }

      // Expedited-Push: generate pending rectification entries
      const newRectifications = studentIds.flatMap(sid => {
        const student = prev.students[sid];
        if (!student) return [];
        return Object.entries(student.courses || {}).map(([code, course]) => ({
          id: `req-od-${Date.now()}-${sid}-${code}`,
          studentId: sid,
          studentName: student.name,
          courseCode: code,
          courseTitle: course.title,
          subjectId: code,
          subjectName: course.title,
          date,
          slot: timeWindow,
          reason: `OD — ${eventTitle}`,
          proofName: 'od_event_authorization.pdf',
          fileName: 'od_event_authorization.pdf',
          status: 'pending',
          createdAt: new Date().toISOString(),
        }));
      });

      return {
        ...prev,
        rectificationRequests: [...newRectifications, ...prev.rectificationRequests],
      };
    });
  };

  // ── Data Import / Reset ───────────────────────
  const importJSONState = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: new Error('Invalid JSON format: expected an object') };
      }
      if (!parsed.students || !parsed.users) {
        return { success: false, error: new Error('Invalid schema: students and users objects are required') };
      }
      setDbState(parsed);
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const resetDB = () => setDbState(initialDbState);

  const updateCampusConfig = (newConfig) => {
    setDbState(prev => ({
      ...prev,
      campusConfig: { ...(prev.campusConfig || INITIAL_CAMPUS_CONFIG), ...newConfig },
    }));
  };

  // ── Derived state helpers ─────────────────────
  const activeStudentProfile =
    currentUser && currentUser.role === 'student' ? dbState.students[currentUser.id] : null;

  return (
    <DatabaseContext.Provider
      value={{
        dbState,
        currentUser,
        student: activeStudentProfile,
        subjects: activeStudentProfile ? activeStudentProfile.subjects : [],
        attendanceTrend: activeStudentProfile ? activeStudentProfile.attendanceTrend : [],
        students: dbState.students,
        rectificationRequests: dbState.rectificationRequests || dbState.rectifications || [],
        rectifications: dbState.rectificationRequests || dbState.rectifications || [],
        sessionLogs: dbState.sessionLogs,
        campusConfig: dbState.campusConfig || INITIAL_CAMPUS_CONFIG,
        activeSection,
        setActiveSection,
        isMobileNavOpen,
        setIsMobileNavOpen,
        login,
        logout,
        addStudent,
        addFaculty,
        removeStudent,
        removeFaculty,
        addSessionLog,
        resolveRectification,
        bulkDispatchOD,
        importJSONState,
        resetDB,
        submitRectification,
        addRectification: submitRectification,
        approveRequest,
        rejectRequest,
        updateCampusConfig,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};
