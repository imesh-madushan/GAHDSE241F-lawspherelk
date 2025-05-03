import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowBack, Edit, Save, Close, Folder, Assignment,
  Person, CalendarToday, Security, FormatListBulleted,
  Gavel, Attachment, Visibility, VisibilityOff, Add,
  Description, Timeline, DeviceHub, BarChart,
  Cancel
} from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import { format } from 'date-fns';
import CaseHeader from '../../components/case/CaseHeader';
import CaseBasicInfo from '../../components/case/CaseBasicInfo';
import TabNavigation from '../../components/case/TabNavigation';
import OverviewTab from '../../components/case/tabs/OverviewTab';
import EvidenceTab from '../../components/case/tabs/EvidenceTab';
import InvestigationsTab from '../../components/case/tabs/InvestigationsTab';
import ReportsTab from '../../components/case/tabs/ReportsTab';
import OffencesTab from '../../components/case/tabs/OffencesTab';
import SidebarCard from '../../components/cards/SidebarCard';
import CaseComplaintCard from '../../components/case/CaseComplaintCard';
import StatusBadge from '../../components/badges/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import AssignedOfficers from '../../components/case/AssignedOfficers';

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

          console.log('Case data fetched successfully:', formattedCaseData);
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
      <CaseHeader
        caseData={caseData}
        isEditing={isEditing}
        actions={actions}
        canEdit={canEdit}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Folder className="text-amber-500 mr-2" />
            <div>
              <p className="text-sm text-gray-700">Case Reference</p>
              <p className="font-mono text-gray-500">{caseData.case_id}</p>
            </div>
          </div>

          <StatusBadge status={caseData.status} isEditing={isEditing} editedCase={editedCase} handleInputChange={handleInputChange} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CaseBasicInfo
              caseData={caseData}
              isEditing={isEditing}
              editedCase={editedCase}
              handleInputChange={handleInputChange}
              formatDate={formatDate}
              canChangeLeader={canChangeLeader}
            />

            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="rounded-xl bg-white shadow-md p-6">
              {activeTab === 'overview' && (
                <div>this is overvire tab </div>
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

          <div className="space-y-6">
            <CaseComplaintCard
              complaint={complaint}
              formatDate={formatDate}
              onViewFullComplaint={handleViewFullComplaint}
            />

            <AssignedOfficers
              assignedOfficers={allOfficers}
            />

            <SidebarCard
              title="Case Statistics"
              icon={<BarChart />}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-blue-600">Evidence Items</p>
                  <p className="text-gray-800 font-bold">{caseData.evidence?.length || 0}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-blue-600">Investigations</p>
                  <p className="text-gray-800 font-bold">{caseData.investigations?.length || 0}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-blue-600">Reports Generated</p>
                  <p className="text-gray-800 font-bold">{caseData.reports?.length || 0}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-blue-600">Days Active</p>
                  <p className="text-gray-800 font-bold">
                    {caseData.started_dt ?
                      Math.ceil((new Date() - new Date(caseData.started_dt)) / (1000 * 60 * 60 * 24)) :
                      'N/A'}
                  </p>
                </div>
              </div>
            </SidebarCard>

            <SidebarCard
              title="Quick Actions"
            >
              <div className="space-y-2">
                <button className="w-full py-2 text-sm bg-blue-600 hover:bg-blue-700 transition-colors rounded-md text-white flex items-center justify-center">
                  <Assignment className="mr-2" fontSize="small" />
                  Create New Report
                </button>
                {canAddInvestigation && (
                  <button className="w-full py-2 text-sm bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-md text-white flex items-center justify-center">
                    <FormatListBulleted className="mr-2" fontSize="small" />
                    Add Investigation Task
                  </button>
                )}
                {canEdit && (
                  <button className="w-full py-2 text-sm bg-green-600 hover:bg-green-700 transition-colors rounded-md text-white flex items-center justify-center">
                    <Gavel className="mr-2" fontSize="small" />
                    Register Offence
                  </button>
                )}
                {(user.role === "OIC" || user.role === "Crime OIC") && (
                  <button className="w-full py-2 text-sm bg-red-600 hover:bg-red-700 transition-colors rounded-md text-white flex items-center justify-center">
                    <Close className="mr-2" fontSize="small" />
                    Close Case
                  </button>
                )}
              </div>
            </SidebarCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleCaseView;