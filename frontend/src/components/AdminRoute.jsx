import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const isAdminRole = (role) => String(role || '').trim().toLowerCase() === 'admin' || String(role || '').trim() === 'Quản trị';

const AdminRoute = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (!isAdminRole(currentUser?.role)) {
    return <Navigate to="/products" replace />;
  }

  return children;
};

export default AdminRoute;
