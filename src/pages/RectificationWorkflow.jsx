import { useState } from 'react';
import { useMockData } from '../MockDataContext';
import {
  FileText, Upload, Send, Calculator, AlertCircle, ArrowRight,
  CheckCircle, FileUp, Shield, Check, X, Eye, Sparkles
} from 'lucide-react';

const RectificationWorkflow = () => {
  const {
    student,
    subjects,
    submitRectification,
    rectificationRequests,
    resolveRectification,
    currentUser,
  } = useMockData();

  const [simulatorDays, setSimulatorDays] = useState(2);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || 'CS101');

  // Form states
  const [reqDate, setReqDate] = useState('');
  const [reqSubject, setReqSubject] = useState(subjects[0]?.id || 'CS101');
  const [docType, setDocType] = useState('Medical Certificate');
  const [reqReason, setReqReason] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Admin / Faculty Review Pipeline state
  const [selectedDocPreview, setSelectedDocPreview] = useState(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [autoExcuseActive, setAutoExcuseActive] = useState(true);

  const isTeacherOrAdmin = currentUser?.role === 'faculty' || currentUser?.role === 'admin';

  const handleFileMockUpload = () => {
    setUploadedFile(`${docType.toLowerCase().replace(/\s+/g, '_')}_proof.pdf`);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!reqDate) {
      setErrorMsg('Please select a date.');
      return;
    }
    if (!reqSubject || reqSubject === 'Select Slot') {
      setErrorMsg('Please select a subject.');
      return;
    }
    if (!reqReason.trim()) {
      setErrorMsg('Please enter a reason or event name.');
      return;
    }

    const matchedSubject = subjects.find(sub => sub.id === reqSubject);
    const subjectName = matchedSubject ? matchedSubject.name : reqSubject;

    submitRectification({
      date: reqDate,
      subjectId: reqSubject,
      subjectName: subjectName,
      docType: docType,
      reason: reqReason,
      fileName: uploadedFile || `${docType.toLowerCase().replace(/\s+/g, '_')}_proof.pdf`,
    });

    setIsSuccess(true);
    setReqDate('');
    setReqSubject(subjects[0]?.id || 'CS101');
    setReqReason('');
    setUploadedFile(null);

    setTimeout(() => {
      setIsSuccess(false);
    }, 4000);
  };

  const handleApproveWithAutoExcuse = (reqId) => {
    resolveRectification(reqId, 'Approved');
    alert('Document Approved! Auto-Excuse Engine converted past Absent entry to Excused/OD in student register.');
  };

  const handleRejectWithNote = (reqId) => {
    resolveRectification(reqId, 'Denied');
  };

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileText color="var(--accent-primary)" /> Student Document Workflow &amp; OD Portal
        </h1>
        <p className="page-subtitle">
          Upload medical applications, leave proofs, inspect submissions, and execute Auto-Excuse attendance conversions.
        </p>
      </div>

      <div className="dashboard-grid">
        {/* 1. STUDENT DOCUMENT UPLOADER */}
        <div className="glass-panel col-span-6">
          <h2 style={{ marginBottom: '14px', fontSize: '18px' }}>Log Official Document / Leave Request</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Submit medical certificates, leave applications, or event permissions for verification.
          </p>

          {isSuccess && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--status-safe)', color: 'var(--status-safe)', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
              <CheckCircle size={16} /> Document submitted! Routed to Admin Inspection Pipeline.
            </div>
          )}

          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--status-critical)', color: 'var(--status-critical)', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px', fontWeight: '500' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Document Type</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value)} className="form-control">
                  <option value="Medical Certificate">Medical Certificate</option>
                  <option value="Leave Application">Leave Application</option>
                  <option value="Official Sports ID Proof">Official Sports ID Proof</option>
                  <option value="Event OD Permission">Event OD Permission</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Absence Date</label>
                <input type="date" value={reqDate} onChange={(e) => setReqDate(e.target.value)} className="form-control" required />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Target Subject / Course</label>
              <select value={reqSubject} onChange={(e) => setReqSubject(e.target.value)} className="form-control">
                {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Reason / Medical Diagnosis</label>
              <input type="text" placeholder="e.g. Viral Fever & Medical Rest" value={reqReason} onChange={(e) => setReqReason(e.target.value)} className="form-control" required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Upload Proof File (PDF / JPG)</label>
              <div
                onClick={handleFileMockUpload}
                style={{
                  border: '2px dashed var(--panel-border)',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backgroundColor: uploadedFile ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  borderColor: uploadedFile ? 'var(--accent-primary)' : 'var(--panel-border)'
                }}
              >
                {uploadedFile ? (
                  <>
                    <FileUp size={24} color="var(--accent-primary)" style={{ margin: '0 auto 8px' }} />
                    <p style={{ fontSize: '14px', color: 'var(--accent-primary)', fontWeight: '600', margin: 0 }}>{uploadedFile}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Click to replace document file</p>
                  </>
                ) : (
                  <>
                    <Upload size={24} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
                    <p style={{ fontSize: '14px', margin: 0 }}>Click to attach proof document</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>PDF, JPG, PNG (Max 5MB)</p>
                  </>
                )}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px' }}>
              <Send size={16} /> Submit Document Application
            </button>
          </form>
        </div>

        {/* 2. ADMIN & FACULTY INSPECTION PIPELINE & AUTO-EXCUSE ENGINE */}
        <div className="glass-panel col-span-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '18px' }}>
              <Shield className="text-purple-500" /> Admin Document Review Pipeline
            </h2>
            <span className="status-badge safe" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} /> Auto-Excuse Engine Active
            </span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Inspect uploaded student documents, leave notes, and approve requests to automatically convert past &quot;Absent&quot; entries to &quot;Excused / On-Duty&quot;.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '480px', overflowY: 'auto', paddingRight: '4px' }}>
            {rectificationRequests.map((req) => {
              const isPending = req.status === 'pending';
              const isApproved = req.status === 'approved' || req.status === 'Approved';
              return (
                <div key={req.id} style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '15px' }}>{req.studentName}</h4>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>({req.studentId})</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {req.docType || 'Medical/OD Application'} · {req.subjectName || req.courseTitle} ({req.date})
                      </div>
                    </div>

                    <span className={`status-badge ${isApproved ? 'safe' : isPending ? 'warning' : 'critical'}`}>
                      {isApproved ? '✔ Approved (Excused)' : isPending ? '⏳ Pending Review' : '✖ Denied'}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px', borderLeft: '3px solid var(--accent-primary)' }}>
                    <strong>Reason:</strong> {req.reason}
                    <div style={{ fontSize: '11px', color: 'var(--accent-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileText size={12} /> Document File: {req.fileName || req.proofName}
                    </div>
                  </div>

                  {/* Actions for Admin / Faculty */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedDocPreview(req)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Eye size={13} /> View File Preview
                    </button>

                    {isPending && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleApproveWithAutoExcuse(req.id)}
                          className="btn"
                          style={{ background: 'var(--status-safe-bg)', color: 'var(--status-safe)', border: '1px solid var(--status-safe)', padding: '6px 12px', fontSize: '11px' }}
                        >
                          <Check size={13} /> Auto-Excuse &amp; Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectWithNote(req.id)}
                          className="btn"
                          style={{ background: 'var(--status-critical-bg)', color: 'var(--status-critical)', border: '1px solid var(--status-critical)', padding: '6px 12px', fontSize: '11px' }}
                        >
                          <X size={13} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. ABSENCE SIMULATOR */}
        <div className="glass-panel col-span-12">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Calculator className="text-blue-500" /> Absence Impact Simulator
          </h2>
          <p style={{ fontSize: '14px', marginBottom: '20px' }}>
            Planning a leave? Simulate the precise percentage impact across your courses before actually missing class.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-muted)' }}>Classes to Miss</label>
              <input type="number" min="1" max="10" value={simulatorDays} onChange={(e) => setSimulatorDays(parseInt(e.target.value) || 0)} className="form-control" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-muted)' }}>Target Subject</label>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="form-control">
                {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
              </select>
            </div>
          </div>

          {/* Simulation Output */}
          {(() => {
            const subject = subjects.find(s => s.id === selectedSubject);
            if (!subject || !student) return null;

            const newHeld = subject.classesHeld + simulatorDays;
            const newPercentage = Math.round((subject.classesAttended / newHeld) * 100);
            const drop = subject.attendance - newPercentage;

            const newOverallHeld = student.totalClasses + simulatorDays;
            const newOverallPercentage = Math.round((student.classesAttended / newOverallHeld) * 100);
            const isCurrentlyEligible = student.overallAttendance >= student.requiredAttendance;
            const willBeEligible = newOverallPercentage >= student.requiredAttendance;

            return (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--accent-primary)', fontWeight: '600' }}>Subject Drop: {subject.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Current</div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{subject.attendance}%</div>
                    </div>
                    <ArrowRight color="var(--text-muted)" />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>After Leave</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: newPercentage >= 75 ? 'var(--status-safe)' : 'var(--status-critical)' }}>{newPercentage}%</div>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--accent-secondary)', fontWeight: '600' }}>Overall Attendance Impact</h4>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Current Overall</div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{student.overallAttendance}%</div>
                    </div>
                    <ArrowRight color="var(--text-muted)" />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Predicted Overall</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: willBeEligible ? 'var(--status-safe)' : 'var(--status-critical)' }}>{newOverallPercentage}%</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* DOCUMENT FILE PREVIEW MODAL */}
      {selectedDocPreview && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '24px' }}>
          <div className="glass-panel" style={{ maxWidth: '520px', width: '100%', padding: '28px', borderRadius: '20px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Inspection File Preview</h3>
              <button onClick={() => setSelectedDocPreview(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ background: '#090d16', border: '2px dashed var(--panel-border)', borderRadius: '12px', padding: '32px', textAlign: 'center', marginBottom: '16px' }}>
              <FileText size={48} color="var(--accent-primary)" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ margin: '0 0 4px', fontSize: '16px' }}>{selectedDocPreview.fileName || selectedDocPreview.proofName}</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Submitted by {selectedDocPreview.studentName} ({selectedDocPreview.studentId})</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setSelectedDocPreview(null)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RectificationWorkflow;
