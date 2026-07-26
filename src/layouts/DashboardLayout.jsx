import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useMockData } from '../MockDataContext';
import { Menu, Sun, Moon, GraduationCap, ClipboardCheck, Shield } from 'lucide-react';

const DashboardLayout = () => {
  const { currentUser, login, isMobileNavOpen, setIsMobileNavOpen, setActiveSection } = useMockData();
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

  const handleRoleSwitch = (role) => {
    if (role === 'student') {
      login('STU-2024-001', 'p@ssword');
      setActiveSection('dashboard');
      navigate('/student');
    } else if (role === 'faculty') {
      login('FAC-2024-001', 'p@ssword');
      setActiveSection('dashboard');
      navigate('/faculty');
    } else if (role === 'admin') {
      login('ADM-2024-001', 'p@ssword');
      setActiveSection('dashboard');
      navigate('/admin');
    }
  };

  const getPageTitle = () => {
    const role = currentUser?.role;
    if (role === 'student') return 'Student Dashboard';
    if (role === 'faculty') return 'Faculty Portal';
    if (role === 'admin') return 'Institutional Admin Portal';
    return 'Attendix';
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="top-navbar">
        <button
          className="hamburger-btn"
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          aria-label="Toggle navigation drawer"
        >
          <Menu size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="top-navbar-title">{getPageTitle()}</span>
          {currentUser && (
            <span className="status-badge safe" style={{ fontSize: '11px', textTransform: 'capitalize', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              {currentUser.role === 'student' && <GraduationCap size={13} />}
              {currentUser.role === 'faculty' && <ClipboardCheck size={13} />}
              {currentUser.role === 'admin' && <Shield size={13} />}
              {currentUser.role}
            </span>
          )}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentUser && (
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
              {currentUser.name}
            </span>
          )}
          {/* Theme Toggle */}
          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className="top-theme-toggle"
            title="Toggle Light/Dark Theme"
          >
            {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {isMobileNavOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
