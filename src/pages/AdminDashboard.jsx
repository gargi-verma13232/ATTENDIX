import { useState } from 'react';
import { useMockData } from '../MockDataContext';
import { Shield, Users, Award, AlertTriangle, Settings, Save, Check, Ban, Search, Filter } from 'lucide-react';

const AdminDashboard = () => {
  const { students, rectificationRequests } = useMockData();
  const [requiredThreshold, setRequiredThreshold] = useState(75);
  const [isSaved, setIsSaved] = useState(false);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'eligible', 'blocked'

  const studentList = Object.values(students);
  const totalStudents = studentList.length;
  
  // Calculate average attendance
  const avgAttendance = Math.round(
    studentList.reduce((acc, curr) => acc + curr.overallAttendance, 0) / totalStudents
  );

  // Critical students count based on the dynamic slider threshold!
  const criticalStudents = studentList.filter(stu => stu.overallAttendance < requiredThreshold).length;

  const totalRequests = rectificationRequests.length;
  const pendingRequests = rectificationRequests.filter(req => req.status === 'pending').length;

  const handleSaveConfig = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Filter students based on search query & eligibility selection
  const filteredStudents = studentList.filter(stu => {
    const matchesSearch = 
      stu.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      stu.id.toLowerCase().includes(searchQuery.toLowerCase());

    const isEligible = stu.overallAttendance >= requiredThreshold;
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'eligible' && isEligible) || 
      (filterStatus === 'blocked' && !isEligible);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield color="var(--accent-primary)" /> Administrator Overview
        </h1>
        <p className="page-subtitle">College-wide statistics, global eligibility thresholds, and student directory.</p>
      </div>

      <div className="dashboard-grid">
        
        {/* Metric 1 */}
        <div className="glass-panel col-span-3" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', borderRadius: '10px' }}>
            <Users size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '24px' }}>{totalStudents}</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Students</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel col-span-3" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-safe)', borderRadius: '10px' }}>
            <Award size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '24px' }}>{avgAttendance}%</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Average Attendance</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel col-span-3" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: criticalStudents > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: criticalStudents > 0 ? 'var(--status-critical)' : 'var(--status-safe)', borderRadius: '10px' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '24px' }}>{criticalStudents}</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Below Threshold</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel col-span-3" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: pendingRequests > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.05)', color: pendingRequests > 0 ? 'var(--status-warning)' : 'var(--text-muted)', borderRadius: '10px' }}>
            <Settings size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '24px' }}>{pendingRequests} / {totalRequests}</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pending OD Requests</p>
          </div>
        </div>

        {/* Dynamic Policy Setting */}
        <div className="glass-panel col-span-12">
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} className="text-blue-500" /> Attendance Policy Manager
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', marginBottom: '16px' }}>
                Set the global required attendance percentage for exam eligibility. Modifying this threshold will instantly update eligibility warnings across all directories.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input 
                  type="range" 
                  min="50" 
                  max="90" 
                  value={requiredThreshold} 
                  onChange={(e) => setRequiredThreshold(parseInt(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--accent-primary)', height: '6px', borderRadius: '3px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-primary)', minWidth: '60px', textAlign: 'right' }}>
                  {requiredThreshold}%
                </span>
              </div>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Academic Session</p>
                <h3 style={{ fontSize: '18px', marginTop: '4px' }}>Fall Semester 2026</h3>
              </div>
              <button onClick={handleSaveConfig} className="btn btn-primary" style={{ padding: '10px 16px' }}>
                {isSaved ? <><Check size={16} /> Config Saved</> : <><Save size={16} /> Save Policy</>}
              </button>
            </div>
          </div>
        </div>

        {/* Student Directory Table */}
        <div className="glass-panel col-span-12">
          <h2 style={{ marginBottom: '16px' }}>Student Directory & Eligibility</h2>

          {/* Directory Search and Filter Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input 
                type="text" 
                placeholder="Search students by name or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '38px' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <Filter size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '38px' }}
              >
                <option value="all">All Eligibility Zones</option>
                <option value="eligible">Eligible Zone</option>
                <option value="blocked">Blocked Zone</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {filteredStudents.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '24px 0', textAlign: 'center' }}>No students match the search criteria.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
                    <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Student Name</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Student ID</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Branch & Year</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Overall Attendance</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Eligibility</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(stu => {
                    const isEligible = stu.overallAttendance >= requiredThreshold;
                    
                    return (
                      <tr key={stu.id} style={{ borderBottom: '1px solid var(--panel-border)', transition: 'background-color 0.2s' }}>
                        <td style={{ padding: '16px', fontWeight: '500' }}>{stu.name}</td>
                        <td style={{ padding: '16px', fontFamily: 'var(--mono)', fontSize: '13px' }}>{stu.id}</td>
                        <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>{stu.branch} • {stu.year}</td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontWeight: '700', fontSize: '15px', color: isEligible ? 'var(--status-safe)' : 'var(--status-critical)' }}>
                              {stu.overallAttendance}%
                            </span>
                            <div className="progress-container" style={{ margin: 0, width: '80px', height: '6px' }}>
                              <div 
                                className={`progress-bar ${isEligible ? 'progress-safe' : 'progress-critical'}`} 
                                style={{ width: `${stu.overallAttendance}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          {isEligible ? (
                            <span className="status-badge safe" style={{ fontSize: '11px' }}>
                              <Check size={12} /> Eligible
                            </span>
                          ) : (
                            <span className="status-badge critical" style={{ fontSize: '11px' }}>
                              <Ban size={12} /> Blocked (&lt;{requiredThreshold}%)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
