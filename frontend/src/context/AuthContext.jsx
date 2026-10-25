import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('agritech_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        localStorage.removeItem('agritech_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success && data.data) {
      setUser(data.data);
      localStorage.setItem('agritech_user', JSON.stringify(data.data));
    }
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    if (data.success && data.data) {
      setUser(data.data);
      localStorage.setItem('agritech_user', JSON.stringify(data.data));
    }
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('agritech_user');
  };

  const updateUserProfile = async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    if (data.success && data.data) {
      setUser(data.data);
      localStorage.setItem('agritech_user', JSON.stringify(data.data));
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
        isAuthenticated: !!user,
        isFarmer: user?.role === 'farmer',
        isExpert: user?.role === 'expert',
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
