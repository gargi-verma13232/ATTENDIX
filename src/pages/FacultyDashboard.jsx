import { useState } from 'react';
import { useMockData } from '../MockDataContext';
import { ClipboardCheck, Users, Clock, Check, X, FileText, AlertTriangle, History } from 'lucide-react';

const FacultyDashboard = () => {
  const { currentUser, students, rectificationRequests, approveRequest, rejectRequest } = useMockData();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'

  // Get only courses taught by this faculty member (CS101, CS102)
  const facultyCourses = currentUser?.courses || [];
  
  // Filter rectification requests related to this faculty's courses
  const filteredRequests = rectificationRequests.filter(req => 
    facultyCourses.includes(req.subjectId)
  );

  const pendingRequests = filteredRequests.filter(req => req.status === 'pending');
  const historyRequests = filteredRequests.filter(req => req.status !== 'pending');

  const pendingRequestsCount = pendingRequests.length;
  const historyRequestsCount = historyRequests.length;

  // Compute stats for class lists
  const studentList = Object.values(students);
  
  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h1 className="page-title">Welcome, {currentUser?.name || 'Faculty Member'}</h1>
        <p className="page-subtitle">Manage class records, review student absence excuses, and authorize duty leaves.</p>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
        {/* Stats 1 */}
        <div className="glass-panel col-span-4" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', borderRadius: '12px' }}>
            <Users size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '28px' }}>{studentList.length}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Enrolled Students</p>
          </div>
        </div>

        {/* Stats 2 */}
        <div className="glass-panel col-span-4" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-secondary)', borderRadius: '12px' }}>
            <ClipboardCheck size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '28px' }}>{facultyCourses.length}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Active Courses</p>
          </div>
        </div>

        {/* Stats 3 */}
        <div className="glass-panel col-span-4" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', background: pendingRequestsCount > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: pendingRequestsCount > 0 ? 'var(--status-warning)' : 'var(--status-safe)', borderRadius: '12px' }}>
            <Clock size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '28px' }}>{pendingRequestsCount}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Pending OD Approvals</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* OD / Rectification Requests Panel */}
        <div className="glass-panel col-span-12" style={{ minHeight: '340px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} className="text-blue-500" /> Attendance Duty Leave Requests
            </h2>
          </div>

          {/* Elegant Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--panel-border)', marginBottom: '24px', gap: '24px' }}>
            <button 
              onClick={() => setActiveTab('pending')}
              style={{ 
                background: 'none', 
                border: 'none', 
                padding: '12px 4px', 
                color: activeTab === 'pending' ? 'var(--accent-primary)' : 'var(--text-muted)', 
                fontWeight: '600', 
                fontSize: '14px', 
                cursor: 'pointer', 
                borderBottom: activeTab === 'pending' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Pending Approvals
              {pendingRequestsCount > 0 && (
                <span style={{ 
                  background: 'var(--status-warning)', 
                  color: 'black', 
                  fontSize: '10px', 
                  fontWeight: '700', 
                  padding: '2px 6px', 
                  borderRadius: '10px' 
                }}>
                  {pendingRequestsCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              style={{ 
                background: 'none', 
                border: 'none', 
                padding: '12px 4px', 
                color: activeTab === 'history' ? 'var(--accent-primary)' : 'var(--text-muted)', 
                fontWeight: '600', 
                fontSize: '14px', 
                cursor: 'pointer', 
                borderBottom: activeTab === 'history' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <History size={14} /> Processed History
              {historyRequestsCount > 0 && (
                <span style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  color: 'var(--text-main)', 
                  fontSize: '10px', 
                  fontWeight: '700', 
                  padding: '2px 6px', 
                  borderRadius: '10px' 
                }}>
                  {historyRequestsCount}
                </span>
              )}
            </button>
          </div>
          
          {/* Active Tab rendering */}
          {activeTab === 'pending' ? (
            pendingRequests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '32px 0', textAlign: 'center' }}>No pending requests left to review.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pendingRequests.map(req => (
                  <div 
                    key={req.id} 
                    className="glass-panel" 
                    style={{ 
                      background: 'rgba(255,255,255,0.01)', 
                      padding: '16px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      border: '1px solid var(--panel-border)',
                      borderRadius: '12px',
                      gap: '24px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '15px' }}>{req.studentName}</strong>
                        <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>{req.studentId}</span>
                        <span className="status-badge warning" style={{ fontSize: '10px', padding: '1px 6px' }}>
                          pending
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '4px' }}>
                        Course: <strong>{req.subjectName}</strong> ({req.subjectId})
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        Reason: {req.reason} • Date: {req.date}
                      </p>
                      {req.fileName && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent-primary)', marginTop: '6px', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                          Attachment: {req.fileName}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => approveRequest(req.id)}
                        className="btn btn-secondary" 
                        style={{ padding: '8px 12px', borderColor: 'var(--status-safe)', color: 'var(--status-safe)' }}
                        title="Approve Request"
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button 
                        onClick={() => rejectRequest(req.id)}
                        className="btn btn-secondary" 
                        style={{ padding: '8px 12px', borderColor: 'var(--status-critical)', color: 'var(--status-critical)' }}
                        title="Reject Request"
                      >
                        <X size={16} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            historyRequests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '32px 0', textAlign: 'center' }}>No requests have been processed yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {historyRequests.map(req => (
                  <div 
                    key={req.id} 
                    className="glass-panel" 
                    style={{ 
                      background: 'rgba(255,255,255,0.01)', 
                      padding: '16px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      border: '1px solid var(--panel-border)',
                      borderRadius: '12px',
                      opacity: 0.85
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '15px' }}>{req.studentName}</strong>
                        <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>{req.studentId}</span>
                        <span className={`status-badge ${req.status === 'approved' ? 'safe' : 'critical'}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                          {req.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '4px' }}>
                        Course: <strong>{req.subjectName}</strong> ({req.subjectId})
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        Reason: {req.reason} • Date: {req.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Student Attendance List */}
        <div className="glass-panel col-span-12">
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} className="text-blue-500" /> Course Attendance Registry
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Student Name</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Student ID</th>
                  {facultyCourses.map(courseId => (
                    <th key={courseId} style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                      {courseId === 'CS101' ? 'Data Structures' : 'Database Systems'}
                    </th>
                  ))}
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {studentList.map(stu => {
                  const dsAttendance = stu.subjects.find(s => s.id === 'CS101')?.attendance ?? 0;
                  const dbAttendance = stu.subjects.find(s => s.id === 'CS102')?.attendance ?? 0;
                  
                  return (
                    <tr key={stu.id} style={{ borderBottom: '1px solid var(--panel-border)', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '16px', fontWeight: '500' }}>{stu.name}</td>
                      <td style={{ padding: '16px', fontFamily: 'var(--mono)', fontSize: '13px' }}>{stu.id}</td>
                      {facultyCourses.includes('CS101') && (
                        <td style={{ padding: '16px' }}>
                          <span style={{ fontWeight: '600', color: dsAttendance >= 75 ? 'var(--status-safe)' : 'var(--status-critical)' }}>
                            {dsAttendance}%
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                            ({stu.subjects.find(s => s.id === 'CS101')?.classesAttended}/{stu.subjects.find(s => s.id === 'CS101')?.classesHeld})
                          </span>
                        </td>
                      )}
                      {facultyCourses.includes('CS102') && (
                        <td style={{ padding: '16px' }}>
                          <span style={{ fontWeight: '600', color: dbAttendance >= 75 ? 'var(--status-safe)' : 'var(--status-critical)' }}>
                            {dbAttendance}%
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                            ({stu.subjects.find(s => s.id === 'CS102')?.classesAttended}/{stu.subjects.find(s => s.id === 'CS102')?.classesHeld})
                          </span>
                        </td>
                      )}
                      <td style={{ padding: '16px' }}>
                        {stu.overallAttendance < 75 ? (
                          <span className="status-badge critical" style={{ fontSize: '11px' }}>
                            <AlertTriangle size={12} /> At Risk
                          </span>
                        ) : (
                          <span className="status-badge safe" style={{ fontSize: '11px' }}>
                            <Check size={12} /> Eligible
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
