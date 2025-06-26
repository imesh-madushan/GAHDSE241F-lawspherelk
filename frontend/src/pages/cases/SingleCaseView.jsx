import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowBack, Edit, Save, Close, Folder, Assignment,
  Person, CalendarToday, Security, FormatListBulleted,
  Gavel, Attachment, Visibility, VisibilityOff, Add,
  Description, Timeline, DeviceHub, BarChart,
  Cancel, ScatterPlot, InfoOutlined,
  History, Note
} from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import { format } from 'date-fns';
import { downloadCaseReport, validateCaseForReport } from '../../utils/reportUtils';
import PageHeader from '../../components/common/PageHeader';
import TabNavigation from '../../components/case/TabNavigation';
import EvidenceTab from '../../components/case/tabs/EvidenceTab';
import InvestigationsTab from '../../components/case/tabs/InvestigationsTab';
import ReportsTab from '../../components/case/tabs/ReportsTab';
import OffencesTab from '../../components/case/tabs/OffencesTab';
import CaseComplaintCard from '../../components/case/CaseComplaintCard';
import StatusBadge from '../../components/badges/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import OfficerCard from '../../components/cards/OfficerCard';
import CustomOfficerDropdown from '../../components/dropdowns/CustomOfficerDropdown';
import { caseStatusList } from '../../../data';
import StatusPopup from '../../components/common/StatusPopup';
import { capitalizeFirstLetter } from '../../utils/Preprocessors';
import CreateEvidenceModal from '../../components/modals/CreateEvidenceModal';
import CreateInvestigationModal from '../../components/modals/CreateInvestigationModal';
import CreateOffenceModal from '../../components/modals/CreateOffenceModal';
// import CreateReportModal from '../../components/modals/CreateReportModal';
import CreateNoteModal from '../../components/modals/CreateNoteModal';
import OutlinedButton from '../../components/buttons/OutlinedButton';

