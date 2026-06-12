export const studentProfile = {
  name: "Ananya Sharma",
  branch: "B.Tech CSE",
  year: "3rd Year",
  currentStreak: 12,
  nextBadge: "Perfect Month",
  totalClassesScheduled: 150,
  totalClassesAttended: 102, 
};

export const subjectAttendance = [
  {
    id: "cs-301",
    name: "Data Structures",
    code: "BCSE301L",
    faculty: "Prof. R. Mehta",
    attended: 28,
    total: 42, 
    weeklyHistory: [75, 74, 70, 68, 67, 66.6],
    classesPerWeek: 4,
  },
  {
    id: "cs-302",
    name: "Database Systems",
    code: "BCSE302L",
    faculty: "Dr. N. Kapoor",
    attended: 38,
    total: 44, 
    weeklyHistory: [80, 82, 85, 84, 86, 86.3],
    classesPerWeek: 3,
  },
  {
    id: "cs-303",
    name: "Computer Networks",
    code: "BCSE303L",
    faculty: "Dr. A. Verma",
    attended: 36,
    total: 48,
    weeklyHistory: [78, 77, 76, 75, 75, 75],
    classesPerWeek: 4,
  }
];

export const dailyTimetable = [
  { id: "slot-1", time: "09:00 AM - 10:00 AM", subject: "Database Systems", room: "Room B301" },
  { id: "slot-2", time: "10:00 AM - 11:00 AM", subject: "Data Structures", room: "Room B302" },
  { id: "slot-3", time: "11:00 AM - 12:00 PM", subject: "Computer Networks", room: "Room B305" },
];