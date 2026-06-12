import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, HeartPulse, FileText, Activity } from 'lucide-react';

const Sidebar = () => {
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
    </aside>
  );
};

export default Sidebar;