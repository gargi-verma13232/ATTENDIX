import { useState } from 'react';
import { useMockData } from '../MockDataContext';
import { Flame, Award, AlertTriangle, CheckCircle, Calculator, Check, Ban } from 'lucide-react';

const StudentDashboard = () => {
  const { student, subjects } = useMockData();
  
  // Dynamically initialize simulation leaves state based on current student's subjects!
  const [simulatedLeaves, setSimulatedLeaves] = useState(() => {
    const initial = {};
    subjects.forEach(sub => {
      initial[sub.id] = 0;
    });
    return initial;
  });

  const getSimulatedSubjectLeaves = (subId) => simulatedLeaves[subId] || 0;

  const handleLeaveChange = (subId, value) => {
    const newVal = Math.max(0, Math.min(15, value)); // limit simulation to 15 leaves per subject
    setSimulatedLeaves(prev => ({
      ...prev,
      [subId]: newVal
    }));
  };

  // Exam Eligibility calculation
  const remainingClasses = student.totalClasses - student.classesAttended - 20; // Simulated remaining
  const requiredTotalAttended = Math.ceil((student.totalClasses * student.requiredAttendance) / 100);
  const classesNeeded = requiredTotalAttended - student.classesAttended;
  const isEligibleNow = student.overallAttendance >= student.requiredAttendance;
  
  // Calculate if they can reach it
  const isPossibleToReach = classesNeeded <= remainingClasses;

  // Simulated leaves metrics across all subjects combined
  const totalSimulatedLeaves = Object.values(simulatedLeaves).reduce((sum, val) => sum + val, 0);
  const simulatedTotalClasses = student.totalClasses + totalSimulatedLeaves;
  const simulatedAttendance = Math.round((student.classesAttended / simulatedTotalClasses) * 100);
  const isSimulatedEligible = simulatedAttendance >= student.requiredAttendance;

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h1 className="page-title">Welcome back, {student.name.split(' ')[0]}</h1>
        <p className="page-subtitle">Here is your attendance snapshot for the current semester.</p>
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
              {student.overallAttendance >= 75 ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>}
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
          
          <div className="panel-inset" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
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

          {/* Leaves Simulation section */}
          <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '20px', marginTop: '20px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={18} color="var(--accent-primary)" /> Course-wise Leaves Predictor
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Simulate individual class leaves to see course-specific impacts and the combined eligibility outcome.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
              
              {/* Itemized list of subjects */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {subjects.map(sub => {
                  const leaves = getSimulatedSubjectLeaves(sub.id);
                  const predPercentage = Math.round((sub.classesAttended / (sub.classesHeld + leaves)) * 100);
                  const isSubSafe = predPercentage >= 75;
                  
                  return (
                    <div 
                      key={sub.id} 
                      className="panel-inset" 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '10px 14px' 
                      }}
                    >
                      <div style={{ flex: 1, marginRight: '12px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>{sub.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', textDecoration: leaves > 0 ? 'line-through' : 'none', color: 'var(--text-muted)' }}>
                            {sub.attendance}%
                          </span>
                          {leaves > 0 && (
                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: isSubSafe ? 'var(--status-safe)' : 'var(--status-critical)' }}>
                              ➔ {predPercentage}%
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => handleLeaveChange(sub.id, leaves - 1)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '14px', minWidth: '32px' }}
                          disabled={leaves <= 0}
                          type="button"
                        >
                          -
                        </button>
                        <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '700', fontSize: '14px' }}>
                          {leaves}
                        </span>
                        <button 
                          onClick={() => handleLeaveChange(sub.id, leaves + 1)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '14px', minWidth: '32px' }}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Combined outcome Summary Panel */}
              <div 
                className="panel-inset" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '16px',
                  background: isSimulatedEligible ? 'rgba(16, 185, 129, 0.04)' : 'rgba(239, 68, 68, 0.04)',
                  borderColor: isSimulatedEligible ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  padding: '20px',
                  borderRadius: '16px'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Combined Simulated Leaves</h4>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: totalSimulatedLeaves > 0 ? 'var(--accent-primary)' : 'var(--text-main)' }}>
                    {totalSimulatedLeaves} Classes
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '12px' }}>
                  <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Predicted Overall Attendance</h4>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '32px', fontWeight: '800', color: isSimulatedEligible ? 'var(--status-safe)' : 'var(--status-critical)' }}>
                      {simulatedAttendance}%
                    </span>
                    {totalSimulatedLeaves > 0 && (
                      <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                        (was {student.overallAttendance}%)
                      </span>
                    )}
                  </div>
                </div>

                <div 
                  className={`status-badge ${isSimulatedEligible ? 'safe' : 'critical'}`} 
                  style={{ 
                    fontSize: '12px', 
                    padding: '8px 16px', 
                    width: '100%', 
                    justifyContent: 'center', 
                    borderRadius: '8px', 
                    marginTop: '4px' 
                  }}
                >
                  {isSimulatedEligible ? <Check size={14} /> : <Ban size={14} />}
                  <strong>{isSimulatedEligible ? 'Eligible for Exams' : 'Blocked from Exams'}</strong>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Subjects Overview Mini */}
        <div className="col-span-12">
          <h3 style={{ marginBottom: '16px' }}>Subject Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {subjects.map(sub => (
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
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
