import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('student_job_token'));
  const [loading, setLoading] = useState(true);
  const [pendingOtpEmail, setPendingOtpEmail] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authService.getCurrentUser();
        if (res.success) {
          setUser(res.data);
          setRole(res.role);
        } else {
          logout();
        }
      } catch (err) {
        // Token expired or invalid: reset session cleanly
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const setAuthSession = (authToken, userData, userRole) => {
    localStorage.setItem('student_job_token', authToken);
    setToken(authToken);
    setUser(userData);
    setRole(userRole);
    setPendingOtpEmail(null);
  };

  const logout = () => {
    localStorage.removeItem('student_job_token');
    setToken(null);
    setUser(null);
    setRole(null);
    setPendingOtpEmail(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      token,
      loading,
      pendingOtpEmail,
      setPendingOtpEmail,
      setAuthSession,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
