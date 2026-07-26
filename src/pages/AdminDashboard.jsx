import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMockData } from '../MockDataContext';
import {
  Shield, Users, Award, AlertTriangle, Settings, Save, Check, Ban,
  Search, Filter, TrendingUp, Zap, Bell, Database, Plus, MapPin, Navigation, UserPlus
} from 'lucide-react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, Line,
  ReferenceLine,
} from 'recharts';

// ── Least-squares linear regression ──────────
const linearRegression = (points) => {
  const n = points.length;
  if (n < 2) return null;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const b = (sumY - m * sumX) / n;
  return { m, b };
};

// ── Custom Scatter Tooltip ────────────────────
const ScatterTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div style={{ background: 'rgba(11,14,20,0.95)', border: '1px solid var(--panel-border)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px' }}>
        <p style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>{d.name}</p>
        <p style={{ color: 'var(--text-muted)' }}>Exam Score: <strong style={{ color: 'var(--accent-primary)' }}>{d.x}</strong></p>
        <p style={{ color: 'var(--text-muted)' }}>Attendance: <strong style={{ color: 'var(--status-safe)' }}>{d.y}%</strong></p>
      </div>
    );
  }
  return null;
};

const AdminDashboard = () => {
  const {
    dbState, students, rectificationRequests, activeSection,
    addStudent, addFaculty, resetDB, importJSONState, bulkDispatchOD,
    campusConfig, updateCampusConfig,
    adminTargetAudience, setAdminTargetAudience,
    adminPreviewRole, setAdminPreviewRole,
    dispatchAdminPushNotice,
  } = useMockData();

  const [requiredThreshold, setRequiredThreshold] = useState(75);
  const [isSaved, setIsSaved] = useState(false);

  // Add User Form mode: 'student' | 'faculty'
  const [addMode, setAddMode] = useState('student');
  const [userIdInput, setUserIdInput] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [examScore, setExamScore] = useState('');
  const [assignedCourses, setAssignedCourses] = useState('CS101, CS102');
  const [addStatus, setAddStatus] = useState({ success: null, message: '' });

  // Campus GPS Configuration State
  const [gpsLat, setGpsLat] = useState(() => campusConfig?.lat ?? 28.4595);
  const [gpsLng, setGpsLng] = useState(() => campusConfig?.lng ?? 77.0266);
  const [gpsRadius, setGpsRadius] = useState(() => campusConfig?.radiusMeters ?? 200);
  const [enforceGeofence, setEnforceGeofence] = useState(() => campusConfig?.enforceGeofence ?? true);
  const [gpsMsg, setGpsMsg] = useState({ success: null, message: '' });

  // JSON Hub
  const [rawJSON, setRawJSON] = useState('');
  const [importStatus, setImportStatus] = useState({ success: null, message: '' });
  const [copyStatus, setCopyStatus] = useState(false);

  // OD Dispatcher
  const [odEventTitle, setOdEventTitle] = useState('');
  const [odDate, setOdDate] = useState('');
  const [odTimeWindow, setOdTimeWindow] = useState('');
  const [odStudentIds, setOdStudentIds] = useState('');
  const [odPolicy, setOdPolicy] = useState('Auto-Approve');
  const [odStatus, setOdStatus] = useState({ success: null, message: '' });

  // Directory search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const studentList = Object.values(students || {});
  const totalStudents = studentList.length;
  const avgAttendance = totalStudents > 0
    ? Math.round(studentList.reduce((a, s) => a + s.overallAttendance, 0) / totalStudents) : 0;
  const criticalStudents = studentList.filter(s => s.overallAttendance < requiredThreshold).length;
  const totalRequests = (rectificationRequests || []).length;
  const pendingRequests = (rectificationRequests || []).filter(r => r.status === 'pending').length;

  // ── Quick Add User Handler ────────────────────
  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    if (!userIdInput || !fullName || !department) {
      setAddStatus({ success: false, message: 'Please fill in all required fields.' });
      return;
    }

    if (addMode === 'student') {
      const score = parseInt(examScore) || 75;
      if (students[userIdInput]) {
        setAddStatus({ success: false, message: 'Student ID already exists.' });
        return;
      }
      const newStudentObj = {
        id: userIdInput.trim(), name: fullName.trim(), role: 'student',
        overallAttendance: score, streak: 0, totalClasses: 100, classesAttended: score,
        requiredAttendance: 75, branch: department.trim(), year: '1st Year',
        examScore: score, badges: [], nextBadge: 'Getting Started',
        timetable: { 1: [], 2: [], 3: [], 4: [], 5: [] },
        subjects: [
          { id: 'CS101', name: 'Data Structures', attendance: score, classesHeld: 25, classesAttended: Math.round(25 * score / 100) },
          { id: 'CS102', name: 'Database Systems', attendance: score, classesHeld: 25, classesAttended: Math.round(25 * score / 100) },
          { id: 'CS103', name: 'Operating Systems', attendance: score, classesHeld: 25, classesAttended: Math.round(25 * score / 100) },
          { id: 'HU101', name: 'Communication Skills', attendance: score, classesHeld: 25, classesAttended: Math.round(25 * score / 100) },
        ],
        courses: {
          CS101: { title: 'Data Structures', faculty: 'Dr. R. Mehta', history: [] },
          CS102: { title: 'Database Systems', faculty: 'Dr. R. Mehta', history: [] },
          CS103: { title: 'Operating Systems', faculty: 'Prof. S. Kumar', history: [] },
          HU101: { title: 'Communication Skills', faculty: 'Dr. P. Nair', history: [] },
        },
        attendanceTrend: [
          { week: 'Week 1', 'Data Structures': score, 'Database Systems': score, 'Operating Systems': score, 'Communication Skills': score },
          { week: 'Week 2', 'Data Structures': score, 'Database Systems': score, 'Operating Systems': score, 'Communication Skills': score },
          { week: 'Week 3', 'Data Structures': score, 'Database Systems': score, 'Operating Systems': score, 'Communication Skills': score },
          { week: 'Week 4', 'Data Structures': score, 'Database Systems': score, 'Operating Systems': score, 'Communication Skills': score },
          { week: 'Week 5', 'Data Structures': score, 'Database Systems': score, 'Operating Systems': score, 'Communication Skills': score },
        ],
      };
      addStudent(newStudentObj);
      setAddStatus({ success: true, message: `Successfully created Student: ${fullName} (${userIdInput})` });
    } else {
      const coursesArr = assignedCourses.split(',').map(c => c.trim()).filter(Boolean);
      const newFacultyObj = {
        id: userIdInput.trim(),
        name: fullName.trim(),
        department: department.trim(),
        courses: coursesArr,
        role: 'faculty'
      };
      addFaculty(newFacultyObj);
      setAddStatus({ success: true, message: `Successfully created Faculty: ${fullName} (${userIdInput})` });
    }

    setUserIdInput(''); setFullName(''); setDepartment(''); setExamScore('');
    setTimeout(() => setAddStatus({ success: null, message: '' }), 3000);
  };

  // ── GPS Geofence Handlers ─────────────────────
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsMsg({ success: false, message: 'Geolocation is not supported by your browser.' });
      return;
    }
    setGpsMsg({ success: true, message: 'Fetching current GPS coordinates...' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latVal = parseFloat(pos.coords.latitude.toFixed(6));
        const lngVal = parseFloat(pos.coords.longitude.toFixed(6));
        setGpsLat(latVal);
        setGpsLng(lngVal);
        setGpsMsg({ success: true, message: `Location updated: ${latVal}, ${lngVal}` });
        setTimeout(() => setGpsMsg({ success: null, message: '' }), 3000);
      },
      (err) => {
        setGpsMsg({ success: false, message: `GPS Error: ${err.message}` });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveGpsConfig = (e) => {
    e.preventDefault();
    updateCampusConfig({
      lat: parseFloat(gpsLat),
      lng: parseFloat(gpsLng),
      radiusMeters: parseInt(gpsRadius),
      enforceGeofence: Boolean(enforceGeofence)
    });
    setGpsMsg({ success: true, message: 'Campus GPS Geofence configuration updated!' });
    setTimeout(() => setGpsMsg({ success: null, message: '' }), 3000);
  };

  // ── JSON Hub ──────────────────────────────────
  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(dbState, null, 2))
      .then(() => { setCopyStatus(true); setTimeout(() => setCopyStatus(false), 2000); })
      .catch(console.error);
  };

  const handleImportJSONSubmit = (e) => {
    e.preventDefault();
    if (!rawJSON.trim()) { setImportStatus({ success: false, message: 'Please enter JSON.' }); return; }
    const res = importJSONState(rawJSON);
    if (res.success) {
      setImportStatus({ success: true, message: 'Database imported!' });
      setRawJSON('');
      setTimeout(() => setImportStatus({ success: null, message: '' }), 3000);
    } else {
      setImportStatus({ success: false, message: `Import failed: ${res.error.message}` });
    }
  };

  const handleResetDB = () => {
    if (window.confirm('Reset database to initial mock data? All changes will be lost.')) {
      resetDB();
      setImportStatus({ success: true, message: 'Database reset to defaults.' });
      setTimeout(() => setImportStatus({ success: null, message: '' }), 3000);
    }
  };

  // ── OD Dispatcher ─────────────────────────────
  const handleODDispatch = (e) => {
    e.preventDefault();
    if (!odEventTitle || !odDate || !odTimeWindow || !odStudentIds.trim()) {
      setOdStatus({ success: false, message: 'All fields are required.' });
      return;
    }
    const ids = odStudentIds.split(',').map(s => s.trim()).filter(Boolean);
    const validIds = ids.filter(id => students[id]);
    if (validIds.length === 0) {
      setOdStatus({ success: false, message: 'No valid student IDs found.' });
      return;
    }
    bulkDispatchOD(odEventTitle, odDate, odTimeWindow, validIds, odPolicy);
    const msg = odPolicy === 'Auto-Approve'
      ? `Auto-approved OD for ${validIds.length} student(s).`
      : `Dispatched ${validIds.length * 4} pending OD requests to faculty inbox.`;
    setOdStatus({ success: true, message: msg });
    setOdEventTitle(''); setOdDate(''); setOdTimeWindow(''); setOdStudentIds('');
    setTimeout(() => setOdStatus({ success: null, message: '' }), 4000);
  };

  // ── Scatter Plot data ─────────────────────────
  const scatterData = useMemo(() => studentList.map(s => ({
    x: s.examScore ?? 50,
    y: s.overallAttendance,
    name: s.name,
  })), [studentList]);

  const regression = useMemo(() => linearRegression(scatterData), [scatterData]);

  const regressionLineData = useMemo(() => {
    if (!regression) return [];
    return [30, 100].map(x => ({ x, y: Math.round(regression.m * x + regression.b) }));
  }, [regression]);

  // ── Directory filter ──────────────────────────
  const filteredStudents = studentList.filter(stu => {
    const q = searchQuery.toLowerCase();
    const matchSearch = stu.name.toLowerCase().includes(q) || stu.id.toLowerCase().includes(q);
    const eligible = stu.overallAttendance >= requiredThreshold;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'eligible' && eligible) || (filterStatus === 'blocked' && !eligible);
    return matchSearch && matchStatus;
  });

  const atRiskStudents = studentList.filter(s => s.overallAttendance < 75);

  // ══════════════════════════════════════════════
  // Section: Data & User Manager
  // ══════════════════════════════════════════════
  if (activeSection === 'admin-data') {
    return (
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database color="var(--accent-primary)" /> Data &amp; User Manager
          </h1>
          <p className="page-subtitle">Add students or faculty, manage GPS geofencing, copy backup payloads, or reload JSON.</p>
        </div>

        <div className="dashboard-grid">
          {/* Quick Add Form */}
          <div className="glass-panel col-span-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <UserPlus size={18} /> Quick Add User
              </h2>
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => setAddMode('student')}
                  style={{
                    padding: '4px 10px', fontSize: '11px', fontWeight: '700', borderRadius: '6px', border: 'none',
                    background: addMode === 'student' ? 'var(--accent-primary)' : 'transparent',
                    color: addMode === 'student' ? '#fff' : 'var(--text-muted)', cursor: 'pointer'
                  }}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode('faculty')}
                  style={{
                    padding: '4px 10px', fontSize: '11px', fontWeight: '700', borderRadius: '6px', border: 'none',
                    background: addMode === 'faculty' ? 'var(--accent-secondary)' : 'transparent',
                    color: addMode === 'faculty' ? '#fff' : 'var(--text-muted)', cursor: 'pointer'
                  }}
                >
                  Faculty
                </button>
              </div>
            </div>

            <form onSubmit={handleAddUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label>{addMode === 'student' ? 'Student ID / Roll No' : 'Faculty ID'}</label>
                <input
                  type="text"
                  value={userIdInput}
                  onChange={e => setUserIdInput(e.target.value)}
                  placeholder={addMode === 'student' ? 'e.g. STU-2024-003' : 'e.g. FAC-2024-002'}
                  className="form-control"
                  required
                />
              </div>
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Connor"
                  className="form-control"
                  required
                />
              </div>
              <div className="input-group">
                <label>Department / Branch</label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="form-control"
                  required
                />
              </div>
              {addMode === 'student' ? (
                <div className="input-group">
                  <label>Internal Exam Score (0–100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={examScore}
                    onChange={e => setExamScore(e.target.value)}
                    placeholder="e.g. 78"
                    className="form-control"
                  />
                </div>
              ) : (
                <div className="input-group">
                  <label>Assigned Course Codes (comma separated)</label>
                  <input
                    type="text"
                    value={assignedCourses}
                    onChange={e => setAssignedCourses(e.target.value)}
                    placeholder="e.g. CS101, CS102"
                    className="form-control"
                  />
                </div>
              )}

              {addStatus.message && (
                <div style={{
                  padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', textAlign: 'center',
                  background: addStatus.success ? 'var(--status-safe-bg)' : 'var(--status-critical-bg)',
                  color: addStatus.success ? 'var(--status-safe)' : 'var(--status-critical)',
                  border: addStatus.success ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.2)'
                }}>
                  {addStatus.message}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ padding: '12px 20px', marginTop: '8px' }}>
                <Plus size={16} /> Add {addMode === 'student' ? 'Student' : 'Faculty'} Record
              </button>
            </form>
          </div>

          {/* Campus GPS Settings Card */}
          <div className="glass-panel col-span-6">
            <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin color="var(--accent-primary)" size={20} /> Campus GPS Geofence Settings
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Configure coordinates and allowable radius for geofenced smart attendance validation.
            </p>

            <form onSubmit={handleSaveGpsConfig} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={gpsLat}
                    onChange={e => setGpsLat(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={gpsLng}
                    onChange={e => setGpsLng(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Geofence Radius (Meters)</label>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  value={gpsRadius}
                  onChange={e => setGpsRadius(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '10px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>Enforce Geofence Check</label>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Require students to be within campus bounds</p>
                </div>
                <input
                  type="checkbox"
                  checked={enforceGeofence}
                  onChange={e => setEnforceGeofence(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
              </div>

              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="btn btn-secondary"
                style={{ padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Navigation size={16} color="var(--accent-primary)" /> 📍 Set to My Current GPS Location
              </button>

              {gpsMsg.message && (
                <div style={{
                  padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', textAlign: 'center',
                  background: gpsMsg.success ? 'var(--status-safe-bg)' : 'var(--status-critical-bg)',
                  color: gpsMsg.success ? 'var(--status-safe)' : 'var(--status-critical)'
                }}>
                  {gpsMsg.message}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ padding: '12px' }}>
                <Save size={16} /> Save GPS Geofence Settings
              </button>
            </form>
          </div>

          {/* Backup & JSON Data Hub */}
          <div className="glass-panel col-span-12" style={{ marginTop: '12px' }}>
            <h2 style={{ marginBottom: '16px' }}>Backup &amp; JSON Data Hub</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Export the current database state or restore from a raw JSON payload.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <button onClick={handleCopyJSON} className="btn btn-secondary" style={{ flex: 1, padding: '12px' }}>
                {copyStatus ? '✓ Copied!' : '📋 Copy JSON Backup'}
              </button>
              <button onClick={handleResetDB} className="btn btn-secondary" style={{ flex: 1, padding: '12px', color: 'var(--status-critical)', borderColor: 'rgba(239,68,68,0.2)' }}>
                ⚠ Reset Database
              </button>
            </div>
            <form onSubmit={handleImportJSONSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label>Paste Raw JSON Configuration</label>
                <textarea
                  value={rawJSON}
                  onChange={e => setRawJSON(e.target.value)}
                  placeholder="Paste database state JSON here..."
                  className="form-control"
                  style={{ minHeight: '140px', fontFamily: 'monospace', fontSize: '12px', resize: 'vertical', background: 'rgba(0,0,0,0.3)' }}
                  required
                />
              </div>
              {importStatus.message && (
                <div style={{ padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', textAlign: 'center', background: importStatus.success ? 'var(--status-safe-bg)' : 'var(--status-critical-bg)', color: importStatus.success ? 'var(--status-safe)' : 'var(--status-critical)', border: importStatus.success ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.2)' }}>
                  {importStatus.message}
                </div>
              )}
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 20px' }}>Apply JSON State</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // Section: OD Event Dispatcher
  // ══════════════════════════════════════════════
  if (activeSection === 'admin-events') {
    return (
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Zap color="var(--accent-primary)" /> OD Event Dispatcher
          </h1>
          <p className="page-subtitle">Authorize mass On-Duty waivers for institutional events.</p>
        </div>

        <div className="dashboard-grid">
          <div className="glass-panel col-span-8">
            <h2 style={{ marginBottom: '20px' }}>Dispatch Mass OD Waiver</h2>
            {odStatus.message && (
              <div style={{ padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', marginBottom: '20px', background: odStatus.success ? 'var(--status-safe-bg)' : 'var(--status-critical-bg)', color: odStatus.success ? 'var(--status-safe)' : 'var(--status-critical)', border: odStatus.success ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.2)' }}>
                {odStatus.success ? <Check size={14} style={{ display: 'inline', marginRight: '6px' }} /> : <AlertTriangle size={14} style={{ display: 'inline', marginRight: '6px' }} />}
                {odStatus.message}
              </div>
            )}
            <form onSubmit={handleODDispatch} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="input-group">
                <label>Event Title</label>
                <input type="text" value={odEventTitle} onChange={e => setOdEventTitle(e.target.value)} placeholder="e.g. National Sports Championship" className="form-control" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label>Event Date</label>
                  <input type="date" value={odDate} onChange={e => setOdDate(e.target.value)} className="form-control" required />
                </div>
                <div className="input-group">
                  <label>Time Window / Slot</label>
                  <input type="text" value={odTimeWindow} onChange={e => setOdTimeWindow(e.target.value)} placeholder="e.g. 09:00–17:00" className="form-control" required />
                </div>
              </div>
              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ margin: 0 }}>Student IDs (comma-separated or CSV upload)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const csvSample = "STU-2024-001, STU-2024-002";
                      setOdStudentIds(csvSample);
                      alert("Simulated CSV File Uploaded! Extracted Student IDs: " + csvSample);
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '11px' }}
                  >
                    📁 Upload Student CSV File
                  </button>
                </div>
                <textarea value={odStudentIds} onChange={e => setOdStudentIds(e.target.value)} placeholder="STU-2024-001, STU-2024-002, or upload CSV file..." className="form-control" rows={3} style={{ resize: 'vertical' }} required />
              </div>
              <div>
                <label className="field-label" style={{ marginBottom: '12px', display: 'block' }}>Policy Mode</label>
                <div className="policy-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { key: 'Auto-Approve', label: 'Mode A — Auto-Approve', desc: 'Immediately marks matching slots as OD in student records.' },
                    { key: 'Expedited-Push', label: 'Mode B — Expedited Push', desc: 'Sends pending OD items to faculty resolution inbox.' },
                  ].map(opt => (
                    <div
                      key={opt.key}
                      onClick={() => setOdPolicy(opt.key)}
                      style={{
                        padding: '16px', borderRadius: '12px', cursor: 'pointer',
                        border: `2px solid ${odPolicy === opt.key ? 'var(--accent-primary)' : 'var(--panel-border)'}`,
                        background: odPolicy === opt.key ? 'rgba(59,130,246,0.08)' : 'transparent',
                        transition: 'all 0.2s',
                      }}
                    >
                      <h4 style={{ fontSize: '14px', marginBottom: '4px' }}>{opt.label}</h4>
                      <p style={{ fontSize: '12px' }}>{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                <Zap size={16} /> Dispatch OD Waiver
              </button>
            </form>
          </div>

          <div className="glass-panel col-span-4">
            <h3 style={{ marginBottom: '16px' }}>Student Directory</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Copy IDs to paste in the form.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
              {studentList.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{s.name}</p>
                    <p style={{ fontSize: '11px', fontFamily: 'monospace' }}>{s.id}</p>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: s.overallAttendance >= 75 ? 'var(--status-safe)' : 'var(--status-critical)' }}>
                    {s.overallAttendance}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // Section: Academic Analytics (Scatter Plot)
  // ══════════════════════════════════════════════
  if (activeSection === 'admin-correlation') {
    return (
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <TrendingUp color="var(--accent-primary)" /> Academic Analytics
          </h1>
          <p className="page-subtitle">Correlation between internal exam scores and attendance percentage.</p>
        </div>

        <div className="dashboard-grid">
          <div className="glass-panel col-span-12">
            <h2 style={{ marginBottom: '8px' }}>Exam Score vs. Attendance Scatter Plot</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Each point represents a student. The dotted line is the least-squares regression trend.
            </p>
            <div style={{ height: '420px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 40, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    domain={[30, 100]}
                    name="Exam Score"
                    stroke="var(--text-muted)"
                    label={{ value: 'Internal Exam Score', position: 'insideBottom', offset: -10, fill: 'var(--text-muted)', fontSize: 12 }}
                    tickFormatter={v => `${v}`}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    domain={[50, 100]}
                    name="Attendance %"
                    stroke="var(--text-muted)"
                    tickFormatter={v => `${v}%`}
                    label={{ value: 'Attendance %', angle: -90, position: 'insideLeft', offset: 10, fill: 'var(--text-muted)', fontSize: 12 }}
                  />
                  <ReTooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                  <ReferenceLine y={75} stroke="var(--status-critical)" strokeDasharray="6 3" label={{ value: '75% min', position: 'right', fill: 'var(--status-critical)', fontSize: 11 }} />
                  <Scatter
                    data={scatterData}
                    fill="var(--accent-primary)"
                    opacity={0.85}
                    shape={(props) => {
                      const { cx, cy } = props;
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={8}
                          fill="var(--accent-primary)"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth={2}
                          style={{ cursor: 'pointer' }}
                        />
                      );
                    }}
                  />
                  {regression && (
                    <Line
                      data={regressionLineData}
                      type="linear"
                      dataKey="y"
                      stroke="var(--accent-secondary)"
                      strokeWidth={2}
                      strokeDasharray="8 4"
                      dot={false}
                      isAnimationActive={false}
                      name="Trend Line"
                    />
                  )}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { label: 'Students Plotted', value: studentList.length, color: 'var(--accent-primary)' },
              { label: 'Avg Exam Score', value: `${Math.round(studentList.reduce((a, s) => a + (s.examScore ?? 50), 0) / (studentList.length || 1))}`, color: 'var(--accent-secondary)' },
              { label: 'Avg Attendance', value: `${avgAttendance}%`, color: 'var(--status-safe)' },
            ].map(card => (
              <div key={card.label} className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>{card.label}</p>
                <h2 style={{ fontSize: '28px', color: card.color }}>{card.value}</h2>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // Section: HOD Alert System
  // ══════════════════════════════════════════════
  if (activeSection === 'admin-hod') {
    return (
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bell color="var(--status-critical)" /> HOD Detention Risk Report
          </h1>
          <p className="page-subtitle">Students trending below 75% — immediate attention required.</p>
        </div>

        <div className="dashboard-grid">
          <div className="glass-panel col-span-4" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', color: 'var(--status-critical)', borderRadius: '10px' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '28px', color: 'var(--status-critical)' }}>{atRiskStudents.length}</h2>
              <p style={{ fontSize: '12px' }}>Students at Risk</p>
            </div>
          </div>
          <div className="glass-panel col-span-4" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(16,185,129,0.1)', color: 'var(--status-safe)', borderRadius: '10px' }}>
              <Check size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '28px', color: 'var(--status-safe)' }}>{totalStudents - atRiskStudents.length}</h2>
              <p style={{ fontSize: '12px' }}>Students Safe</p>
            </div>
          </div>
          <div className="glass-panel col-span-4" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(59,130,246,0.1)', color: 'var(--accent-primary)', borderRadius: '10px' }}>
              <Users size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '28px' }}>{totalStudents}</h2>
              <p style={{ fontSize: '12px' }}>Total Enrolled</p>
            </div>
          </div>

          <div className="glass-panel col-span-12">
            <h2 style={{ marginBottom: '20px' }}>Detention Risk Students</h2>
            {atRiskStudents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--status-safe)' }}>
                <CheckCircle size={40} style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontSize: '16px', fontWeight: '600' }}>All students are above 75%. No detentions needed!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {atRiskStudents
                  .sort((a, b) => a.overallAttendance - b.overallAttendance)
                  .map(stu => {
                    const gap = 75 - stu.overallAttendance;
                    const needed = Math.ceil(3 * stu.totalClasses - 4 * stu.classesAttended);
                    return (
                      <div key={stu.id} className="hod-alert-row">
                        <div className="hod-alert-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h4>{stu.name}</h4>
                            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{stu.id}</span>
                            <span className="status-badge critical" style={{ fontSize: '10px', padding: '1px 6px' }}>
                              <AlertTriangle size={10} /> {gap.toFixed(1)}% below threshold
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {stu.branch} · {stu.year} · Must attend <strong style={{ color: 'var(--status-warning)' }}>{needed}</strong> consecutive classes to recover
                          </p>
                        </div>
                        <div className="hod-alert-progress">
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stu.classesAttended}/{stu.totalClasses} classes</span>
                            <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--status-critical)' }}>{stu.overallAttendance}%</span>
                          </div>
                          <div className="progress-container">
                            <div className="progress-bar progress-critical" style={{ width: `${stu.overallAttendance}%` }} />
                            <div style={{ position: 'absolute', left: '75%', top: 0, bottom: 0, width: '2px', background: 'var(--status-warning)', borderRadius: '2px' }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // Default: Admin Overview
  // ══════════════════════════════════════════════
  const handleSaveConfig = () => { setIsSaved(true); setTimeout(() => setIsSaved(false), 2000); };

  return (
    <div className="dashboard-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield color="var(--accent-primary)" /> Administrator Overview
          </h1>
          <p className="page-subtitle">College-wide statistics, global eligibility thresholds, and student directory.</p>
        </div>

        {/* ADMIN TARGET VIEW & PUSH CONTROL PANEL */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '8px 14px', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
            Push Target:
          </span>
          <button
            onClick={() => setAdminTargetAudience('students')}
            className={`btn ${adminTargetAudience === 'students' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            🎓 Students
          </button>
          <button
            onClick={() => setAdminTargetAudience('teachers')}
            className={`btn ${adminTargetAudience === 'teachers' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            📋 Teachers
          </button>
          <div style={{ width: '1px', height: '20px', background: 'var(--panel-border)', margin: '0 4px' }} />
          <button
            onClick={() => setAdminPreviewRole(adminPreviewRole === 'student' ? 'none' : 'student')}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px', color: adminPreviewRole === 'student' ? 'var(--accent-primary)' : 'var(--text-main)' }}
          >
            👁️ Preview Student View
          </button>
          <button
            onClick={() => setAdminPreviewRole(adminPreviewRole === 'faculty' ? 'none' : 'faculty')}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px', color: adminPreviewRole === 'faculty' ? 'var(--accent-secondary)' : 'var(--text-main)' }}
          >
            👁️ Preview Teacher View
          </button>
        </div>
      </div>

      {/* ADMIN PREVIEW MODAL / BANNER IF ACTIVE */}
      {adminPreviewRole !== 'none' && (
        <div style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid var(--accent-secondary)', padding: '16px 20px', borderRadius: '14px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span className="status-badge safe" style={{ background: 'var(--accent-secondary)', color: '#fff' }}>
              👁️ Admin Inspection Preview: View as {adminPreviewRole === 'student' ? 'Student' : 'Teacher'}
            </span>
            <button onClick={() => setAdminPreviewRole('none')} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: '700' }}>
              ✖ Close Preview
            </button>
          </div>
          <p style={{ fontSize: '13px', margin: 0, color: 'var(--text-main)' }}>
            This live preview shows what the pushed announcements, OD waivers, and timetable recovery slots will look like to {adminPreviewRole === 'student' ? 'enrolled students' : 'faculty members'}.
          </p>
        </div>
      )}

      <div className="dashboard-grid">
        {[
          { icon: <Users size={24} />, value: totalStudents, label: 'Total Enrolled Students', bg: 'rgba(59,130,246,0.1)', color: 'var(--accent-primary)' },
          { icon: <Shield size={24} />, value: Object.keys(dbState.faculty || {}).length || 18, label: 'Active Faculty Members', bg: 'rgba(139,92,246,0.1)', color: 'var(--accent-secondary)' },
          { icon: <Award size={24} />, value: `${avgAttendance}%`, label: 'Average Attendance Rate', bg: 'rgba(16,185,129,0.1)', color: 'var(--status-safe)' },
          { icon: <Bell size={24} />, value: '38 Days Left', label: 'End-Sem Exam Countdown', bg: 'rgba(245,158,11,0.1)', color: 'var(--status-warning)' },
        ].map(m => (
          <motion.div
            key={m.label}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="glass-panel col-span-3"
            style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <div style={{ padding: '12px', background: m.bg, color: m.color, borderRadius: '10px' }}>{m.icon}</div>
            <div><h2 style={{ fontSize: '22px' }}>{m.value}</h2><p style={{ fontSize: '12px' }}>{m.label}</p></div>
          </motion.div>
        ))}

        <div className="glass-panel col-span-12">
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} /> Attendance Policy Manager
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', marginBottom: '16px' }}>
                Set the global required attendance percentage for exam eligibility.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input type="range" min="50" max="90" value={requiredThreshold} onChange={e => setRequiredThreshold(parseInt(e.target.value))} style={{ flex: 1, accentColor: 'var(--accent-primary)', height: '6px', borderRadius: '3px', cursor: 'pointer' }} />
                <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-primary)', minWidth: '60px', textAlign: 'right' }}>{requiredThreshold}%</span>
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Academic Session</p>
                <h3 style={{ fontSize: '18px', marginTop: '4px' }}>Fall Semester 2026</h3>
              </div>
              <button onClick={handleSaveConfig} className="btn btn-primary" style={{ padding: '10px 16px' }}>
                {isSaved ? <><Check size={16} /> Saved</> : <><Save size={16} /> Save Policy</>}
              </button>
            </div>
          </div>
        </div>

        <div className="glass-panel col-span-12">
          <h2 style={{ marginBottom: '16px' }}>Student Directory &amp; Eligibility</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input type="text" placeholder="Search by name or ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="form-control" style={{ paddingLeft: '38px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <Filter size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-control" style={{ paddingLeft: '38px' }}>
                <option value="all">All Eligibility Zones</option>
                <option value="eligible">Eligible Zone</option>
                <option value="blocked">Blocked Zone</option>
              </select>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {filteredStudents.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '24px 0', textAlign: 'center' }}>No students match the search criteria.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
                    {['Student Name', 'ID', 'Branch & Year', 'Overall Attendance', 'Eligibility'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(stu => {
                    const eligible = stu.overallAttendance >= requiredThreshold;
                    return (
                      <tr key={stu.id} style={{ borderBottom: '1px solid var(--panel-border)' }}>
                        <td style={{ padding: '16px', fontWeight: '500' }}>{stu.name}</td>
                        <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: '13px' }}>{stu.id}</td>
                        <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>{stu.branch} · {stu.year}</td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontWeight: '700', fontSize: '15px', color: eligible ? 'var(--status-safe)' : 'var(--status-critical)' }}>{stu.overallAttendance}%</span>
                            <div className="progress-container" style={{ margin: 0, width: '80px', height: '6px' }}>
                              <div className={`progress-bar ${eligible ? 'progress-safe' : 'progress-critical'}`} style={{ width: `${stu.overallAttendance}%` }} />
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          {eligible
                            ? <span className="status-badge safe" style={{ fontSize: '11px' }}><Check size={12} /> Eligible</span>
                            : <span className="status-badge critical" style={{ fontSize: '11px' }}><Ban size={12} /> Blocked (&lt;{requiredThreshold}%)</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckCircle = ({ size, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

export default AdminDashboard;
