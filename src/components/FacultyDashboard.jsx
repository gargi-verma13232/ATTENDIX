import { useState, useEffect } from 'react';
import { useMockData } from '../MockDataContext';
import {
  UserCheck,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Upload,
  Send,
  Bell,
  Check,
  X,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Image as ImageIcon,
  Compass,
  ArrowRight,
} from 'lucide-react';

const FacultyDashboard = () => {
  const {
    facultyProfile,
    facultySchedule,
    subjects,
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
  } = useMockData();

  // QR Modal state
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrToken, setQrToken] = useState('ATTX-LIVE-A9K2-8871');
  const [qrCountdown, setQrCountdown] = useState(10);

  // Catch-up notes form state
  const currentNotes = getSessionNotes(selectedCourse, selectedDate, selectedSlot);
  const [summaryInput, setSummaryInput] = useState(currentNotes.summary || '');
  const [homeworkInput, setHomeworkInput] = useState(currentNotes.homework || '');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  // Synchronize local note state when selected session changes
  useEffect(() => {
    const notes = getSessionNotes(selectedCourse, selectedDate, selectedSlot);
    setSummaryInput(notes.summary || '');
    setHomeworkInput(notes.homework || '');
    setSaveMessage('');
  }, [selectedCourse, selectedDate, selectedSlot]);

  // Rotating QR Code effect (every 10 seconds)
  useEffect(() => {
    if (!showQrModal) return;

    const interval = setInterval(() => {
      setQrCountdown(prev => {
        if (prev <= 1) {
          // Rotate token
          const randomHash = Math.random().toString(36).substring(2, 6).toUpperCase();
          const randomNum = Math.floor(1000 + Math.random() * 9000);
          setQrToken(`ATTX-LIVE-${randomHash}-${randomNum}`);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showQrModal]);

  // Roster for currently selected session
  const currentRoster = getSessionRoster(selectedCourse, selectedDate, selectedSlot);
  const totalStudents = currentRoster.length;
  const presentStudents = currentRoster.filter(s => s.status === 'present').length;
  const absentStudents = totalStudents - presentStudents;
  const attendancePercent = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;

  // Save session catch-up notes
  const handleSaveNotes = (e) => {
    e.preventDefault();
    updateSessionNotes(selectedCourse, selectedDate, selectedSlot, {
      ...currentNotes,
      summary: summaryInput,
      homework: homeworkInput,
    });
    setSaveMessage('Catch-up notes saved successfully! Students can view these in their modal.');
    setTimeout(() => setSaveMessage(''), 4000);
  };

  // Simulate uploading board work photo
  const handleAddPhoto = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    ];
    const photoToAdd = newPhotoUrl.trim() || samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    addPhotoToSession(selectedCourse, selectedDate, selectedSlot, photoToAdd);
    setNewPhotoUrl('');
    setSaveMessage('Board work photo added to class session!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // Generate deterministic SVG matrix for QR visual representation
  const generateSvgQrCells = (token) => {
    const gridSize = 11;
    const cells = [];
    let hashVal = 0;
    for (let i = 0; i < token.length; i++) {
      hashVal = (hashVal << 5) - hashVal + token.charCodeAt(i);
      hashVal |= 0;
    }

    // Always draw corner finder patterns
    const isFinderPattern = (r, c) => {
      const topL = r < 3 && c < 3;
      const topR = r < 3 && c > gridSize - 4;
      const botL = r > gridSize - 4 && c < 3;
      return topL || topR || botL;
    };

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (isFinderPattern(r, c)) {
          cells.push({ r, c, active: true });
        } else {
          const pseudoBit = (Math.sin(hashVal + r * 17 + c * 31) * 10000) % 1 > 0.4;
          cells.push({ r, c, active: pseudoBit });
        }
      }
    }
    return cells;
  };

  const qrCells = generateSvgQrCells(qrToken);

  return (
    <div className="dashboard-content">
      {/* 1. Professor Header & Daily Teaching Schedule */}
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 className="page-title" style={{ margin: 0 }}>Faculty Workspace</h1>
            <span className="status-badge safe" style={{ fontSize: '12px' }}>
              {facultyProfile.badge}
            </span>
          </div>
          <p className="page-subtitle">
            {facultyProfile.name} • {facultyProfile.title} ({facultyProfile.department})
          </p>
          <p style={{ fontSize: '13px', color: 'var(--accent-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} /> Cabin Location: {facultyProfile.cabinOfficeLocation}
          </p>
        </div>

        <button
          onClick={() => setShowQrModal(true)}
          className="btn btn-primary"
          style={{ padding: '12px 24px', fontSize: '15px' }}
        >
          <QrCode size={20} /> Generate Live QR Code
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Daily Teaching Schedule & Active Lecture Slots */}
        <div className="glass-panel col-span-12">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '18px' }}>
            <Calendar className="text-blue-500" /> Today&apos;s Teaching Schedule & Room Assignments
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {facultySchedule.map((slot) => {
              const isCurrentSelected = selectedSlot === slot.id && selectedCourse === slot.courseId;
              return (
                <div
                  key={slot.id}
                  onClick={() => {
                    setSelectedCourse(slot.courseId);
                    setSelectedSlot(slot.id);
                  }}
                  className="glass-panel"
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    background: isCurrentSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--panel-bg)',
                    border: isCurrentSelected ? '1px solid var(--accent-primary)' : '1px solid var(--panel-border)',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                        {slot.courseCode} • {slot.batch}
                      </span>
                      <h3 style={{ fontSize: '16px', margin: '4px 0 0' }}>{slot.courseName}</h3>
                    </div>
                    {slot.active && (
                      <span className="status-badge safe" style={{ fontSize: '11px', padding: '3px 8px' }}>
                        Live Now
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> {slot.slotTime}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: 'var(--text-main)' }}>
                      <MapPin size={14} /> {slot.room}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Interactive Session Logger & Student Roster */}
        <div className="glass-panel col-span-7">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                <UserCheck className="text-blue-500" /> Interactive Session Logger
              </h2>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>
                Click on any student card/row to toggle Present (✔) or Absent (✖) during class.
              </p>
            </div>

            {/* Session Selectors */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', background: '#111827', color: 'white', border: '1px solid var(--panel-border)', fontSize: '13px' }}
              >
                <option value="cs-301">CS301 - Data Structures</option>
                <option value="cs-302">CS302 - Database Systems</option>
                <option value="cs-303">CS303 - Computer Networks</option>
              </select>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', background: '#111827', color: 'white', border: '1px solid var(--panel-border)', fontSize: '13px' }}
              />

              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', background: '#111827', color: 'white', border: '1px solid var(--panel-border)', fontSize: '13px' }}
              >
                <option value="slot-1">Slot 1 (09:00 AM)</option>
                <option value="slot-2">Slot 2 (10:30 AM)</option>
                <option value="slot-3">Slot 3 (02:00 PM)</option>
              </select>
            </div>
          </div>

          {/* Quick Roster Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px', background: 'rgba(0,0,0,0.25)', padding: '12px 16px', borderRadius: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Students</div>
              <div style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>{totalStudents}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--status-safe)' }}>Present</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--status-safe)', marginTop: '2px' }}>{presentStudents}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--status-critical)' }}>Absent</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--status-critical)', marginTop: '2px' }}>{absentStudents}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Attendance %</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: attendancePercent >= 75 ? 'var(--status-safe)' : 'var(--status-critical)', marginTop: '2px' }}>
                {attendancePercent}%
              </div>
            </div>
          </div>

          {/* Roster List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '460px', overflowY: 'auto', paddingRight: '4px' }}>
            {currentRoster.map((student) => {
              const isPresent = student.status === 'present';
              return (
                <div
                  key={student.id}
                  onClick={() => toggleStudentAttendance(selectedCourse, selectedDate, selectedSlot, student.id)}
                  className="roster-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: isPresent ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: isPresent ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: isPresent ? 'var(--status-safe)' : 'var(--status-critical)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '14px',
                      }}
                    >
                      {student.avatar || student.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{student.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{student.rollNo}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      className={`status-badge ${isPresent ? 'safe' : 'critical'}`}
                      style={{ padding: '6px 14px', fontSize: '13px', fontWeight: '700' }}
                    >
                      {isPresent ? (
                        <>
                          <CheckCircle2 size={16} /> ✔ Present
                        </>
                      ) : (
                        <>
                          <XCircle size={16} /> ✖ Absent
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Class Recovery Hub (Faculty Side: Catch-Up Notes & Photo Uploads) */}
        <div className="glass-panel col-span-5">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', marginBottom: '8px' }}>
            <BookOpen className="text-blue-500" /> Class Recovery Hub (Faculty Logger)
          </h2>
          <p style={{ fontSize: '13px', marginBottom: '16px' }}>
            Add lecture summary, homework, and slide/board photos. Students who are absent can access these in their Catch-Up modal.
          </p>

          <form onSubmit={handleSaveNotes} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600', color: 'var(--text-muted)' }}>
                Lecture Summary & Key Concepts
              </label>
              <textarea
                rows={3}
                value={summaryInput}
                onChange={(e) => setSummaryInput(e.target.value)}
                placeholder="e.g. Covered AVL tree LL/RR rotations and insertion step-by-step..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--panel-border)',
                  background: 'rgba(0,0,0,0.25)',
                  color: 'white',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600', color: 'var(--text-muted)' }}>
                Homework & Assignment Assigned
              </label>
              <textarea
                rows={2}
                value={homeworkInput}
                onChange={(e) => setHomeworkInput(e.target.value)}
                placeholder="e.g. Solve questions 1 to 5 from Exercise 4.2 in workbook..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--panel-border)',
                  background: 'rgba(0,0,0,0.25)',
                  color: 'white',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                }}
              />
            </div>

            {/* Board Work / Slide Photos Upload Section */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600', color: 'var(--text-muted)' }}>
                Board Work / Slide Photos Gallery ({currentNotes.photos ? currentNotes.photos.length : 0} uploaded)
              </label>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="Paste image URL or leave blank for sample photo..."
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--panel-border)',
                    background: 'rgba(0,0,0,0.25)',
                    color: 'white',
                    fontSize: '12px',
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '12px' }}
                >
                  <Upload size={14} /> Add Photo
                </button>
              </div>

              {/* Photo Mini Gallery Preview */}
              {currentNotes.photos && currentNotes.photos.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {currentNotes.photos.map((photo, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '64px', border: '1px solid var(--panel-border)' }}>
                      <img src={photo} alt="Board Note" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', bottom: '2px', left: '4px', fontSize: '10px', background: 'rgba(0,0,0,0.7)', padding: '1px 5px', borderRadius: '4px' }}>
                        Note {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px', border: '1px dashed var(--panel-border)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                  <ImageIcon size={20} style={{ margin: '0 auto 6px', opacity: 0.5 }} />
                  No board work photos added yet for this class session.
                </div>
              )}
            </div>

            {saveMessage && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--status-safe)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', color: 'var(--status-safe)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} /> {saveMessage}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
              <Send size={16} /> Save Session Catch-Up Notes
            </button>
          </form>
        </div>

        {/* 4. Resolution Inbox & Auto-Register Jump */}
        <div className="glass-panel col-span-7">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', marginBottom: '8px' }}>
            <FileText className="text-purple-500" /> Resolution Inbox (OD & Medical Applications)
          </h2>
          <p style={{ fontSize: '13px', marginBottom: '16px' }}>
            Review pending student applications. Use the &quot;📍 Jump to Class Register&quot; button to jump to that date/slot&apos;s session logger and edit attendance immediately.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {odRequests.map((req) => (
              <div
                key={req.id}
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--panel-border)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '15px' }}>{req.studentName}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({req.rollNo})</span>
                      <span className={`status-badge ${req.type === 'OD' ? 'safe' : 'warning'}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                        {req.type}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-main)', marginTop: '4px', fontWeight: '500' }}>
                      {req.courseName} • {req.date} ({req.slotTime})
                    </div>
                  </div>

                  {/* Status badge or Approve/Reject controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {req.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => updateRequestStatus(req.id, 'approved')}
                          className="btn"
                          style={{ background: 'var(--status-safe-bg)', color: 'var(--status-safe)', border: '1px solid var(--status-safe)', padding: '6px 12px', fontSize: '12px' }}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          onClick={() => updateRequestStatus(req.id, 'rejected')}
                          className="btn"
                          style={{ background: 'var(--status-critical-bg)', color: 'var(--status-critical)', border: '1px solid var(--status-critical)', padding: '6px 12px', fontSize: '12px' }}
                        >
                          <X size={14} /> Reject
                        </button>
                      </>
                    ) : (
                      <span className={`status-badge ${req.status === 'approved' ? 'safe' : 'critical'}`} style={{ textTransform: 'capitalize' }}>
                        {req.status === 'approved' ? '✔ Approved' : '✖ Rejected'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Reason & Document */}
                <div style={{ fontSize: '13px', background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)' }}>
                  <strong>Reason:</strong> {req.reason}
                  {req.documentUrl && (
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-primary)' }}>
                      <FileText size={13} /> Document Attached: <u>{req.documentUrl}</u>
                    </div>
                  )}
                </div>

                {/* 📍 JUMP TO CLASS REGISTER BUTTON */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                  <button
                    onClick={() => {
                      jumpToClassRegister(req.courseId, req.date, req.slotId);
                      window.scrollTo({ top: 180, behavior: 'smooth' });
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '13px', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--text-main)', border: '1px solid rgba(59, 130, 246, 0.4)' }}
                  >
                    📍 Jump to Class Register ({req.date} • {req.slotId})
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Institutional Notice Center */}
        <div className="glass-panel col-span-5">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', marginBottom: '8px' }}>
            <Bell className="text-yellow-500" /> Institutional Notice Center
          </h2>
          <p style={{ fontSize: '13px', marginBottom: '16px' }}>
            Department meetings, exam duty schedules, and academic deadlines.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notices.map((notice) => (
              <div
                key={notice.id}
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--panel-border)',
                  borderRadius: '12px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className={`status-badge ${notice.priority === 'High' ? 'critical' : 'warning'}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                    {notice.category} • {notice.priority} Priority
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{notice.date}</span>
                </div>
                <h4 style={{ fontSize: '15px', marginBottom: '6px', fontWeight: '600', color: 'var(--text-main)' }}>{notice.title}</h4>
                <p style={{ fontSize: '13px', marginBottom: '8px', lineHeight: '1.4' }}>{notice.details}</p>
                <div style={{ fontSize: '12px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={13} /> {notice.location} ({notice.time})
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. ROTATING DYNAMIC QR GENERATOR MODAL */}
      {showQrModal && (
        <div
          className="modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '480px',
              width: '100%',
              padding: '32px',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
              position: 'relative',
              borderRadius: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="status-badge safe" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={14} className="spin-slow" /> Live Anti-Proxy QR
              </span>
              <button
                onClick={() => setShowQrModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <h3 style={{ fontSize: '22px', marginBottom: '6px' }}>Class Attendance Live QR</h3>
            <p style={{ fontSize: '13px', marginBottom: '20px' }}>
              Students must scan this QR code within 50m of campus. Token auto-refreshes every 10s to prevent proxy screenshots.
            </p>

            {/* SVG QR Code Display */}
            <div
              style={{
                width: '240px',
                height: '240px',
                margin: '0 auto 20px',
                background: '#ffffff',
                padding: '16px',
                borderRadius: '16px',
                boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="200" height="200" viewBox="0 0 11 11">
                {qrCells.map((c, i) =>
                  c.active ? (
                    <rect key={i} x={c.c} y={c.r} width="1" height="1" fill="#0B0E14" />
                  ) : null
                )}
              </svg>
            </div>

            {/* Live Token Display */}
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '18px',
                fontWeight: '700',
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid var(--panel-border)',
                marginBottom: '16px',
                letterSpacing: '2px',
                color: 'var(--accent-primary)',
              }}
            >
              {qrToken}
            </div>

            {/* COUNTDOWN TIMER BAR (0 - 10s) */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>
                <span>Token Hash Lifetime</span>
                <span style={{ fontWeight: '700', color: qrCountdown <= 3 ? 'var(--status-critical)' : 'var(--text-main)' }}>
                  Refreshes in {qrCountdown}s
                </span>
              </div>
              <div className="progress-container" style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)' }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${(qrCountdown / 10) * 100}%`,
                    backgroundColor:
                      qrCountdown <= 3 ? 'var(--status-critical)' : qrCountdown <= 5 ? 'var(--status-warning)' : 'var(--accent-primary)',
                    transition: 'width 1s linear',
                  }}
                />
              </div>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              GPS coordinate lock: {campusConfig.latitude.toFixed(4)}, {campusConfig.longitude.toFixed(4)} ({campusConfig.radiusMeters}m radius)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
