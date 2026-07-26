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

export const campusConfig = {
  name: "Main University Campus - Academic Block B",
  latitude: 12.971598,
  longitude: 77.594562,
  radiusMeters: 100, // Students within 100m are verified inside campus
};

export const facultyProfile = {
  name: "Prof. Rajesh Mehta",
  title: "Principal Professor & Course Coordinator",
  department: "Computer Science & Engineering",
  cabinOfficeLocation: "Room A-402, Tech Block (4th Floor)",
  email: "r.mehta@attendix.edu",
  badge: "Senior Faculty",
};

export const facultySchedule = [
  {
    id: "slot-1",
    slotTime: "09:00 AM - 10:00 AM",
    courseId: "cs-301",
    courseName: "Data Structures",
    courseCode: "BCSE301L",
    room: "Room B301",
    batch: "CSE - Sec B",
    active: true,
  },
  {
    id: "slot-2",
    slotTime: "10:30 AM - 11:30 AM",
    courseId: "cs-302",
    courseName: "Database Systems",
    courseCode: "BCSE302L",
    room: "Lab C-104",
    batch: "CSE - Sec A",
    active: false,
  },
  {
    id: "slot-3",
    slotTime: "02:00 PM - 03:00 PM",
    courseId: "cs-303",
    courseName: "Computer Networks",
    courseCode: "BCSE303L",
    room: "Room B305",
    batch: "CSE - Sec C",
    active: false,
  },
];

export const defaultRoster = [
  { id: "STU001", rollNo: "21BCE1001", name: "Ananya Sharma", status: "present", avatar: "AS" },
  { id: "STU002", rollNo: "21BCE1014", name: "Rohan Kapoor", status: "present", avatar: "RK" },
  { id: "STU003", rollNo: "21BCE1022", name: "Priya Nair", status: "present", avatar: "PN" },
  { id: "STU004", rollNo: "21BCE1045", name: "Vikramaditya Rao", status: "absent", avatar: "VR" },
  { id: "STU005", rollNo: "21BCE1067", name: "Divya Venkat", status: "present", avatar: "DV" },
  { id: "STU006", rollNo: "21BCE1089", name: "Karthik Verma", status: "present", avatar: "KV" },
  { id: "STU007", rollNo: "21BCE1102", name: "Meera Krishnan", status: "absent", avatar: "MK" },
  { id: "STU008", rollNo: "21BCE1115", name: "Siddharth Joshi", status: "present", avatar: "SJ" },
  { id: "STU009", rollNo: "21BCE1130", name: "Sneha Reddy", status: "present", avatar: "SR" },
  { id: "STU010", rollNo: "21BCE1144", name: "Aarav Patel", status: "present", avatar: "AP" },
];

export const defaultSessionNotes = {
  "cs-301_2026-07-26_slot-1": {
    summary: "Covered AVL Tree Balancing algorithms (LL, RR, LR, RL rotations) with step-by-step tree insertion traces on the blackboard.",
    homework: "Implement AVL Tree node insertion in C++ / Java and solve Exercise 4.2 (Questions 1 to 5).",
    photos: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80", // Blackboard / slide notes sample
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80", // Equation / diagram notes sample
    ],
  },
  "cs-302_2026-07-26_slot-2": {
    summary: "Normal forms in Database Design: 1NF, 2NF, 3NF, and BCNF with relational decomposition examples.",
    homework: "Convert the provided hospital management schema into 3NF and check for lossless join property.",
    photos: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    ],
  },
};

export const initialOdRequests = [
  {
    id: "req-1",
    studentName: "Ananya Sharma",
    rollNo: "21BCE1001",
    courseId: "cs-301",
    courseName: "Data Structures",
    date: "2026-07-26",
    slotId: "slot-1",
    slotTime: "09:00 AM - 10:00 AM",
    type: "OD",
    reason: "Inter-University Hackathon Finalist representing CSE Dept",
    documentUrl: "hackathon-invitation-2026.pdf",
    status: "pending",
  },
  {
    id: "req-2",
    studentName: "Vikramaditya Rao",
    rollNo: "21BCE1045",
    courseId: "cs-302",
    courseName: "Database Systems",
    date: "2026-07-26",
    slotId: "slot-2",
    slotTime: "10:30 AM - 11:30 AM",
    type: "Medical",
    reason: "Viral fever - University Medical Center rest advice",
    documentUrl: "medical-certificate-july.pdf",
    status: "pending",
  },
  {
    id: "req-3",
    studentName: "Meera Krishnan",
    rollNo: "21BCE1102",
    courseId: "cs-301",
    courseName: "Data Structures",
    date: "2026-07-26",
    slotId: "slot-1",
    slotTime: "09:00 AM - 10:00 AM",
    type: "OD",
    reason: "National Level Basketball Tournament",
    documentUrl: "sports-dept-permission.pdf",
    status: "approved",
  },
];

export const institutionalNotices = [
  {
    id: "notice-1",
    title: "Mid-Term Examination Invigilation Roster Released",
    category: "Exam Duty",
    date: "July 28, 2026",
    time: "02:00 PM",
    location: "Examination Cell",
    priority: "High",
    details: "All faculty must check their duty rooms for the upcoming CAT-1 exams starting Aug 2nd.",
  },
  {
    id: "notice-2",
    title: "CSE Department Academic Curriculum Review Meeting",
    category: "Meeting",
    date: "July 29, 2026",
    time: "11:00 AM",
    location: "Conference Hall 2B",
    priority: "Medium",
    details: "Discussion on revising Data Structures & Database labs with AI-assisted grading modules.",
  },
  {
    id: "notice-3",
    title: "Final Deadline for July Attendance Rectification Submissions",
    category: "Academic Deadline",
    date: "July 31, 2026",
    time: "05:00 PM",
    location: "ERP Portal",
    priority: "High",
    details: "All pending OD and medical leave requests must be resolved before month-end freeze.",
  },
];