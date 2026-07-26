import { useState, useRef, useEffect } from 'react';
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
  ExternalLink,
  Calendar,
} from 'lucide-react';

// Haversine formula to calculate distance in meters between two lat/lon points
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371e3; // Earth radius in meters
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

  // GPS verification state (simulate student location: 45m inside campus vs 320m outside campus)
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

  // Catch-Up Modal state
  const [selectedCatchupSession, setSelectedCatchupSession] = useState(null);

  // Attempt WebAuthn biometric unlock or open sleek simulated tap fallback
  const handleBiometricUnlock = async () => {
    try {
      if (window.PublicKeyCredential) {
        // Attempt browser WebAuthn API
        const publicKey = {
          challenge: new Uint8Array(32),
          rpId: window.location.hostname,
          userVerification: 'required',
          timeout: 60000,
        };
        await navigator.credentials.get({ publicKey });
        setBiometricUnlocked(true);
      } else {
        setShowFingerprintFallback(true);
      }
    } catch {
      // If WebAuthn fails or is cancelled/unsupported on desktop, open sleek fallback modal
      setShowFingerprintFallback(true);
    }
  };

  // Simulated Fingerprint tap verification
  const handleSimulatedTapFingerprint = () => {
    setFingerprintScanning(true);
    setTimeout(() => {
      setFingerprintScanning(false);
      setShowFingerprintFallback(false);
      setBiometricUnlocked(true);
    }, 1500);
  };

  // Apply camera zoom constraints if video track supports it
  useEffect(() => {
    if (!cameraActive || !videoRef.current || !videoRef.current.srcObject) return;
    try {
      const stream = videoRef.current.srcObject;
      const track = stream.getVideoTracks()[0];
      if (track && track.getCapabilities && track.getCapabilities().zoom) {
        track.applyConstraints({
          advanced: [{ zoom: zoomLevel }],
        });
      }
    } catch {
      // Fallback is handled via CSS transform scale on video element
    }
  }, [zoomLevel, cameraActive]);

  // Handle final QR attendance signoff
  const handleConfirmScan = () => {
    if (!biometricUnlocked || !isGpsValid) return;
    // Log attendance for current class slot
    logStudentAttendanceScan('cs-301', '2026-07-26', 'slot-1');
    setScanSuccessMessage('Attendance verified & logged successfully via Biometric + GPS!');
    setTimeout(() => {
      setScanSuccessMessage('');
      setShowScannerModal(false);
      setCameraActive(false);
      setBiometricUnlocked(false);
    }, 2500);
  };

  return (
    <div className="dashboard-content">
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h1 className="page-title">Welcome back, {student.name.split(' ')[0]}</h1>
          <p className="page-subtitle">Here is your attendance snapshot, QR scanner, and class recovery hub.</p>
        </div>

        {/* Scan Attendance QR (GPS Protected) Button */}
        <button
          onClick={() => {
            setShowScannerModal(true);
            setCameraActive(true);
            setBiometricUnlocked(false);
            setScanSuccessMessage('');
          }}
          className="btn btn-primary"
          style={{ padding: '14px 24px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <QrCode size={22} /> Scan Attendance QR (GPS Protected)
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Main Attendance Overview */}
        <div className="glass-panel col-span-8" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div className="circular-progress" style={{ '--progress': `${student.overallAttendance}%` }}>
            <div className="circular-progress-value">{student.overallAttendance}%</div>
          </div>
          <div>
            <h2>Overall Attendance</h2>
            <p style={{ marginBottom: '16px' }}>{student.classesAttended} out of {student.totalClasses} classes attended</p>
            <div className={`status-badge ${student.overallAttendance >= 75 ? 'safe' : student.overallAttendance >= 65 ? 'warning' : 'critical'}`}>
              {student.overallAttendance >= 75 ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              {student.overallAttendance >= 75 ? 'Safe Zone' : student.overallAttendance >= 65 ? 'Warning Zone' : 'Critical Shortage'}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
            <div>
              <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Status</p>
              <h3 style={{ fontSize: '24px', marginTop: '4px' }}>{isEligibleNow ? 'YES' : 'NO'}</h3>
            </div>
            <div>
              <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Classes Needed</p>
              <h3 style={{ fontSize: '24px', marginTop: '4px' }}>{classesNeeded > 0 ? classesNeeded : 0}</h3>
            </div>
            <div>
              <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Remaining Classes</p>
              <h3 style={{ fontSize: '24px', marginTop: '4px' }}>{remainingClasses}</h3>
            </div>
          </div>
          {!isEligibleNow && isPossibleToReach && (
            <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--status-warning)' }}>
              You need to attend {classesNeeded} more classes to reach the 75% threshold. You cannot afford to miss more than {remainingClasses - classesNeeded} classes.
            </p>
          )}
        </div>

        {/* Subjects Breakdown Mini */}
        <div className="col-span-12">
          <h3 style={{ marginBottom: '16px' }}>Subject Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {subjects.map((sub) => (
              <div key={sub.id} className="glass-panel" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontWeight: '500' }}>{sub.name}</span>
                  <span style={{ color: sub.attendance >= 75 ? 'var(--status-safe)' : 'var(--status-critical)', fontWeight: '600' }}>
                    {sub.attendance}%
                  </span>
                </div>
                <div className="progress-container">
                  <div
                    className={`progress-bar ${sub.attendance >= 75 ? 'progress-safe' : 'progress-critical'}`}
                    style={{ width: `${sub.attendance}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. CLASS RECOVERY HUB (STUDENT SIDE: ABSENT SESSIONS & CATCH-UP MODAL) */}
        <div className="glass-panel col-span-12" style={{ marginTop: '8px' }}>
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
                <div
                  key={sess.id}
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
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} /> {sess.date} ({sess.time})
                      </span>
                      <h3 style={{ fontSize: '16px', margin: '4px 0 0' }}>{sess.courseName}</h3>
                    </div>

                    <span className={`status-badge ${isAbsent ? 'critical' : 'safe'}`} style={{ fontSize: '12px' }}>
                      {isAbsent ? '✖ Absent' : '✔ Present'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
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
                          fontSize: '12px',
                        }}
                      >
                        <BookOpen size={13} /> View Catch-Up Notes
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BIOMETRIC QR SCANNER WITH ZOOM MODAL (GPS PROTECTED) */}
      {showScannerModal && (
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
            zIndex: 1000,
            padding: '24px',
          }}
        >
          <div
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
                <ShieldCheck size={16} /> Anti-Proxy Biometric + GPS
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
            <p style={{ fontSize: '13px', marginBottom: '16px' }}>
              Biometric verification &amp; GPS geofencing are required before signing off on class attendance.
            </p>

            {/* Step 1: Biometric Lock Status */}
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
                <Fingerprint size={24} color={biometricUnlocked ? 'var(--status-safe)' : 'var(--status-warning)'} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>
                    {biometricUnlocked ? 'Biometric Verified ✔' : 'Biometric Lock Active'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {biometricUnlocked ? 'Fingerprint credential confirmed' : 'Required before scan signoff'}
                  </div>
                </div>
              </div>

              {!biometricUnlocked && (
                <button
                  onClick={handleBiometricUnlock}
                  className="btn btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '13px', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}
                >
                  <Fingerprint size={16} /> Unlock Fingerprint
                </button>
              )}
            </div>

            {/* Step 2: GPS Geofencing Status & Simulation Controls */}
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
                  className="btn"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--panel-border)',
                    padding: '4px 10px',
                    fontSize: '11px',
                    color: 'var(--text-main)',
                  }}
                >
                  📍 Toggle Test Location
                </button>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {isGpsValid
                  ? `Your coordinates match ${campusConfig.name} within the ${campusConfig.radiusMeters}m allowed geofence.`
                  : `Proxy protection blocked scan. You are ${distanceMeters}m from ${campusConfig.name} (Max allowed: ${campusConfig.radiusMeters}m).`}
              </div>
            </div>

            {/* Step 3: Viewfinder & Camera Zoom Slider (1x to 5x) */}
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
                {/* Simulated / Camera View with CSS zoom fallback */}
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
                  {/* Grid Lines in background */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  />
                  {/* Simulated QR target in classroom */}
                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      border: '2px dashed var(--accent-primary)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255, 255, 255, 0.95)',
                    }}
                  >
                    <QrCode size={64} color="#000" />
                  </div>
                </div>

                {/* Live Laser Scanner Line Animation */}
                <div className="scanner-laser" />

                {/* Zoom Badge overlay */}
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
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '10px 16px', borderRadius: '12px' }}>
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
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>5x (Projector)</span>
              </div>
            </div>

            {scanSuccessMessage && (
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--status-safe)', padding: '12px', borderRadius: '10px', color: 'var(--status-safe)', fontSize: '13px', textAlign: 'center', marginBottom: '12px' }}>
                <CheckCircle2 size={18} style={{ display: 'inline', marginRight: '6px' }} />
                {scanSuccessMessage}
              </div>
            )}

            {/* Confirm Scan Action */}
            <button
              onClick={handleConfirmScan}
              disabled={!biometricUnlocked || !isGpsValid}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                opacity: !biometricUnlocked || !isGpsValid ? 0.4 : 1,
                cursor: !biometricUnlocked || !isGpsValid ? 'not-allowed' : 'pointer',
              }}
            >
              <CheckCircle size={18} />
              {!biometricUnlocked
                ? 'Unlock Biometric to Continue'
                : !isGpsValid
                ? 'Outside GPS Geofence - Scan Disabled'
                : 'Confirm Attendance Scan'}
            </button>
          </div>
        </div>
      )}

      {/* SIMULATED FINGERPRINT TAP FALLBACK MODAL */}
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
          <div
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
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Biometric Tap Verification</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Tap the fingerprint scanner below to complete hardware verification for attendance.
            </p>

            <div
              onClick={handleSimulatedTapFingerprint}
              style={{
                width: '110px',
                height: '110px',
                margin: '0 auto 24px',
                borderRadius: '50%',
                background: fingerprintScanning ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.1)',
                border: '2px solid var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: fingerprintScanning ? '0 0 30px var(--accent-primary)' : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              <Fingerprint size={56} color="var(--accent-primary)" className={fingerprintScanning ? 'spin-slow' : ''} />
            </div>

            <p style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: '600' }}>
              {fingerprintScanning ? 'Verifying hardware token...' : 'Click to scan fingerprint'}
            </p>
          </div>
        </div>
      )}

      {/* LECTURE CATCH-UP MODAL (OPENED BY CLICKING ANY 'ABSENT' SLOT) */}
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
          <div
            className="glass-panel"
            style={{
              maxWidth: '620px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '32px',
              borderRadius: '24px',
              position: 'relative',
              border: '1px solid rgba(139, 92, 246, 0.4)',
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

            {/* Official Teacher's Lecture Summary */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--accent-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={16} /> Official Lecture Summary &amp; Key Topics
              </h4>
              <div
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '16px',
                  borderRadius: '12px',
                  borderLeft: '4px solid var(--accent-primary)',
                  lineHeight: '1.6',
                  fontSize: '14px',
                }}
              >
                {(() => {
                  const notes = getSessionNotes(selectedCatchupSession.courseId, selectedCatchupSession.date, selectedCatchupSession.slotId);
                  return notes.summary || 'No summary notes posted by the professor for this class yet.';
                })()}
              </div>
            </div>

            {/* Homework Assigned */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--accent-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={16} /> Homework &amp; Assigned Readings
              </h4>
              <div
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '16px',
                  borderRadius: '12px',
                  borderLeft: '4px solid var(--accent-secondary)',
                  lineHeight: '1.6',
                  fontSize: '14px',
                }}
              >
                {(() => {
                  const notes = getSessionNotes(selectedCatchupSession.courseId, selectedCatchupSession.date, selectedCatchupSession.slotId);
                  return notes.homework || 'No specific homework assigned for this session.';
                })()}
              </div>
            </div>

            {/* Photo Gallery of Uploaded Board Notes */}
            <div>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--status-safe)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ImageIcon size={16} /> Blackboard Work / Slide Photo Gallery
              </h4>

              {(() => {
                const notes = getSessionNotes(selectedCatchupSession.courseId, selectedCatchupSession.date, selectedCatchupSession.slotId);
                const photos = notes.photos || [];
                if (photos.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '24px', border: '1px dashed var(--panel-border)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      No board work or slide photos uploaded for this session yet.
                    </div>
                  );
                }
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {photos.map((url, idx) => (
                      <div key={idx} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--panel-border)', background: '#000' }}>
                        <img src={url} alt={`Board Note ${idx + 1}`} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                        <div style={{ padding: '8px 12px', fontSize: '12px', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Class Note Photo #{idx + 1}</span>
                          <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            View <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

