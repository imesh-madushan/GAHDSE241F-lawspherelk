import React, { useState } from 'react';
import {
  Dashboard,
  Notifications,
  SwapHoriz,
  ArrowDropDown,
  Person,
  Settings,
  Logout,
  Menu,
  AccountBalanceTwoTone
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationButton from './buttons/NotificationButton';
import ConfirmationPopup from './common/ConfirmationPopup';
import sriLankaGovLogo from '../assets/Sri Lanka Government.png';

const Navbar = ({ expanded }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  console.log('Navbar user:', user);

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
  }; const handleProfileClick = (e) => {
    e.preventDefault();
    setShowProfileMenu(false);
    navigate('/profile');
  };

  const handleSettingsClick = (e) => {
    e.preventDefault();
    setShowProfileMenu(false);
    navigate('/settings');
  };
  const getDashboardTitle = () => {
    if (!user?.role) return 'LawSphere LK';
    return `Criminal Record Management System`;
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-gray-950 via-slate-900 to-gray-950 text-white shadow-xl ">
        <div className="flex justify-between items-center">
          <div className='flex  items-center space-x-4 '>
            <div className="relative bg-white rounded-tr-2xl">
              <img
                src={sriLankaGovLogo}
                alt="Sri Lanka Government Logo"
                className="w-20 h-20 object-contain"
              />
            </div>
            

            <div className="flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div>
                <div className="font-bold text-white text-xl tracking-wide">{getDashboardTitle()}</div>
                <div className="text-xs text-yellow-300 font-medium tracking-wider">SRI LANKA POLICE - Galle</div>
              </div>
            </div>
          </div>


          <div className="flex items-center space-x-4">
            {/* TODO: Create notification backend */}
            {/* <NotificationButton count={24} notifications={[]} sideBarExpanded={expanded} /> */}

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center text-white font-medium rounded-lg transition-colors duration-200 border-0 cursor-pointer "
              >
                <div className="h-12 w-12 rounded-full flex items-center justify-center mr-3 border-0">
                  <img
                    src={user?.profile_pic || <Person fontSize="small" className="text-white" />}
                    alt="Profile"
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-md text-yellow-300">{user?.role || 'Unknown role'}</span>
                  <span className="text-sm font-medium">{user?.name || 'Unknown name'}</span>
                </div>
                <ArrowDropDown fontSize="small" className="ml-2" />
              </button>

              {/* profile menu dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-5 py-4 text-gray-700 hover:bg-gray-50 flex items-center transition-colors font-medium cursor-pointer text-base"
                  >
                    <Person fontSize="small" className="mr-3 text-gray-600" />
                    My Profile
                  </button>
                  {/* <button
                    onClick={handleSettingsClick}
                    className="w-full text-left px-5 py-4 text-gray-700 hover:bg-gray-50 flex items-center transition-colors font-medium cursor-pointer text-base"
                  >
                    <Settings fontSize="small" className="mr-3 text-gray-600" />
                    Settings
                  </button> */}
                  <div className="border-t border-gray-200 mt-1">
                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center transition-colors font-medium cursor-pointer"
                    >
                      <Logout fontSize="small" className="mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 p-2 rounded-lg transition-colors shadow-lg cursor-pointer">
                <Menu />
              </button>
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