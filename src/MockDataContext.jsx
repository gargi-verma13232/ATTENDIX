import { createContext, useContext, useState } from 'react';
import { DatabaseProvider, useDatabase, DatabaseContext } from './context/DatabaseContext';
import {
  campusConfig as mockCampusConfig,
  facultyProfile,
  facultySchedule,
  defaultRoster,
  defaultSessionNotes,
  initialOdRequests,
  institutionalNotices,
  dailyTimetable,
} from './data/mockData';

const EnhancedContext = createContext();

export const useMockData = () => {
  const enhanced = useContext(EnhancedContext);
  const base = useDatabase();
  return { ...base, ...enhanced };
};

export const MockDataProvider = ({ children }) => {
  // Faculty Workspace State
  const [selectedCourse, setSelectedCourse] = useState('cs-301');
  const [selectedDate, setSelectedDate] = useState('2026-07-26');
  const [selectedSlot, setSelectedSlot] = useState('slot-1');

  // Interactive Rosters stored by key: courseId_date_slotId
  const [sessionRosters, setSessionRosters] = useState({
    'cs-301_2026-07-26_slot-1': defaultRoster,
  });

  // Session notes & catch-up content stored by key: courseId_date_slotId
  const [sessionNotes, setSessionNotes] = useState({
    'cs-301_2026-07-26_slot-1': defaultSessionNotes,
  });

  // Resolution Inbox OD/Medical Requests
  const [odRequests, setOdRequests] = useState(initialOdRequests);
  const [notices] = useState(institutionalNotices);

  // Student Attendance Sessions History (to support Catch-Up Hub)
  const [studentSessions, setStudentSessions] = useState([
    {
      id: "sess-1",
      date: "2026-07-26",
      slotId: "slot-1",
      time: "09:00 AM - 10:30 AM",
      courseId: "cs-301",
      courseName: "CS301 - Data Structures",
      status: "Present",
      teacher: "Dr. Arvind Mehta",
    },
    {
      id: "sess-2",
      date: "2026-07-25",
      slotId: "slot-2",
      time: "11:00 AM - 12:30 PM",
      courseId: "cs-302",
      courseName: "CS302 - Database Systems",
      status: "Absent",
      teacher: "Prof. S. Radhakrishnan",
    },
    {
      id: "sess-3",
      date: "2026-07-24",
      slotId: "slot-1",
      time: "09:00 AM - 10:30 AM",
      courseId: "cs-301",
      courseName: "CS301 - Data Structures",
      status: "Present",
      teacher: "Dr. Arvind Mehta",
    },
    {
      id: "sess-4",
      date: "2026-07-24",
      slotId: "slot-3",
      time: "02:00 PM - 03:30 PM",
      courseId: "cs-303",
      courseName: "CS303 - Computer Networks",
      status: "Absent",
      teacher: "Dr. Neha Verma",
    },
  ]);

  // Toggle present/absent for a student in a specific session roster
  const toggleStudentAttendance = (courseId, date, slotId, studentId) => {
    const key = `${courseId}_${date}_${slotId}`;
    setSessionRosters(prev => {
      const current = prev[key] || defaultRoster;
      const updated = current.map(student => {
        if (student.id === studentId) {
          const nextStatus = student.status === 'present' ? 'absent' : 'present';
          return {
            ...student,
            status: nextStatus,
            timestamp: nextStatus === 'present' ? 'Manual Check (Faculty)' : null,
          };
        }
        return student;
      });
      return { ...prev, [key]: updated };
    });
  };

  const getSessionRoster = (courseId, date, slotId) => {
    const key = `${courseId}_${date}_${slotId}`;
    return sessionRosters[key] || defaultRoster;
  };

  const getSessionNotes = (courseId, date, slotId) => {
    const key = `${courseId}_${date}_${slotId}`;
    return sessionNotes[key] || { summary: '', homework: '', photos: [] };
  };

  const updateSessionNotes = (courseId, date, slotId, notesObject) => {
    const key = `${courseId}_${date}_${slotId}`;
    setSessionNotes(prev => ({
      ...prev,
      [key]: notesObject,
    }));
  };

  const addPhotoToSession = (courseId, date, slotId, photoUrl) => {
    const key = `${courseId}_${date}_${slotId}`;
    setSessionNotes(prev => {
      const existing = prev[key] || { summary: '', homework: '', photos: [] };
      return {
        ...prev,
        [key]: {
          ...existing,
          photos: [...(existing.photos || []), photoUrl],
        },
      };
    });
  };

  const updateRequestStatus = (requestId, newStatus) => {
    setOdRequests(prev =>
      prev.map(req => (req.id === requestId ? { ...req, status: newStatus } : req))
    );
  };

  const jumpToClassRegister = (courseId, date, slotId) => {
    setSelectedCourse(courseId);
    setSelectedDate(date);
    setSelectedSlot(slotId);
  };

  // Live QR session scan counter
  const [liveScanCount, setLiveScanCount] = useState(14);
  const [scannedStudentsList, setScannedStudentsList] = useState([
    { id: 'STU-2024-002', name: 'Ananya Sharma', time: '09:02 AM', method: 'Biometric + GPS' },
    { id: 'STU-2024-004', name: 'Rohan Gupta', time: '09:04 AM', method: 'Biometric + GPS' },
  ]);

  const incrementLiveScanCount = () => {
    setLiveScanCount(prev => prev + 1);
  };

  // Dynamic QR Tracking
  const [activeSessionQR, setActiveSessionQR] = useState(null);
  
  const startSessionQR = (courseId, slotId, section, token) => {
    setActiveSessionQR({ courseId, slotId, section, token });
  };
  
  const stopSessionQR = () => {
    setActiveSessionQR(null);
  };

  // Verify if course is in today's timetable
  const verifyStudentTimetable = (courseId) => {
    // Assuming dailyTimetable has subject names, we will check if courseId maps to a subject in dailyTimetable
    // In our mockData, dailyTimetable has { subject: "Database Systems", ... }
    // Let's do a simple fuzzy match or return true for demo if not strictly enforceable
    const validCourseCodes = {
      'cs-301': 'Data Structures',
      'cs-302': 'Database Systems',
      'cs-303': 'Computer Networks'
    };
    const courseName = validCourseCodes[courseId];
    if (!courseName) return false;
    return dailyTimetable.some(slot => slot.subject.includes(courseName));
  };

  // Student Document Uploads
  const [studentDocuments, setStudentDocuments] = useState([]);
  
  const submitDocument = (doc) => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      ...doc,
      status: 'Pending Admin Approval',
      submittedAt: new Date().toISOString().split('T')[0]
    };
    setStudentDocuments(prev => [newDoc, ...prev]);
    if (base && base.submitRectification) {
      base.submitRectification({
        subjectId: doc.subjectId || 'CS101',
        subjectName: doc.subjectName || 'Data Structures',
        date: doc.date || new Date().toISOString().split('T')[0],
        docType: doc.type || 'Medical Certificate',
        reason: doc.type || 'Leave/OD Application',
        fileName: doc.fileName || 'document.pdf',
        size: doc.size || '1.5 MB',
        status: 'pending'
      });
    }
  };

  // Timetable Recovery Planner State
  const [cancelledClasses, setCancelledClasses] = useState([
    {
      id: 'canc-001',
      courseId: 'CS101',
      courseName: 'CS101 - Data Structures',
      date: '2026-07-24',
      slotId: '09:00',
      reason: 'Departmental Faculty Workshop',
      status: 'Cancelled',
      missedHours: 1.5,
    },
  ]);

  const [recoveryClasses, setRecoveryClasses] = useState([
    {
      id: 'rec-001',
      courseId: 'CS101',
      courseName: 'CS101 - Data Structures',
      originalDate: '2026-07-24',
      scheduledDate: '2026-07-29',
      dayOfWeek: 'Wednesday',
      timeSlot: '04:00 PM - 05:30 PM',
      room: 'Lab 302',
      faculty: 'Dr. R. Mehta',
      status: 'Scheduled',
    },
  ]);

  // Alert Notifications for Students
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-001',
      title: '📢 Recovery Class Scheduled',
      message: 'CS101 Data Structures recovery session set for Wednesday 04:00 PM in Lab 302.',
      date: '2026-07-26',
      unread: true,
      targetRole: 'student',
    },
    {
      id: 'notif-002',
      title: '✅ OD Request Approved',
      message: 'Your On-Duty request for Inter-University Hackathon has been approved.',
      date: '2026-07-25',
      unread: false,
      targetRole: 'student',
    },
  ]);

  // Admin Target View & Push Preview Control (Admin-only feature)
  const [adminTargetAudience, setAdminTargetAudience] = useState('students'); // 'students' | 'teachers'
  const [adminPreviewRole, setAdminPreviewRole] = useState('none'); // 'none' | 'student' | 'faculty'

  const cancelClassSession = (courseId, courseName, date, slotId, reason) => {
    const newCancel = {
      id: `canc-${Date.now()}`,
      courseId,
      courseName,
      date,
      slotId,
      reason,
      status: 'Cancelled',
      missedHours: 1.5,
    };
    setCancelledClasses(prev => [newCancel, ...prev]);
  };

  const createRecoveryClass = (recoveryData) => {
    const newRecovery = {
      id: `rec-${Date.now()}`,
      ...recoveryData,
      status: 'Scheduled',
    };
    setRecoveryClasses(prev => [newRecovery, ...prev]);

    // Automatically dispatch alert notification to students
    const alertMsg = {
      id: `notif-${Date.now()}`,
      title: '📢 New Recovery Class Scheduled',
      message: `${recoveryData.courseName} recovery session scheduled on ${recoveryData.dayOfWeek} (${recoveryData.scheduledDate}) at ${recoveryData.timeSlot} in ${recoveryData.room}.`,
      date: new Date().toISOString().split('T')[0],
      unread: true,
      targetRole: 'student',
    };
    setNotifications(prev => [alertMsg, ...prev]);
  };

  const dispatchAdminPushNotice = (title, message, targetRole) => {
    const newPush = {
      id: `push-${Date.now()}`,
      title: `📢 ${title}`,
      message,
      date: new Date().toISOString().split('T')[0],
      unread: true,
      targetRole: targetRole || adminTargetAudience,
    };
    setNotifications(prev => [newPush, ...prev]);
  };

  const logStudentAttendanceScan = (courseId, date, slotId) => {
    const key = `${courseId}_${date}_${slotId}`;
    setSessionRosters(prev => {
      const current = prev[key] || defaultRoster;
      const updated = current.map(student => {
        if (student.id === 'stu-001' || student.id === 'STU-2024-001') {
          return {
            ...student,
            status: 'present',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Biometric+GPS QR)',
          };
        }
        return student;
      });
      return { ...prev, [key]: updated };
    });

    setStudentSessions(prev =>
      prev.map(sess => {
        if (sess.courseId === courseId && sess.date === date && sess.slotId === slotId) {
          return { ...sess, status: 'Present' };
        }
        return sess;
      })
    );

    // Increment live scan counter and log student in active QR session
    setLiveScanCount(prev => prev + 1);
    setScannedStudentsList(prev => [
      {
        id: 'STU-2024-001',
        name: 'Alex Johnson',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        method: 'Biometric + GPS QR',
      },
      ...prev,
    ]);
  };

  const enhancedValue = {
    campusConfig: mockCampusConfig,
    facultyProfile,
    facultySchedule,
    selectedCourse,
    setSelectedCourse,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    toggleStudentAttendance,
    getSessionRoster,
    getSessionNotes,
    updateSessionNotes,
    addPhotoToSession,
    odRequests,
    updateRequestStatus,
    jumpToClassRegister,
    notices,
    studentSessions,
    logStudentAttendanceScan,
    liveScanCount,
    scannedStudentsList,
    cancelledClasses,
    recoveryClasses,
    cancelClassSession,
    createRecoveryClass,
    notifications,
    dispatchAdminPushNotice,
    activeSessionQR,
    startSessionQR,
    stopSessionQR,
    incrementLiveScanCount,
    verifyStudentTimetable,
    studentDocuments,
    submitDocument,
    adminTargetAudience,
    setAdminTargetAudience,
    adminPreviewRole,
    setAdminPreviewRole,
  };

  return (
    <DatabaseProvider>
      <EnhancedContext.Provider value={enhancedValue}>
        {children}
      </EnhancedContext.Provider>
    </DatabaseProvider>
  );
};

export { EnhancedContext as MockDataContext };
export default EnhancedContext;
