import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowBack, Edit, Save, Close, Folder, Assignment,
  Person, CalendarToday, Security, FormatListBulleted,
  Gavel, Attachment, Visibility, VisibilityOff, Add,
  Description, Timeline, DeviceHub, BarChart,
  Cancel, ScatterPlot, InfoOutlined
} from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import { format } from 'date-fns';
import PageHeader from '../../components/common/PageHeader';
import TabNavigation from '../../components/case/TabNavigation';
import EvidenceTab from '../../components/case/tabs/EvidenceTab';
import InvestigationsTab from '../../components/case/tabs/InvestigationsTab';
import ReportsTab from '../../components/case/tabs/ReportsTab';
import OffencesTab from '../../components/case/tabs/OffencesTab';
import CaseComplaintCard from '../../components/case/CaseComplaintCard';
import StatusBadge from '../../components/badges/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import OutlinedButton from '../../components/buttons/OutlinedButton';
import OfficerCard from '../../components/cards/OfficerCard';
import CustomOfficerDropdown from '../../components/dropdowns/CustomOfficerDropdown';
import { caseStatusList, complainStatusList } from '../../../data';

const SingleCaseView = () => {
  const { user } = useAuth();
  const { caseId } = useParams();

  const [caseData, setCaseData] = useState({
    case_id: '',
    topic: '',
    case_type: '',
    status: '',
    started_dt: '',
    end_dt: null,
    leader_id: '',
    leader_name: '',
    leader_role: '',
    evidence: [],
    investigations: [],
    reports: [],
    assignedOfficers: []
  });

  const [complaint, setComplaint] = useState({
    complain_id: '',
    complain_dt: '',
    description: '',
    status: '',
    officer_id: '',
    officer_name: '',
    officer_role: '',
    officer_profile: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCase, setEditedCase] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [allOfficers, setAllOfficers] = useState([]);
  const [availableOfficers, setAvailableOfficers] = useState([]);

  const canEdit = user.user_id == caseData.leader_id || user.role === "OIC" || user.role === "Crime OIC";
  const canChangeLeader = user.role === "Crime OIC";
  const canAssignOfficers = user.user_id == caseData.leader_id || user.role === "Crime OIC";
  const canUpdateTimeLine = user.user_id == caseData.leader_id || user.role === "Crime OIC" || user.role === "Forrensic Officer";
  const canAddEvidence = user.user_id == caseData.leader_id || user.role === "Crime OIC" || user.role === "Sub Inspector" || user.role === "Sergeant" || user.role === "Police Constable";
  const canAddInvestigation = user.user_id == caseData.leader_id || user.role === "Crime OIC";

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
    } catch (e) {
      return 'N/A';
    }
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getRiskLevel = (score) => {
    if (score >= 70) return { level: 'High', color: 'bg-red-500' };
    if (score >= 40) return { level: 'Medium', color: 'bg-yellow-500' };
    return { level: 'Low', color: 'bg-green-500' };
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setCaseData(editedCase);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleSaveChanges = () => {
    handleEditToggle();
  };

  const handleCancelEdit = () => {
    setEditedCase(caseData);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedCase(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssignOfficer = (officer) => {
    const updatedOfficers = [
      ...caseData.assignedOfficers,
      {
        id: officer.id,
        name: officer.name,
        role: officer.role || "Assigned Officer",
        image: officer.image
      }
    ];

    setCaseData({
      ...caseData,
      assignedOfficers: updatedOfficers
    });
  };

  const handleViewFullComplaint = () => {
    console.log("View full complaint for ID:", complaint.complain_id);
  };

  const handleLeaderChange = (officer) => {
    setEditedCase(prev => ({
      ...prev,
      leader_id: officer.id,
      leader_name: officer.name,
      leader_role: officer.role,
      leader_profile: officer.profilePic || officer.image
    }));
  };

  // Fetch available officers for leader assignment
  useEffect(() => {
    const fetchAvailableOfficers = async () => {
      if (isEditing && canChangeLeader) {
        try {
          // Get officers that could be assigned as leaders (based on roles)
          const response = await apiClient.post('/officers/getAll');

          if (response.data) {
            console.log("Available officers fetched:", response.data);
            setAvailableOfficers(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch available officers:", error);
        }
      }
    };

    fetchAvailableOfficers();
  }, [isEditing, canChangeLeader]);

  const actions = {
    Edit: { icon: <Edit fontSize='small' />, label: 'Edit Case', onClick: handleEditToggle, styles: 'text-blue-700' },
    Cancel: { icon: <Cancel fontSize='small' />, label: 'Cancel', onClick: handleCancelEdit, styles: 'text-red-700' },
    Save: { icon: <Save fontSize='small' />, label: 'Save', onClick: handleSaveChanges, styles: 'text-green-700' },
  };

  // Process and collect all officers related to the case
  const processRelatedOfficers = (caseData) => {
    const uniqueOfficers = new Map();

    // Add case leader if exists
    if (caseData.leader_id && caseData.leader_name) {
      uniqueOfficers.set(caseData.leader_id, {
        id: caseData.leader_id,
        name: caseData.leader_name,
        role: caseData.leader_role,
        profilePic: caseData.leader_profile,
        type: 'Case Leader'
      });
    }

    // Add complaint officer if exists
    if (caseData.complaint?.officer_id) {
      uniqueOfficers.set(caseData.complaint.officer_id, {
        id: caseData.complaint.officer_id,
        name: caseData.complaint.officer_name || 'Unknown',
        role: caseData.complaint.officer_role || 'Officer',
        profilePic: caseData.complaint.officer_profile,
        type: 'Complaint Officer'
      });
    }

    // Add evidence collectors
    if (caseData.evidence && caseData.evidence.length > 0) {
      caseData.evidence.forEach(item => {
        if (item.officer_id) {
          uniqueOfficers.set(item.officer_id, {
            id: item.officer_id,
            name: item.collected_by || 'Unknown',
            role: item.officer_role || 'Officer',
            profilePic: item.officer_profile,
            type: 'Evidence Collector'
          });
        }
      });
    }

    // Add report creators
    if (caseData.reports && caseData.reports.length > 0) {
      caseData.reports.forEach(report => {
        if (report.officer_id) {
          uniqueOfficers.set(report.officer_id, {
            id: report.officer_id,
            name: report.created_by || 'Unknown',
            role: report.officer_role || 'Officer',
            profilePic: report.officer_profile,
            type: 'Report Creator'
          });
        }
      });
    }
    // Add investigation officers
    if (caseData.assignedOfficers && caseData.assignedOfficers.length > 0) {
      caseData.assignedOfficers.forEach(officer => {
        if (officer.user_id) {
          uniqueOfficers.set(officer.user_id, {
            id: officer.user_id,
            name: officer.name || 'Unknown',
            role: officer.role || 'Officer',
            profilePic: officer.profile_pic,
            type: 'Investigation Officer'
          });
        }
      });
    }

    return Array.from(uniqueOfficers.values());
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data } = await apiClient.get(`/cases/${caseId}`);

        if (data.caseData) {
          const formattedCaseData = {
            ...data.caseData,
            evidence: data.caseData.evidence || [],
            investigations: data.caseData.investigations || [],
            reports: data.caseData.reports || [],
            assignedOfficers: data.caseData.assignedOfficers || []
          };

          setCaseData(formattedCaseData);
          setEditedCase(formattedCaseData);

          // Set complaint data from the separate complaint object
          if (data.caseData.complaint) {
            setComplaint(data.caseData.complaint);
          }

          // Process all related officers
          const officers = processRelatedOfficers(formattedCaseData);
          setAllOfficers(officers);
        }
      } catch (error) {
        console.error('Error fetching case data:', error);
        setError('Failed to load case data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (caseId) {
      fetchData();
    }
  }, [caseId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-6 rounded-xl bg-white shadow-lg">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
            <p className="text-lg text-gray-700">Loading case details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-6 rounded-xl bg-white shadow-lg">
          <div className="flex flex-col items-center">
            <div className="text-red-500 text-5xl mb-4">!</div>
            <p className="text-lg text-red-600 mb-4">{error}</p>
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

  return (
    <div className="min-h-screen pb-12 bg-gray-50">
      <PageHeader
        title={isEditing ? 'Edit Case' : 'Case Details'}
        breadcrumbItems={[
          { label: 'Dashboard', link: '/dashboard' },
          { label: 'Cases', link: '/cases' },
          { label: caseData.case_id.substring(0, 8) }
        ]}
        onBack={() => window.history.back()}
        actions={canEdit ? [
          isEditing ? {
            icon: <Cancel fontSize='small' />,
            label: 'Cancel',
            onClick: handleCancelEdit,
            styles: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
          } : {
            icon: <Edit fontSize='small' />,
            label: 'Edit Case',
            onClick: handleEditToggle,
            styles: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
          },
          isEditing ? {
            icon: <Save fontSize='small' />,
            label: 'Save Changes',
            onClick: handleSaveChanges,
            styles: 'bg-green-600 text-white border-green-600 hover:bg-green-700'
          } : null
        ].filter(Boolean) : []}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Top Card - Case Header */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <Folder className="text-blue-700" />
                </div>
                <div>
                  <div className="text-gray-500 text-sm font-medium">Case Reference</div>
                  <h1 className="text-xl font-bold text-gray-900">{'#'+caseData.case_id}</h1>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center text-gray-500 px-3 py-1">
                  <CalendarToday className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm font-medium">
                    {formatDate(caseData.started_dt)}
                  </span>
                </div>

                <StatusBadge
                  status={caseData.status}
                  statusList={caseStatusList}
                  isEditing={isEditing}
                  handleInputChange={handleInputChange}
                />

                <div className="bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-sm font-medium border border-blue-100">
                  <ScatterPlot fontSize="small" className="mr-1" />
                  {caseData.case_type || "Unknown Type"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Content - Main Case Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Info Card */}
            <div className="bg-white rounded-xl shadow-sm ">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <InfoOutlined className="h-5 w-5 mr-2 text-blue-600" />
                  Case Topic
                </h2>

                {isEditing ? (
                  <input
                    type="text"
                    name="topic"
                    value={editedCase.topic}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-blue-300 rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter case topic"
                  />
                ) : (
                  <div className="bg-gray-50 p-5 rounded-lg text-gray-800">
                    <h3 className="text-xl font-medium">{caseData.topic || "No topic provided"}</h3>
                  </div>
                )}

                <div className="mt-2">
                  <div className="flex justify-between items-center mb-2">
                    {isEditing && canChangeLeader && (
                      <span className="text-xs text-blue-600 font-medium">Change Leader</span>
                    )}
                  </div>

                  {isEditing && canChangeLeader ? (
                    <CustomOfficerDropdown
                      officers={availableOfficers}
                      selectedOfficerId={editedCase.leader_id}
                      onOfficerSelect={handleLeaderChange}
                      className="mb-4"
                    />
                  ) : (
                    <div className="mb-4">
                      {caseData.leader_id ? (
                        <OfficerCard
                          officer={{
                            id: caseData.leader_id,
                            name: caseData.leader_name,
                            role: caseData.leader_role,
                            profilePic: caseData.leader_profile,
                            type: "Case Leader"
                          }}
                          size="medium"
                          className="bg-white/50 border border-gray-200 hover:border-blue-300 shadow-sm"
                        />
                      ) : (
                        <div className="inline-flex items-center bg-yellow-50 px-3 py-1 rounded-md text-yellow-700 text-sm">
                          <Person className="h-4 w-4 mr-1" />
                          No case leader assigned
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col sm:items-end">
                    <span className="text-sm text-gray-500">Case Duration:</span>
                    <div className="mt-2 flex items-center">
                      <Timeline className="text-gray-400 mr-2" />
                      <span className="text-gray-700">
                        {caseData.end_dt ?
                          `${Math.ceil((new Date(caseData.end_dt) - new Date(caseData.started_dt)) / (1000 * 60 * 60 * 24))} days` :
                          `${Math.ceil((new Date() - new Date(caseData.started_dt)) / (1000 * 60 * 60 * 24))} days (ongoing)`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">
                      Case Overview
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <BarChart className="text-blue-600 mr-2" />
                          <h4 className="text-gray-700 font-medium">Case Progress</h4>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-700">Evidence Collected</span>
                            <span className="text-sm text-gray-700 font-medium">
                              {caseData.evidence?.length || 0} items
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min(100, (caseData.evidence?.length || 0) * 10)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-700">Investigations</span>
                            <span className="text-sm text-gray-700 font-medium">
                              {caseData.investigations?.length || 0} total
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${Math.min(100, (caseData.investigations?.length || 0) * 20)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-700">Reports Generated</span>
                            <span className="text-sm text-gray-700 font-medium">
                              {caseData.reports?.length || 0} reports
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${Math.min(100, (caseData.reports?.length || 0) * 25)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Security className="text-blue-600 mr-2" />
                          <h4 className="text-gray-700 font-medium">Offence Information</h4>
                        </div>
                        {caseData.offences?.length > 0 ? (
                          <div className="space-y-3">
                            {caseData.offences.map((offence, index) => (
                              <div key={offence.offence_id || index} className="bg-white p-3 rounded-md shadow-sm">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-800">{offence.crime_type}</span>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${offence.status === 'Convicted' ? 'bg-red-100 text-red-800' :
                                    offence.status === 'Acquitted' ? 'bg-green-100 text-green-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {offence.status}
                                  </span>
                                </div>
                                <div className="mt-1 text-xs text-gray-500">
                                  Risk Score:
                                  <span className="ml-1 font-medium">
                                    {offence.risk_score || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500">
                            No offences registered for this case yet
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'evidence' && (
                  <EvidenceTab
                    caseData={caseData}
                    canAddEvidence={canAddEvidence}
                  />
                )}

                {activeTab === 'investigations' && (
                  <InvestigationsTab
                    caseData={caseData}
                    canAddInvestigation={canAddInvestigation}
                    formatDate={formatDate}
                  />
                )}

                {activeTab === 'offences' && (
                  <OffencesTab
                    caseData={caseData}
                    canEdit={canEdit}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    getRiskLevel={getRiskLevel}
                  />
                )}

                {activeTab === 'reports' && (
                  <ReportsTab
                    caseData={caseData}
                    canEdit={canEdit}
                    formatDate={formatDate}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Complaint Card */}
            <CaseComplaintCard
              complaint={complaint}
              formatDate={formatDate}
              onViewFullComplaint={handleViewFullComplaint}
            />

            {/* Assigned Officers */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800 flex items-center">
                  <Person className="h-5 w-5 mr-2 text-blue-600" />
                  Assigned Officers
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {allOfficers && allOfficers.length > 0 ? (
                    allOfficers.map((officer, index) => (
                      <OfficerCard
                        key={officer.id || index}
                        officer={officer}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-2">No officers involved in this case</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800 flex items-center">
                  <DeviceHub className="h-5 w-5 mr-2 text-blue-600" />
                  Quick Actions
                </h2>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full py-2.5 text-sm bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg text-white flex items-center justify-center">
                  <Description className="mr-2" fontSize="small" />
                  Create New Report
                </button>

                {canAddInvestigation && (
                  <button className="w-full py-2.5 text-sm bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg text-white flex items-center justify-center">
                    <FormatListBulleted className="mr-2" fontSize="small" />
                    Add Investigation Task
                  </button>
                )}

                {canEdit && (
                  <button className="w-full py-2.5 text-sm bg-amber-600 hover:bg-amber-700 transition-colors rounded-lg text-white flex items-center justify-center">
                    <Gavel className="mr-2" fontSize="small" />
                    Register Offence
                  </button>
                )}

                {(user.role === "OIC" || user.role === "Crime OIC") && (
                  <button className="w-full py-2.5 text-sm bg-red-600 hover:bg-red-700 transition-colors rounded-lg text-white flex items-center justify-center">
                    <Close className="mr-2" fontSize="small" />
                    Close Case
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleCaseView;