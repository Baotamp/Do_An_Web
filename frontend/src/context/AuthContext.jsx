import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../config/api';

const AuthContext = createContext();
const AUTH_CURRENT_USER_KEY = 'phonehub_current_user';
const AUTH_TOKEN_KEY = 'phonehub_auth_token';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const storedUser = window.localStorage.getItem(AUTH_CURRENT_USER_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [authToken, setAuthToken] = useState(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    return window.localStorage.getItem(AUTH_TOKEN_KEY) || '';
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (currentUser) {
      window.localStorage.setItem(AUTH_CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      window.localStorage.removeItem(AUTH_CURRENT_USER_KEY);
    }
  }, [currentUser]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (authToken) {
      window.localStorage.setItem(AUTH_TOKEN_KEY, authToken);
    } else {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }, [authToken]);

  const registerUser = async ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: normalizedEmail,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Không thể đăng ký tài khoản.',
        };
      }

      setCurrentUser(data.user);
      setAuthToken('');
      return { success: true };
    } catch {
      return {
        success: false,
        message: 'Không kết nối được server. Vui lòng thử lại.',
      };
    }
  };

  const loginUser = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Sai email hoặc mật khẩu.',
        };
      }

      setCurrentUser(data.user);
      setAuthToken(data.token || '');
      return { success: true };
    } catch {
      return {
        success: false,
        message: 'Không kết nối được server. Vui lòng thử lại.',
      };
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setAuthToken('');
  };

  const value = useMemo(() => ({
    currentUser,
    authToken,
    isAuthenticated: Boolean(currentUser),
    loginUser,
    registerUser,
    logoutUser,
  }), [authToken, currentUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
