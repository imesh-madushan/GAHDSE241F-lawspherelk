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

const Navbar = () => {
  const { user } = useAuth();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-4">
            <div className="font-bold text-xl">LawSphere LK</div>
            <div className="hidden md:flex space-x-1">
              <button className="px-3 py-2 rounded hover:bg-blue-800 flex items-center">
                <Dashboard fontSize="small" className="mr-1" />
                Dashboard
              </button>
              <button className="px-3 py-2 rounded hover:bg-blue-800 flex items-center">
                <Notifications fontSize="small" className="mr-1" />
                Notifications
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Role Switcher */}
            {/* Profile Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center"
              >
                <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center">
                  <Person fontSize="small" />
                </div>
                <span className="ml-2 hidden md:inline">{user.name}</span>
                <ArrowDropDown fontSize="small" className="ml-1" />
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <a href="#profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center">
                    <Person fontSize="small" className="mr-2" />
                    Profile
                  </a>
                  <a href="#settings" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center">
                    <Settings fontSize="small" className="mr-2" />
                    Settings
                  </a>
                  <a href="#logout" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center">
                    <Logout fontSize="small" className="mr-2" />
                    Logout
                  </a>
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
  );
};

export default Navbar;