import { useMockData } from '../MockDataContext';
import { HeartPulse, CheckCircle, AlertTriangle, XCircle, Calendar } from 'lucide-react';

const RecoveryPlanner = () => {
  const { subjects } = useMockData();

  const calculateRecovery = (sub) => {
    const requiredTotal = Math.ceil((sub.classesHeld * 75) / 100);
    const classesNeeded = requiredTotal - sub.classesAttended;
    const isSafe = sub.attendance >= 75;

    // Simulate remaining classes in semester
    const remainingClasses = 15; 
    
    // If safe, how many can they miss?
    // Let M be number of classes they can miss.
    // (Attended) / (Held + M) >= 0.75
    // Attended >= 0.75 * Held + 0.75 * M
    // M <= (Attended - 0.75 * Held) / 0.75
    const safeLeaves = isSafe ? Math.floor((sub.classesAttended - 0.75 * sub.classesHeld) / 0.75) : 0;

    return {
      classesNeeded: classesNeeded > 0 ? classesNeeded : 0,
      isSafe,
      safeLeaves,
      remainingClasses
    };
  };

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <HeartPulse color="var(--accent-primary)" /> Attendance Recovery Planner
        </h1>
        <p className="page-subtitle">Understand your status and plan your attendance strategically to stay out of the critical zone.</p>
      </div>

      <div className="dashboard-grid">
        {subjects.map(sub => {
          const { isSafe, classesNeeded, safeLeaves } = calculateRecovery(sub);
          const statusClass = isSafe ? 'safe' : sub.attendance >= 65 ? 'warning' : 'critical';
          const StatusIcon = isSafe ? CheckCircle : sub.attendance >= 65 ? AlertTriangle : XCircle;

          return (
            <div key={sub.id} className="glass-panel col-span-6" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: `var(--status-${statusClass})` }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>{sub.name}</h3>
                  <p style={{ fontSize: '13px', fontFamily: 'var(--mono)' }}>{sub.id} • {sub.classesAttended}/{sub.classesHeld} Classes</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: `var(--status-${statusClass})` }}>{sub.attendance}%</div>
                  <div className={`status-badge ${statusClass}`} style={{ marginTop: '4px' }}>
                    <StatusIcon size={14} /> {isSafe ? 'Safe' : statusClass === 'warning' ? 'Warning' : 'Critical'}
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                {isSafe ? (
                  <div>
                    <h4 style={{ color: 'var(--status-safe)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <CheckCircle size={16} /> Safe Leaves Available
                    </h4>
                    <p style={{ fontSize: '14px' }}>You can safely miss <strong>{safeLeaves}</strong> more classes while still maintaining the required 75% attendance percentage.</p>
                  </div>
                ) : (
                  <div>
                    <h4 style={{ color: `var(--status-${statusClass})`, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <AlertTriangle size={16} /> Recovery Action Plan
                    </h4>
                    <p style={{ fontSize: '14px', marginBottom: '12px' }}>
                      You need to attend <strong>{classesNeeded}</strong> more consecutive classes to reach 75%.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <Calendar size={14} /> Expected Recovery Date: <strong>Approx. 2 Weeks</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecoveryPlanner;
