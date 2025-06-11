import React, { useState } from 'react';
import {
  Dashboard,
  Notifications,
  SwapHoriz,
  ArrowDropDown,
  Person,
  Settings,
  Logout,
  Menu
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationButton from './buttons/NotificationButton';
import ConfirmationPopup from './common/ConfirmationPopup';

const Navbar = ({ expanded }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutConfirm(false);
      setShowProfileMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to login
      navigate('/');
    }
  };

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setShowProfileMenu(false);
    setShowLogoutConfirm(true);
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    setShowProfileMenu(false);
    navigate('/profile');
  };

  return (
    <>
      <nav className="bg-blue-900 text-white shadow-lg">
        <div className="px-4">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4 ">
              {!expanded && (
                <div className="font-bold text-xl">LawSphere LK</div>
              )}
              {/* TODO: Create notification backend */}
              {/* <NotificationButton count={55} notifications={[]} sideBarExpanded={expanded} /> */}
            </div>

            <div className="flex items-center space-x-4 hover:cursor-pointer ">
              {/* Role Switcher */}
              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center bg-blue-100 rounded-full p-2 transition-colors duration-200 hover:cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center">
                    <Person fontSize="small" />
                  </div>
                  <span className="ml-2 hidden md:inline text-black">{user?.name || 'User'}</span>
                  <ArrowDropDown fontSize="small" className="ml-1 text-black" />
                </button>

                {/* profile menu dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/60 backdrop-blur-md rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center"
                    >
                      <Person fontSize="small" className="mr-2" />
                      Profile
                    </button>
                    {/* <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center"
                    >
                      <Settings fontSize="small" className="mr-2" />
                      Settings
                    </button> */}
                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center"
                    >
                      <Logout fontSize="small" className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button className="px-2">
                  <Menu />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Popup */}
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
    </>
  );
};

export default Navbar;