import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useMockData } from '../MockDataContext';
import { 
  LayoutDashboard, 
  TrendingUp, 
  HeartPulse, 
  FileText, 
  Activity, 
  Sun, 
  Moon, 
  LogOut, 
  GraduationCap, 
  ClipboardCheck, 
  Shield 
} from 'lucide-react';

const Sidebar = () => {
  const { currentUser, logout } = useMockData();
  const navigate = useNavigate();
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user avatar icon based on role
  const getRoleIcon = () => {
    if (!currentUser) return null;
    if (currentUser.role === 'student') return <GraduationCap size={16} className="text-blue-500" />;
    if (currentUser.role === 'faculty') return <ClipboardCheck size={16} className="text-purple-500" />;
    if (currentUser.role === 'admin') return <Shield size={16} className="text-emerald-500" />;
    return null;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Activity size={32} color="#3B82F6" />
        Attendix
      </div>
      
      <nav className="sidebar-nav">
        {currentUser?.role === 'student' && (
          <>
            <NavLink to="/student" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              Dashboard
            </NavLink>
            <NavLink to="/student/recovery" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <HeartPulse size={20} />
              Recovery Planner
            </NavLink>
            <NavLink to="/student/rectification" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FileText size={20} />
              OD & Rectification
            </NavLink>
            <NavLink to="/student/trends" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <TrendingUp size={20} />
              Subject Trends
            </NavLink>
          </>
        )}

        {currentUser?.role === 'faculty' && (
          <>
            <NavLink to="/faculty" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              Faculty Dashboard
            </NavLink>
          </>
        )}

        {currentUser?.role === 'admin' && (
          <>
            <NavLink to="/admin" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              Admin Dashboard
            </NavLink>
          </>
        )}
      </nav>

      {/* Profile & Settings section */}
      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 4px' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '8px', 
              background: 'rgba(255, 255, 255, 0.05)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              {getRoleIcon()}
            </div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.name}</h4>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, textTransform: 'capitalize' }}>
                {currentUser.role} • {currentUser.id}
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={toggleTheme}
            className="btn btn-secondary" 
            style={{ flex: 1, padding: '8px 12px', display: 'flex', justifyContent: 'center', fontSize: '12px' }}
            title="Toggle Light/Dark Theme"
          >
            {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          
          <button 
            onClick={handleLogout}
            className="btn btn-secondary" 
            style={{ flex: 1, padding: '8px 12px', display: 'flex', justifyContent: 'center', fontSize: '12px', color: 'var(--status-critical)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;