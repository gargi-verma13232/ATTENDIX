import { useState, useMemo } from 'react';
import { useMockData } from '../MockDataContext';
import {
  Flame, Award, AlertTriangle, CheckCircle, Calculator,
  Check, Ban, BookOpen, ClipboardList, Zap, ChevronRight, X
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
  if (pct >= 77) return 'Safe Zone';
  if (pct >= 75) return 'Warning Zone';
  return 'Critical';
};

// Build today's timetable entries from student timetable + session logs
const getTodayFeed = (student, sessionLogs) => {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun..6=Sat; spec uses 1=Mon..5=Fri
  const slots = student?.timetable?.[dow] || [];
  const todayStr = today.toISOString().split('T')[0];

  return slots.map((slotLabel, idx) => {
    // slotLabel like "09:00 - Data Structures"
    const [time, ...rest] = slotLabel.split(' - ');
    const courseName = rest.join(' - ');
    // Find course code from subjects
    const sub = student.subjects?.find(s => s.name === courseName);
    const courseCode = sub?.id || null;

    // Check history for today
    const courseHistory = courseCode ? student.courses?.[courseCode]?.history || [] : [];
    const todayEntry = courseHistory.find(h => h.date === todayStr && h.slot === time);
    const status = todayEntry?.status || 'Scheduled';

    // Find matching session log for absent modal
    const sessionLog = sessionLogs?.find(
      l => l.courseCode === courseCode && l.date === todayStr && l.slot === time
    );

    return { id: `${idx}-${time}`, time, courseName, courseCode, status, sessionLog };
  });
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

// Tiny sparkline (uses attendance trend data for a given subject name)
const Sparkline = ({ trendData, subjectName, color }) => {
  const data = trendData.map(t => ({ v: t[subjectName] ?? 0 }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <ReTooltip
          content={({ active, payload }) =>
            active && payload?.length ? (
              <span style={{
                background: 'rgba(11,14,20,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#fff',
              }}>
                {payload[0].value}%
              </span>
            ) : null
          }
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Task Dispatch Modal — shown when clicking an Absent feed slot
const TaskModal = ({ entry, onClose }) => {
  if (!entry) return null;
  const log = entry.sessionLog;
  return (
    <div
      className="task-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="task-modal"
        onClick={e => e.stopPropagation()}
      >
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

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const StudentDashboard = () => {
  const { student, subjects, attendanceTrend, sessionLogs } = useMockData();

  const [simulatedLeaves, setSimulatedLeaves] = useState(() => {
    const init = {};
    (subjects || []).forEach(sub => { init[sub.id] = 0; });
    return init;
  });
  const [selectedAbsentSlot, setSelectedAbsentSlot] = useState(null);

  const handleLeaveChange = (subId, value) => {
    setSimulatedLeaves(prev => ({ ...prev, [subId]: Math.max(0, Math.min(15, value)) }));
  };

  // ── Exam Eligibility ──────────────────────────
  const remainingClasses = student.totalClasses - student.classesAttended - 20;
  const requiredTotalAttended = Math.ceil((student.totalClasses * student.requiredAttendance) / 100);
  const classesNeeded = requiredTotalAttended - student.classesAttended;
  const isEligibleNow = student.overallAttendance >= student.requiredAttendance;
  const isPossibleToReach = classesNeeded <= remainingClasses;

  // ── Simulation ────────────────────────────────
  const totalSimulatedLeaves = Object.values(simulatedLeaves).reduce((s, v) => s + v, 0);
  const simulatedTotalClasses = student.totalClasses + totalSimulatedLeaves;
  const simulatedAttendance = Math.round((student.classesAttended / simulatedTotalClasses) * 100);
  const isSimulatedEligible = simulatedAttendance >= student.requiredAttendance;

  // ── Recovery Math (spec formula) ─────────────
  const totalHeld = student.totalClasses;
  const totalAttended = student.classesAttended;
  const recoveryNeeded = Math.ceil(3 * totalHeld - 4 * totalAttended);
  const safeLeaves = Math.floor((4 * totalAttended - 3 * totalHeld) / 3);

  // ── Today's Feed ──────────────────────────────
  const todayFeed = useMemo(() => getTodayFeed(student, sessionLogs), [student, sessionLogs]);

  const overallStatus = getStatus(student.overallAttendance);
  const badges = student.badges || [];

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h1 className="page-title">Welcome back, {student.name.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here is your attendance snapshot for the current semester.</p>
      </div>

      <div className="dashboard-grid">

        {/* ── Attendance Overview ─────────────────── */}
        <div className="glass-panel col-span-8" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div className="circular-progress" style={{ '--progress': `${student.overallAttendance * 3.6}deg` }}>
            <div className="circular-progress-value">{student.overallAttendance}%</div>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ marginBottom: '4px' }}>Overall Attendance</h2>
            <p style={{ marginBottom: '12px' }}>
              {student.classesAttended} of {student.totalClasses} classes attended
            </p>
            <div className={`status-badge ${overallStatus}`} style={{ marginBottom: '12px' }}>
              {overallStatus === 'safe' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              {getStatusLabel(student.overallAttendance)}
            </div>

            {/* Recovery / Safe Leaves info */}
            {overallStatus !== 'safe' ? (
              <div className="recovery-callout critical-bg">
                <AlertTriangle size={14} />
                <span>
                  Attend <strong>{recoveryNeeded}</strong> consecutive classes to reach 75%.
                </span>
              </div>
            ) : (
              <div className="recovery-callout safe-bg">
                <CheckCircle size={14} />
                <span>
                  You can safely miss <strong>{Math.max(0, safeLeaves)}</strong> more classes.
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
            {badges.length === 0 && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Keep attending to earn badges!</span>
            )}
          </div>
        </div>

        {/* ── Today's Class Feed ─────────────────── */}
        <div className="glass-panel col-span-12">
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📅 Today's Class Schedule
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
                const isScheduled = entry.status === 'Scheduled';
                return (
                  <div
                    key={entry.id}
                    className={`feed-item ${isAbsent ? 'feed-absent' : isOD ? 'feed-od' : isPresent ? 'feed-present' : 'feed-scheduled'}`}
                    onClick={() => isAbsent ? setSelectedAbsentSlot(entry) : null}
                    style={{ cursor: isAbsent ? 'pointer' : 'default' }}
                    title={isAbsent ? 'Click to view missed lecture details' : ''}
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

        {/* ── Exam Eligibility Predictor ─────────── */}
        <div className="glass-panel col-span-12">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="var(--accent-primary)" /> Exam Eligibility Predictor
            </h2>
            <div className={`status-badge ${isEligibleNow ? 'safe' : isPossibleToReach ? 'warning' : 'critical'}`}>
              {isEligibleNow ? 'Eligible' : isPossibleToReach ? 'At Risk' : 'Ineligible'}
            </div>
          </div>

          <div className="panel-inset" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div>
              <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Current Status</p>
              <h3 style={{ fontSize: '24px', marginTop: '4px', color: isEligibleNow ? 'var(--status-safe)' : 'var(--status-critical)' }}>{isEligibleNow ? 'YES' : 'NO'}</h3>
            </div>
            <div>
              <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Classes Needed</p>
              <h3 style={{ fontSize: '24px', marginTop: '4px' }}>{classesNeeded > 0 ? classesNeeded : '—'}</h3>
            </div>
            <div>
              <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Remaining Classes</p>
              <h3 style={{ fontSize: '24px', marginTop: '4px' }}>{Math.max(0, remainingClasses)}</h3>
            </div>
          </div>

          {/* Leave Simulator */}
          <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={18} color="var(--accent-primary)" /> Course-wise Leaves Predictor
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Simulate future absences per subject to see combined eligibility impact.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {subjects.map(sub => {
                  const leaves = simulatedLeaves[sub.id] || 0;
                  const pred = Math.round((sub.classesAttended / (sub.classesHeld + leaves)) * 100);
                  return (
                    <div key={sub.id} className="panel-inset" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}>
                      <div style={{ flex: 1, marginRight: '12px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>{sub.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', textDecoration: leaves > 0 ? 'line-through' : 'none', color: 'var(--text-muted)' }}>{sub.attendance}%</span>
                          {leaves > 0 && (
                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: pred >= 75 ? 'var(--status-safe)' : 'var(--status-critical)' }}>
                              ➔ {pred}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => handleLeaveChange(sub.id, leaves - 1)} className="btn btn-secondary" style={{ padding: '4px 10px', minWidth: '32px' }} disabled={leaves <= 0}>−</button>
                        <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '700' }}>{leaves}</span>
                        <button onClick={() => handleLeaveChange(sub.id, leaves + 1)} className="btn btn-secondary" style={{ padding: '4px 10px', minWidth: '32px' }}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="panel-inset" style={{
                display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', borderRadius: '16px',
                background: isSimulatedEligible ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)',
                borderColor: isSimulatedEligible ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
              }}>
                <div>
                  <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Combined Simulated Leaves</h4>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: totalSimulatedLeaves > 0 ? 'var(--accent-primary)' : 'var(--text-main)' }}>
                    {totalSimulatedLeaves} Classes
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '12px' }}>
                  <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Predicted Overall</h4>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '32px', fontWeight: '800', color: isSimulatedEligible ? 'var(--status-safe)' : 'var(--status-critical)' }}>
                      {simulatedAttendance}%
                    </span>
                    {totalSimulatedLeaves > 0 && (
                      <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>(was {student.overallAttendance}%)</span>
                    )}
                  </div>
                </div>
                <div className={`status-badge ${isSimulatedEligible ? 'safe' : 'critical'}`} style={{ fontSize: '12px', padding: '8px 16px', width: '100%', justifyContent: 'center', borderRadius: '8px', marginTop: '4px' }}>
                  {isSimulatedEligible ? <Check size={14} /> : <Ban size={14} />}
                  <strong>{isSimulatedEligible ? 'Eligible for Exams' : 'Blocked from Exams'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Subject-wise Trajectories ──────────── */}
        <div className="col-span-12">
          <h3 style={{ marginBottom: '16px' }}>Subject-wise Trajectories</h3>
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
                  {/* SVG Sparkline via Recharts mini chart */}
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

      {/* ── Task Dispatch Modal ─────────────────── */}
      {selectedAbsentSlot && (
        <TaskModal entry={selectedAbsentSlot} onClose={() => setSelectedAbsentSlot(null)} />
      )}
    </div>
  );
};

export default StudentDashboard;
