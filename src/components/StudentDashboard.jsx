import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMockData } from '../MockDataContext';
import {
  Flame,
  Award,
  AlertTriangle,
  CheckCircle,
  QrCode,
  Fingerprint,
  ZoomIn,
  BookOpen,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Sparkles,
  XCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371e3;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

const StudentDashboard = () => {
  const {
    student,
    subjects,
    campusConfig,
    studentSessions,
    getSessionNotes,
    logStudentAttendanceScan,
    notifications,
    activeSessionQR,
    verifyStudentTimetable,
    incrementLiveScanCount,
    submitDocument,
    studentDocuments,
  } = useMockData();

  // Exam Eligibility calculation
  const remainingClasses = student.totalClasses - student.classesAttended - 20;
  const requiredTotalAttended = Math.ceil((student.totalClasses * student.requiredAttendance) / 100);
  const classesNeeded = requiredTotalAttended - student.classesAttended;
  const isEligibleNow = student.overallAttendance >= student.requiredAttendance;
  const isPossibleToReach = classesNeeded <= remainingClasses;

  // Scanner modal state
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [biometricUnlocked, setBiometricUnlocked] = useState(false);
  const [showFingerprintFallback, setShowFingerprintFallback] = useState(false);
  const [fingerprintScanning, setFingerprintScanning] = useState(false);

  // GPS verification state
  const [simulateInsideCampus, setSimulateInsideCampus] = useState(true);
  const studentLat = simulateInsideCampus ? campusConfig.latitude + 0.0003 : campusConfig.latitude + 0.0028;
  const studentLon = simulateInsideCampus ? campusConfig.longitude + 0.0003 : campusConfig.longitude + 0.0028;
  const distanceMeters = calculateHaversineDistance(
    campusConfig.latitude,
    campusConfig.longitude,
    studentLat,
    studentLon
  );
  const isGpsValid = distanceMeters <= campusConfig.radiusMeters;

  // Camera Zoom Slider state (1x to 5x)
  const [zoomLevel, setZoomLevel] = useState(1);
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanSuccessMessage, setScanSuccessMessage] = useState('');
  const [scanErrorMessage, setScanErrorMessage] = useState('');

  // Handle ESC key for Scanner Modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && showScannerModal) {
        setShowScannerModal(false);
        setCameraActive(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showScannerModal]);

  // Catch-Up Modal state
  const [selectedCatchupSession, setSelectedCatchupSession] = useState(null);

  // Document Upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDocType, setUploadDocType] = useState('Medical Certificate');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDocumentSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setIsUploading(true);
    let prog = 0;
    const interval = setInterval(() => {
      prog += 25;
      setUploadProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        submitDocument({
          type: uploadDocType,
          fileName: selectedFile.name,
          size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
        });
        setIsUploading(false);
        setShowUploadModal(false);
        setSelectedFile(null);
        setUploadProgress(0);
      }
    }, 250);
  };

  // Manage Camera Stream
  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      if (cameraActive) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Failed to access camera:", err);
        }
      }
    };

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        const currentStream = videoRef.current.srcObject;
        if (currentStream) {
          currentStream.getTracks().forEach(track => track.stop());
        }
        videoRef.current.srcObject = null;
      }
    };

    if (cameraActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [cameraActive]);

  // Trigger WebAuthn Biometric API with Fallback
  const handleBiometricUnlock = async () => {
    setFingerprintScanning(true);
    try {
      if (window.PublicKeyCredential && navigator.credentials) {
        const publicKeyCredentialRequestOptions = {
          challenge: Uint8Array.from('ATTENDIX_WEBAUTHN_CHALLENGE_2026', c => c.charCodeAt(0)),
          timeout: 60000,
          userVerification: 'required',
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
          },
        };
        await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions });
        setBiometricUnlocked(true);
        setFingerprintScanning(false);
        setShowFingerprintFallback(false);
      } else {
        setShowFingerprintFallback(true);
        setFingerprintScanning(false);
      }
    } catch {
      setShowFingerprintFallback(true);
      setFingerprintScanning(false);
    }
  };

  const handleSimulatedTapFingerprint = () => {
    setFingerprintScanning(true);
    setTimeout(() => {
      setFingerprintScanning(false);
      setShowFingerprintFallback(false);
      setBiometricUnlocked(true);
    }, 1200);
  };

  const handleConfirmScan = () => {
    if (!biometricUnlocked || !isGpsValid) return;

    // Cross-check Timetable
    if (!activeSessionQR || !verifyStudentTimetable(activeSessionQR.courseId)) {
      setScanErrorMessage('Invalid Attempt: Attendance is marked failed as this subject is not in your current timetable slot.');
      setTimeout(() => setScanErrorMessage(''), 4000);
      return;
    }

    logStudentAttendanceScan(activeSessionQR.courseId, new Date().toISOString().split('T')[0], activeSessionQR.slotId);
    incrementLiveScanCount();
    setScanSuccessMessage('Attendance verified & logged successfully via WebAuthn Biometrics + GPS!');
    setTimeout(() => {
      setScanSuccessMessage('');
      setShowScannerModal(false);
      setCameraActive(false);
      setBiometricUnlocked(false);
    }, 2200);
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h1 className="page-title">Welcome back, {student.name.split(' ')[0]}</h1>
          <p className="page-subtitle">Here is your attendance snapshot, WebAuthn QR scanner, and class recovery hub.</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            setShowScannerModal(true);
            setCameraActive(true);
            setBiometricUnlocked(false);
            setScanSuccessMessage('');
          }}
          className="btn btn-primary"
          style={{ padding: '14px 24px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <QrCode size={22} /> Scan Class QR (WebAuthn Protected)
        </motion.button>
      </div>

      {/* PUSHED ALERTS & NOTIFICATIONS BANNER */}
      {notifications && notifications.length > 0 && (
        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.slice(0, 2).map((notif) => (
            <div
              key={notif.id}
              style={{
                background: 'rgba(59, 130, 246, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                padding: '12px 18px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Sparkles size={20} className="text-blue-500" />
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-primary)' }}>
                    {notif.title}
                  </span>
                  <p style={{ fontSize: '12px', color: 'var(--text-main)', margin: '2px 0 0' }}>
                    {notif.message}
                  </p>
                </div>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{notif.date}</span>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-grid">
        {/* Main Attendance Overview */}
        <div className="glass-panel col-span-8" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div className="circular-progress" style={{ '--progress': `${student.overallAttendance}%` }}>
            <div className="circular-progress-value">{student.overallAttendance}%</div>
          </div>
          <div>
            <h2>Overall Attendance Ratio</h2>
            <p style={{ marginBottom: '16px' }}>{student.classesAttended} out of {student.totalClasses} total classes attended</p>
            <div className={`status-badge ${student.overallAttendance >= 75 ? 'safe' : student.overallAttendance >= 65 ? 'warning' : 'critical'}`}>
              {student.overallAttendance >= 75 ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              {student.overallAttendance >= 75 ? 'Safe Exam Zone' : student.overallAttendance >= 65 ? 'Warning Zone' : 'Critical Shortage'}
            </div>
          </div>
        </div>

        {/* Streak Tracker */}
        <div className="glass-panel col-span-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div className="streak-icon-container">
            <Flame size={32} />
          </div>
          <h2 style={{ fontSize: '32px', marginBottom: '4px' }}>{student.streak} Days</h2>
          <p style={{ fontWeight: '500', color: 'var(--text-main)', marginBottom: '8px' }}>Attendance Streak</p>
          <div className="status-badge warning" style={{ fontSize: '12px', background: 'rgba(245, 158, 11, 0.2)' }}>
            <Award size={14} /> Top 5% in Class
          </div>
        </div>

        {/* Exam Eligibility Predictor */}
        <div className="glass-panel col-span-12">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award className="text-blue-500" /> Exam Eligibility Predictor
            </h2>
            <div className={`status-badge ${isEligibleNow ? 'safe' : isPossibleToReach ? 'warning' : 'critical'}`}>
              {isEligibleNow ? 'Eligible' : isPossibleToReach ? 'At Risk' : 'Ineligible'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
            <div>
              <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Current Eligibility</p>
              <h3 style={{ fontSize: '24px', marginTop: '4px' }}>{isEligibleNow ? 'YES' : 'NO'}</h3>
            </div>
            <div>
              <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Classes Needed</p>
              <h3 style={{ fontSize: '24px', marginTop: '4px' }}>{classesNeeded > 0 ? classesNeeded : 0}</h3>
            </div>
            <div>
              <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Remaining Classes</p>
              <h3 style={{ fontSize: '24px', marginTop: '4px' }}>{remainingClasses}</h3>
            </div>
          </div>
        </div>

        {/* INTERACTIVE ATTENDANCE CALENDAR & PROGRESS TRACKING */}
        <div className="glass-panel col-span-12">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Calendar className="text-blue-500" /> Attendance Calendar &amp; Class History
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Visual daily class history with live status indicators and recovery session tracking.
              </p>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}><CheckCircle2 size={16} color="#10b981" /></motion.span> Attended</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}><XCircle size={16} color="#ef4444" /></motion.span> Missed</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }}><AlertCircle size={16} color="#f59e0b" /></motion.span> Recovered/OD</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 1.5 }}><Clock size={16} color="#3b82f6" /></motion.span> Scheduled</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            {[
              { date: '2026-07-26', day: 'Sun', title: 'Data Structures', time: '09:00 AM', status: 'attended', icon: <CheckCircle2 size={18} color="#10b981" /> },
              { date: '2026-07-25', day: 'Sat', title: 'Database Systems', time: '11:00 AM', status: 'missed', icon: <XCircle size={18} color="#ef4444" /> },
              { date: '2026-07-24', day: 'Fri', title: 'Operating Systems', time: '02:00 PM', status: 'recovered', icon: <AlertCircle size={18} color="#f59e0b" /> },
              { date: '2026-07-23', day: 'Thu', title: 'Communication', time: '10:00 AM', status: 'attended', icon: <CheckCircle2 size={18} color="#10b981" /> },
              { date: '2026-07-22', day: 'Wed', title: 'Data Structures', time: '09:00 AM', status: 'attended', icon: <CheckCircle2 size={18} color="#10b981" /> },
              { date: '2026-07-27', day: 'Mon', title: 'Database Systems', time: '11:00 AM', status: 'upcoming', icon: <Clock size={18} color="#3b82f6" /> },
              { date: '2026-07-28', day: 'Tue', title: 'Operating Systems', time: '02:00 PM', status: 'upcoming', icon: <Clock size={18} color="#3b82f6" /> },
            ].map((dayItem, i) => {
              const bgMap = {
                attended: 'rgba(16, 185, 129, 0.1)',
                missed: 'rgba(239, 68, 68, 0.1)',
                recovered: 'rgba(245, 158, 11, 0.1)',
                upcoming: 'rgba(59, 130, 246, 0.1)',
              };
              const borderMap = {
                attended: 'rgba(16, 185, 129, 0.3)',
                missed: 'rgba(239, 68, 68, 0.3)',
                recovered: 'rgba(245, 158, 11, 0.3)',
                upcoming: 'rgba(59, 130, 246, 0.3)',
              };
              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.03 }}
                  style={{
                    background: bgMap[dayItem.status],
                    border: `1px solid ${borderMap[dayItem.status]}`,
                    borderRadius: '12px',
                    padding: '12px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700' }}>
                    {dayItem.day} · {dayItem.date.split('-').slice(1).join('/')}
                  </div>
                  <div style={{ fontSize: '20px', margin: '6px 0 2px' }}>
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>{dayItem.icon}</motion.div>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {dayItem.title}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{dayItem.time}</div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CLASS RECOVERY HUB */}
        <div className="glass-panel col-span-12">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen className="text-purple-500" /> Class Recovery Hub (Lecture Catch-Up)
              </h2>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>
                Click on any &quot;Absent&quot; slot below to view official teacher summary, homework, and slide/board photos.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '14px' }}>
            {studentSessions.map((sess) => {
              const isAbsent = sess.status === 'Absent';
              return (
                <motion.div
                  key={sess.id}
                  whileHover={{ scale: isAbsent ? 1.02 : 1 }}
                  onClick={() => {
                    if (isAbsent) {
                      setSelectedCatchupSession(sess);
                    }
                  }}
                  className="glass-panel"
                  style={{
                    padding: '16px',
                    background: isAbsent ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                    border: isAbsent ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.2)',
                    cursor: isAbsent ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} /> {sess.date} ({sess.time})
                      </span>
                      <h3 style={{ fontSize: '16px', margin: '4px 0 0' }}>{sess.courseName}</h3>
                    </div>

                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: isAbsent ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: isAbsent ? '#ef4444' : '#10b981'
                    }}>
                      {isAbsent ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                      {isAbsent ? 'Absent' : 'Present'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--panel-border)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sess.teacher}</span>

                    {isAbsent && (
                      <button
                        type="button"
                        className="btn"
                        style={{
                          background: 'rgba(139, 92, 246, 0.2)',
                          color: '#fff',
                          border: '1px solid var(--accent-secondary)',
                          padding: '6px 12px',
                          fontSize: '11px',
                        }}
                      >
                        Catch-Up
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* DOCUMENT CENTER */}
        <div className="glass-panel col-span-12">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText className="text-blue-500" /> Document Center
              </h2>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>
                Upload Medical Certificates, OD Proofs, or Leave Applications for Admin approval.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary"
              style={{ padding: '10px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FileText size={18} /> Upload Document
            </motion.button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {studentDocuments.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                No documents uploaded yet.
              </div>
            ) : (
              studentDocuments.map(doc => (
                <div key={doc.id} className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--accent-primary)' }}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '15px', marginBottom: '4px' }}>{doc.fileName}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{doc.type} • {doc.size}</p>
                    </div>
                  </div>
                  <div className="status-badge warning" style={{ fontSize: '12px' }}>{doc.status}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* WEBAUTHN BIOMETRIC QR SCANNER MODAL */}
      <AnimatePresence>
        {showScannerModal && (
          <div
            className="modal-backdrop"
            onClick={(e) => {
              if (e.target.classList.contains('modal-backdrop')) {
                setShowScannerModal(false);
                setCameraActive(false);
              }
            }}
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
                maxWidth: '520px',
                width: '100%',
                padding: '28px',
                position: 'relative',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="status-badge safe" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} /> WebAuthn Fingerprint + GPS Lock
                </span>
                <button
                  onClick={() => {
                    setShowScannerModal(false);
                    setCameraActive(false);
                  }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={24} />
                </button>
              </div>

              <h3 style={{ fontSize: '22px', marginBottom: '6px' }}>Attendance QR Scanner</h3>
              <p style={{ fontSize: '13px', marginBottom: '16px', color: 'var(--text-muted)' }}>
                Native WebAuthn biometric verification &amp; GPS geofencing are enforced before attendance signoff.
              </p>

              {/* Step 1: WebAuthn Biometric Status */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--panel-border)',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="fingerprint-glow-container" style={{ padding: '8px' }}>
                    <Fingerprint size={24} color={biometricUnlocked ? 'var(--status-safe)' : 'var(--accent-primary)'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>
                      {biometricUnlocked ? (
                        <>WebAuthn Verified <CheckCircle2 size={16} color="#10b981" /></>
                      ) : (
                        'WebAuthn Fingerprint Lock'
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {biometricUnlocked ? 'Biometric Touch ID confirmed' : 'Required before scan signoff'}
                    </div>
                  </div>
                </div>

                {!biometricUnlocked && (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleBiometricUnlock}
                    className="btn btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '13px', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}
                  >
                    <Fingerprint size={16} /> Scan Fingerprint
                  </motion.button>
                )}
              </div>

              {/* Step 2: GPS Status */}
              <div
                style={{
                  background: isGpsValid ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.1)',
                  border: isGpsValid ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isGpsValid ? <ShieldCheck size={20} color="var(--status-safe)" /> : <ShieldAlert size={20} color="var(--status-critical)" />}
                    <span style={{ fontSize: '14px', fontWeight: '700', color: isGpsValid ? 'var(--status-safe)' : 'var(--status-critical)' }}>
                      {isGpsValid ? `GPS Verified: Inside Campus (${distanceMeters}m)` : `GPS Alert: Outside Campus (${distanceMeters}m)`}
                    </span>
                  </div>

                  <button
                    onClick={() => setSimulateInsideCampus(!simulateInsideCampus)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '11px' }}
                  >
                    📍 Toggle Test Location
                  </button>
                </div>
              </div>

              {/* Step 3: Viewfinder */}
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '100%',
                    height: '240px',
                    background: '#04070D',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '2px solid var(--panel-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transition: 'transform 0.25s ease',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(11, 14, 20, 0.95) 100%)',
                      position: 'relative',
                    }}
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: `scale(${zoomLevel})`,
                        transition: 'transform 0.25s ease',
                      }}
                    />
                  </div>

                  <div className="scanner-laser" />

                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(0,0,0,0.7)',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: 'var(--accent-primary)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <ZoomIn size={14} /> {zoomLevel.toFixed(1)}x Zoom
                  </div>
                </div>

                {/* Zoom Slider Control */}
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.15)', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>1x</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={zoomLevel}
                    onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                    style={{
                      flex: 1,
                      accentColor: 'var(--accent-primary)',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>5x</span>
                </div>
              </div>

              {scanErrorMessage && (
                <div style={{ marginTop: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-critical)', padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <AlertCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  {scanErrorMessage}
                </div>
              )}

              {scanSuccessMessage && (
                <div className="alert-success" style={{ marginTop: '12px' }}>
                  <CheckCircle2 size={16} /> {scanSuccessMessage}
                </div>
              )}

              <button
                onClick={handleConfirmScan}
                disabled={!biometricUnlocked || !isGpsValid}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '14px',
                  fontSize: '15px',
                  opacity: !biometricUnlocked || !isGpsValid ? 0.4 : 1,
                  cursor: !biometricUnlocked || !isGpsValid ? 'not-allowed' : 'pointer',
                }}
              >
                <CheckCircle size={18} />
                {!biometricUnlocked
                  ? 'Scan WebAuthn Fingerprint First'
                  : !isGpsValid
                  ? 'Outside GPS Geofence - Scan Disabled'
                  : 'Confirm Attendance Scan'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WEBAUTHN TOUCH ID FINGERPRINT PROMPT MODAL FALLBACK */}
      <AnimatePresence>
        {showFingerprintFallback && (
          <div
            className="modal-backdrop"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.92)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1100,
              padding: '24px',
            }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="glass-panel"
              style={{
                maxWidth: '380px',
                width: '100%',
                padding: '32px',
                textAlign: 'center',
                borderRadius: '24px',
                border: '1px solid var(--panel-border)',
              }}
            >
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>WebAuthn Touch ID Prompt</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Place your finger on the device sensor to verify biometric identity for Attendix.
              </p>

              <div
                onClick={handleSimulatedTapFingerprint}
                style={{
                  position: 'relative',
                  width: '110px',
                  height: '110px',
                  margin: '0 auto 24px',
                  borderRadius: '50%',
                  background: fingerprintScanning ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.1)',
                  border: '2px solid var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                }}
              >
                {fingerprintScanning && <div className="fingerprint-scan-line" />}
                <Fingerprint size={56} color={fingerprintScanning ? 'var(--status-safe)' : 'var(--accent-primary)'} />
              </div>

              <p style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: '600' }}>
                {fingerprintScanning ? 'Scanning hardware token...' : 'Tap sensor to confirm identity'}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CATCH-UP MODAL */}
      <AnimatePresence>
        {selectedCatchupSession && (
          <div
            className="modal-backdrop"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.88)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1050,
              padding: '24px',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="glass-panel"
              style={{
                maxWidth: '620px',
                width: '100%',
                maxHeight: '85vh',
                overflowY: 'auto',
                padding: '32px',
                borderRadius: '24px',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <span className="status-badge critical" style={{ marginBottom: '8px' }}>
                    Absent Class • Official Recovery Hub
                  </span>
                  <h3 style={{ fontSize: '24px', margin: '4px 0 0' }}>{selectedCatchupSession.courseName}</h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {selectedCatchupSession.date} ({selectedCatchupSession.time}) • {selectedCatchupSession.teacher}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCatchupSession(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--accent-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={16} /> Official Lecture Summary
                </h4>
                <div className="panel-inset" style={{ lineHeight: '1.6', fontSize: '14px' }}>
                  {(() => {
                    const notes = getSessionNotes(selectedCatchupSession.courseId, selectedCatchupSession.date, selectedCatchupSession.slotId);
                    return notes.summary || 'No summary notes posted by the professor for this class yet.';
                  })()}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--accent-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} /> Homework Assigned
                </h4>
                <div className="panel-inset" style={{ lineHeight: '1.6', fontSize: '14px' }}>
                  {(() => {
                    const notes = getSessionNotes(selectedCatchupSession.courseId, selectedCatchupSession.date, selectedCatchupSession.slotId);
                    return notes.homework || 'No specific homework assigned for this session.';
                  })()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOCUMENT UPLOAD MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <div
            className="modal-backdrop"
            onClick={(e) => {
              if (e.target.classList.contains('modal-backdrop') && !isUploading) {
                setShowUploadModal(false);
                setSelectedFile(null);
              }
            }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1050,
              padding: '24px',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="glass-panel"
              style={{
                maxWidth: '520px',
                width: '100%',
                padding: '32px',
                borderRadius: '24px',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '22px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <FileText className="text-blue-500" /> Upload Document
                </h3>
                <button
                  onClick={() => { if (!isUploading) { setShowUploadModal(false); setSelectedFile(null); } }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: isUploading ? 'not-allowed' : 'pointer' }}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleDocumentSubmit}>
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <label>Document Type</label>
                  <select 
                    className="form-control" 
                    value={uploadDocType} 
                    onChange={e => setUploadDocType(e.target.value)}
                    disabled={isUploading}
                  >
                    <option>Medical Certificate</option>
                    <option>OD Proof (Extracurricular)</option>
                    <option>Leave Application</option>
                  </select>
                </div>

                <div 
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleFileDrop}
                  style={{
                    border: `2px dashed ${selectedFile ? 'var(--accent-primary)' : 'var(--panel-border)'}`,
                    background: selectedFile ? 'rgba(59, 130, 246, 0.05)' : 'rgba(0,0,0,0.2)',
                    borderRadius: '16px',
                    padding: '32px',
                    textAlign: 'center',
                    marginBottom: '24px',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                >
                  <input 
                    type="file" 
                    id="file-upload" 
                    onChange={e => { if (e.target.files[0]) setSelectedFile(e.target.files[0]); }}
                    style={{ display: 'none' }}
                    disabled={isUploading}
                  />
                  
                  {!selectedFile ? (
                    <>
                      <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
                      <p style={{ fontSize: '15px', fontWeight: '500', marginBottom: '8px' }}>Drag & Drop your file here</p>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>PDF, JPG, PNG (Max 5MB)</p>
                      <label htmlFor="file-upload" className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-block' }}>
                        Browse Files
                      </label>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
                      <div style={{ padding: '16px', background: 'var(--panel-bg)', borderRadius: '12px' }}>
                        <FileText size={32} color="var(--accent-primary)" />
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <h4 style={{ fontSize: '15px', marginBottom: '4px' }}>{selectedFile.name}</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        {!isUploading && (
                          <button 
                            type="button" 
                            onClick={(e) => { e.preventDefault(); setSelectedFile(null); }}
                            style={{ background: 'transparent', border: 'none', color: 'var(--status-critical)', fontSize: '12px', marginTop: '8px', cursor: 'pointer', padding: 0 }}
                          >
                            Remove File
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {isUploading && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)' }}>
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--panel-border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--accent-primary)', transition: 'width 0.2s ease' }} />
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '14px', fontSize: '15px', opacity: !selectedFile || isUploading ? 0.5 : 1 }}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? 'Uploading Document...' : 'Submit for Approval'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;
