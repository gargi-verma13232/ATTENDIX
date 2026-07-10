import { Navigate } from 'react-router-dom';
import { useMockData } from '../MockDataContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useMockData();

  if (!currentUser) {
    // Redirect to login if not logged in
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // User is logged in but does not have the required role.
    // Redirect them to their own dashboard.
    if (currentUser.role === 'faculty') {
      return <Navigate to="/faculty" replace />;
    } else if (currentUser.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/student" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
