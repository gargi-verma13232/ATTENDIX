import { useState, useMemo } from 'react';
import { useMockData } from '../MockDataContext';
import {
  Flame, Award, AlertTriangle, CheckCircle, Calculator,
  Check, Ban, BookOpen, ClipboardList, Zap, ChevronRight, X,
  MapPin, Clock, Navigation, Search, HelpCircle, XCircle
} from 'lucide-react';
import {
  LineChart, Line, ResponsiveContainer, Tooltip as ReTooltip,
} from 'recharts';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const SUBJECT_COLORS = {
  CS101: '#3B82F6',
  CS102: '#8B5CF6',
  CS103: '#10B981',
  HU101: '#F59E0B',
};

const BADGE_META = {
  '7-Day Streak':      { emoji: '🔥', color: '#F59E0B' },
  'Perfect Month':     { emoji: '🌟', color: '#8B5CF6' },
  'Attendance Warrior':{ emoji: '⚔️', color: '#EF4444' },
  'Getting Started':   { emoji: '🚀', color: '#3B82F6' },
};

const getStatus = (pct) => {
  if (pct >= 77) return 'safe';
  if (pct >= 75) return 'warning';
  return 'critical';
};

const getStatusLabel = (pct) => {
  if (pct >= 77) return 'Safe Zone (≥77%)';
  if (pct >= 75) return 'Warning Zone (75-76.9%)';
  return 'Critical (<75%)';
};

// Teacher Live Location Finder based on current hour/schedule
const getTeacherLiveLocation = (facultyName, courseCode) => {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 9 && hour < 10) {
    return {
      location: 'Lecture Hall A-101 (Block 2)',
      activity: 'Conducting CS101 Lecture',
      status: 'In Lecture',
      availableIn: '30 mins'
    };
  } else if (hour >= 10 && hour < 11) {
    return {
      location: 'Database Systems Lab (Computer Center 3)',
      activity: 'Supervising CS102 Practical Lab',
      status: 'In Lab',
      availableIn: '45 mins'
    };
  } else if (hour >= 11 && hour < 12) {
    return {
      location: 'Lecture Hall B-204 (Block 1)',
      activity: 'Conducting OS Session',
      status: 'In Lecture',
      availableIn: '15 mins'
    };
  } else if (hour >= 12 && hour < 14) {
    return {
      location: 'Faculty Cabin C-204 (CS Dept, 2nd Floor)',
      activity: 'Available for Student Doubts & OD Resolution',
      status: 'Available in Cabin',
      availableIn: 'Now'
    };
  } else if (hour >= 14 && hour < 16) {
    return {
      location: 'Seminar Hall 2 (Main Admin Block)',
      activity: 'Departmental Faculty Meeting',
      status: 'In Meeting',
      availableIn: '1 hour'
    };
  } else {
    return {
      location: 'Faculty Cabin C-204 (CS Department)',
      activity: 'Cabin Office Hours',
      status: 'Available in Cabin',
      availableIn: 'Now'
    };
  }
};

