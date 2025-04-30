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
    witness_name: ''
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

  const actions = {
    Edit: { icon: <Edit fontSize='small' />, label: 'Edit Case', onClick: handleEditToggle, styles: 'text-blue-700' },
    Cancel: { icon: <Cancel fontSize='small' />, label: 'Cancel', onClick: handleCancelEdit, styles: 'text-red-700' },
    Save: { icon: <Save fontSize='small' />, label: 'Save', onClick: handleSaveChanges, styles: 'text-green-700' },
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

          if (data.caseData.complain_id) {
            setComplaint({
              complain_id: data.caseData.complain_id,
              complain_dt: data.caseData.complain_dt,
              description: data.caseData.complaint_description || 'No description available',
              witness_name: 'Complainant'
            });
          }

          console.log('Case data fetched successfully:', formattedCaseData);
        }

        // try {
        //   const officersResponse = await apiClient.get('/users/officers');
        //   if (officersResponse.data && officersResponse.data.officers) {
        //     setAllOfficers(officersResponse.data.officers);
        //   }
        // } catch (error) {
        //   console.error('Error fetching officers:', error);
        // }
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
                // <OverviewTab
                //   caseData={caseData}
                //   canUpdateTimeLine={canUpdateTimeLine}
                //   formatDate={formatDate}
                // />
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
            <SidebarCard
              title="Related Complaint"
              icon={<Assignment />}
            >
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-blue-600">Complaint ID</p>
                  <p className="text-gray-800 font-mono">{complaint.complain_id}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Filed On</p>
                  <p className="text-gray-800">{formatDate(complaint.complain_dt)}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Complainer</p>
                  <p className="text-gray-800">{complaint.witness_name}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Description</p>
                  <p className="text-gray-800 text-sm">{complaint.description}</p>
                </div>
                <div className="pt-2">
                  <button className="w-full text-blue-600 hover:text-blue-800 text-sm py-2 border border-blue-500 rounded-md flex items-center justify-center hover:bg-blue-50 transition-colors">
                    <Visibility fontSize="small" className="mr-1" />
                    View Full Complaint
                  </button>
                </div>
              </div>
            </SidebarCard>

            <AssignedOfficers
              assignedOfficers={caseData.assignedOfficers}
              allOfficers={allOfficers}
              canAssign={canAssignOfficers}
              onAssignOfficer={handleAssignOfficer}
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