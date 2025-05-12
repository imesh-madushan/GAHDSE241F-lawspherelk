import React from 'react';
import {
  Dashboard,
  Folder,
  Description,
  Search,
  Inventory2,
  Fingerprint,
  Summarize,
  People,
  BarChart,
  Settings,
  Science,
  ChevronLeft,
  ChevronRight,
  Copyright
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ activeItem, setActiveItem, expanded, setExpanded }) => {
  const { user } = useAuth();

  // Define menu items with proper icon components
  const menuItems = {
    'OIC': [
      { id: 'dashboard', label: 'Dashboard', icon: <Dashboard /> },
      { id: 'cases', label: 'Cases', icon: <Folder /> },
      { id: 'complaints', label: 'Complaints', icon: <Description /> },
      { id: 'investigations', label: 'Investigations', icon: <Search /> },
      { id: 'evidence', label: 'Evidence', icon: <Inventory2 /> },
      { id: 'criminals', label: 'Criminal Records', icon: <Fingerprint /> },
      { id: 'reports', label: 'Reports', icon: <Summarize /> },
      { id: 'officers', label: 'Officer Management', icon: <People /> },
      { id: 'analytics', label: 'Analytics', icon: <BarChart /> },
      { id: 'settings', label: 'Settings', icon: <Settings /> }
    ],
    'Crime OIC': [
      { id: 'dashboard', label: 'Dashboard', icon: <Dashboard /> },
      { id: 'cases', label: 'Cases', icon: <Folder /> },
      { id: 'complaints', label: 'Complaints', icon: <Description /> },
      { id: 'criminals', label: 'Criminal Records', icon: <Fingerprint /> },
      { id: 'officers', label: 'Officers', icon: <People /> },
      { id: 'reports', label: 'Reports', icon: <Summarize /> },
      { id: 'analytics', label: 'Analytics', icon: <BarChart /> },
      { id: 'settings', label: 'Settings', icon: <Settings /> }
    ],
    'Sub Inspector': [
      { id: 'dashboard', label: 'Dashboard', icon: <Dashboard /> },
      { id: 'cases', label: 'Assigned Cases', icon: <Folder /> },
      { id: 'investigations', label: 'Investigations', icon: <Search /> },
      { id: 'evidence', label: 'Evidence', icon: <Inventory2 /> },
      { id: 'reports', label: 'Reports', icon: <Summarize /> },
      { id: 'settings', label: 'Settings', icon: <Settings /> }
    ],
    'Sergeant': [
      { id: 'dashboard', label: 'Dashboard', icon: <Dashboard /> },
      { id: 'cases', label: 'Assigned Cases', icon: <Folder /> },
      { id: 'investigations', label: 'Investigations', icon: <Search /> },
      { id: 'evidence', label: 'Evidence', icon: <Inventory2 /> },
      { id: 'reports', label: 'Reports', icon: <Summarize /> },
      { id: 'settings', label: 'Settings', icon: <Settings /> }
    ],
    'Police Constable': [
      { id: 'dashboard', label: 'Dashboard', icon: <Dashboard /> },
      { id: 'cases', label: 'Assigned Cases', icon: <Folder /> },
      { id: 'investigations', label: 'Investigations', icon: <Search /> },
      { id: 'evidence', label: 'Evidence Collection', icon: <Inventory2 /> },
      { id: 'complaints', label: 'File Complaint', icon: <Description /> },
      { id: 'settings', label: 'Settings', icon: <Settings /> }
    ],
    'Forensic Leader': [
      { id: 'dashboard', label: 'Dashboard', icon: <Dashboard /> },
      { id: 'forensic-requests', label: 'Analysis Requests', icon: <Science /> },
      { id: 'reports', label: 'Forensic Reports', icon: <Summarize /> },
      { id: 'evidence', label: 'Evidence', icon: <Inventory2 /> },
      { id: 'team', label: 'Forensic Team', icon: <People /> },
      { id: 'analytics', label: 'Analytics', icon: <BarChart /> },
      { id: 'settings', label: 'Settings', icon: <Settings /> }
    ]
  };

  const currentMenuItems = menuItems[user.role] || menuItems['Police Constable'];

  return (
    <div className={`h-screen bg-gray-900 text-white transition-all duration-300 ${expanded ? 'w-58' : 'w-20'} flex flex-col`}>
      <div className="p-5 flex justify-between items-center border-b border-gray-700">
        {expanded && <span className="font-bold text-lg">LawSphere LK</span>}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded-full flex hover:bg-gray-700 transition-colors"
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {expanded ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>

      <nav className="mt-4 flex-grow">
        {currentMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveItem(item.id);
              window.location.href = `/${item.id}`;
            }}
            className={`flex relative items-center py-3.5 transition-colors hover:cursor-pointer 
              ${activeItem === item.id
                ? 'my-8 bg-blue-800 text-white border-l-4 border-blue-500'
                : 'text-gray-300 hover:bg-gray-700'
              }
              ${expanded
                ? 'mx-2 px-6 w-full rounded-sm rounded-br-xl rounded-tr-xl'
                : 'w-16 mx-auto rounded-xl '
              }`}
          >
            <span className={`flex items-center justify-center ${expanded ? 'mr-3' : 'mx-auto'}`}>
              {React.cloneElement(item.icon, {
                fontSize: `${activeItem === item.id
                  ? 'medium'
                  : 'small'
                  }`
              })}
            </span>
            {expanded && <span className="text-sm">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer Section */}
      <div className={`mt-auto border-t border-gray-700 p-3 ${!expanded && 'text-center'}`}>
        {expanded ? (
          <>
            <div className="flex items-center text-gray-400 text-sm mb-2">
              <Copyright className="mr-1" fontSize="small" />
              <span>2025 LawSphere LK</span>
            </div>
            <p className="text-xs ml-2 text-gray-500">Sri Lanka Police Department</p>
          </>
        ) : (
          <Copyright className="text-gray-400 mx-auto" />
        )}
      </div>
    </div>
  );
};

export default Sidebar;