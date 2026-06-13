import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, HeartPulse, FileText, Activity, Sun, Moon } from 'lucide-react';

const Sidebar = () => {
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

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Activity size={32} color="#3B82F6" />
        Attendix
      </div>
      <nav className="sidebar-nav">
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
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--panel-border)' }}>
        <button 
          onClick={toggleTheme}
          className="btn btn-secondary" 
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          {isLightMode ? (
            <><Moon size={18} /> Dark Mode</>
          ) : (
            <><Sun size={18} /> Light Mode</>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;