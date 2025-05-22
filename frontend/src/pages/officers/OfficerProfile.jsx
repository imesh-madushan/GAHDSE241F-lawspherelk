import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import OfficerBasicInfo from '../../components/officers/OfficerBasicInfo';
import TabNavigation from '../../components/officers/TabNavigation';
import CasesTab from '../../components/officers/tabs/CasesTab';
import ComplaintsTab from '../../components/officers/tabs/ComplaintsTab';
import InvestigationsTab from '../../components/officers/tabs/InvestigationsTab';
import EvidenceTab from '../../components/officers/tabs/EvidenceTab';
import ForensicReportsTab from '../../components/officers/tabs/ForensicReportsTab';
import ReportsTab from '../../components/officers/tabs/ReportsTab';
import { apiClient } from '../../config/apiConfig';
import { useAuth } from '../../contexts/AuthContext';
import {
  Assignment,
  Gavel,
  Attachment,
  FormatListBulleted,
  Description,
  NotificationImportant,
  Lock,
  LockOpen
} from '@mui/icons-material';

const OfficerProfile = () => {
  const { user } = useAuth();
  const { officerId } = useParams();
  const navigate = useNavigate();  

  const [officerData, setOfficerData] = useState(null);
  const [activeTab, setActiveTab] = useState('cases');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canToggleAccount = user.role === "OIC"

  const tabs = [
    { id: 'cases', icon: <Gavel fontSize="small" />, label: 'Cases', count: officerData?.cases?.length },
    { id: 'complaints', icon: <NotificationImportant fontSize="small" />, label: 'Complaints', count: officerData?.complaints?.length },
    { id: 'investigations', icon: <FormatListBulleted fontSize="small" />, label: 'Investigations', count: officerData?.investigations?.length },
    { id: 'evidence', icon: <Attachment fontSize="small" />, label: 'Evidence', count: officerData?.evidence?.length },
    { id: 'forensic', icon: <Description fontSize="small" />, label: 'Forensic Reports', count: officerData?.forensicReports?.length },
    { id: 'reports', icon: <Assignment fontSize="small" />, label: 'Reports', count: officerData?.reports?.length }
  ];

  // navigate to profile page if officerId is equal to current user id
  if (officerId === user.user_id) {
    navigate('/profile');
  }

  useEffect(() => {
    const fetchOfficer = async () => {
      try {
        const response = await apiClient.get(`/officers/${officerId}`);
        setOfficerData(response.data.officerData);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch officer data');
        setLoading(false);
      }
    };

    if (officerId) {
      fetchOfficer();
    }
  }, [officerId]);

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate service duration
  const calculateServiceDuration = (joinDate) => {
    if (!joinDate) return "N/A";
    const startDate = new Date(joinDate);
    const today = new Date();
    let years = today.getFullYear() - startDate.getFullYear();
    const months = today.getMonth() - startDate.getMonth();
    if (months < 0) {
      years -= 1;
    }
    return `${years} years ${months < 0 ? 12 + months : months} months`;
  };

  const currentUserRole = user.role;

  // Handler for toggling account status
  const handleToggleAccount = async () => {
    try {
      await apiClient.patch(`/officers/toggleaccountstatus`, {
        officerId: officerData.user_id,
      });
      setOfficerData(prev => ({
        ...prev,
        account_locked: prev.account_locked ? 0 : 1
      }));
    } catch (err) {
      let msg = err?.response?.data?.message || err.message || 'Failed to toggle account status';
      setError(msg);
      console.error("Error toggling account status:", err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-6 rounded-xl bg-white shadow-lg">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
            <p className="text-lg text-gray-700">Loading officer profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !officerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-6 rounded-xl bg-white shadow-lg">
          <div className="flex flex-col items-center">
            <div className="text-red-500 text-5xl mb-4">!</div>
            <p className="text-lg text-red-600 mb-4">
              {error
                ? error
                : "Officer not found"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'cases':
        return <CasesTab data={officerData.cases} />;
      case 'complaints':
        return <ComplaintsTab data={officerData.complaints} />;
      case 'investigations':
        return <InvestigationsTab data={officerData.investigations} />;
      case 'evidence':
        return <EvidenceTab data={officerData.evidence} />;
      case 'forensic':
        return <ForensicReportsTab data={officerData.forensicReports} />;
      case 'reports':
        return <ReportsTab data={officerData.reports} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-gray-50">
      <PageHeader
        title="Officer Profile"
        breadcrumbItems={[
          { label: 'Dashboard', link: '/dashboard' },
          { label: 'Officers', link: '/officers' },
          { label: officerData.name }
        ]}
        onBack={() => window.history.back()}
        actions={canToggleAccount ? [{
          label: officerData.account_locked ? 'Activate Account' : 'Disable Account',
          icon: officerData.account_locked ? <LockOpen fontSize='small' /> : <Lock fontSize='small' />,
          onClick: handleToggleAccount,
          styles: officerData.account_locked
            ? 'border-green-500 text-green-700 hover:bg-green-500'
            : 'border-red-500 text-red-700 hover:bg-red-500'
        }] : []}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-md">
          {/* Profile section */}
          <div className="p-6">
            <OfficerBasicInfo
              officer={officerData}
              formatDate={formatDate}
              calculateServiceDuration={calculateServiceDuration}
              currentUserRole={currentUserRole}
              handleToggleAccount={handleToggleAccount}
            />

            {/* Tabs for different sections */}
            <div className="mt-8">
              <TabNavigation
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

              {/* Tab content */}
              <div className="py-4">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerProfile;