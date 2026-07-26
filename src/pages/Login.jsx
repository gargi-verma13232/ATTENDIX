import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../MockDataContext';
import { Activity, Lock, User, Shield, GraduationCap, ClipboardCheck, X, Plus } from 'lucide-react';

const Login = () => {
  const { login, currentUser, dbState, removeStudent, removeFaculty, addStudent, addFaculty } = useMockData();
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUserRole, setNewUserRole] = useState('student');
  const [newUserId, setNewUserId] = useState('');
  const [newUserName, setNewUserName] = useState('');

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'student') {
        navigate('/student');
      } else if (currentUser.role === 'faculty') {
        navigate('/faculty');
      } else if (currentUser.role === 'admin') {
        navigate('/admin');
      }
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId || !password) {
      setError('Please enter both User ID and Password');
      return;
    }

    const result = login(userId, password);
    if (result.success) {
      const userRole = dbState?.users?.[userId]?.role || 
        (userId.toUpperCase().startsWith('FAC') ? 'faculty' : userId.toUpperCase().startsWith('ADM') ? 'admin' : 'student');
      if (userRole === 'faculty') {
        navigate('/faculty');
      } else if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } else {
      setError(result.message || 'Invalid credentials');
    }
  };

  const handleQuickLogin = (uid, pwd) => {
    setUserId(uid);
    setPassword(pwd);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        
        {/* Main login card */}
        <div className="glass-panel login-card">
          <div className="login-header">
            <div className="login-logo">
              <Activity size={36} color="#3B82F6" />
              <span>Attendix</span>
            </div>
            <p>Smart Attendance Tracking & Analytics</p>
          </div>

          {error && (
            <div className="login-error-banner">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="userId">User ID</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="userId"
                  type="text"
                  placeholder="e.g. STU-2024-001"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary login-btn">
              Sign In
            </button>
          </form>
        </div>

        {/* Quick Credentials Switcher */}
        <div className="glass-panel quick-login-panel" style={{ maxHeight: '600px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Quick Login Switcher</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {showAddForm ? <X size={14} /> : <Plus size={14} />}
              {showAddForm ? 'Cancel' : 'Add User'}
            </button>
          </div>
          
          {showAddForm ? (
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '14px' }}>Add New User</h4>
              <div className="input-group" style={{ marginBottom: '12px' }}>
                <select className="form-control" value={newUserRole} onChange={e => setNewUserRole(e.target.value)}>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: '12px' }}>
                <input type="text" className="form-control" placeholder="User ID (e.g. STU-999)" value={newUserId} onChange={e => setNewUserId(e.target.value)} />
              </div>
              <div className="input-group" style={{ marginBottom: '12px' }}>
                <input type="text" className="form-control" placeholder="Full Name" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
              </div>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={() => {
                  if (!newUserId || !newUserName) return;
                  if (newUserRole === 'student') {
                    addStudent({ id: newUserId, name: newUserName, role: 'student', overallAttendance: 100, branch: 'B.Tech CSE', year: '1st Year', totalClasses: 10, classesAttended: 10 });
                  } else {
                    addFaculty({ id: newUserId, name: newUserName, department: 'Computer Science', courses: [] });
                  }
                  setShowAddForm(false);
                  setNewUserId('');
                  setNewUserName('');
                }}
              >
                Add User
              </button>
            </div>
          ) : (
            <p style={{ fontSize: '13px', marginBottom: '16px' }}>Select an identity to login automatically:</p>
          )}

          <div className="quick-login-list" style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
            
            {/* STUDENTS */}
            {Object.values(dbState?.students || {}).map(student => (
              <div key={student.id} className="quick-login-item" style={{ position: 'relative' }}>
                <div onClick={() => handleQuickLogin(student.id, 'p@ssword')} style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  <div className="quick-login-icon student-icon">
                    <GraduationCap size={20} />
                  </div>
                  <div className="quick-login-info">
                    <span className={`role-badge ${student.overallAttendance >= 75 ? 'student-safe' : 'student'}`}>
                      Student ({student.overallAttendance >= 75 ? 'Safe' : 'Critical'})
                    </span>
                    <h4>{student.name}</h4>
                    <p>ID: {student.id} • PW: p@ssword</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeStudent(student.id); }}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}
                  title="Remove User"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {/* FACULTY */}
            {Object.values(dbState?.faculty || {}).map(faculty => (
              <div key={faculty.id} className="quick-login-item" style={{ position: 'relative' }}>
                <div onClick={() => handleQuickLogin(faculty.id, 'p@ssword')} style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  <div className="quick-login-icon faculty-icon">
                    <ClipboardCheck size={20} />
                  </div>
                  <div className="quick-login-info">
                    <span className="role-badge faculty">Faculty</span>
                    <h4>{faculty.name}</h4>
                    <p>ID: {faculty.id} • PW: p@ssword</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFaculty(faculty.id); }}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}
                  title="Remove User"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {/* ADMIN */}
            <div className="quick-login-item" onClick={() => handleQuickLogin('ADM-2024-001', 'p@ssword')}>
              <div className="quick-login-icon admin-icon">
                <Shield size={20} />
              </div>
              <div className="quick-login-info">
                <span className="role-badge admin">Administrator</span>
                <h4>Registrar Office</h4>
                <p>ID: ADM-2024-001 • PW: p@ssword</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
