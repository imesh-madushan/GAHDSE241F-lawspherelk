import React, { useState, useEffect } from 'react';
import {
  ArrowBack, Edit, Save, Close, Folder, Assignment,
  Person, CalendarToday, Security, FormatListBulleted,
  Gavel, Attachment, Visibility, VisibilityOff, Add,
  Description, Timeline, DeviceHub, BarChart,
  Cancel
} from '@mui/icons-material';
import { format } from 'date-fns';
import { sampleCase, sampleComplaint, officersList } from './sampleData';
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

const SingleCaseView = ({ case_id }) => {
  const { user } = useAuth();

  const [caseData, setCaseData] = useState(sampleCase);
  const [complaint, setComplaint] = useState(sampleComplaint);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCase, setEditedCase] = useState(sampleCase);
  const [activeTab, setActiveTab] = useState('overview');

  // Check if user is the case leader and can edit
  const canEdit = user.user_id == caseData.leader_id || user.role === "OIC" || user.role === "Crime OIC";
  const canChangeLeader = user.role === "Crime OIC";
  const canAssignOfficers = user.user_id == caseData.leader_id || user.role === "Crime OIC";
  const canUpdateTimeLine = user.user_id == caseData.leader_id || user.role === "Crime OIC" || user.role === "Forrensic Officer";
  const canAddEvidence = user.user_id == caseData.leader_id || user.role === "Crime OIC" || user.role === "Sub Inspector" || user.role === "Sergeant" || user.role === "Police Constable";
  const canAddInvestigation = user.user_id == caseData.leader_id || user.role === "Crime OIC";

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
    } catch (e) {
      return 'N/A';
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
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
    // In a real app, you'd add this officer to the case
    const updatedOfficers = [
      ...caseData.assignedOfficers,
      {
        id: officer.id,
        name: officer.name,
        role: officer.role || "Assigned Officer",
        image: officer.image
      }
    ];

    // Update the case data with the new officer
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

  return (
    <div className="min-h-screen pb-12 bg-gray-50">
      {/* Header with glassmorphism */}
      <CaseHeader
        caseData={caseData}
        isEditing={isEditing}
        actions={actions}
        canEdit={canEdit}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Case ID and Status */}
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

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Case info */}
          <div className="lg:col-span-2">
            {/* Case details card with glassmorphism */}
            <CaseBasicInfo
              caseData={caseData}
              isEditing={isEditing}
              editedCase={editedCase}
              handleInputChange={handleInputChange}
              formatDate={formatDate}
              canChangeLeader={canChangeLeader}
            />

            {/* Tabs navigation */}
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Tab content */}
            <div className="rounded-xl bg-white shadow-md p-6">
              {activeTab === 'overview' && (
                <OverviewTab
                  caseData={caseData}
                  canUpdateTimeLine={canUpdateTimeLine}
                  formatDate={formatDate}
                />
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

          {/* Right sidebar - Related info */}
          <div className="space-y-6">
            {/* Complaint card */}
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

            {/* Assigned officers */}
            <AssignedOfficers
              assignedOfficers={caseData.assignedOfficers}
              allOfficers={officersList}
              canAssign={canAssignOfficers}
              onAssignOfficer={handleAssignOfficer}
            />

            {/* Statistics card */}
            <SidebarCard
              title="Case Statistics"
              icon={<BarChart />}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-blue-600">Evidence Items</p>
                  <p className="text-gray-800 font-bold">{caseData.evidence.length}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-blue-600">Investigations</p>
                  <p className="text-gray-800 font-bold">{caseData.investigations.length}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-blue-600">Reports Generated</p>
                  <p className="text-gray-800 font-bold">{caseData.reports.length}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-blue-600">Days Active</p>
                  <p className="text-gray-800 font-bold">43</p>
                </div>
              </div>
            </SidebarCard>

            {/* Action buttons */}
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