const SingleCaseView = () => {
  const { user } = useAuth();
  const { caseId } = useParams();
  const navigate = useNavigate();


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
  const [activeTab, setActiveTab] = useState('evidence');
  const [allOfficers, setAllOfficers] = useState([]);
  const [popup, setPopup] = useState({ open: false, status: 'success', message: '', description: '', referenceLink: null });
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [tabCounts, setTabCounts] = useState({
    evidence: 0,
    investigations: 0,
    offences: 0,
    reports: 0
  });
  const [showCreateEvidenceModal, setShowCreateEvidenceModal] = useState(false); const [showCreateInvestigationModal, setShowCreateInvestigationModal] = useState(false);
  const [showCreateOffenceModal, setShowCreateOffenceModal] = useState(false);
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);

  // Permission checks - If case is closed, ONLY OIC can do anything
  const isCaseClosed = caseData.status === "closed";
  const isOIC = user.role === "OIC";
  const isCrimeOIC = user.role === "Crime OIC";
  const isLeader = user.user_id === caseData.leader_id;

  const canEdit = () => {
    if (isCaseClosed) return false;
    return user.user_id == caseData.leader_id || isOIC || user.role === "Crime OIC";
  };

  const canChangeLeader = () => {
    if (isCaseClosed) return false;
    return isOIC || user.role === "Crime OIC";
  };

  const canAddEvidence = () => {
    if (isCaseClosed) return false;
    return (
      user.user_id == caseData.leader_id ||
      isOIC ||
      user.role === "Crime OIC" ||
      user.role === "Sub Inspector" ||
      user.role === "Sergeant" ||
      user.role === "Police Constable"
    );
  };

  const canAddInvestigation = () => {
    if (isCaseClosed) return false;
    return (user.user_id == caseData.leader_id || isOIC || user.role === "Crime OIC") && caseData.status !== 'closed';
  };

  const canAddOffence = () => {
    if (isCaseClosed) return false;
    return (user.user_id == caseData.leader_id || isOIC || user.role === "Crime OIC") && caseData.status !== 'closed';
  };
  // Reports: For closed cases, only OIC can create reports
  const canCreateReport = () => {
    return (
      isOIC ||
      isCrimeOIC ||
      isLeader
    );
  };

  // Notes: Case leader, OIC, Crime OIC, and team members can create notes
  const canCreateNote = () => {
    return (
      user.user_id == caseData.leader_id ||
      isOIC ||
      user.role === "Crime OIC" ||
      caseData.assignedOfficers?.some(officer => officer.user_id === user.user_id)
    );
  };

  // Quick action handlers
  const handleAddEvidence = () => {
    setShowCreateEvidenceModal(true);
  };

  const handleAddInvestigation = () => {
    if (caseData.status === 'closed') {
      setPopup({
        open: true,
        status: 'error',
        message: 'Action Not Allowed',
        description: 'Cannot start new investigation for a closed case.',
        referenceLink: null
      });
      return;
    }
    setShowCreateInvestigationModal(true);
  };

  const handleAddOffence = () => {
    if (caseData.status === 'closed') {
      setPopup({
        open: true,
        status: 'error',
        message: 'Action Not Allowed',
        description: 'Cannot add new offence to a closed case.',
        referenceLink: null
      });
      return;
    }
    setShowCreateOffenceModal(true);
  };
  const handleCreateReport = async () => {
    try {
      // Validate case data before generating report
      const validation = validateCaseForReport(caseData);

      if (!validation.isValid) {
        setPopup({
          open: true,
          status: 'error',
          message: 'Cannot Generate Report',
          description: `Please fix the following issues: ${validation.errors.join(', ')}`,
          referenceLink: null
        });
        return;
      }

      // Show warnings if any
      if (validation.warnings.length > 0) {
        setPopup({
          open: true,
          status: 'warning',
          message: 'Report Generation Warning',
          description: `Note: ${validation.warnings.join(', ')}. Report will still be generated.`,
          referenceLink: null
        });

        // Continue after showing warning
        setTimeout(async () => {
          await generateReport();
        }, 2000);
        return;
      }

      await generateReport();

    } catch (error) {
      console.error('Error in handleCreateReport:', error);
      setPopup({
        open: true,
        status: 'error',
        message: 'Report Generation Failed',
        description: error.message || 'An unexpected error occurred while generating the report.',
        referenceLink: null
      });
    }
  };

  const generateReport = async () => {
    try {
      setPopup({
        open: true,
        status: 'info',
        message: 'Generating Report...',
        description: 'Please wait while we generate your comprehensive case report PDF.',
        referenceLink: null
      });

      const result = await downloadCaseReport(caseId);

      setPopup({
        open: true,
        status: 'success',
        message: 'Report Generated Successfully',
        description: `Case report has been generated and downloaded as ${result.filename}`,
        referenceLink: null
      });

    } catch (error) {
      console.error('Error generating report:', error);
      setPopup({
        open: true,
        status: 'error',
        message: 'Report Generation Failed',
        description: error.message || 'Failed to generate case report. Please try again.',
        referenceLink: null
      });
    }
  };

  const handleCreateNote = () => {
    setShowCreateNoteModal(true);
  };
  // Define quick actions with police-style black/gray styling
  const quickActions = [
    ...(canAddEvidence() ? [{
      icon: <Attachment fontSize="small" />,
      label: 'Add Evidence',
      onClick: handleAddEvidence,
      styles: 'w-full bg-gray-800 text-white hover:bg-black border-none'
    }] : []),
    ...(canAddInvestigation() ? [{
      icon: <FormatListBulleted fontSize="small" />,
      label: 'New Investigation',
      onClick: handleAddInvestigation,
      styles: 'w-full bg-gray-800 text-white hover:bg-black border-none'
    }] : []),
    ...(canAddOffence() ? [{
      icon: <Gavel fontSize="small" />,
      label: 'File Crime Offence',
      onClick: handleAddOffence,
      styles: 'w-full bg-gray-800 text-white hover:bg-black border-none'
    }] : []),
    ...(canCreateNote() ? [{
      icon: <Note fontSize="small" />,
      label: 'Add Note',
      onClick: handleCreateNote,
      styles: 'w-full bg-gray-800 text-white hover:bg-black border-none'
    }] : []),
    ...(canCreateReport() ? [{
      icon: <Description fontSize="small" />,
      label: 'Generate Report',
      onClick: handleCreateReport,
      styles: 'w-full bg-gray-800 text-white hover:bg-black border-none'
    }] : [])
  ];

  const dropOfficerRoles = [
    'OIC',
    'Crime OIC',
    'Police Constable',
    'Forensic Officer',
    'Sergeant',
  ];

  const dropOfficerRolesForeNotes = [
    'Police Constable',
    'Forensic Officer',
    'Sergeant',
    'Sub Inspector',
    'Inspector',
  ];

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
    } catch {
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

  const handleSaveChanges = async () => {
    // Prevent removing topic or leader
    if (!editedCase.topic || !editedCase.topic.trim()) {
      setPopup({
        open: true,
        status: 'error',
        message: 'Case topic is required',
        description: 'Case topic cannot be empty or removed.',
        referenceLink: null
      });
      return;
    }
    if (!editedCase.leader_id) {
      setPopup({
        open: true,
        status: 'error',
        message: 'Case leader is required',
        description: 'Case leader cannot be removed or set to none.',
        referenceLink: null
      });
      return;
    }

    // Find changed fields only
    const updatedFields = {};
    Object.keys(editedCase).forEach(key => {
      if (editedCase[key] !== caseData[key]) {
        // Only send leader_id if leader changed
        if (key === 'leader_id') {
          updatedFields['leader_id'] = editedCase['leader_id'];
        } else if (key !== 'leader_name' && key !== 'leader_role' && key !== 'leader_profile') {
          updatedFields[key] = editedCase[key];
        }
      }
    });

    if (Object.keys(updatedFields).length === 0) {
      setIsEditing(false);
      return;
    }

    setIsEditing(false);
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiClient.put('/cases/update', {
        case_id: caseData.case_id,
        ...updatedFields
      });
      if (response.data && response.data.success) {
        setPopup({
          open: true,
          status: 'success',
          message: 'Case updated successfully',
          description: '',
          referenceLink: `/cases/${caseData.case_id}`
        });
        setPendingUpdate({ ...caseData, ...updatedFields });
      } else {
        setPopup({
          open: true,
          status: 'error',
          message: 'Case update failed',
          description: response.data?.message || 'Failed to update case.',
          referenceLink: null
        });
      }
    } catch (error) {
      setPopup({
        open: true,
        status: 'error',
        message: 'Case update failed',
        description: error?.response?.data?.message || 'An error occurred.',
        referenceLink: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopupClose = useCallback(() => {
    setPopup(prev => ({ ...prev, open: false }));
    if (popup.status === 'success' && pendingUpdate) {
      // If leader_id changed, update leader details as well
      let newCaseData = { ...pendingUpdate };
      if (
        editedCase.leader_id &&
        editedCase.leader_id !== caseData.leader_id &&
        (editedCase.leader_name || editedCase.leader_role || editedCase.leader_profile)
      ) {
        newCaseData.leader_name = editedCase.leader_name;
        newCaseData.leader_role = editedCase.leader_role;
        newCaseData.leader_profile = editedCase.leader_profile;
      }
      setCaseData(newCaseData);
      setPendingUpdate(null);
    }
  }, [popup, pendingUpdate, editedCase, caseData.leader_id]);

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

  const handleViewFullComplaint = () => {
    navigate(`/complaints/${complaint.complain_id}`);
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

  // Add this new function to calculate tab counts
  const calculateTabCounts = (caseData) => {
    setTabCounts({
      evidence: caseData.evidence?.length || 0,
      investigations: caseData.investigations?.length || 0,
      offences: caseData.offences?.length || 0,
      reports: caseData.reports?.length || 0
    });
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

          // Calculate tab counts
          calculateTabCounts(formattedCaseData);

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
        onBack={() => navigate(-1)}
        actions={[
          ...(canEdit() ? [
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
          ].filter(Boolean) : []),
          // {
          //   icon: <History fontSize='small' />,
          //   onClick: () => navigate(`/recordhistory/cases/${caseId}`),
          //   styles: 'bg-white rounded-full text-gray-700 border-purple-600'
          // }

        ]}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Top Card - Case Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6 border border-gray-200">
          <div className="bg-gray-100 p-5 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex items-center">
                <div className="bg-gray-300 p-3 rounded-lg mr-4">
                  <Folder className="text-gray-800" />
                </div>
                <div>
                  <div className="text-gray-700 text-sm font-medium uppercase tracking-wide">Case Reference</div>
                  <h1 className="text-xl font-bold text-gray-900">{'#' + caseData.case_id}</h1>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center text-gray-700 px-3 py-2 bg-white rounded">
                  <CalendarToday className="h-4 w-4 mr-2 text-gray-700" />
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

                <div className="bg-gray-200 px-3 py-2 rounded text-gray-800 text-sm font-medium">
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <InfoOutlined className="h-5 w-5 mr-2 text-gray-800" />
                  Case Topic
                </h2>

                {isEditing ? (
                  <input
                    type="text"
                    name="topic"
                    value={editedCase.topic}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                    placeholder="Enter case topic"
                  />
                ) : (
                  <div className="bg-gray-50 p-5 rounded-lg text-gray-800 border border-gray-200">
                    <h3 className="text-xl font-medium">{capitalizeFirstLetter(caseData.topic) || "No topic provided"}</h3>
                  </div>
                )}

                <div className="mt-2">
                  <div className="flex justify-between items-center mb-2">
                    {isEditing && canChangeLeader() && (
                      <span className="text-xs text-blue-600 font-medium">Change Leader</span>
                    )}
                  </div>

                  {isEditing && canChangeLeader() ? (
                    <CustomOfficerDropdown
                      filters={{
                        dropRoles: dropOfficerRoles,
                      }}
                      selectedOfficerId={editedCase.leader_id}
                      onOfficerSelect={handleLeaderChange}
                      className="mb-4"
                      setError={setError}
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
                          className="bg-white border border-gray-200 hover:border-gray-400 shadow-sm"
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
            <TabNavigation
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabCounts={tabCounts}
              neutralMode={true}
            />

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">
                      Case Overview
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <BarChart className="text-gray-800 mr-2" />
                          <h4 className="text-gray-800 font-medium">Case Progress</h4>
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
                              className="bg-gray-800 h-2 rounded-full"
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
                              className="bg-gray-800 h-2 rounded-full"
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
                              className="bg-gray-800 h-2 rounded-full"
                              style={{ width: `${Math.min(100, (caseData.reports?.length || 0) * 25)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Security className="text-gray-800 mr-2" />
                          <h4 className="text-gray-800 font-medium">Offence Information</h4>
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
                    canAddEvidence={canAddEvidence()}
                  />
                )}

                {activeTab === 'investigations' && (
                  <InvestigationsTab
                    caseData={caseData}
                    canAddInvestigation={canAddInvestigation()}
                    formatDate={formatDate}
                  />
                )}

                {activeTab === 'offences' && (
                  <OffencesTab
                    caseData={caseData}
                    canEdit={canEdit()}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    getRiskLevel={getRiskLevel}
                  />
                )}

                {activeTab === 'reports' && (
                  <ReportsTab
                    caseData={caseData}
                    canEdit={canEdit()}
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800 flex items-center">
                  <Person className="h-5 w-5 mr-2 text-gray-800" />
                  Active Officers
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
            {quickActions.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-800 flex items-center">
                    <DeviceHub className="h-5 w-5 mr-2 text-gray-800" />
                    Quick Actions
                  </h2>
                </div>
                <div className="items-center p-6 space-y-3">
                  {quickActions.length > 0 ? (
                    quickActions.map((action, index) => (
                      <div key={index} className="w-full">
                        <OutlinedButton action={action} />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <DeviceHub className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No actions available for your role</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateEvidenceModal
        open={showCreateEvidenceModal}
        onClose={() => setShowCreateEvidenceModal(false)}
        canCreate={canAddEvidence()}
        context="case"
        contextId={caseId}
      />

      <CreateInvestigationModal
        open={showCreateInvestigationModal}
        onClose={() => setShowCreateInvestigationModal(false)}
        canCreate={canAddInvestigation()}
        context="case"
        contextId={caseId}
      />
      <CreateOffenceModal
        open={showCreateOffenceModal}
        onClose={() => setShowCreateOffenceModal(false)}
        canCreate={canAddOffence()}
        context="case"
        contextId={caseId}
      />

      <CreateNoteModal
        open={showCreateNoteModal}
        onClose={() => setShowCreateNoteModal(false)}
        canCreate={canCreateNote()}
        context="case"
        contextId={caseId}
        contextData={caseData}
        dropOfficerRoles={dropOfficerRolesForeNotes}
        allowedOfficerIds={[caseData.leader_id]}
      />

      <StatusPopup
        open={popup.open}
        status={popup.status}
        message={popup.message}
        description={popup.description}
        referenceLink={popup.referenceLink}
        onClose={handlePopupClose}
        okLabel={popup.status === 'success' ? 'Ok' : 'Close'}
      />
    </div>
  );
};

export default SingleCaseView;