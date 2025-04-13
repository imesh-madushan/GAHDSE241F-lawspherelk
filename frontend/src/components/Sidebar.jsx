import React, { useState } from 'react';
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
  ChevronRight
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({activeItem, setActiveItem }) => {
  const { user } = useAuth(); 

  const [expanded, setExpanded] = useState(true);

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
      { id: 'analytics', label: 'Analytics', icon: <BarChart /> }
    ],
    'Sub Inspector': [
      { id: 'dashboard', label: 'Dashboard', icon: <Dashboard /> },
      { id: 'cases', label: 'Assigned Cases', icon: <Folder /> },
      { id: 'investigations', label: 'Investigations', icon: <Search /> },
      { id: 'evidence', label: 'Evidence', icon: <Inventory2 /> },
      { id: 'reports', label: 'Reports', icon: <Summarize /> }
    ],
    'Sergeant': [
      { id: 'dashboard', label: 'Dashboard', icon: <Dashboard /> },
      { id: 'cases', label: 'Assigned Cases', icon: <Folder /> },
      { id: 'investigations', label: 'Investigations', icon: <Search /> },
      { id: 'evidence', label: 'Evidence', icon: <Inventory2 /> },
      { id: 'reports', label: 'Reports', icon: <Summarize /> }
    ],
    'Police Constable': [
      { id: 'dashboard', label: 'Dashboard', icon: <Dashboard /> },
      { id: 'cases', label: 'Assigned Cases', icon: <Folder /> },
      { id: 'investigations', label: 'Investigations', icon: <Search /> },
      { id: 'evidence', label: 'Evidence Collection', icon: <Inventory2 /> },
      { id: 'complaints', label: 'File Complaint', icon: <Description /> }
    ],
    'Forensic Leader': [
      { id: 'dashboard', label: 'Dashboard', icon: <Dashboard /> },
      { id: 'forensic-requests', label: 'Analysis Requests', icon: <Science /> },
      { id: 'reports', label: 'Forensic Reports', icon: <Summarize /> },
      { id: 'evidence', label: 'Evidence', icon: <Inventory2 /> },
      { id: 'team', label: 'Forensic Team', icon: <People /> },
      { id: 'analytics', label: 'Analytics', icon: <BarChart /> }
    ]
  };

  const currentMenuItems = menuItems[user.role] || menuItems['Police Constable'];

  return (
    <div className={`h-screen bg-gray-900 text-white transition-all duration-300 ${expanded ? 'w-64' : 'w-20'}`}>
      <div className="p-4 flex justify-between items-center border-b border-gray-700">
        {expanded && <span className="font-bold text-lg">LawSphere LK</span>}
        <button 
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded-full hover:bg-gray-700 transition-colors"
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {expanded ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>
      
      <nav className="mt-4">
        {currentMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveItem(item.id)}
            className={`flex items-center w-full px-4 py-3 mx-2 mb-1 rounded-lg transition-colors ${
              activeItem === item.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className={`flex items-center justify-center ${expanded ? 'mr-3' : 'mx-auto'}`}>
              {React.cloneElement(item.icon, { fontSize: 'small' })}
            </span>
            {expanded && <span className="text-sm">{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;