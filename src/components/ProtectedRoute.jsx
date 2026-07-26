import { Navigate } from 'react-router-dom';
import { useMockData } from '../MockDataContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useMockData();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary, #0f172a)', color: '#fff' }}>
        <div style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #3b82f6', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login if not logged in
    return <Navigate to="/login" replace />;
  }

  const role = currentUser?.role;

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    // User is logged in but does not have the required role.
    // Redirect them to their own dashboard safely.
    if (role === 'faculty') {
      return <Navigate to="/faculty" replace />;
    } else if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/student" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
