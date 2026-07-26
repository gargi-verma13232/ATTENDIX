import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useMockData } from '../MockDataContext';
import { Menu } from 'lucide-react';

const DashboardLayout = () => {
  const { isMobileNavOpen, setIsMobileNavOpen } = useMockData();

  return (
    <div className="app-container">
      {/* Mobile Top Navbar Header */}
      <header className="top-navbar">
        <button 
          className="hamburger-btn" 
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          aria-label="Toggle navigation drawer"
        >
          <Menu size={24} />
        </button>
        <span className="top-navbar-title">Attendix</span>
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
