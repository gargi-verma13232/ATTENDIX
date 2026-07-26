import { useState } from 'react';
import { useMockData } from '../MockDataContext';
import { motion } from 'framer-motion';
import {
  HeartPulse, CheckCircle, AlertTriangle, XCircle, Calendar,
  Clock, MapPin, Plus, Send, AlertCircle, Sparkles, User, Hourglass, ClipboardEdit
} from 'lucide-react';

const RecoveryPlanner = () => {
  const {
    subjects,
    currentUser,
    cancelledClasses,
    recoveryClasses,
    cancelClassSession,
    createRecoveryClass,
  } = useMockData();

  // Cancel class form state
  const [cancelCourse, setCancelCourse] = useState('cs-301');
  const [cancelDate, setCancelDate] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  // Schedule recovery form state
  const [recCourse, setRecCourse] = useState('cs-301');
  const [recDay, setRecDay] = useState('Wednesday');
  const [recDate, setRecDate] = useState('2026-07-29');
  const [recSlot, setRecSlot] = useState('04:00 PM - 05:30 PM');
  const [recRoom, setRecRoom] = useState('Lab 302');
  const [actionSuccess, setActionSuccess] = useState('');

  const isTeacherOrAdmin = currentUser?.role === 'faculty' || currentUser?.role === 'admin';

  // Weekly Timetable Grid Data
  const weeklyTimetable = [
    { day: 'Monday', slots: [
      { time: '09:00 AM - 10:30 AM', course: 'CS101 Data Structures', room: 'LH-101', faculty: 'Dr. R. Mehta' },
      { time: '11:00 AM - 12:30 PM', course: 'CS103 Operating Systems', room: 'LH-104', faculty: 'Prof. S. Kumar' },
      { time: '02:00 PM - 03:30 PM', course: 'Free Slot (Auto-Suggested Recovery)', room: 'Available', isFree: true },
    ]},
    { day: 'Tuesday', slots: [
      { time: '10:00 AM - 11:30 AM', course: 'CS102 Database Systems', room: 'Lab 201', faculty: 'Dr. R. Mehta' },
      { time: '02:00 PM - 03:30 PM', course: 'HU101 Communication Skills', room: 'LH-202', faculty: 'Dr. P. Nair' },
      { time: '04:00 PM - 05:30 PM', course: 'Free Slot (Auto-Suggested Recovery)', room: 'Available', isFree: true },
    ]},
    { day: 'Wednesday', slots: [
      { time: '09:00 AM - 10:30 AM', course: 'CS101 Data Structures', room: 'LH-101', faculty: 'Dr. R. Mehta' },
      { time: '11:00 AM - 12:30 PM', course: 'CS103 Operating Systems', room: 'LH-104', faculty: 'Prof. S. Kumar' },
      { time: '04:00 PM - 05:30 PM', course: '⭐ Auto-Suggested Free Slot', room: 'Lab 302', isSuggested: true },
    ]},
    { day: 'Thursday', slots: [
      { time: '10:00 AM - 11:30 AM', course: 'CS102 Database Systems', room: 'Lab 201', faculty: 'Dr. R. Mehta' },
      { time: '02:00 PM - 03:30 PM', course: 'Free Slot (Auto-Suggested Recovery)', room: 'Available', isFree: true },
    ]},
    { day: 'Friday', slots: [
      { time: '09:00 AM - 10:30 AM', course: 'CS101 Data Structures', room: 'LH-101', faculty: 'Dr. R. Mehta' },
      { time: '01:00 PM - 02:30 PM', course: 'HU101 Communication Skills', room: 'LH-202', faculty: 'Dr. P. Nair' },
    ]},
  ];

  const handleCancelSubmit = (e) => {
    e.preventDefault();
    if (!cancelDate || !cancelReason) return;
    const courseObj = subjects.find(s => s.id === cancelCourse) || { name: cancelCourse };
    cancelClassSession(cancelCourse, courseObj.name, cancelDate, '09:00 AM', cancelReason);
    setActionSuccess(`Flagged class on ${cancelDate} as Cancelled. Missed hours calculated!`);
    setCancelDate(''); setCancelReason('');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleRecoverySubmit = (e) => {
    e.preventDefault();
    const courseObj = subjects.find(s => s.id === recCourse) || { name: recCourse };
    createRecoveryClass({
      courseId: recCourse,
      courseName: courseObj.name,
      originalDate: '2026-07-24',
      scheduledDate: recDate,
      dayOfWeek: recDay,
      timeSlot: recSlot,
      room: recRoom,
      faculty: currentUser?.name || 'Dr. R. Mehta',
    });
    setActionSuccess(`Scheduled recovery class for ${courseObj.name}! Alert sent to students.`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const calculateRecovery = (sub) => {
    const requiredTotal = Math.ceil((sub.classesHeld * 75) / 100);
    const classesNeeded = requiredTotal - sub.classesAttended;
    const isSafe = sub.attendance >= 75;
    const safeLeaves = isSafe ? Math.floor((sub.classesAttended - 0.75 * sub.classesHeld) / 0.75) : 0;
    return { classesNeeded: classesNeeded > 0 ? classesNeeded : 0, isSafe, safeLeaves };
  };

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <HeartPulse color="var(--accent-primary)" /> Timetable &amp; Smart Recovery Planner
        </h1>
        <p className="page-subtitle">
          Weekly timetable schedule, class cancellation tracking, missed hours calculation, and automated recovery class scheduling.
        </p>
      </div>

      {actionSuccess && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--status-safe)', color: 'var(--status-safe)', padding: '12px 18px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}><CheckCircle size={16} /></motion.div> {actionSuccess}
        </div>
      )}

      <div className="dashboard-grid">
        {/* 1. WEEKLY TIMETABLE GRID */}
        <div className="glass-panel col-span-12">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Calendar className="text-blue-500" /> Weekly Class Schedule &amp; Room Assignments
            </h2>
            <span className="status-badge safe" style={{ fontSize: '11px' }}>Current Semester Schedule</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
            {weeklyTimetable.map((dayCol, idx) => (
              <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '12px' }}>
                <h3 style={{ fontSize: '14px', textAlign: 'center', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', margin: '0 0 10px 0', color: 'var(--accent-primary)' }}>
                  {dayCol.day}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {dayCol.slots.map((slot, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        background: slot.isSuggested ? 'rgba(245, 158, 11, 0.12)' : slot.isFree ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255,255,255,0.03)',
                        border: slot.isSuggested ? '1px dashed var(--status-warning)' : slot.isFree ? '1px dashed rgba(59,130,246,0.3)' : '1px solid var(--panel-border)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        fontSize: '12px',
                      }}
                    >
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} /> {slot.time}
                      </div>
                      <div style={{ fontWeight: '700', color: slot.isSuggested ? 'var(--status-warning)' : 'var(--text-main)', marginTop: '3px' }}>
                        {slot.course}
                      </div>
                      {slot.room && (
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={10} /> {slot.room} {slot.faculty ? `· ${slot.faculty}` : ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. CANCEL / POSTPONE & AUTO-SUGGEST RECOVERY SCHEDULER (TEACHER / ADMIN) */}
        {isTeacherOrAdmin && (
          <>
            {/* Flag Cancelled / Postponed Class */}
            <div className="glass-panel col-span-6">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '17px' }}>
                <XCircle color="var(--status-critical)" size={18} /> Flag Class as Cancelled / Postponed
              </h2>
              <form onSubmit={handleCancelSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Select Course</label>
                  <select value={cancelCourse} onChange={e => setCancelCourse(e.target.value)} className="form-control">
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Date of Cancelled Class</label>
                    <input type="date" value={cancelDate} onChange={e => setCancelDate(e.target.value)} className="form-control" required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Calculated Missed Hours</label>
                    <input type="text" value="1.5 Hours" disabled className="form-control" style={{ opacity: 0.7 }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Reason for Cancellation / Postponement</label>
                  <input type="text" placeholder="e.g. Faculty Attending Academic Conference" value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="form-control" required />
                </div>
                <button type="submit" className="btn btn-secondary" style={{ color: 'var(--status-critical)', borderColor: 'rgba(239,68,68,0.3)' }}>
                  <XCircle size={16} /> Flag Cancelled Class &amp; Log Missed Hours
                </button>
              </form>
            </div>

            {/* Smart Recovery Class Auto-Scheduler */}
            <div className="glass-panel col-span-6">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '17px' }}>
                <Sparkles color="var(--status-warning)" size={18} /> Schedule Recovery Class (Auto-Suggested Slots)
              </h2>
              <form onSubmit={handleRecoverySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Select Course</label>
                  <select value={recCourse} onChange={e => setRecCourse(e.target.value)} className="form-control">
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '10px 14px', borderRadius: '10px', fontSize: '12px' }}>
                  <strong style={{ color: 'var(--status-warning)' }}>💡 Auto-Suggested Free Slot:</strong> Wednesday 04:00 PM – 05:30 PM (Lab 302) has zero timetable conflicts for enrolled students.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Target Day &amp; Date</label>
                    <input type="date" value={recDate} onChange={e => setRecDate(e.target.value)} className="form-control" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Time Slot</label>
                    <input type="text" value={recSlot} onChange={e => setRecSlot(e.target.value)} className="form-control" />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Room Number</label>
                  <input type="text" value={recRoom} onChange={e => setRecRoom(e.target.value)} className="form-control" />
                </div>

                <button type="submit" className="btn btn-primary">
                  <Send size={16} /> Schedule Recovery Class &amp; Dispatch Student Alerts
                </button>
              </form>
            </div>
          </>
        )}

        {/* 3. SCHEDULED RECOVERY CLASSES & CANCELLED LOG */}
        <div className="glass-panel col-span-12">
          <h2 style={{ marginBottom: '14px', fontSize: '17px' }}>Active Scheduled Recovery Sessions &amp; Cancelled Log</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
            {recoveryClasses.map((rec) => (
              <div key={rec.id} style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span className="status-badge warning" style={{ fontSize: '11px', marginBottom: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}><AlertCircle size={12} /></motion.div> Rescheduled / Recovery
                    </span>
                    <h3 style={{ fontSize: '16px', margin: 0 }}>{rec.courseName}</h3>
                  </div>
                  <span className="status-badge safe">{rec.status}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} color="var(--text-muted)"/> <strong>Scheduled:</strong> {rec.dayOfWeek} ({rec.scheduledDate})</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} color="var(--text-muted)"/> <strong>Time Slot:</strong> {rec.timeSlot}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} color="var(--text-muted)"/> <strong>Location:</strong> {rec.room} · {rec.faculty}</span>
                </div>
              </div>
            ))}

            {cancelledClasses.map((canc) => (
              <div key={canc.id} style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span className="status-badge critical" style={{ fontSize: '11px', marginBottom: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}><XCircle size={12} /></motion.div> Cancelled Class
                    </span>
                    <h3 style={{ fontSize: '16px', margin: 0 }}>{canc.courseName}</h3>
                  </div>
                  <span className="status-badge critical">{canc.status}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} color="var(--text-muted)"/> <strong>Original Date:</strong> {canc.date}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Hourglass size={14} color="var(--text-muted)"/> <strong>Missed Hours:</strong> {canc.missedHours} Hours</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ClipboardEdit size={14} color="var(--text-muted)"/> <strong>Reason:</strong> {canc.reason}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. STUDENT SUBJECT RECOVERY CARDS */}
        {subjects.map(sub => {
          const { isSafe, classesNeeded, safeLeaves } = calculateRecovery(sub);
          const statusClass = isSafe ? 'safe' : sub.attendance >= 65 ? 'warning' : 'critical';
          const StatusIcon = isSafe ? CheckCircle : sub.attendance >= 65 ? AlertTriangle : XCircle;

          return (
            <div key={sub.id} className="glass-panel col-span-6" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: `var(--status-${statusClass})` }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{sub.name}</h3>
                  <p style={{ fontSize: '13px', fontFamily: 'var(--mono)' }}>{sub.id} • {sub.classesAttended}/{sub.classesHeld} Classes</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: `var(--status-${statusClass})` }}>{sub.attendance}%</div>
                  <div className={`status-badge ${statusClass}`} style={{ marginTop: '4px' }}>
                    <StatusIcon size={14} /> {isSafe ? 'Safe' : statusClass === 'warning' ? 'Warning' : 'Critical'}
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '12px' }}>
                {isSafe ? (
                  <div>
                    <h4 style={{ color: 'var(--status-safe)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '14px' }}>
                      <CheckCircle size={16} /> Safe Leaves Available
                    </h4>
                    <p style={{ fontSize: '13px', margin: 0 }}>You can safely miss <strong>{safeLeaves}</strong> more classes while still maintaining 75% attendance.</p>
                  </div>
                ) : (
                  <div>
                    <h4 style={{ color: `var(--status-${statusClass})`, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '14px' }}>
                      <AlertTriangle size={16} /> Recovery Action Plan
                    </h4>
                    <p style={{ fontSize: '13px', marginBottom: '8px' }}>
                      You need to attend <strong>{classesNeeded}</strong> more consecutive classes to reach 75%.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <Calendar size={14} /> Expected Recovery: <strong>Approx. 2 Weeks</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecoveryPlanner;
