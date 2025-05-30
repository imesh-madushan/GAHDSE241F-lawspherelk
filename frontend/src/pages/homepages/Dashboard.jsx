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
  Add,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../config/apiConfig';
import Spinner from '../../components/Spinner';
import OutlinedButton from '../../components/buttons/OutlinedButton';

const Dashboard = () => {
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [recentCases, setRecentCases] = useState([]);
  const [statsValues, setStatsValues] = useState([]); //to store the stats count
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(true);
  const [isLoadingCases, setIsLoadingCases] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      //fetching recent complaints from the backend
      try {
        const { data } = await apiClient.get('/complaints/getAllComplaints', {
          params: {
            status: 'new',
            limit: 5,
          },
        });
        if (data.complaints) {
          setRecentComplaints(data.complaints);
        }
      }
      catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setIsLoadingComplaints(false);
      }

      //fetching recent cases from the backend
      try {
        const { data } = await apiClient.get('/cases/getAllCases', {
          params: {
            status: 'inprogress',
            limit: 5,
          },
        });
        if (data.cases) {
          setRecentCases(data.cases);
        }
      }
      catch (error) {
        // if status is 404, 
        if (error.response && error.response.status === 404) {
          console.log(error.response.data.message);
        } else {
          console.error('Error fetching cases:', error);
        }
      } finally {
        setIsLoadingCases(false);
      }

      //get the all stats count
      try {
        const { data } = await apiClient.get('/common/getAllStatsCount')
        if (data.statsValues) {
          setStatsValues(data.statsValues);
        }
      }
      catch (error) {
        console.error('Error fetching cases:', error);
      } finally {
        setIsLoadingStats(false);
      }

    }
    fetchData();
  }, []);

  const stats = {
    activeCases: { icon: <Folder />, title: 'Active Cases', value: statsValues?.total_active_cases ?? 'no data', color: 'blue' },
    newComplaints: { icon: <Description />, title: 'New Complaints', value: statsValues?.total_new_complaints ?? 'no data', color: 'red' },
    ongoingInvestigations: { icon: <Search />, title: 'Ongoing Investigations', value: statsValues?.total_active_investigations ?? 'no data', color: 'green' },
    officersCount: { icon: <People />, title: 'Officers on Duty', value: statsValues?.x ?? 'no data', color: 'purple' }
  };

  //mapping for role and stats
  const roleStats = {
    'OIC': [stats.activeCases, stats.newComplaints, stats.ongoingInvestigations, stats.officersCount],
    'Crime OIC': [stats.activeCases, stats.newComplaints, stats.ongoingInvestigations, stats.officersCount],
    'Sub Inspector': [stats.activeCases, stats.ongoingInvestigations, stats.officersCount],
    'Sergeant': [stats.officersCount],
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoadingStats ? (
          <div className="col-span-full flex justify-center">
            <Spinner />
          </div>
        ) : (
          roleStats[user.role]?.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              color={stat.color}
            />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Recent Cases</h2>
            <a href="#allCases" className="inline-flex items-center px-5 py-2.5 text-sm font-sans text-center text-blue-700 hover:text-blue-800  rounded-lg hover:cursor-pointer hover:text-shadow-amber-700">
              View All
              <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
              </svg>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
            {isLoadingCases ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : recentCases.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No recent cases found</p>
              </div>
            ) : (
              recentCases.map((caseData, index) => (
                <CaseCard
                  key={index}
                  caseData={caseData}
                />
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Recent Complaints</h2>
            <a href="#allComplains" className="inline-flex items-center px-5 py-2.5 text-sm font-sans text-center text-blue-700 hover:text-blue-800  rounded-lg hover:cursor-pointer hover:text-shadow-amber-700">
              View All
              <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
              </svg>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
            {isLoadingComplaints ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : recentComplaints.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No recent complaints found</p>
              </div>
            ) : (
              recentComplaints.map((complaint, index) => (
                <ComplaintCard
                  key={index}
                  complaint={complaint}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;