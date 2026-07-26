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

  const logStudentAttendanceScan = (courseId, date, slotId) => {
    const key = `${courseId}_${date}_${slotId}`;
    setSessionRosters(prev => {
      const current = prev[key] || defaultRoster;
      const updated = current.map(student => {
        if (student.id === 'stu-001') {
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
