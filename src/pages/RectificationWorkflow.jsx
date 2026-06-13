import { useState } from 'react';
import { useMockData } from '../MockDataContext';
import { FileText, Upload, Send, Calculator, AlertCircle, ArrowRight } from 'lucide-react';

const RectificationWorkflow = () => {
  const { subjects } = useMockData();
  const [simulatorDays, setSimulatorDays] = useState(2);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);

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
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-muted)' }}>Target Subject</label>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--panel-border)', background: '#111827', color: 'white' }}
              >
                {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
              </select>
            </div>
          </div>

          {/* Simulation Result */}
          {(() => {
            const subject = subjects.find(s => s.id === selectedSubject);
            const newHeld = subject.classesHeld + simulatorDays;
            const newPercentage = Math.floor((subject.classesAttended / newHeld) * 100);
            const drop = subject.attendance - newPercentage;
            
            return (
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>Simulation Result</h4>
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
                    <AlertCircle size={14} /> This will cause a drop of {drop}%
                  </div>
                )}
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

          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)' }}>Date</label>
                <input type="date" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)' }}>Subject/Slot</label>
                <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--panel-border)', background: '#111827', color: 'white' }}>
                  <option>Select Slot</option>
                  {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)' }}>Reason / Event Name</label>
              <input type="text" placeholder="e.g. Inter-University Hackathon" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)' }}>Supporting Document</label>
              <div style={{ border: '2px dashed var(--panel-border)', borderRadius: '8px', padding: '32px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                <Upload size={24} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: '14px' }}>Click or drag file to upload proof</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>PDF, JPG, PNG (Max 5MB)</p>
              </div>
            </div>

            <button type="button" className="btn btn-primary" style={{ marginTop: '8px' }}>
              <Send size={18} /> Submit Request
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default RectificationWorkflow;
