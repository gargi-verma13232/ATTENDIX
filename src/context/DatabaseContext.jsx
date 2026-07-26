import { createContext, useContext, useState, useEffect } from 'react';

export const DatabaseContext = createContext();

export const useDatabase = () => useContext(DatabaseContext);

// Initial Mock Data
const INITIAL_STUDENTS = {
  'STU-2024-001': {
    name: "Alex Johnson",
    id: "STU-2024-001",
    role: "student",
    overallAttendance: 72,
    streak: 12,
    totalClasses: 110,
    classesAttended: 79,
    requiredAttendance: 75,
    branch: "B.Tech CSE",
    year: "3rd Year",
    nextBadge: "Perfect Month",
    subjects: [
      { id: 'CS101', name: 'Data Structures', attendance: 60, classesHeld: 30, classesAttended: 18 },
      { id: 'CS102', name: 'Database Systems', attendance: 86, classesHeld: 28, classesAttended: 24 },
      { id: 'CS103', name: 'Operating Systems', attendance: 66, classesHeld: 32, classesAttended: 21 },
      { id: 'HU101', name: 'Communication Skills', attendance: 80, classesHeld: 20, classesAttended: 16 },
    ],
    attendanceTrend: [
      { week: 'Week 1', 'Data Structures': 100, 'Database Systems': 100, 'Operating Systems': 100, 'Communication Skills': 100 },
      { week: 'Week 2', 'Data Structures': 85, 'Database Systems': 95, 'Operating Systems': 80, 'Communication Skills': 90 },
      { week: 'Week 3', 'Data Structures': 75, 'Database Systems': 90, 'Operating Systems': 75, 'Communication Skills': 85 },
      { week: 'Week 4', 'Data Structures': 68, 'Database Systems': 88, 'Operating Systems': 70, 'Communication Skills': 80 },
      { week: 'Week 5', 'Data Structures': 60, 'Database Systems': 86, 'Operating Systems': 66, 'Communication Skills': 80 },
    ]
  },
  'STU-2024-002': {
    name: "Ananya Sharma",
    id: "STU-2024-002",
    role: "student",
    overallAttendance: 88,
    streak: 24,
    totalClasses: 110,
    classesAttended: 97,
    requiredAttendance: 75,
    branch: "B.Tech CSE",
    year: "3rd Year",
    nextBadge: "Attendance Scholar",
    subjects: [
      { id: 'CS101', name: 'Data Structures', attendance: 87, classesHeld: 30, classesAttended: 26 },
      { id: 'CS102', name: 'Database Systems', attendance: 89, classesHeld: 28, classesAttended: 25 },
      { id: 'CS103', name: 'Operating Systems', attendance: 88, classesHeld: 32, classesAttended: 28 },
      { id: 'HU101', name: 'Communication Skills', attendance: 90, classesHeld: 20, classesAttended: 18 },
    ],
    attendanceTrend: [
      { week: 'Week 1', 'Data Structures': 100, 'Database Systems': 100, 'Operating Systems': 100, 'Communication Skills': 100 },
      { week: 'Week 2', 'Data Structures': 95, 'Database Systems': 95, 'Operating Systems': 95, 'Communication Skills': 95 },
      { week: 'Week 3', 'Data Structures': 90, 'Database Systems': 92, 'Operating Systems': 90, 'Communication Skills': 95 },
      { week: 'Week 4', 'Data Structures': 88, 'Database Systems': 90, 'Operating Systems': 88, 'Communication Skills': 90 },
      { week: 'Week 5', 'Data Structures': 87, 'Database Systems': 89, 'Operating Systems': 88, 'Communication Skills': 90 },
    ]
  }
};

const INITIAL_FACULTY = [
  { id: 'FAC-2024-001', name: 'Dr. R. Mehta', department: 'Computer Science', courses: ['CS101', 'CS102'] }
];

const INITIAL_REQUESTS = [
  {
    id: 'req-001',
    studentId: 'STU-2024-001',
    studentName: 'Alex Johnson',
    subjectId: 'CS101',
    subjectName: 'Data Structures',
    date: '2026-07-08',
    reason: 'Inter-University Hackathon',
    status: 'pending',
    fileName: 'hackathon_invitation.pdf'
  },
  {
    id: 'req-002',
    studentId: 'STU-2024-001',
    studentName: 'Alex Johnson',
    subjectId: 'CS103',
    subjectName: 'Operating Systems',
    date: '2026-07-09',
    reason: 'Medical Leave - Fever',
    status: 'approved',
    fileName: 'medical_certificate.jpg'
  }
];

const INITIAL_USERS = {
  'STU-2024-001': { id: 'STU-2024-001', password: 'p@ssword', name: 'Alex Johnson', role: 'student' },
  'STU-2024-002': { id: 'STU-2024-002', password: 'p@ssword', name: 'Ananya Sharma', role: 'student' },
  'FAC-2024-001': { id: 'FAC-2024-001', password: 'p@ssword', name: 'Dr. R. Mehta', role: 'faculty', department: 'Computer Science', courses: ['CS101', 'CS102'] },
  'ADM-2024-001': { id: 'ADM-2024-001', password: 'p@ssword', name: 'Registrar Office', role: 'admin', office: 'Admin Block A' }
};

const DB_KEY = 'attendix_db_state_react';

