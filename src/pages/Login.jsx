import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMockData } from '../MockDataContext';
import { Activity, Lock, User, Shield, GraduationCap, ClipboardCheck } from 'lucide-react';

const Login = () => {
  const { login, currentUser } = useMockData();
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
      // Determine redirection based on credentials
      if (userId.startsWith('STU')) {
        navigate('/student');
      } else if (userId.startsWith('FAC')) {
        navigate('/faculty');
      } else if (userId.startsWith('ADM')) {
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
        <div className="glass-panel quick-login-panel">
          <h3>Quick Login Switcher</h3>
          <p style={{ fontSize: '13px', marginBottom: '16px' }}>Select an identity to login automatically:</p>
          
          <div className="quick-login-list">
            
            <div 
              className="quick-login-item" 
              onClick={() => handleQuickLogin('STU-2024-001', 'p@ssword')}
            >
              <div className="quick-login-icon student-icon">
                <GraduationCap size={20} />
              </div>
              <div className="quick-login-info">
                <span className="role-badge student">Student (Critical)</span>
                <h4>Alex Johnson</h4>
                <p>ID: STU-2024-001 • PW: p@ssword</p>
              </div>
            </div>

            <div 
              className="quick-login-item" 
              onClick={() => handleQuickLogin('STU-2024-002', 'p@ssword')}
            >
              <div className="quick-login-icon student-icon">
                <GraduationCap size={20} />
              </div>
              <div className="quick-login-info">
                <span className="role-badge student-safe">Student (Safe)</span>
                <h4>Ananya Sharma</h4>
                <p>ID: STU-2024-002 • PW: p@ssword</p>
              </div>
            </div>

            <div 
              className="quick-login-item" 
              onClick={() => handleQuickLogin('FAC-2024-001', 'p@ssword')}
            >
              <div className="quick-login-icon faculty-icon">
                <ClipboardCheck size={20} />
              </div>
              <div className="quick-login-info">
                <span className="role-badge faculty">Faculty</span>
                <h4>Dr. R. Mehta</h4>
                <p>ID: FAC-2024-001 • PW: p@ssword</p>
              </div>
            </div>

            <div 
              className="quick-login-item" 
              onClick={() => handleQuickLogin('ADM-2024-001', 'p@ssword')}
            >
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
