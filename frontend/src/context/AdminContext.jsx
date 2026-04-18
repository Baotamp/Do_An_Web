import { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';

const AdminContext = createContext();

const isAdminRole = (role) => String(role || '').trim().toLowerCase() === 'admin' || String(role || '').trim() === 'Quản trị';

export const AdminProvider = ({ children }) => {
  const { currentUser, logoutUser } = useAuth();

  const adminUser = isAdminRole(currentUser?.role) ? currentUser : null;

  const value = useMemo(() => ({
    adminUser,
    isAdmin: Boolean(adminUser),
    loginAsAdmin: () => ({
      success: false,
      message: 'Đăng nhập admin được gộp chung với đăng nhập tài khoản thường.',
    }),
    logoutAdmin: logoutUser,
  }), [adminUser, logoutUser]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
