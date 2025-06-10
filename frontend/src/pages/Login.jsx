import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Security, Person, Lock, Visibility, VisibilityOff, Error, CheckCircle, Logout } from '@mui/icons-material';
import { apiClient } from '../config/apiConfig';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationPopup from '../components/common/ConfirmationPopup';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();
  const { login, logout, user } = useAuth();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await apiClient.get('/auth/checkAuth');
        if (response.data.user) {
          setIsLoggedIn(true);
          setCurrentUser(response.data.user);
        }
      } catch (error) {
        // User not logged in, continue with login page
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', {
        username: formData.username.trim(),
        password: formData.password
      });

      if (response.data.user) {
        // Update auth context
        await login(response.data.user);
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);

      // Handle different error types
      if (error.response?.status === 403) {
        // Account locked
        setError(
          error.response.data.message ||
          'Your account has been locked. Please contact the administrator to unlock your account.'
        );
      } else if (error.response?.status === 401) {
        // Invalid credentials
        setError(
          error.response.data.message ||
          'Invalid username or password. Please check your credentials and try again.'
        );
      } else {
        // General error
        setError(
          error.response?.data?.message ||
          'Login failed. Please check your credentials and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setShowLogoutConfirm(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // If user is already logged in, show already logged in message
  if (isLoggedIn && currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            {/* Header */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Already Logged In
            </h2>

            <p className="text-gray-600 mb-6">
              You are currently logged in as <span className="font-semibold text-blue-600">{currentUser.name}</span>
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
              >
                <Security className="w-5 h-5 mr-2" />
                Go to Dashboard
              </button>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
              >
                <Logout className="w-5 h-5 mr-2" />
                Logout & Login as Different User
              </button>
            </div>
          </div>
        </div>

        <ConfirmationPopup
          open={showLogoutConfirm}
          title="Logout Confirmation"
          message="Are you sure you want to logout? You will need to login again to access the system."
          confirmLabel="Logout"
          cancelLabel="Cancel"
          variant="warning"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <Security className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LawSphere LK</h1>
          <p className="text-gray-600">Sri Lanka Police Department</p>
          <h2 className="text-xl font-semibold text-gray-800 mt-4">Sign in to your account</h2>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <Error className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-red-700 text-sm">{error}</div>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Person className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-400"
                  placeholder="Enter your username"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-400"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <VisibilityOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Visibility className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              © 2025 LawSphere LK - Sri Lanka Police Department
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Credentials:</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <div>Username: <span className="font-mono">user1</span> | Password: <span className="font-mono">password</span></div>
            <div>Username: <span className="font-mono">user2</span> | Password: <span className="font-mono">password</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;