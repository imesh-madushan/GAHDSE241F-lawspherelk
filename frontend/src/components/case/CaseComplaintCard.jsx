import React from 'react';
import { Assignment, Visibility, CalendarToday, Notes, Circle } from '@mui/icons-material';
import SidebarCard from '../cards/SidebarCard';
import OfficerCard from '../cards/OfficerCard';
import StatusBadge from '../badges/StatusBadge';
import { complainStatusList } from '../../../data';

const CaseComplaintCard = ({ complaint, formatDate, onViewFullComplaint }) => {
  // Create an officer object from complaint data for OfficerCard
  const complaintOfficer = complaint?.officer_id ? {
    id: complaint.officer_id,
    name: complaint.officer_name || 'Unknown Officer',
    role: complaint.officer_role || 'Officer',
    profilePic: complaint.officer_profile,
    type: 'Complaint Handler'
  } : null;

  // Handle empty complaint data gracefully
  if (!complaint || Object.keys(complaint).length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-amber-50 px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 flex items-center">
            <Assignment className="h-5 w-5 mr-2 text-amber-600" />
            Related Complaint
          </h2>
        </div>
        <div className="p-6 text-center text-gray-500">
          <p className="text-sm">No complaint data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-amber-50 px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800 flex items-center">
          <Assignment className="h-5 w-5 mr-2 text-amber-600" />
          Related Complaint
        </h2>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-amber-100 p-1.5 rounded mr-3">
              <Assignment className="text-amber-700 h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500">Complaint ID</span>
              <p className="font-mono text-sm font-medium">{complaint.complain_id}</p>
            </div>
          </div>

          <StatusBadge status={complaint.complaint_status} statusList={complainStatusList} />
        </div>

        <div className="mb-4 flex items-center text-gray-500 text-sm">
          <CalendarToday className="h-4 w-4 mr-2" />
          <span>{formatDate(complaint.complain_dt)}</span>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex items-start mb-2">
            <Notes className="text-gray-400 h-4 w-4 mt-0.5 mr-2" />
            <span className="text-xs font-medium text-gray-500">DESCRIPTION</span>
          </div>
          <p className="text-gray-700 text-sm whitespace-pre-wrap">
            {complaint.description || 'No description provided'}
          </p>
        </div>

        {complaintOfficer && (
          <div className="mb-4">
            <OfficerCard
              officer={complaintOfficer}
              size="small"
              className="bg-white/60 border border-gray-100 hover:border-blue-200 shadow-sm"
            />
          </div>
        )}

        <button
          onClick={onViewFullComplaint}
          className="w-full mt-2 text-blue-600 hover:text-white hover:bg-blue-600 text-sm py-2 px-4 border border-blue-200 rounded-lg flex items-center justify-center transition-colors duration-200"
        >
          <Visibility fontSize="small" className="mr-2" />
          View Full Complaint
        </button>
      </div>
    </div>
  );
};

export default CaseComplaintCard;
