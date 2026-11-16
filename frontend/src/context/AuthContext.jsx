import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('civicfix_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('civicfix_token');
      if (storedToken) {
        try {
          const profile = await authService.getCurrentUser();
          setUser(profile);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    localStorage.setItem('civicfix_token', res.access_token);
    localStorage.setItem('civicfix_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    localStorage.setItem('civicfix_token', res.access_token);
    localStorage.setItem('civicfix_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('civicfix_token');
    localStorage.removeItem('civicfix_user');
    setToken(null);
    setUser(null);
  };

  // Quick 1-click test login for examiners and testers
  const loginAsDemo = async (role) => {
    const credentials = {
      citizen: { email: 'citizen@civicfix.org', pass: 'Password123!' },
      staff: { email: 'staff@civicfix.org', pass: 'Password123!' },
      admin: { email: 'admin@civicfix.org', pass: 'Password123!' },
    };
    const cred = credentials[role.toLowerCase()] || credentials.citizen;
    return await login(cred.email, cred.pass);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff' || isAdmin;
  const isCitizen = user?.role === 'citizen';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isStaff,
        isCitizen,
        login,
        register,
        logout,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
