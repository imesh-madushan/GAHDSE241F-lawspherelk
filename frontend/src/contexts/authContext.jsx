// authContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../config/apiConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await apiClient.get('/auth/checkAuth');
      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      // User not authenticated
      setUser(null);

      // // Auto login for development - remove this in production
      // try {
      //   const loginResponse = await apiClient.post('/auth/login', {
      //     username: 'user1',
      //     password: 'abcd1234'
      //   });

      //   if (loginResponse.data.user) {
      //     setUser(loginResponse.data.user);
      //   }
      // } catch (loginError) {
      //   console.error('Auto login failed:', loginError);
      // }
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};