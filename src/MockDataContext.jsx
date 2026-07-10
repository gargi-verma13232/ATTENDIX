import { createContext, useContext, useState, useEffect } from 'react';

const MockDataContext = createContext();

export const useMockData = () => useContext(MockDataContext);

// Initial mock data definitions
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

const USERS = {
  'STU-2024-001': { id: 'STU-2024-001', password: 'p@ssword', name: 'Alex Johnson', role: 'student' },
  'STU-2024-002': { id: 'STU-2024-002', password: 'p@ssword', name: 'Ananya Sharma', role: 'student' },
  'FAC-2024-001': { id: 'FAC-2024-001', password: 'p@ssword', name: 'Dr. R. Mehta', role: 'faculty', department: 'Computer Science', courses: ['CS101', 'CS102'] },
  'ADM-2024-001': { id: 'ADM-2024-001', password: 'p@ssword', name: 'Registrar Office', role: 'admin', office: 'Admin Block A' }
};

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

export const MockDataProvider = ({ children }) => {
  // Load state from LocalStorage or initialize with mock data
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('attendix_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('attendix_students_data');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [rectificationRequests, setRectificationRequests] = useState(() => {
    const saved = localStorage.getItem('attendix_rectification_requests');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  // Sync to LocalStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('attendix_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('attendix_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('attendix_students_data', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('attendix_rectification_requests', JSON.stringify(rectificationRequests));
  }, [rectificationRequests]);

  // Auth operations
  const login = (userId, password) => {
    const user = USERS[userId];
    if (user && user.password === password) {
      // Find full profile information if it's a student, else keep standard user details
      const userProfile = { ...user };
      if (user.role === 'student' && students[userId]) {
        userProfile.studentDetails = students[userId];
      }
      setCurrentUser(userProfile);
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Submit new request
  const submitRectification = (request) => {
    const newRequest = {
      id: `req-${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      status: 'pending',
      ...request
    };
    setRectificationRequests(prev => [newRequest, ...prev]);
  };

  // Approve a request
  const approveRequest = (requestId) => {
    // 1. Mark request as approved
    setRectificationRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;
      
      // If already approved, do nothing
      if (req.status === 'approved') return req;

      // 2. Update the student's attendance stats
      setStudents(prevStudents => {
        const studentId = req.studentId;
        const student = prevStudents[studentId];
        if (!student) return prevStudents;

        const updatedSubjects = student.subjects.map(sub => {
          if (sub.id !== req.subjectId) return sub;
          
          const newAttended = sub.classesAttended + 1;
          const newAttendance = Math.round((newAttended / sub.classesHeld) * 100);
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

        // Update the weekly trends for the approved subject (add +3% to latest trend for demonstration)
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

        return {
          ...prevStudents,
          [studentId]: {
            ...student,
            subjects: updatedSubjects,
            totalClasses: totalHeld,
            classesAttended: totalAttended,
            overallAttendance: newOverall,
            attendanceTrend: updatedTrend
          }
        };
      });

      return { ...req, status: 'approved' };
    }));
  };

  // Helper for mapping ID to name in trends
  const subNameLookup = (id) => {
    if (id === 'CS101') return 'Data Structures';
    if (id === 'CS102') return 'Database Systems';
    if (id === 'CS103') return 'Operating Systems';
    if (id === 'HU101') return 'Communication Skills';
    return id;
  };

  // Reject a request
  const rejectRequest = (requestId) => {
    setRectificationRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' } : req
    ));
  };

  // Context value
  // Note: if logged in student's stats are updated, we want their info in currentUser.studentDetails to stay fresh
  const activeStudentProfile = currentUser && currentUser.role === 'student' ? students[currentUser.id] : null;

  return (
    <MockDataContext.Provider value={{
      currentUser,
      student: activeStudentProfile, // Provide direct student access for legacy components
      subjects: activeStudentProfile ? activeStudentProfile.subjects : [],
      attendanceTrend: activeStudentProfile ? activeStudentProfile.attendanceTrend : [],
      students, // All students for faculty/admin view
      rectificationRequests,
      login,
      logout,
      submitRectification,
      approveRequest,
      rejectRequest
    }}>
      {children}
    </MockDataContext.Provider>
  );
};
