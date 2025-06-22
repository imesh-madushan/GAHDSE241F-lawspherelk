import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
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
  Assignment, Gavel, Attachment, FormatListBulleted, Description,
  NotificationImportant, Lock, LockOpen, Phone, Mail, LocationOn,
  CalendarToday, AccessTime, Badge, LocalPolice, VerifiedUser,
  History
} from '@mui/icons-material';
import StatusPopup from '../../components/common/StatusPopup';
import { Save, Edit, Cancel } from '@mui/icons-material';

const OfficerProfile = () => {
  const { user } = useAuth();
  const { officerId } = useParams();
  const navigate = useNavigate();

  const [officerData, setOfficerData] = useState(null);
  const [activeTab, setActiveTab] = useState('cases');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOfficer, setEditedOfficer] = useState({});
  const [touched, setTouched] = useState({});
  const [popup, setPopup] = useState({ open: false, status: "success", message: "", description: "" });
  const canToggleAccount = user?.role === "OIC";

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

    if (officerId && !isEditing) {
      fetchOfficer();
    }
  }, [officerId, isEditing]);

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

  // Edit handlers (OIC only)
  const handleEditToggle = () => {
    if (isEditing) {
      setEditedOfficer({});
      setIsEditing(false);
    } else {
      setEditedOfficer({
        name: officerData.name,
        nic: officerData.nic,
        phone: officerData.phone,
        email: officerData.email,
        address: officerData.address,
        role: officerData.role,
        profile_pic: officerData.profile_pic
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setEditedOfficer({});
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedOfficer(prev => ({
      ...prev,
      [name]: value
    }));
    setTouched(t => ({ ...t, [name]: true }));
  };

  // Only send changed fields
  const getChangedFields = () => {
    const changed = {};
    for (const key of Object.keys(editedOfficer)) {
      if (editedOfficer[key] !== officerData[key]) {
        changed[key] = editedOfficer[key];
      }
    }
    return changed;
  };

  const handleSaveChanges = async () => {
    const changedFields = getChangedFields();
    if (Object.keys(changedFields).length === 0) {
      setPopup({
        open: true,
        status: "info",
        message: "No changes detected.",
        description: ""
      });
      setIsEditing(false);
      return;
    }
    try {
      const response = await apiClient.put(`/officers/update`, {
        officerId: officerData.user_id,
        ...changedFields
      });
      if (response.data && response.data.success) {
        setOfficerData(prev => ({
          ...prev,
          ...changedFields
        }));
        setPopup({
          open: true,
          status: "success",
          message: "Officer updated successfully",
          description: ""
        });
        setIsEditing(false);
      } else {
        setPopup({
          open: true,
          status: "error",
          message: "Failed to update officer",
          description: response.data?.message || ""
        });
      }
    } catch (err) {
      setPopup({
        open: true,
        status: "error",
        message: "Failed to update officer",
        description: err.response?.data?.message || ""
      });
    }
  };

  const handlePopupClose = () => setPopup({ ...popup, open: false });

  const tabs = [
    { id: 'cases', icon: <Gavel fontSize="small" />, label: 'Cases', count: officerData?.cases?.length },
    { id: 'complaints', icon: <NotificationImportant fontSize="small" />, label: 'Complaints', count: officerData?.complaints?.length },
    { id: 'investigations', icon: <FormatListBulleted fontSize="small" />, label: 'Investigations', count: officerData?.investigations?.length },
    { id: 'evidence', icon: <Attachment fontSize="small" />, label: 'Evidence', count: officerData?.evidence?.length },
    { id: 'reports', icon: <Assignment fontSize="small" />, label: 'Reports', count: officerData?.reports?.length }
  ];

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
      case 'reports':
        return <ReportsTab data={officerData.reports} />;
      default:
        return null;
    }
  };
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-6 rounded-xl bg-white shadow-lg">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mb-4"></div>
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
            </p>            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 bg-gray-50">
      <PageHeader
        title={isEditing ? "Edit Officer Profile" : "Officer Profile"}
        breadcrumbItems={[
          { label: 'Dashboard', link: '/dashboard' },
          { label: 'Officers', link: '/officers' },
          { label: officerData.name }
        ]}
        onBack={() => navigate(-1)}
        actions={[
          ...(canToggleAccount ? [{
            label: officerData.account_locked ? 'Activate Account' : 'Disable Account',
            icon: officerData.account_locked ? <LockOpen fontSize='small' /> : <Lock fontSize='small' />,
            onClick: handleToggleAccount,
            styles: officerData.account_locked
              ? 'border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700'
              : 'border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700'
          }] : []),
          ...(user?.role === "OIC" ? [
            isEditing ? {
              icon: <Cancel fontSize='small' />,
              label: 'Cancel',
              onClick: handleCancelEdit,
              styles: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
            } : {
              icon: <Edit fontSize='small' />,
              label: 'Edit Officer',
              onClick: handleEditToggle,
              styles: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            },
            isEditing ? {
              icon: <Save fontSize='small' />,
              label: 'Save Changes',
              onClick: handleSaveChanges,
              styles: 'bg-gray-800 text-white border-gray-800 hover:bg-gray-900'
            } : null
          ].filter(Boolean) : []),
          // {            icon: <History fontSize='small' />,
          //   onClick: () => navigate(`/recordhistory/user/${officerId}`),
          //   styles: 'bg-white rounded-full text-gray-700 border-gray-600'
          // }
        ]}
      />

      <div className="container mx-auto px-4 py-6">        {/* Profile Header with Hero Banner */}
        <div className="bg-gray-800 rounded-t-xl shadow-md relative overflow-hidden">
          <div className="absolute inset-0 bg-gray-900 opacity-20 z-0"></div>
          <div className="relative px-8 py-6 flex flex-col md:flex-row items-center md:items-start text-white">
            {/* Profile Photo */}
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-8">
              <div className="relative">
                <div className="w-36 h-36 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                  <img
                    src={officerData.profile_pic || "/default-profile.png"}
                    alt={officerData.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "/default-profile.png" }}
                  />
                </div>                <div className="absolute flex bottom-0.5 right-0.5 bg-white text-gray-700 rounded-full p-2 shadow-lg">
                  <VerifiedUser fontSize="small" />
                </div>
              </div>
            </div>

            {/* Officer Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{officerData.name}</h1>
                  <div className="mt-1 flex items-center justify-center md:justify-start">
                    <Badge className="mr-1.5 h-5 w-5" />
                    <span className="font-medium">{officerData.role}</span>

                    {/* Account Status Badge */}
                    <span className={`ml-3 px-2 py-0.5 text-xs font-medium rounded-full ${officerData.account_locked
                      ? "bg-red-100 text-red-800 border border-red-300"
                      : "bg-green-100 text-green-800 border border-green-300"
                      }`}>
                      {officerData.account_locked ? "Inactive" : "Active"}
                    </span>
                  </div>
                </div>

                {/* Last Login */}
                <div className="mt-3 md:mt-0 text-sm opacity-90">
                  <div className="flex items-center justify-center md:justify-end">
                    <AccessTime className="mr-1.5 h-4 w-4" />
                    <span>
                      Last login: {officerData.lastlogin_dt ? formatDate(officerData.lastlogin_dt) : "Never"}
                    </span>
                  </div>
                </div>
              </div>              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white bg-opacity-30 backdrop-blur-sm rounded-lg px-4 py-3 text-center shadow-md">
                  <div className="text-2xl font-bold text-gray-800 drop-shadow-sm">{officerData.cases?.length || 0}</div>
                  <div className="text-xs uppercase text-gray-800 font-medium tracking-wider drop-shadow-sm">Cases</div>
                </div>
                <div className="bg-white bg-opacity-30 backdrop-blur-sm rounded-lg px-4 py-3 text-center shadow-md">
                  <div className="text-2xl font-bold text-gray-800 drop-shadow-sm">{officerData.complaints?.length || 0}</div>
                  <div className="text-xs uppercase text-gray-800 font-medium tracking-wider drop-shadow-sm">Complaints</div>
                </div>
                <div className="bg-white bg-opacity-30 backdrop-blur-sm rounded-lg px-4 py-3 text-center shadow-md">
                  <div className="text-2xl font-bold text-gray-800 drop-shadow-sm">{officerData.investigations?.length || 0}</div>
                  <div className="text-xs uppercase text-gray-800 font-medium tracking-wider drop-shadow-sm">Investigations</div>
                </div>
                <div className="bg-white bg-opacity-30 backdrop-blur-sm rounded-lg px-4 py-3 text-center shadow-md">
                  <div className="text-2xl font-bold text-gray-800 drop-shadow-sm">{officerData.evidence?.length || 0}</div>
                  <div className="text-xs uppercase text-gray-800 font-medium tracking-wider drop-shadow-sm">Evidence</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Service Info Cards */}
        <div className="bg-white shadow-md p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Contact Info */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Phone className="h-5 w-5 mr-2 text-gray-700" />
            Contact Information
          </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editedOfficer.email || ""}
                      onChange={handleInputChange}
                      className="font-medium bg-gray-50 border rounded px-2 py-1"
                      placeholder="Email"
                    />
                  ) : (
                    <p className="font-medium">{officerData.email}</p>
                  )}
                </div>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={editedOfficer.phone || ""}
                      onChange={handleInputChange}
                      className="font-medium bg-gray-50 border rounded px-2 py-1"
                      placeholder="Phone"
                    />
                  ) : (
                    <p className="font-medium">{officerData.phone}</p>
                  )}
                </div>
              </li>
              <li className="flex items-start">
                <LocationOn className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={editedOfficer.address || ""}
                      onChange={handleInputChange}
                      className="font-medium bg-gray-50 border rounded px-2 py-1"
                      placeholder="Address"
                    />
                  ) : (
                    <p className="font-medium">{officerData.address}</p>
                  )}
                </div>
              </li>
            </ul>
          </div>

          {/* Service Info */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <LocalPolice className="h-5 w-5 mr-2 text-gray-700" />
            Service Information
          </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CalendarToday className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium">{formatDate(officerData.created_dt)}</p>
                </div>
              </li>
              <li className="flex items-start">
                <AccessTime className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Service Duration</p>
                  <p className="font-medium">{calculateServiceDuration(officerData.created_dt)}</p>
                </div>
              </li>
              <li className="flex items-start">
                <Badge className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  {isEditing ? (<select
                    name="role"
                    value={editedOfficer.role || officerData.role}
                    onChange={handleInputChange}
                    className="font-medium bg-gray-50 border rounded px-2 py-1"
                  >
                    <option value="OIC">OIC</option>
                    <option value="Crime OIC">Crime OIC</option>
                    <option value="Forensic Officer">Forensic Officer</option>
                    <option value="Sub Inspector">Sub Inspector</option>
                    <option value="Sergeant">Sergeant</option>
                  </select>
                  ) : (
                    <p className="font-medium">
                      {officerData.role === 'Crime OIC' ? 'Crime Division' :
                        officerData.role === 'OIC' ? 'Administration' :
                          officerData.role === 'Forensic Officer' ? 'Forensic Department' : 'Field Operations'}
                    </p>
                  )}
                </div>
              </li>
            </ul>
          </div>

          {/* Cases Summary */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Gavel className="h-5 w-5 mr-2 text-gray-700" />
            Case Summary
          </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Cases:</span>                <span className="font-semibold text-gray-700">
                  {officerData.cases?.filter(c => c.status === 'inprogress').length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Closed Cases:</span>
                <span className="font-semibold text-gray-700">
                  {officerData.cases?.filter(c => c.status === 'closed').length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Recent Activity:</span>
                <span className="font-semibold">
                  {officerData.cases?.length > 0
                    ? formatDate(officerData.cases[0].started_dt)
                    : "No recent activity"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and content */}
        <div className="bg-white rounded-xl shadow-md">
          {/* Tabs Navigation */}
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
      {/* Status Popup */}
      <StatusPopup
        open={popup.open}
        status={popup.status}
        message={popup.message}
        description={popup.description}
        onClose={handlePopupClose}
        okLabel={popup.status === "success" ? "OK" : "Close"}
      />
    </div>
  );
};

export default OfficerProfile;