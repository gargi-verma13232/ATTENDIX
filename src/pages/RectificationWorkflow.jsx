import { useState } from 'react';
import { useMockData } from '../MockDataContext';
import { FileText, Upload, Send, Calculator, AlertCircle, ArrowRight, CheckCircle, FileUp } from 'lucide-react';

const RectificationWorkflow = () => {
  const { student, subjects, submitRectification } = useMockData();
  const [simulatorDays, setSimulatorDays] = useState(2);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || '');

  // Form states
  const [reqDate, setReqDate] = useState('');
  const [reqSubject, setReqSubject] = useState(subjects[0]?.id || '');
  const [reqReason, setReqReason] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileMockUpload = () => {
    // Simulate file selection
    setUploadedFile('duty_leave_request_proof.pdf');
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

    // Trigger context submit
    submitRectification({
      date: reqDate,
      subjectId: reqSubject,
      subjectName: subjectName,
      reason: reqReason,
      fileName: uploadedFile || 'general_proof.pdf'
    });

    // Reset fields & show success message
    setIsSuccess(true);
    setReqDate('');
    setReqSubject(subjects[0]?.id || '');
    setReqReason('');
    setUploadedFile(null);

    setTimeout(() => {
      setIsSuccess(false);
    }, 4000);
  };

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileText color="var(--accent-primary)" /> OD & Rectification
        </h1>
        <p className="page-subtitle">Log official attendance requests and simulate absence impact.</p>
      </div>

      <div className="dashboard-grid">
        
        {/* Absence Simulator */}
        <div className="glass-panel col-span-6">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Calculator className="text-blue-500" /> Absence Simulator
          </h2>
          <p style={{ fontSize: '14px', marginBottom: '20px' }}>
            Planning a leave? Simulate the precise percentage impact across your courses before actually missing class.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-muted)' }}>Classes to Miss</label>
              <input 
                type="number" 
                min="1" 
                max="10"
                value={simulatorDays} 
                onChange={(e) => setSimulatorDays(parseInt(e.target.value) || 0)}
                className="form-control"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-muted)' }}>Target Subject</label>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="form-control"
              >
                {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
              </select>
            </div>
          </div>

          {/* Simulation Result */}
          {(() => {
            const subject = subjects.find(s => s.id === selectedSubject);
            if (!subject || !student) return null;

            const newHeld = subject.classesHeld + simulatorDays;
            const newPercentage = Math.round((subject.classesAttended / newHeld) * 100);
            const drop = subject.attendance - newPercentage;
            
            // Overall predictions
            const newOverallHeld = student.totalClasses + simulatorDays;
            const newOverallPercentage = Math.round((student.classesAttended / newOverallHeld) * 100);
            const isCurrentlyEligible = student.overallAttendance >= student.requiredAttendance;
            const willBeEligible = newOverallPercentage >= student.requiredAttendance;
            
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  {drop > 0 && (
                    <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--status-warning)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertCircle size={14} /> Subject attendance drops by {drop}%
                    </div>
                  )}
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
                  
                  {!willBeEligible && isCurrentlyEligible && (
                    <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--status-critical)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                      <AlertCircle size={14} /> Warning: This will make you INELIGIBLE for exams (&lt;75%)!
                    </div>
                  )}
                  {willBeEligible && (
                    <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--status-safe)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={14} /> You will remain eligible for exams.
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Rectification Request Form */}
        <div className="glass-panel col-span-6">
          <h2 style={{ marginBottom: '16px' }}>Log Official Attendance Request</h2>
          <p style={{ fontSize: '14px', marginBottom: '24px' }}>
            Submit your application for Sports, Cultural Clubs, or University Events. This request routes directly to your faculty's dashboard.
          </p>

          {isSuccess && (
            <div 
              style={{ 
                background: 'rgba(16, 185, 129, 0.1)', 
                border: '1px solid rgba(16, 185, 129, 0.2)', 
                color: 'var(--status-safe)', 
                padding: '12px', 
                borderRadius: '8px', 
                fontSize: '13px', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '500'
              }}
            >
              <CheckCircle size={16} /> Request submitted successfully! It is now pending review.
            </div>
          )}

          {errorMsg && (
            <div 
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                color: 'var(--status-critical)', 
                padding: '12px', 
                borderRadius: '8px', 
                fontSize: '13px', 
                marginBottom: '16px',
                fontWeight: '500'
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)' }}>Date</label>
                <input 
                  type="date" 
                  value={reqDate}
                  onChange={(e) => setReqDate(e.target.value)}
                  className="form-control"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)' }}>Subject/Slot</label>
                <select 
                  value={reqSubject}
                  onChange={(e) => setReqSubject(e.target.value)}
                  className="form-control"
                >
                  <option value="">Select Slot</option>
                  {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)' }}>Reason / Event Name</label>
              <input 
                type="text" 
                placeholder="e.g. Inter-University Hackathon" 
                value={reqReason}
                onChange={(e) => setReqReason(e.target.value)}
                className="form-control"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)' }}>Supporting Document</label>
              <div 
                onClick={handleFileMockUpload}
                style={{ 
                  border: '2px dashed var(--panel-border)', 
                  borderRadius: '8px', 
                  padding: '32px', 
                  textAlign: 'center', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s ease',
                  backgroundColor: uploadedFile ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                  borderColor: uploadedFile ? 'var(--accent-primary)' : 'var(--panel-border)'
                }}
              >
                {uploadedFile ? (
                  <>
                    <FileUp size={24} color="var(--accent-primary)" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontSize: '14px', color: 'var(--accent-primary)', fontWeight: '500' }}>{uploadedFile}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Click to replace file</p>
                  </>
                ) : (
                  <>
                    <Upload size={24} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontSize: '14px' }}>Click to upload proof document</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>PDF, JPG, PNG (Max 5MB)</p>
                  </>
                )}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
              <Send size={18} /> Submit Request
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default RectificationWorkflow;
