
import { useMockData } from '../MockDataContext';
import { Flame, Award, AlertTriangle, CheckCircle } from 'lucide-react';

const StudentDashboard = () => {
  const { student, subjects } = useMockData();

  // Exam Eligibility calculation
  const remainingClasses = student.totalClasses - student.classesAttended - 20; // Simulated remaining
  const requiredTotalAttended = Math.ceil((student.totalClasses * student.requiredAttendance) / 100);
  const classesNeeded = requiredTotalAttended - student.classesAttended;
  const isEligibleNow = student.overallAttendance >= student.requiredAttendance;
  
  // Calculate if they can reach it
  const isPossibleToReach = classesNeeded <= remainingClasses;

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
            <p style={{ marginBottom: '16px' }}>{student.classesAttended} out of 150 classes attended</p>
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
