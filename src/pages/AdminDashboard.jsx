import { useState } from 'react';
import { useMockData } from '../MockDataContext';
import { Shield, Users, Award, AlertTriangle, Settings, Save, Check, Ban, Search, Filter } from 'lucide-react';

const AdminDashboard = () => {
  const { dbState, students, rectificationRequests, activeSection, addStudent, resetDB, importJSONState } = useMockData();
  const [requiredThreshold, setRequiredThreshold] = useState(75);
  const [isSaved, setIsSaved] = useState(false);

  // States for Quick Add Student Form
  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [examScore, setExamScore] = useState('');
  const [addStatus, setAddStatus] = useState({ success: null, message: '' });

  // States for JSON Backup & Import Hub
  const [rawJSON, setRawJSON] = useState('');
  const [importStatus, setImportStatus] = useState({ success: null, message: '' });
  const [copyStatus, setCopyStatus] = useState(false);

  const handleAddStudentSubmit = (e) => {
    e.preventDefault();
    if (!studentId || !fullName || !department || !examScore) {
      setAddStatus({ success: false, message: 'All fields are required.' });
      return;
    }

    const score = parseInt(examScore);
    if (isNaN(score) || score < 0 || score > 100) {
      setAddStatus({ success: false, message: 'Internal exam score must be a number between 0 and 100.' });
      return;
    }

    // Check if student already exists
    if (students[studentId]) {
      setAddStatus({ success: false, message: 'A student with this ID already exists.' });
      return;
    }

    // Construct student object with default timetable/course structures
    const newStudentObj = {
      id: studentId.trim(),
      name: fullName.trim(),
      role: 'student',
      overallAttendance: score,
      streak: 0,
      totalClasses: 100,
      classesAttended: score,
      requiredAttendance: 75,
      branch: department.trim(),
      year: '1st Year',
      nextBadge: 'Getting Started',
      subjects: [
        { id: 'CS101', name: 'Data Structures', attendance: score, classesHeld: 25, classesAttended: Math.round(25 * (score / 100)) },
        { id: 'CS102', name: 'Database Systems', attendance: score, classesHeld: 25, classesAttended: Math.round(25 * (score / 100)) },
        { id: 'CS103', name: 'Operating Systems', attendance: score, classesHeld: 25, classesAttended: Math.round(25 * (score / 100)) },
        { id: 'HU101', name: 'Communication Skills', attendance: score, classesHeld: 25, classesAttended: Math.round(25 * (score / 100)) },
      ],
      attendanceTrend: [
        { week: 'Week 1', 'Data Structures': score, 'Database Systems': score, 'Operating Systems': score, 'Communication Skills': score },
        { week: 'Week 2', 'Data Structures': score, 'Database Systems': score, 'Operating Systems': score, 'Communication Skills': score },
        { week: 'Week 3', 'Data Structures': score, 'Database Systems': score, 'Operating Systems': score, 'Communication Skills': score },
        { week: 'Week 4', 'Data Structures': score, 'Database Systems': score, 'Operating Systems': score, 'Communication Skills': score },
        { week: 'Week 5', 'Data Structures': score, 'Database Systems': score, 'Operating Systems': score, 'Communication Skills': score }
      ]
    };

    addStudent(newStudentObj);
    setAddStatus({ success: true, message: `Successfully added student ${fullName} (${studentId})!` });
    
    // Clear inputs
    setStudentId('');
    setFullName('');
    setDepartment('');
    setExamScore('');
    
    // Reset status after 3 seconds
    setTimeout(() => {
      setAddStatus({ success: null, message: '' });
    }, 3000);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(dbState, null, 2))
      .then(() => {
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy state to clipboard: ', err);
      });
  };

  const handleImportJSONSubmit = (e) => {
    e.preventDefault();
    if (!rawJSON.trim()) {
      setImportStatus({ success: false, message: 'Please enter JSON data.' });
      return;
    }

    const res = importJSONState(rawJSON);
    if (res.success) {
      setImportStatus({ success: true, message: 'Database state successfully imported and applied!' });
      setRawJSON('');
      setTimeout(() => setImportStatus({ success: null, message: '' }), 3000);
    } else {
      setImportStatus({ success: false, message: `Import failed: ${res.error.message}` });
    }
  };

  const handleResetDB = () => {
    if (window.confirm('Are you sure you want to reset the database to initial mock data? This will clear all modifications.')) {
      resetDB();
      setImportStatus({ success: true, message: 'Database successfully reset to initial mock state.' });
      setTimeout(() => setImportStatus({ success: null, message: '' }), 3000);
    }
  };

  // If Data & User Manager activeSection is selected, render the manager view!
  if (activeSection === 'admin-data') {
    return (
      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users color="var(--accent-primary)" /> Data & User Manager
          </h1>
          <p className="page-subtitle">Add students to mock database, copy database state backups, or load new JSON configurations.</p>
        </div>

        <div className="dashboard-grid">
          {/* Card 1: Quick Add Student */}
          <div className="glass-panel col-span-6">
            <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Quick Add Student
            </h2>
            <form onSubmit={handleAddStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label>Student ID / Roll No</label>
                <input 
                  type="text" 
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. STU-2024-003"
                  className="form-control"
                  required
                />
              </div>

              <div className="input-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rachel Green"
                  className="form-control"
                  required
                />
              </div>

              <div className="input-group">
                <label>Department / Branch</label>
                <input 
                  type="text" 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. B.Tech ECE"
                  className="form-control"
                  required
                />
              </div>

              <div className="input-group">
                <label>Internal Exam Attendance Score (%)</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={examScore}
                  onChange={(e) => setExamScore(e.target.value)}
                  placeholder="e.g. 78"
                  className="form-control"
                  required
                />
              </div>

              {addStatus.message && (
                <div style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  fontSize: '13px', 
                  fontWeight: '500',
                  textAlign: 'center',
                  background: addStatus.success ? 'var(--status-safe-bg)' : 'var(--status-critical-bg)',
                  color: addStatus.success ? 'var(--status-safe)' : 'var(--status-critical)',
                  border: addStatus.success ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                  {addStatus.message}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ padding: '12px 20px', marginTop: '8px' }}>
                Add Student Record
              </button>
            </form>
          </div>

          {/* Card 2: Backup & JSON Data Hub */}
          <div className="glass-panel col-span-6" style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ marginBottom: '20px' }}>
              Backup & JSON Data Hub
            </h2>
            
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Generate copyable backup payloads of the database state or restore database state from a raw JSON configuration payload.
            </p>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <button 
                onClick={handleCopyJSON} 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '12px' }}
              >
                {copyStatus ? '✓ Copied to Clipboard' : '📋 Copy JSON Backup'}
              </button>
              <button 
                onClick={handleResetDB} 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '12px', color: 'var(--status-critical)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
              >
                ⚠ Reset Database
              </button>
            </div>

            <form onSubmit={handleImportJSONSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              <div className="input-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label>Paste Raw JSON Configuration</label>
                <textarea 
                  value={rawJSON}
                  onChange={(e) => setRawJSON(e.target.value)}
                  placeholder="Paste database state JSON string here..."
                  className="form-control"
                  style={{ 
                    flex: 1, 
                    minHeight: '180px', 
                    fontFamily: 'var(--mono, monospace)', 
                    fontSize: '12px', 
                    resize: 'vertical',
                    background: 'rgba(0, 0, 0, 0.3)'
                  }}
                  required
                />
              </div>

              {importStatus.message && (
                <div style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  fontSize: '13px', 
                  fontWeight: '500',
                  textAlign: 'center',
                  background: importStatus.success ? 'var(--status-safe-bg)' : 'var(--status-critical-bg)',
                  color: importStatus.success ? 'var(--status-safe)' : 'var(--status-critical)',
                  border: importStatus.success ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                  {importStatus.message}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ padding: '12px 20px' }}>
                Apply JSON State
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'eligible', 'blocked'

  const studentList = Object.values(students);
  const totalStudents = studentList.length;
  
  // Calculate average attendance safely to avoid division by zero (NaN)
  const avgAttendance = totalStudents > 0 
    ? Math.round(studentList.reduce((acc, curr) => acc + curr.overallAttendance, 0) / totalStudents) 
    : 0;

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
