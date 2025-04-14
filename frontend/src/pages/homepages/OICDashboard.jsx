// src/pages/OICDashboard.jsx
import React, { useEffect, useState } from 'react';
import Navbar from '../../components/NavBar'
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import CaseCard from '../../components/CaseCard';
import ComplaintCard from '../../components/ComplaintCard';
import {
  Folder,
  Description,
  Search,
  People,
  ArrowForward,
  Add,
  Visibility,
  Assignment,
  AssignmentInd,
  Edit,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../config/apiConfig';
import Spinner from '../../components/Spinner';
import FilledButton from '../../components/buttons/FilledButton';

const OICDashboard = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [expanded, setExpanded] = useState(true); //to toggle the sidebar and hide the text in navbar

  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await apiClient.get('/complaints/getAllComplaints');
        if (data.complaints) {
          setRecentComplaints(data.complaints);
        }
      }
      catch (error) {
        console.error('Error fetching complaints:', error);
      }
    }
    fetchData();
  }, []);

  const stats = [
    { icon: <Folder />, title: 'Active Cases', value: '24', color: 'blue' },
    { icon: <Description />, title: 'New Complaints', value: '12', color: 'red' },
    { icon: <Search />, title: 'Ongoing Investigations', value: '18', color: 'green' },
    { icon: <People />, title: 'Officers on Duty', value: '42', color: 'purple' }
  ];

  const recentCases = [
    {
      case_id: '8f7d6e5c-4b3a-2d1c-0e9f',
      topic: 'Robbery at Commercial Bank',
      case_type: 'Robbery',
      status: 'In Progress',
      started_dt: '2025-04-01T08:30:00',
      leader_name: 'Inspector R. Silva'
    },
    {
      case_id: '1a2b3c4d-5e6f-7g8h-9i0j',
      topic: 'Missing Person - Amal Fernando',
      case_type: 'Missing Person',
      status: 'Open',
      started_dt: '2025-04-03T14:00:00',
      leader_name: 'Sub Inspector D. Gunasekara'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        expanded={expanded}
        setExpanded={setExpanded}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          expanded={expanded}
        />

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800">OIC Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
                color={stat.color}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">Recent Cases</h2>
                <a href="#allCases" class="inline-flex items-center px-5 py-2.5 text-sm font-sans text-center text-blue-700 hover:text-blue-800  rounded-lg hover:cursor-pointer hover:text-shadow-amber-700">
                  View All
                  <svg class="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                  </svg>
                </a>
              </div>

              {recentCases.map((caseData, index) => (
                <CaseCard
                  key={index}
                  caseData={caseData}
                  actions={[
                    { icon: <Visibility fontSize='small' />, label: 'View', onClick: () => { } },
                    { icon: <Edit fontSize='small' />, label: 'Update', onClick: () => { } },
                    { icon: <AssignmentInd fontSize='small' />, label: 'Reassign', onClick: () => { } }
                  ]}
                />
              ))}

              <div className="mt-4 text-center">
                <FilledButton
                  text='Create New Case'
                  icon={<Add className='mr-2' />}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">Recent Complaints</h2>
                <a href="#allComplains" class="inline-flex items-center px-5 py-2.5 text-sm font-sans text-center text-blue-700 hover:text-blue-800  rounded-lg hover:cursor-pointer hover:text-shadow-amber-700">
                  View All
                  <svg class="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                  </svg>
                </a>
              </div>

              {recentComplaints.length === 0 ? (
                <Spinner />
              ) : (
                recentComplaints.map((complaint, index) => (
                  <ComplaintCard
                    key={index}
                    complaint={complaint}
                    actions={[
                      { icon: <Visibility fontSize='small' />, label: 'View', onClick: () => { } },
                      { icon: <Assignment fontSize='small' />, label: 'Assign', onClick: () => { } },
                      { icon: <Folder fontSize='small' />, label: 'Create Case', onClick: () => { } }
                    ]}
                  />
                )))}

              <div className="mt-4 text-center">
                <FilledButton
                  text='File New Complaint'
                  icon={<Add className='mr-2' />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OICDashboard;