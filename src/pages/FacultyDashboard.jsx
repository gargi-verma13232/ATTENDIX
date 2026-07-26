import { useState } from 'react';
import { useMockData } from '../MockDataContext';
import {
  ClipboardCheck, Users, Clock, Check, X, FileText,
  AlertTriangle, BookOpen, Send, CheckSquare
} from 'lucide-react';

// ── Course map for display ────────────────────
const COURSE_MAP = {
  CS101: 'Data Structures',
  CS102: 'Database Systems',
  CS103: 'Operating Systems',
  HU101: 'Communication Skills',
};

const SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

// ── Attendance Toggle Button ──────────────────
const AttendanceToggle = ({ studentId, value, onChange }) => {
  const opts = ['Present', 'Absent', 'OD'];
  const colors = {
    Present: 'var(--status-safe)',
    Absent: 'var(--status-critical)',
    OD: 'var(--status-warning)',
  };
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {opts.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(studentId, opt)}
          style={{
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: '700',
            border: `1px solid ${value === opt ? colors[opt] : 'var(--panel-border)'}`,
            borderRadius: '6px',
            background: value === opt ? `${colors[opt]}18` : 'transparent',
            color: value === opt ? colors[opt] : 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            minHeight: '32px',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const FacultyDashboard = () => {
  const { currentUser, students, rectificationRequests, approveRequest, rejectRequest, addSessionLog } = useMockData();

  const [activeTab, setActiveTab] = useState('logger'); // 'logger' | 'inbox' | 'registry'

  // ── Session Logger State ──────────────────────
  const [logCourse, setLogCourse] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logSlot, setLogSlot] = useState('');
  const [topicsCovered, setTopicsCovered] = useState('');
  const [homeworkAssigned, setHomeworkAssigned] = useState('');
  const [quizAlert, setQuizAlert] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [logSuccess, setLogSuccess] = useState(false);
  const [logError, setLogError] = useState('');

  // ── Inbox Tab ─────────────────────────────────
  const [inboxTab, setInboxTab] = useState('pending');

  const facultyCourses = currentUser?.courses || [];
  const studentList = Object.values(students);

  // Initialise attendance map when course is selected
  const initAttendanceMap = (courseCode) => {
    const map = {};
    studentList.forEach(s => { map[s.id] = 'Present'; });
    setAttendanceMap(map);
    setLogCourse(courseCode);
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  const isSubmitDisabled = !logCourse || !logDate || !logSlot ||
    !topicsCovered.trim() || !homeworkAssigned.trim();

  const handleLogSubmit = (e) => {
    e.preventDefault();
    setLogError('');
    if (isSubmitDisabled) {
      setLogError('Please fill in all required fields before finalising the session.');
      return;
    }

    addSessionLog(
      { courseCode: logCourse, date: logDate, slot: logSlot, topicsCovered, homeworkAssigned, quizAlert },
      attendanceMap
    );

    setLogSuccess(true);
    setTopicsCovered('');
    setHomeworkAssigned('');
    setQuizAlert(false);
    setLogSlot('');
    setLogCourse('');
    setAttendanceMap({});
    setTimeout(() => setLogSuccess(false), 4000);
  };

  // Inbox data
  const filteredRequests = rectificationRequests.filter(r =>
    facultyCourses.includes(r.subjectId || r.courseCode)
  );
  const pendingRequests = filteredRequests.filter(r => r.status === 'pending');
  const historyRequests = filteredRequests.filter(r => r.status !== 'pending');

  // Tab style helper
  const tabStyle = (name) => ({
    background: 'none',
    border: 'none',
    padding: '12px 4px',
    color: activeTab === name ? 'var(--accent-primary)' : 'var(--text-muted)',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    borderBottom: activeTab === name ? '2px solid var(--accent-primary)' : '2px solid transparent',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'inherit',
  });

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h1 className="page-title">Welcome, {currentUser?.name || 'Faculty Member'}</h1>
        <p className="page-subtitle">Log sessions, mark attendance, and manage duty leave requests.</p>
      </div>

      {/* ── Stats Row ──────────────────────────── */}
      <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
        <div className="glass-panel col-span-4" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', background: 'rgba(59,130,246,0.1)', color: 'var(--accent-primary)', borderRadius: '12px' }}>
            <Users size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '28px' }}>{studentList.length}</h2>
            <p style={{ fontSize: '13px' }}>Enrolled Students</p>
          </div>
        </div>
        <div className="glass-panel col-span-4" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', background: 'rgba(139,92,246,0.1)', color: 'var(--accent-secondary)', borderRadius: '12px' }}>
            <ClipboardCheck size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '28px' }}>{facultyCourses.length}</h2>
            <p style={{ fontSize: '13px' }}>Active Courses</p>
          </div>
        </div>
        <div className="glass-panel col-span-4" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', background: pendingRequests.length > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', color: pendingRequests.length > 0 ? 'var(--status-warning)' : 'var(--status-safe)', borderRadius: '12px' }}>
            <Clock size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '28px' }}>{pendingRequests.length}</h2>
            <p style={{ fontSize: '13px' }}>Pending OD Approvals</p>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ─────────────────────── */}
      <div className="glass-panel col-span-12" style={{ minHeight: '400px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--panel-border)', marginBottom: '28px', gap: '28px', overflowX: 'auto' }}>
          <button style={tabStyle('logger')} onClick={() => setActiveTab('logger')}>
            <BookOpen size={16} /> Session Logger
          </button>
          <button style={tabStyle('inbox')} onClick={() => setActiveTab('inbox')}>
            <FileText size={16} /> Resolution Inbox
            {pendingRequests.length > 0 && (
              <span style={{ background: 'var(--status-warning)', color: 'black', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '10px' }}>
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button style={tabStyle('registry')} onClick={() => setActiveTab('registry')}>
            <Users size={16} /> Attendance Registry
          </button>
        </div>

        {/* ══ SESSION LOGGER ══════════════════════ */}
        {activeTab === 'logger' && (
          <div className="faculty-logger">
            <h2 style={{ marginBottom: '4px', fontSize: '18px' }}>Daily Session Logger</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Select a course, mark attendance, fill in session details, then finalize.
            </p>

            {logSuccess && (
              <div className="alert-success" style={{ marginBottom: '20px' }}>
                <Check size={16} /> Session logged successfully! Student records have been updated.
              </div>
            )}
            {logError && (
              <div className="alert-error" style={{ marginBottom: '20px' }}>
                <AlertTriangle size={16} /> {logError}
              </div>
            )}

            <form onSubmit={handleLogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Course / Date / Slot selectors */}
              <div className="faculty-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div>
                  <label className="field-label">Course *</label>
                  <select
                    value={logCourse}
                    onChange={e => initAttendanceMap(e.target.value)}
                    className="form-control"
                    required
                  >
                    <option value="">Select Course</option>
                    {facultyCourses.map(code => (
                      <option key={code} value={code}>{code} — {COURSE_MAP[code] || code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Session Date *</label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={e => setLogDate(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Time Slot *</label>
                  <select
                    value={logSlot}
                    onChange={e => setLogSlot(e.target.value)}
                    className="form-control"
                    required
                  >
                    <option value="">Select Slot</option>
                    {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Student Roster */}
              {logCourse && studentList.length > 0 && (
                <div>
                  <label className="field-label" style={{ marginBottom: '12px', display: 'block' }}>
                    Student Roster — {COURSE_MAP[logCourse] || logCourse}
                  </label>
                  <div className="roster-table">
                    <div className="roster-header">
                      <span>Student</span>
                      <span>ID</span>
                      <span>Attendance Status</span>
                    </div>
                    {studentList.map(stu => (
                      <div key={stu.id} className="roster-row">
                        <span style={{ fontWeight: '500' }}>{stu.name}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>{stu.id}</span>
                        <AttendanceToggle
                          studentId={stu.id}
                          value={attendanceMap[stu.id] || 'Present'}
                          onChange={handleAttendanceChange}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Session Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="field-label">Topics Covered * <span style={{ color: 'var(--status-critical)', fontWeight: '400' }}>(required to submit)</span></label>
                  <textarea
                    value={topicsCovered}
                    onChange={e => setTopicsCovered(e.target.value)}
                    placeholder="Describe the topics covered in today's session..."
                    className="form-control"
                    rows={3}
                    style={{ resize: 'vertical' }}
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Homework Assigned * <span style={{ color: 'var(--status-critical)', fontWeight: '400' }}>(required to submit)</span></label>
                  <textarea
                    value={homeworkAssigned}
                    onChange={e => setHomeworkAssigned(e.target.value)}
                    placeholder="Describe the assignment or problem set given to students..."
                    className="form-control"
                    rows={2}
                    style={{ resize: 'vertical' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setQuizAlert(!quizAlert)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: quizAlert ? 'var(--status-warning)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit', fontSize: '14px', fontWeight: '600' }}
                  >
                    {quizAlert ? <CheckSquare size={20} color="var(--status-warning)" /> : <CheckSquare size={20} />}
                    Set Quiz Alert for this session
                  </button>
                </div>
              </div>

              {/* Validation Gate Submit */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitDisabled}
                  style={{
                    padding: '12px 24px',
                    opacity: isSubmitDisabled ? 0.45 : 1,
                    cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Send size={16} /> Submit &amp; Finalize Session
                </button>
                {isSubmitDisabled && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Fill in Topics Covered and Homework Assigned to enable submission.
                  </p>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ══ RESOLUTION INBOX ════════════════════ */}
        {activeTab === 'inbox' && (
          <div>
            <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--panel-border)', marginBottom: '24px' }}>
              {[['pending', 'Pending Approvals'], ['history', 'Processed History']].map(([key, label]) => {
                const count = key === 'pending' ? pendingRequests.length : historyRequests.length;
                return (
                  <button
                    key={key}
                    onClick={() => setInboxTab(key)}
                    style={{
                      background: 'none', border: 'none',
                      padding: '12px 4px',
                      color: inboxTab === key ? 'var(--accent-primary)' : 'var(--text-muted)',
                      fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                      borderBottom: inboxTab === key ? '2px solid var(--accent-primary)' : '2px solid transparent',
                      display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit',
                    }}
                  >
                    {label}
                    {count > 0 && (
                      <span style={{ background: key === 'pending' ? 'var(--status-warning)' : 'rgba(255,255,255,0.1)', color: key === 'pending' ? 'black' : 'var(--text-main)', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '10px' }}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {inboxTab === 'pending' ? (
              pendingRequests.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', padding: '32px 0', textAlign: 'center' }}>No pending requests.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {pendingRequests.map(req => (
                    <div key={req.id} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', border: '1px solid var(--panel-border)', borderRadius: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <strong style={{ fontSize: '15px' }}>{req.studentName}</strong>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{req.studentId}</span>
                          <span className="status-badge warning" style={{ fontSize: '10px', padding: '1px 6px' }}>pending</span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '4px' }}>
                          Course: <strong>{req.subjectName || req.courseTitle}</strong> ({req.subjectId || req.courseCode})
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Reason: {req.reason} · Date: {req.date}</p>
                        {(req.fileName || req.proofName) && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent-primary)', marginTop: '6px', background: 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                            Attachment: {req.fileName || req.proofName}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button onClick={() => approveRequest(req.id)} className="btn btn-secondary" style={{ padding: '8px 12px', borderColor: 'var(--status-safe)', color: 'var(--status-safe)' }}>
                          <Check size={16} /> Approve
                        </button>
                        <button onClick={() => rejectRequest(req.id)} className="btn btn-secondary" style={{ padding: '8px 12px', borderColor: 'var(--status-critical)', color: 'var(--status-critical)' }}>
                          <X size={16} /> Deny
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              historyRequests.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', padding: '32px 0', textAlign: 'center' }}>No requests processed yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {historyRequests.map(req => (
                    <div key={req.id} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--panel-border)', borderRadius: '12px', opacity: 0.85 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <strong>{req.studentName}</strong>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{req.studentId}</span>
                          <span className={`status-badge ${req.status === 'approved' || req.status === 'Approved' ? 'safe' : 'critical'}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                            {req.status}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '4px' }}>
                          Course: <strong>{req.subjectName || req.courseTitle}</strong>
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Reason: {req.reason} · Date: {req.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* ══ ATTENDANCE REGISTRY ══════════════════ */}
        {activeTab === 'registry' && (
          <div>
            <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} /> Course Attendance Registry
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
                    <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Student Name</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>ID</th>
                    {facultyCourses.map(code => (
                      <th key={code} style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                        {COURSE_MAP[code] || code}
                      </th>
                    ))}
                    <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentList.map(stu => (
                    <tr key={stu.id} style={{ borderBottom: '1px solid var(--panel-border)' }}>
                      <td style={{ padding: '16px', fontWeight: '500' }}>{stu.name}</td>
                      <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: '13px' }}>{stu.id}</td>
                      {facultyCourses.map(code => {
                        const subj = stu.subjects?.find(s => s.id === code);
                        const pct = subj?.attendance ?? 0;
                        return (
                          <td key={code} style={{ padding: '16px' }}>
                            <span style={{ fontWeight: '600', color: pct >= 75 ? 'var(--status-safe)' : 'var(--status-critical)' }}>{pct}%</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                              ({subj?.classesAttended ?? 0}/{subj?.classesHeld ?? 0})
                            </span>
                          </td>
                        );
                      })}
                      <td style={{ padding: '16px' }}>
                        {stu.overallAttendance < 75 ? (
                          <span className="status-badge critical" style={{ fontSize: '11px' }}><AlertTriangle size={12} /> At Risk</span>
                        ) : (
                          <span className="status-badge safe" style={{ fontSize: '11px' }}><Check size={12} /> Eligible</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;
