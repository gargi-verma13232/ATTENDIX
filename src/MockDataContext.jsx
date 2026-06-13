import { createContext, useContext, useState } from 'react';

const MockDataContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useMockData = () => useContext(MockDataContext);

export const MockDataProvider = ({ children }) => {
  const [student] = useState({
    name: "Alex Johnson",
    id: "STU-2024-001",
    overallAttendance: 72,
    streak: 12,
    totalClasses: 150,
    classesAttended: 108,
    requiredAttendance: 75,
  });

  const [subjects] = useState([
    { id: 'CS101', name: 'Data Structures', attendance: 68, classesHeld: 30, classesAttended: 20 },
    { id: 'CS102', name: 'Database Systems', attendance: 85, classesHeld: 28, classesAttended: 24 },
    { id: 'CS103', name: 'Operating Systems', attendance: 71, classesHeld: 32, classesAttended: 23 },
    { id: 'HU101', name: 'Communication Skills', attendance: 90, classesHeld: 20, classesAttended: 18 },
  ]);

  const [attendanceTrend] = useState([
    { week: 'Week 1', 'Data Structures': 100, 'Database Systems': 100, 'Operating Systems': 100, 'Communication Skills': 100 },
    { week: 'Week 2', 'Data Structures': 90, 'Database Systems': 95, 'Operating Systems': 85, 'Communication Skills': 100 },
    { week: 'Week 3', 'Data Structures': 80, 'Database Systems': 90, 'Operating Systems': 80, 'Communication Skills': 95 },
    { week: 'Week 4', 'Data Structures': 75, 'Database Systems': 88, 'Operating Systems': 75, 'Communication Skills': 90 },
    { week: 'Week 5', 'Data Structures': 68, 'Database Systems': 85, 'Operating Systems': 71, 'Communication Skills': 90 },
  ]);

  return (
    <MockDataContext.Provider value={{ student, subjects, attendanceTrend }}>
      {children}
    </MockDataContext.Provider>
  );
};
