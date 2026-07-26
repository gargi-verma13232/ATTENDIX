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
  Shield,
  Bell,
  Flame,
} from 'lucide-react';


const Sidebar = () => {
  const {
    currentUser,
    student,
    logout,
    activeSection,
    setActiveSection,
    isMobileNavOpen,
    setIsMobileNavOpen,
  } = useMockData();

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobile = () => setIsMobileNavOpen(false);

  const getRoleIcon = () => {
    if (!currentUser) return null;
    if (currentUser.role === 'student') return <GraduationCap size={16} />;
    if (currentUser.role === 'faculty') return <ClipboardCheck size={16} />;
    if (currentUser.role === 'admin') return <Shield size={16} />;
    return null;
  };

  // Admin section link style helper
  const adminLinkStyle = (section) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    color: activeSection === section ? 'var(--text-main)' : 'var(--text-muted)',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '14px',
    cursor: 'pointer',
    background: activeSection === section ? 'rgba(59,130,246,0.1)' : 'transparent',
    boxShadow: activeSection === section ? 'inset 0 0 0 1px rgba(59,130,246,0.2)' : 'none',
    transition: 'all 0.25s ease',
    border: 'none',
    fontFamily: 'inherit',
    width: '100%',
    textAlign: 'left',
    position: 'relative',
    overflow: 'hidden',
  });

  return (
    <aside className={`sidebar ${isMobileNavOpen ? 'mobile-open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <Activity size={32} color="#3B82F6" />
        Attendix
      </div>

      <nav className="sidebar-nav">
        {/* Portal Switcher for Demo / Testing */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px' }}>
          <NavLink
            to="/student"
            className={({ isActive }) => `btn ${isActive ? 'btn-primary' : ''}`}
            style={{ flex: 1, padding: '6px 10px', fontSize: '11px', textAlign: 'center', borderRadius: '8px', textDecoration: 'none' }}
            onClick={closeMobile}
          >
            Student
          </NavLink>
          <NavLink
            to="/faculty"
            className={({ isActive }) => `btn ${isActive ? 'btn-primary' : ''}`}
            style={{ flex: 1, padding: '6px 10px', fontSize: '11px', textAlign: 'center', borderRadius: '8px', textDecoration: 'none' }}
            onClick={closeMobile}
          >
            Faculty
          </NavLink>
        </div>

        {/* ── Student Nav ──────────────────────── */}
        {(!currentUser || currentUser?.role === 'student') && (
          <>
            <NavLink
              to="/student"
              end
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </NavLink>
            <NavLink
              to="/student/recovery"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <HeartPulse size={20} />
              Recovery Planner
            </NavLink>
            <NavLink
              to="/student/rectification"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <FileText size={20} />
              OD &amp; Rectification
            </NavLink>
            <NavLink
              to="/student/trends"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <TrendingUp size={20} />
              Subject Trends
            </NavLink>

            {/* Streak Counter Widget */}
            {student && (
              <div className="streak-sidebar-widget">
                <Flame size={18} color="var(--status-warning)" />
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Day Streak</p>
                  <p style={{ fontSize: '18px', fontWeight: '800', color: 'var(--status-warning)', margin: 0 }}>
                    🔥 {student.streak}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Faculty Nav ──────────────────────── */}
        {currentUser?.role === 'faculty' && (
          <>
            <NavLink
              to="/faculty"
              end
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              <LayoutDashboard size={20} />
              Faculty Dashboard
            </NavLink>
          </>
        )}

        {/* ── Admin Nav ────────────────────────── */}
        {currentUser?.role === 'admin' && (
          <>
            <button
              style={adminLinkStyle('dashboard')}
              onClick={() => { setActiveSection('dashboard'); navigate('/admin'); closeMobile(); }}
            >
              {activeSection === 'dashboard' && <span className="nav-active-bar" />}
              <LayoutDashboard size={20} />
              University Overview
            </button>
            <button
              style={adminLinkStyle('admin-hod')}
              onClick={() => { setActiveSection('admin-hod'); navigate('/admin'); closeMobile(); }}
            >
              {activeSection === 'admin-hod' && <span className="nav-active-bar" />}
              <Bell size={20} />
              HOD Alert System
            </button>
          </>
        )}
      </nav>

      {/* ── Profile & Settings ────────────────── */}
      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 4px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {getRoleIcon()}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.name}</h4>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, textTransform: 'capitalize' }}>
                {currentUser.role} · {currentUser.id}
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className="btn btn-secondary"
            style={{ flex: 1, padding: '8px 12px', display: 'flex', justifyContent: 'center', fontSize: '12px' }}
            title="Toggle Light/Dark Theme"
          >
            {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ flex: 1, padding: '8px 12px', display: 'flex', justifyContent: 'center', fontSize: '12px', color: 'var(--status-critical)', borderColor: 'rgba(239,68,68,0.2)' }}
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