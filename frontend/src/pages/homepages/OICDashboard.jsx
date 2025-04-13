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

const OICDashboard = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [recentComplaints, setRecentComplaints] = useState([]);
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

  // const recentComplaints = [
  //   {
  //     complain_id: '1a2b3c4d-5e6f-7g8h-9i0j',
  //     description: 'Stolen motorcycle from residence at 23 Galle Road. Black Honda CB150, license KU-2343.',
  //     complain_dt: '2025-04-05T09:15:00',
  //     status: 'New',
  //     complainer_name: 'Ashan Perera'
  //   },
  //   {
  //     complain_id: '5a6b7c8d-9e0f-1g2h-3i4j',
  //     description: 'Threat of violence by local gang members near Colombo Central College.',
  //     complain_dt: '2025-04-04T16:30:00',
  //     status: 'Under Review',
  //     complainer_name: 'Principal - Colombo Central College',
  //     officer_name: 'Sergeant Kumara'
  //   }
  // ];


  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        activeItem={activeItem}
        setActiveItem={setActiveItem}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

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
                <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                  View All <ArrowForward className='w-0.5' />
                </button>
              </div>

              {recentCases.map((caseData, index) => (
                <CaseCard
                  key={index}
                  caseData={caseData}
                  actions={[
                    { icon: <Visibility />, label: 'View', onClick: () => { } },
                    { icon: <Edit />, label: 'Update', onClick: () => { } },
                    { icon: <AssignmentInd />, label: 'Reassign', onClick: () => { } }
                  ]}
                />
              ))}

              <div className="mt-4 text-center">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  <Add className='mr-2' />
                  Create New Case
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">Recent Complaints</h2>
                <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                  View All <ArrowForward />
                </button>
              </div>

              {recentComplaints.length === 0 ? (
                  <Spinner/>
              ) : (
                recentComplaints.map((complaint, index) => (
                  <ComplaintCard
                    key={index}
                    complaint={complaint}
                    actions={[
                      { icon: <Visibility />, label: 'View', onClick: () => { } },
                      { icon: <Assignment />, label: 'Assign', onClick: () => { } },
                      { icon: <Folder />, label: 'Create Case', onClick: () => { } }
                    ]}
                  />
                )))}

              <div className="mt-4 text-center">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  <Add className='mr-2' />
                  File New Complaint
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OICDashboard;