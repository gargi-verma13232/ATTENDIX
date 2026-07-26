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

import './index.css';

// A simple root redirect handler based on authentication status and role
const RootRedirect = () => {
  const { currentUser } = useMockData();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role === 'faculty') {
    return <Navigate to="/faculty" replace />;
  }

  if (currentUser.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/student" replace />;
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
            <DashboardLayout />
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
            <DashboardLayout />
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
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="data" element={<AdminDashboard />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<RootRedirect />} />
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