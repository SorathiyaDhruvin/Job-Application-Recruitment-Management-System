import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('recruit_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('recruit_token');
      const savedUser = localStorage.getItem('recruit_user');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
          // Refresh user data from server in background
          const res = await api.get('/auth/me');
          if (res.data?.data) {
            const updatedUser = {
              ...JSON.parse(savedUser),
              ...res.data.data
            };
            setUser(updatedUser);
            localStorage.setItem('recruit_user', JSON.stringify(updatedUser));
          }
        } catch (err) {
          console.error('Failed to sync current user:', err);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const authData = res.data.data;
    
    setToken(authData.token);
    setUser(authData);

    localStorage.setItem('recruit_token', authData.token);
    localStorage.setItem('recruit_user', JSON.stringify(authData));

    return authData;
  };

  const register = async (registerData) => {
    const res = await api.post('/auth/register', registerData);
    const authData = res.data.data;

    setToken(authData.token);
    setUser(authData);

    localStorage.setItem('recruit_token', authData.token);
    localStorage.setItem('recruit_user', JSON.stringify(authData));

    return authData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('recruit_token');
    localStorage.removeItem('recruit_user');
  };

  const updateUserProfile = (partialUser) => {
    setUser((prev) => {
      const updated = { ...prev, ...partialUser };
      localStorage.setItem('recruit_user', JSON.stringify(updated));
      return updated;
    });
  };

  const isCandidate = user?.role === 'CANDIDATE';
  const isRecruiter = user?.role === 'RECRUITER';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
        isAuthenticated: !!token && !!user,
        isCandidate,
        isRecruiter,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
