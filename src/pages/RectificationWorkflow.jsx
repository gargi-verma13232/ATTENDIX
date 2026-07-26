import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMockData } from '../MockDataContext';
import DocumentUploadModal from '../components/DocumentUploadModal';
import {
  FileText, Upload, Send, Calculator, ArrowRight,
  CheckCircle, FileUp, Shield, Check, X, Eye, Sparkles,
  CheckCircle2, XCircle, Clock
} from 'lucide-react';

const RectificationWorkflow = () => {
  const {
    student,
    subjects,
    submitRectification,
    rectificationRequests,
    resolveRectification,
    currentUser,
    submitDocument,
  } = useMockData();

  const [simulatorDays, setSimulatorDays] = useState(2);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || 'CS101');

  // Form states
  const [reqDate, setReqDate] = useState('');
  const [reqSubject, setReqSubject] = useState(subjects[0]?.id || 'CS101');
  const [docType, setDocType] = useState('Medical Certificate');
  const [reqReason, setReqReason] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileObj, setUploadedFileObj] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Admin / Faculty Review Pipeline state
  const [selectedDocPreview, setSelectedDocPreview] = useState(null);

  const handleModalSubmitDoc = (docData) => {
    setUploadedFile(docData.fileName);
    setUploadedFileObj(docData);
    setDocType(docData.docType || docType);
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
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-muted)' }}>Official Proof Document</label>
              <div
                onClick={() => setShowUploadModal(true)}
                style={{
                  border: uploadedFile ? '1px solid rgba(16, 185, 129, 0.4)' : '1px dashed rgba(59, 130, 246, 0.4)',
                  borderRadius: '16px',
                  padding: '20px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: uploadedFile ? 'rgba(16, 185, 129, 0.06)' : 'rgba(59, 130, 246, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
              >
                {uploadedFile ? (
                  <>
                    <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px', color: 'var(--status-safe)' }}>
                      <FileUp size={22} />
                    </div>
                    <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {uploadedFile}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--status-safe)', margin: '2px 0 0', fontWeight: '600' }}>
                        ✓ File Attached — Click to replace or change category
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '12px', color: 'var(--accent-primary)' }}>
                      <Upload size={22} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                        Click to Open Document Verification Upload Portal
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                        Attach PDF, PNG, JPG proof files with live thumbnail preview
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px' }}>
              <Send size={16} /> Submit Document Application
            </button>
          </form>
        </div>

        {/* Document Upload Modal */}
        <DocumentUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSubmitDoc={handleModalSubmitDoc}
        />

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
              const isPending = req.status === 'pending' || req.status === 'Pending Admin Approval';
              const isApproved = req.status === 'approved' || req.status === 'Approved' || req.status === 'Approved (Auto-Excused)';
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isApproved ? <><CheckCircle2 size={14} /> Approved (Auto-Excused)</> : isPending ? <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}><Clock size={14} /></motion.div> Pending Admin Approval</> : <><XCircle size={14} /> Denied</>}
                      </div>
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
                          className="btn btn-success btn-sm"
                        >
                          <Check size={13} /> Auto-Excuse &amp; Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectWithNote(req.id)}
                          className="btn btn-danger btn-sm"
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