// Build today's timetable entries from student timetable + session logs
const getTodayFeed = (student, sessionLogs) => {
  const today = new Date();
  const dow = today.getDay();
  const slots = student?.timetable?.[dow] || [];
  const todayStr = today.toISOString().split('T')[0];

  return slots.map((slotLabel, idx) => {
    const [time, ...rest] = slotLabel.split(' - ');
    const courseName = rest.join(' - ');
    const sub = student.subjects?.find(s => s.name === courseName);
    const courseCode = sub?.id || null;

    const courseHistory = courseCode ? student.courses?.[courseCode]?.history || [] : [];
    const todayEntry = courseHistory.find(h => h.date === todayStr && h.slot === time);
    const status = todayEntry?.status || 'Scheduled';

    const sessionLog = sessionLogs?.find(
      l => l.courseCode === courseCode && l.date === todayStr && l.slot === time
    );

    return { id: `${idx}-${time}`, time, courseName, courseCode, status, sessionLog };
  });
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

// Task Dispatch Modal
const TaskModal = ({ entry, onClose }) => {
  if (!entry) return null;
  const log = entry.sessionLog;
  return (
    <div className="task-modal-backdrop" onClick={onClose}>
      <div className="task-modal" onClick={e => e.stopPropagation()}>
        <div className="task-modal-header">
          <div>
            <h3>{entry.courseName}</h3>
            <p style={{ fontSize: '12px', marginTop: '2px' }}>
              {entry.time} · {entry.status}
            </p>
          </div>
          <button className="task-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {log ? (
          <div className="task-modal-body">
            <div className="task-detail-block">
              <div className="task-detail-label">
                <BookOpen size={14} /> Topics Covered
              </div>
              <p>{log.topicsCovered}</p>
            </div>
            <div className="task-detail-block">
              <div className="task-detail-label">
                <ClipboardList size={14} /> Homework Assigned
              </div>
              <p>{log.homeworkAssigned}</p>
            </div>
            {log.quizAlert && (
              <div className="task-quiz-alert">
                <Zap size={14} /> Quiz upcoming in this subject — stay prepared!
              </div>
            )}
          </div>
        ) : (
          <div className="task-modal-body">
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
              No session log available for this class yet. Check back after the faculty logs the session.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Teacher Live Location Modal
const TeacherTrackerModal = ({ req, onClose }) => {
  if (!req) return null;
  const facultyName = req.courseCode === 'CS103' ? 'Prof. S. Kumar' : 'Dr. R. Mehta';
  const info = getTeacherLiveLocation(facultyName, req.courseCode || req.subjectId);

  return (
    <div className="task-modal-backdrop" onClick={onClose}>
      <div className="task-modal" onClick={e => e.stopPropagation()} style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
        <div className="task-modal-header" style={{ background: 'rgba(239, 68, 68, 0.08)' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin color="var(--accent-primary)" size={20} /> Resolve Rejected OD Request
            </h3>
            <p style={{ fontSize: '12px', marginTop: '2px' }}>
              {req.subjectName || req.courseTitle} · Date: {req.date}
            </p>
          </div>
          <button className="task-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="task-modal-body">
          <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px 16px', borderRadius: '10px' }}>
            <p style={{ fontSize: '12px', color: 'var(--status-critical)', fontWeight: '600', marginBottom: '2px' }}>Rejection Reason / Note</p>
            <p style={{ fontSize: '13px', color: 'var(--text-main)' }}>"{req.reason}" — Marked as Denied by Faculty.</p>
          </div>

          <div className="panel-inset" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '700' }}>{facultyName}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Course Professor</p>
              </div>
              <span className="status-badge warning" style={{ fontSize: '11px' }}>
                <Clock size={12} /> {info.status}
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <Navigation size={16} color="var(--accent-primary)" />
                <span>Current Location: <strong style={{ color: 'var(--text-main)' }}>{info.location}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <BookOpen size={16} color="var(--accent-secondary)" />
                <span>Live Activity: <strong style={{ color: 'var(--text-muted)' }}>{info.activity}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <Clock size={16} color="var(--status-safe)" />
                <span>Best Time to Visit: <strong style={{ color: 'var(--status-safe)' }}>{info.availableIn}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
          >
            Got it — Navigate to Cabin
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const StudentDashboard = () => {
  const { student, subjects, attendanceTrend, sessionLogs, rectificationRequests, rectifications } = useMockData();

  const [selectedAbsentSlot, setSelectedAbsentSlot] = useState(null);
  const [selectedRejectedReq, setSelectedRejectedReq] = useState(null);

  // Bunk / Leave Calculator Interactive Slider State
  const [bunkSliderValue, setBunkSliderValue] = useState(0); // -10 (must attend) to +10 (can skip)

  // ── Exam Eligibility ──────────────────────────
  const remainingClasses = student.totalClasses - student.classesAttended - 20;
  const requiredTotalAttended = Math.ceil((student.totalClasses * student.requiredAttendance) / 100);
  const classesNeeded = requiredTotalAttended - student.classesAttended;
  const isEligibleNow = student.overallAttendance >= student.requiredAttendance;
  const isPossibleToReach = classesNeeded <= remainingClasses;

  // ── Recovery Math (spec formula) ─────────────
  const totalHeld = student.totalClasses;
  const totalAttended = student.classesAttended;
  const recoveryNeeded = Math.ceil(3 * totalHeld - 4 * totalAttended);
  const safeLeavesAvailable = Math.floor((4 * totalAttended - 3 * totalHeld) / 3);

  // Dynamic calculation for Bunk / Leave Widget based on slider adjustment
  const simulatedAttended = Math.max(0, totalAttended + (bunkSliderValue < 0 ? Math.abs(bunkSliderValue) : 0));
  const simulatedHeld = Math.max(1, totalHeld + (bunkSliderValue > 0 ? bunkSliderValue : (bunkSliderValue < 0 ? Math.abs(bunkSliderValue) : 0)));
  const dynamicPercentage = Math.round((simulatedAttended / simulatedHeld) * 100);

  // ── Today's Feed ──────────────────────────────
  const todayFeed = useMemo(() => getTodayFeed(student, sessionLogs), [student, sessionLogs]);

  const overallStatus = getStatus(student.overallAttendance);
  const badges = student.badges || [];

  // Rejected rectifications list for Teacher Location Tracker
  const allReqs = rectificationRequests || rectifications || [];
  const rejectedRequests = allReqs.filter(r =>
    (r.studentId === student.id || !r.studentId) &&
    (r.status === 'Denied' || r.status === 'rejected' || r.status === 'Denied Request')
  );

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h1 className="page-title">Welcome back, {student.name.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here is your smart attendance snapshot and leave calculator for this semester.</p>
      </div>

      <div className="dashboard-grid">

        {/* ── Attendance Overview Ring ────────────── */}
        <div className="glass-panel col-span-8" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div className="circular-progress" style={{ '--progress': `${student.overallAttendance * 3.6}deg` }}>
            <div className="circular-progress-value">{student.overallAttendance}%</div>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ marginBottom: '4px' }}>Overall Attendance Ring</h2>
            <p style={{ marginBottom: '12px' }}>
              {student.classesAttended} of {student.totalClasses} total classes attended
            </p>
            <div className={`status-badge ${overallStatus}`} style={{ marginBottom: '12px' }}>
              {overallStatus === 'safe' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              {getStatusLabel(student.overallAttendance)}
            </div>

            {overallStatus !== 'safe' ? (
              <div className="recovery-callout critical-bg">
                <AlertTriangle size={14} />
                <span>
                  Must attend <strong>{Math.max(1, recoveryNeeded)}</strong> consecutive classes to recover to 75%.
                </span>
              </div>
            ) : (
              <div className="recovery-callout safe-bg">
                <CheckCircle size={14} />
                <span>
                  You can safely skip <strong>{Math.max(0, safeLeavesAvailable)}</strong> more classes while remaining safe!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Streak & Badges ────────────────────── */}
        <div className="glass-panel col-span-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '12px' }}>
          <div className="streak-icon-container">
            <Flame size={32} />
          </div>
          <h2 style={{ fontSize: '32px', marginBottom: '0' }}>{student.streak} Days</h2>
          <p style={{ fontWeight: '500', color: 'var(--text-main)' }}>Attendance Streak</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
            {badges.map(badge => {
              const meta = BADGE_META[badge] || { emoji: '🏅', color: '#6B7280' };
              return (
                <span key={badge} className="badge-chip" style={{ '--badge-color': meta.color }}>
                  {meta.emoji} {badge}
                </span>
              );
            })}
          </div>
        </div>

        {/* ── Interactive Bunk / Leave Calculator Widget ── */}
        <div className="glass-panel col-span-12">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator color="var(--accent-primary)" size={22} /> Bunk &amp; Recovery Calculator Widget
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Real-time Leave Simulation</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', marginBottom: '16px' }}>
                {safeLeavesAvailable > 0
                  ? `You are currently in the Safe Zone. Adjust the slider to see how skipping classes affects your 75% requirement.`
                  : `You are below 75%. Adjust the slider to see how many consecutive classes you must attend to recover.`}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
                  <span>Must Attend (+10 Classes)</span>
                  <span style={{ color: bunkSliderValue === 0 ? 'var(--accent-primary)' : bunkSliderValue > 0 ? 'var(--status-critical)' : 'var(--status-safe)' }}>
                    {bunkSliderValue === 0 ? 'Current Baseline' : bunkSliderValue > 0 ? `Skip +${bunkSliderValue} Classes` : `Attend +${Math.abs(bunkSliderValue)} Classes`}
                  </span>
                  <span>Can Skip (+10 Bunks)</span>
                </div>

                <input
                  type="range"
                  min="-10"
                  max="10"
                  value={bunkSliderValue}
                  onChange={e => setBunkSliderValue(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: bunkSliderValue > 0 ? 'var(--status-critical)' : 'var(--status-safe)', height: '8px', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div className="panel-inset" style={{
              display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', borderRadius: '16px',
              background: dynamicPercentage >= 75 ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
              borderColor: dynamicPercentage >= 75 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Projected Attendance</span>
                <span style={{ fontSize: '32px', fontWeight: '800', color: dynamicPercentage >= 75 ? 'var(--status-safe)' : 'var(--status-critical)' }}>
                  {dynamicPercentage}%
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {bunkSliderValue > 0
                  ? `Skipping ${bunkSliderValue} upcoming classes will shift your percentage from ${student.overallAttendance}% to ${dynamicPercentage}%.`
                  : bunkSliderValue < 0
                  ? `Attending ${Math.abs(bunkSliderValue)} consecutive classes will raise your percentage to ${dynamicPercentage}%.`
                  : `Currently at ${student.overallAttendance}% overall attendance.`}
              </p>
            </div>
          </div>
        </div>

        {/* ── Today's Class Feed ─────────────────── */}
        <div className="glass-panel col-span-12">
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📅 Today's Timetable Schedule
          </h2>
          {todayFeed.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
              No classes scheduled for today. Enjoy your free day! 🎉
            </p>
          ) : (
            <div className="today-feed">
              {todayFeed.map(entry => {
                const isAbsent = entry.status === 'Absent';
                const isOD = entry.status === 'OD';
                const isPresent = entry.status === 'Present';
                return (
                  <div
                    key={entry.id}
                    className={`feed-item ${isAbsent ? 'feed-absent' : isOD ? 'feed-od' : isPresent ? 'feed-present' : 'feed-scheduled'}`}
                    onClick={() => isAbsent ? setSelectedAbsentSlot(entry) : null}
                    style={{ cursor: isAbsent ? 'pointer' : 'default' }}
                  >
                    <div className="feed-time">{entry.time}</div>
                    <div className="feed-info">
                      <span className="feed-course">{entry.courseName}</span>
                      <span className={`feed-status-tag ${isAbsent ? 'tag-absent' : isOD ? 'tag-od' : isPresent ? 'tag-present' : 'tag-scheduled'}`}>
                        {entry.status}
                      </span>
                    </div>
                    {isAbsent && (
                      <div className="feed-action">
                        <ChevronRight size={16} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Teacher Location Tracker for Rejected OD Requests ── */}
        <div className="glass-panel col-span-12">
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin color="var(--status-critical)" size={20} /> Rejected OD / Leave Resolution &amp; Teacher Tracker
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            If your OD request was denied, find your faculty's live location on campus to resolve it in person.
          </p>

          {rejectedRequests.length === 0 ? (
            <div className="panel-inset" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle size={24} color="var(--status-safe)" style={{ margin: '0 auto 8px', display: 'block' }} />
              <p style={{ fontSize: '14px', fontWeight: '500' }}>No rejected OD requests! All applications are either pending or approved.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {rejectedRequests.map(req => (
                <div key={req.id} className="panel-inset" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderColor: 'rgba(239,68,68,0.2)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '15px' }}>{req.subjectName || req.courseTitle}</strong>
                      <span className="status-badge critical" style={{ fontSize: '10px' }}>Rejected</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Date: {req.date} · Reason: {req.reason}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedRejectedReq(req)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '12px', color: 'var(--accent-primary)', borderColor: 'rgba(59,130,246,0.3)', gap: '6px' }}
                  >
                    <Navigation size={14} /> 📍 Find Teacher to Resolve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Subject-wise Trajectories & Sparklines ──────────── */}
        <div className="col-span-12">
          <h3 style={{ marginBottom: '16px' }}>Subject-wise Trajectories &amp; Sparklines</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {subjects.map(sub => {
              const st = getStatus(sub.attendance);
              const color = SUBJECT_COLORS[sub.id] || '#6B7280';
              const subjectTrend = attendanceTrend.map(t => ({ v: t[sub.name] ?? sub.attendance }));
              return (
                <div key={sub.id} className="glass-panel subject-trajectory-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontWeight: '600', fontSize: '15px' }}>{sub.name}</span>
                      <p style={{ fontSize: '12px', marginTop: '2px' }}>{sub.id} · {sub.classesAttended}/{sub.classesHeld} classes</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '22px', fontWeight: '800', color: st === 'safe' ? 'var(--status-safe)' : st === 'warning' ? 'var(--status-warning)' : 'var(--status-critical)' }}>
                        {sub.attendance}%
                      </span>
                      <div className={`status-badge ${st}`} style={{ fontSize: '10px', marginTop: '4px' }}>
                        {st === 'safe' ? '✓ Safe' : st === 'warning' ? '⚠ Warning' : '✗ Critical'}
                      </div>
                    </div>
                  </div>
                  <div style={{ height: '48px', marginTop: '8px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={subjectTrend} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
                        <ReTooltip
                          content={({ active, payload }) =>
                            active && payload?.length ? (
                              <span style={{ background: 'rgba(11,14,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', color: '#fff' }}>
                                {payload[0].value}%
                              </span>
                            ) : null
                          }
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Task Dispatch Modal */}
      {selectedAbsentSlot && (
        <TaskModal entry={selectedAbsentSlot} onClose={() => setSelectedAbsentSlot(null)} />
      )}

      {/* Teacher Tracker Modal */}
      {selectedRejectedReq && (
        <TeacherTrackerModal req={selectedRejectedReq} onClose={() => setSelectedRejectedReq(null)} />
      )}
    </div>
  );
};

export default StudentDashboard;
