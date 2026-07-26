import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  BookOpen,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  Users
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
    liveScanCount,
    scannedStudentsList,
    campusConfig,
    startSessionQR,
    stopSessionQR
  } = useMockData();

  // QR Generator state & Section picker
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState('Section A');
  const [qrToken, setQrToken] = useState('ATTX-LIVE-A9K2-8871');
  const [qrCountdown, setQrCountdown] = useState(30);

  // Catch-up notes state
  const currentNotes = getSessionNotes(selectedCourse, selectedDate, selectedSlot);
  const [summaryInput, setSummaryInput] = useState(currentNotes.summary || '');
  const [homeworkInput, setHomeworkInput] = useState(currentNotes.homework || '');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  // Synchronize local notes state when selected session changes
  useEffect(() => {
    const notes = getSessionNotes(selectedCourse, selectedDate, selectedSlot);
    setSummaryInput(notes.summary || '');
    setHomeworkInput(notes.homework || '');
    setSaveMessage('');
  }, [selectedCourse, selectedDate, selectedSlot]);

  // 30-Second Auto-Refreshing Live QR Token Effect & Context Sync
  useEffect(() => {
    if (!showQrModal) {
      stopSessionQR();
      return;
    }

    // Sync initial token
    startSessionQR(selectedCourse, selectedSlot, selectedSection, qrToken);

    const interval = setInterval(() => {
      setQrCountdown(prev => {
        if (prev <= 1) {
          const randomHash = Math.random().toString(36).substring(2, 6).toUpperCase();
          const randomNum = Math.floor(1000 + Math.random() * 9000);
          const newToken = `ATTX-LIVE-${randomHash}-${randomNum}`;
          setQrToken(newToken);
          startSessionQR(selectedCourse, selectedSlot, selectedSection, newToken);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      stopSessionQR();
    };
  }, [showQrModal, selectedCourse, selectedSlot, selectedSection]);

  // Session roster & attendance stats
  const currentRoster = getSessionRoster(selectedCourse, selectedDate, selectedSlot);
  const totalStudents = currentRoster.length;
  const presentStudents = currentRoster.filter(s => s.status === 'present').length;
  const absentStudents = totalStudents - presentStudents;
  const attendancePercent = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;

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

  const handleAddPhoto = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    ];
    const photoToAdd = newPhotoUrl.trim() || samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    addPhotoToSession(selectedCourse, selectedDate, selectedSlot, photoToAdd);
    setNewPhotoUrl('');
    setSaveMessage('Board work photo added to class session!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const generateSvgQrCells = (token) => {
    const gridSize = 11;
    const cells = [];
    let hashVal = 0;
    for (let i = 0; i < token.length; i++) {
      hashVal = (hashVal << 5) - hashVal + token.charCodeAt(i);
      hashVal |= 0;
    }

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
      {/* 1. Header & Quick Launch QR Generator */}
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
            <MapPin size={14} /> Cabin Office: {facultyProfile.cabinOfficeLocation}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowQrModal(true)}
          className="btn btn-primary"
          style={{ padding: '12px 24px', fontSize: '15px' }}
        >
          <QrCode size={20} /> Launch 30s Live Dynamic QR
        </motion.button>
      </div>

      <div className="dashboard-grid">
        {/* Today's Teaching Schedule */}
        <div className="glass-panel col-span-12">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '18px' }}>
            <Calendar className="text-blue-500" /> Today&apos;s Lecture Schedule &amp; Room Assignments
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {facultySchedule.map((slot) => {
              const isCurrentSelected = selectedSlot === slot.id && selectedCourse === slot.courseId;
              return (
                <motion.div
                  key={slot.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
                        ● Live Lecture
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginTop: '12px', borderTop: '1px solid var(--panel-border)', paddingTop: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> {slot.slotTime}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: 'var(--text-main)' }}>
                      <MapPin size={14} /> {slot.room}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 2. Interactive Manual Override Roster Table */}
        <div className="glass-panel col-span-7">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                <UserCheck className="text-blue-500" /> Manual Override Attendance Register
              </h2>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>
                Select session details and manually override attendance status in real time.
              </p>
            </div>

            {/* Session Selectors */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="form-control"
                style={{ width: 'auto', minHeight: '38px', padding: '6px 10px', fontSize: '12px' }}
              >
                <option value="cs-301">CS301 - Data Structures</option>
                <option value="cs-302">CS302 - Database Systems</option>
                <option value="cs-303">CS303 - Computer Networks</option>
              </select>

              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="form-control"
                style={{ width: 'auto', minHeight: '38px', padding: '6px 10px', fontSize: '12px' }}
              >
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
                <option value="Section C">Section C</option>
              </select>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="form-control"
                style={{ width: 'auto', minHeight: '38px', padding: '6px 10px', fontSize: '12px' }}
              />

              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="form-control"
                style={{ width: 'auto', minHeight: '38px', padding: '6px 10px', fontSize: '12px' }}
              >
                <option value="slot-1">Slot 1 (09:00 AM)</option>
                <option value="slot-2">Slot 2 (10:30 AM)</option>
                <option value="slot-3">Slot 3 (02:00 PM)</option>
              </select>
            </div>
          </div>

          {/* Attendance Overview Progress Bar */}
          <div style={{ background: 'rgba(0,0,0,0.15)', padding: '14px 18px', borderRadius: '14px', marginBottom: '20px', border: '1px solid var(--panel-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Overall Attendance Ratio ({selectedCourse.toUpperCase()})</span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: attendancePercent >= 75 ? 'var(--status-safe)' : 'var(--status-critical)' }}>
                {presentStudents} / {totalStudents} ({attendancePercent}%)
              </span>
            </div>

            <div className="progress-container" style={{ height: '8px' }}>
              <motion.div
                className="progress-bar"
                initial={{ width: 0 }}
                animate={{ width: `${attendancePercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                  backgroundColor: attendancePercent >= 75 ? 'var(--status-safe)' : 'var(--status-critical)',
                }}
              />
            </div>
          </div>

          {/* Roster Override Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '440px', overflowY: 'auto', paddingRight: '4px' }}>
            {currentRoster.map((student) => {
              const isPresent = student.status === 'present';
              return (
                <motion.div
                  key={student.id}
                  whileHover={{ x: 2 }}
                  onClick={() => toggleStudentAttendance(selectedCourse, selectedDate, selectedSlot, student.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: isPresent ? 'var(--status-safe-bg)' : 'var(--status-critical-bg)',
                    border: isPresent ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
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
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{student.rollNo} • {selectedSection}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      className={`status-badge ${isPresent ? 'safe' : 'critical'}`}
                      style={{ padding: '6px 14px', fontSize: '13px', fontWeight: '700' }}
                    >
                      {isPresent ? (
                        <>
                          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}><CheckCircle2 size={16} color="#10b981" /></motion.div> Attended
                        </>
                      ) : (
                        <>
                          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}><XCircle size={16} color="#ef4444" /></motion.div> Absent
                        </>
                      )}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 3. Class Catch-Up Notes & Photo Gallery */}
        <div className="glass-panel col-span-5">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', marginBottom: '8px' }}>
            <BookOpen className="text-blue-500" /> Class Catch-Up Notes &amp; Slides
          </h2>
          <p style={{ fontSize: '13px', marginBottom: '16px' }}>
            Publish notes, assigned homework, and board work photos for absent students.
          </p>

          <form onSubmit={handleSaveNotes} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="field-label">Lecture Summary &amp; Key Concepts</label>
              <textarea
                rows={3}
                value={summaryInput}
                onChange={(e) => setSummaryInput(e.target.value)}
                placeholder="e.g. Covered AVL tree LL/RR rotations and insertion step-by-step..."
                className="form-control"
              />
            </div>

            <div>
              <label className="field-label">Homework Assigned</label>
              <textarea
                rows={2}
                value={homeworkInput}
                onChange={(e) => setHomeworkInput(e.target.value)}
                placeholder="e.g. Solve questions 1 to 5 from Exercise 4.2 in workbook..."
                className="form-control"
              />
            </div>

            <div>
              <label className="field-label">Board Work / Slide Photos ({currentNotes.photos ? currentNotes.photos.length : 0} uploaded)</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="Paste image URL..."
                  className="form-control"
                  style={{ flex: 1 }}
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

              {currentNotes.photos && currentNotes.photos.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {currentNotes.photos.map((photo, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '64px', border: '1px solid var(--panel-border)' }}>
                      <img src={photo} alt="Board Note" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px', border: '1px dashed var(--panel-border)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                  <ImageIcon size={20} style={{ margin: '0 auto 6px', opacity: 0.5 }} />
                  No board work photos added yet for this session.
                </div>
              )}
            </div>

            {saveMessage && (
              <div className="alert-success">
                <CheckCircle2 size={16} /> {saveMessage}
              </div>
            )}

            <button type="submit" className="btn btn-primary">
              <Send size={16} /> Publish Session Notes
            </button>
          </form>
        </div>

        {/* 4. Resolution Inbox */}
        <div className="glass-panel col-span-7">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', marginBottom: '8px' }}>
            <FileText className="text-purple-500" /> Resolution Inbox (OD &amp; Medical Applications)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {odRequests.map((req) => (
              <div key={req.id} className="panel-inset" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontWeight: '700', fontSize: '15px' }}>{req.studentName}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px' }}>({req.rollNo})</span>
                  </div>
                  {req.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => updateRequestStatus(req.id, 'approved')} className="btn" style={{ background: 'var(--status-safe-bg)', color: 'var(--status-safe)', border: '1px solid var(--status-safe)', padding: '4px 10px', fontSize: '12px' }}>
                        <Check size={14} /> Approve
                      </button>
                      <button onClick={() => updateRequestStatus(req.id, 'rejected')} className="btn" style={{ background: 'var(--status-critical-bg)', color: 'var(--status-critical)', border: '1px solid var(--status-critical)', padding: '4px 10px', fontSize: '12px' }}>
                        <X size={14} /> Reject
                      </button>
                    </div>
                  ) : (
                    <span className={`status-badge ${req.status === 'approved' ? 'safe' : 'critical'}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {req.status === 'approved' ? (
                          <><CheckCircle2 size={14} /> Approved</>
                        ) : (
                          <><XCircle size={14} /> Rejected</>
                        )}
                      </div>
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '13px' }}><strong>Reason:</strong> {req.reason}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Notice Center */}
        <div className="glass-panel col-span-5">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', marginBottom: '8px' }}>
            <Bell className="text-yellow-500" /> Institutional Notice Center
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notices.map((notice) => (
              <div key={notice.id} className="panel-inset">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span className="status-badge warning">{notice.category}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{notice.date}</span>
                </div>
                <h4 style={{ fontSize: '14px', margin: '4px 0' }}>{notice.title}</h4>
                <p style={{ fontSize: '12px' }}>{notice.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 30-SECOND DYNAMIC QR GENERATOR MODAL */}
      <AnimatePresence>
        {showQrModal && (
          <div
            className="modal-backdrop"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '24px',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
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
                  <RefreshCw size={14} className="spin-slow" /> 30s Live Anti-Proxy QR
                </span>
                <button
                  onClick={() => setShowQrModal(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={24} />
                </button>
              </div>

              <h3 style={{ fontSize: '22px', marginBottom: '6px' }}>Session Dynamic Attendance QR</h3>
              <p style={{ fontSize: '13px', marginBottom: '20px', color: 'var(--text-muted)' }}>
                Generating for <strong>{selectedCourse.toUpperCase()} ({selectedSection})</strong>. QR code auto-refreshes every 30s with WebAuthn fingerprint lock.
              </p>

              {/* SVG QR Code Display with Radar Ring Animation */}
              <div
                style={{
                  position: 'relative',
                  width: '240px',
                  height: '240px',
                  margin: '0 auto 20px',
                  background: '#ffffff',
                  padding: '16px',
                  borderRadius: '20px',
                  boxShadow: '0 0 35px rgba(59, 130, 246, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div className="radar-pulse-ring" />
                <div className="radar-pulse-ring radar-pulse-ring-delayed" />
                <svg width="200" height="200" viewBox="0 0 11 11">
                  {qrCells.map((c, i) =>
                    c.active ? (
                      <rect key={i} x={c.c} y={c.r} width="1" height="1" fill="#0B0E14" />
                    ) : null
                  )}
                </svg>
              </div>

              {/* Token Hash Display */}
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

              {/* Live Scan Counter */}
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>
                    Live Biometric Verified Check-ins
                  </span>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--status-safe)', margin: 0 }}>
                    ⚡ {liveScanCount} Verified Students
                  </div>
                </div>
                <span className="status-badge safe" style={{ fontSize: '11px' }}>
                  ● Live Sync
                </span>
              </div>

              {/* 30-Second Countdown Timer Bar */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  <span>Token Auto-Rotate Timer</span>
                  <span style={{ fontWeight: '700', color: qrCountdown <= 5 ? 'var(--status-critical)' : 'var(--text-main)' }}>
                    Refreshes in {qrCountdown}s
                  </span>
                </div>
                <div className="progress-container" style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)' }}>
                  <motion.div
                    className="progress-bar"
                    animate={{ width: `${(qrCountdown / 30) * 100}%` }}
                    transition={{ duration: 1, ease: 'linear' }}
                    style={{
                      backgroundColor:
                        qrCountdown <= 5 ? 'var(--status-critical)' : qrCountdown <= 10 ? 'var(--status-warning)' : 'var(--accent-primary)',
                    }}
                  />
                </div>
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                GPS lock: {campusConfig.latitude ? campusConfig.latitude.toFixed(4) : '28.4595'}, {campusConfig.longitude ? campusConfig.longitude.toFixed(4) : '77.0266'} ({campusConfig.radiusMeters || 200}m radius)
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacultyDashboard;
