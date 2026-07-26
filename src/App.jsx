import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MockDataProvider, useMockData } from './MockDataContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import RecoveryPlanner from './pages/RecoveryPlanner';
import RectificationWorkflow from './pages/RectificationWorkflow';
import SubjectTrends from './pages/SubjectTrends';
import AdminDashboard from './pages/AdminDashboard';

// Components
import FacultyDashboard from './components/FacultyDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

import './index.css';

// A root redirect handler based on authentication status and role with optional chaining & loading safety
const RootRedirect = () => {
  const { currentUser, loading } = useMockData();

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary, #0f172a)', color: '#ffffff' }}>
        <div style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #3b82f6', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', fontSize: '14px', color: '#94a3b8' }}>Loading Attendix Workspace...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const role = currentUser?.role;

  if (role === 'faculty') {
    return <Navigate to="/faculty" replace />;
  }

  if (role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (role === 'student') {
    return <Navigate to="/student" replace />;
  }

  return <Navigate to="/login" replace />;
};

function AppContent() {
  return (
    <Routes>
      {/* Root redirect logic */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Student Routes */}
      <Route 
        path="/student" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <ErrorBoundary title="Student Dashboard Error">
              <DashboardLayout />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="recovery" element={<RecoveryPlanner />} />
        <Route path="rectification" element={<RectificationWorkflow />} />
        <Route path="trends" element={<SubjectTrends />} />
      </Route>

      {/* Protected Faculty Routes */}
      <Route 
        path="/faculty" 
        element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <ErrorBoundary title="Faculty Dashboard Error">
              <DashboardLayout />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      >
        <Route index element={<FacultyDashboard />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ErrorBoundary title="Admin Workspace Error">
              <DashboardLayout />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="data" element={<AdminDashboard />} />
      </Route>

      {/* Catch-All 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <MockDataProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </MockDataProvider>
  );
}

export default App;