const initialDbState = {
  students: INITIAL_STUDENTS,
  faculty: INITIAL_FACULTY,
  rectificationRequests: INITIAL_REQUESTS,
  users: INITIAL_USERS
};

export const DatabaseProvider = ({ children }) => {
  const [dbState, setDbState] = useState(() => {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse persisted database state, resetting to initial mock data.", e);
      }
    }
    return initialDbState;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('attendix_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Global layout states to coordinate sidebar and mobile nav toggle
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Sync dbState to LocalStorage
  useEffect(() => {
    localStorage.setItem(DB_KEY, JSON.stringify(dbState));
  }, [dbState]);

  // Sync currentUser to LocalStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('attendix_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('attendix_current_user');
    }
  }, [currentUser]);

  // Auth Operations
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

  // State Modification Operations
  const addStudent = (newStudent) => {
    setDbState(prev => {
      const updatedStudents = {
        ...prev.students,
        [newStudent.id]: newStudent
      };
      const updatedUsers = {
        ...prev.users,
        [newStudent.id]: {
          id: newStudent.id,
          password: 'p@ssword',
          name: newStudent.name,
          role: 'student'
        }
      };
      return {
        ...prev,
        students: updatedStudents,
        users: updatedUsers
      };
    });
  };

  const addFaculty = (newFaculty) => {
    setDbState(prev => {
      const updatedFaculty = Array.isArray(prev.faculty)
        ? [...prev.faculty, newFaculty]
        : [newFaculty];
      const updatedUsers = {
        ...prev.users,
        [newFaculty.id]: {
          id: newFaculty.id,
          password: 'p@ssword',
          name: newFaculty.name,
          role: 'faculty',
          department: newFaculty.department,
          courses: newFaculty.courses || []
        }
      };
      return {
        ...prev,
        faculty: updatedFaculty,
        users: updatedUsers
      };
    });
  };

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

  const resetDB = () => {
    setDbState(initialDbState);
  };

  const submitRectification = (request) => {
    const newRequest = {
      id: `req-${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      status: 'pending',
      ...request
    };
    setDbState(prev => ({
      ...prev,
      rectificationRequests: [newRequest, ...prev.rectificationRequests]
    }));
  };

  const approveRequest = (requestId) => {
    setDbState(prev => {
      const req = prev.rectificationRequests.find(r => r.id === requestId);
      if (!req || req.status === 'approved') return prev;

      const updatedRequests = prev.rectificationRequests.map(r =>
        r.id === requestId ? { ...r, status: 'approved' } : r
      );

      const studentId = req.studentId;
      const student = prev.students[studentId];
      if (!student) {
        return {
          ...prev,
          rectificationRequests: updatedRequests
        };
      }

      const updatedSubjects = student.subjects.map(sub => {
        if (sub.id !== req.subjectId) return sub;

        const newAttended = sub.classesAttended + 1;
        const newHeld = sub.classesHeld;
        const newAttendance = Math.round((newAttended / newHeld) * 100);
        return {
          ...sub,
          classesAttended: newAttended,
          attendance: newAttendance
        };
      });

      // Recompute overall
      const totalHeld = updatedSubjects.reduce((acc, s) => acc + s.classesHeld, 0);
      const totalAttended = updatedSubjects.reduce((acc, s) => acc + s.classesAttended, 0);
      const newOverall = Math.round((totalAttended / totalHeld) * 100);

      // Helper lookup
      const subNameLookup = (id) => {
        if (id === 'CS101') return 'Data Structures';
        if (id === 'CS102') return 'Database Systems';
        if (id === 'CS103') return 'Operating Systems';
        if (id === 'HU101') return 'Communication Skills';
        return id;
      };

      const updatedTrend = student.attendanceTrend.map((t, idx) => {
        if (idx === student.attendanceTrend.length - 1) {
          const currentVal = t[subNameLookup(req.subjectId)] || 0;
          return {
            ...t,
            [subNameLookup(req.subjectId)]: Math.min(100, currentVal + 3)
          };
        }
        return t;
      });

      const updatedStudents = {
        ...prev.students,
        [studentId]: {
          ...student,
          subjects: updatedSubjects,
          totalClasses: totalHeld,
          classesAttended: totalAttended,
          overallAttendance: newOverall,
          attendanceTrend: updatedTrend
        }
      };

      return {
        ...prev,
        rectificationRequests: updatedRequests,
        students: updatedStudents
      };
    });
  };

  const rejectRequest = (requestId) => {
    setDbState(prev => ({
      ...prev,
      rectificationRequests: prev.rectificationRequests.map(req =>
        req.id === requestId ? { ...req, status: 'rejected' } : req
      )
    }));
  };

  // Select active student profile to sync with stats modifications
  const activeStudentProfile = currentUser && currentUser.role === 'student' ? dbState.students[currentUser.id] : null;

  return (
    <DatabaseContext.Provider value={{
      dbState,
      currentUser,
      student: activeStudentProfile,
      subjects: activeStudentProfile ? activeStudentProfile.subjects : [],
      attendanceTrend: activeStudentProfile ? activeStudentProfile.attendanceTrend : [],
      students: dbState.students,
      rectificationRequests: dbState.rectificationRequests,
      activeSection,
      setActiveSection,
      isMobileNavOpen,
      setIsMobileNavOpen,
      login,
      logout,
      addStudent,
      addFaculty,
      importJSONState,
      resetDB,
      submitRectification,
      approveRequest,
      rejectRequest
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};
