import React from 'react';
import { Assignment, Visibility } from '@mui/icons-material';
import SidebarCard from '../cards/SidebarCard';
import OfficerCard from '../cards/OfficerCard';

const CaseComplaintCard = ({ complaint, formatDate, onViewFullComplaint }) => {
  // Create an officer object from complaint data for OfficerCard
  const complaintOfficer = complaint.officer_id ? {
    id: complaint.officer_id,
    name: complaint.officer_name || 'Unknown Officer',
    role: complaint.officer_role || 'Officer',
    profilePic: complaint.officer_profile,
    type: 'Complaint Receiver'
  } : null;

  return (
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
          <p className="text-xs text-blue-600">Status</p>
          <p className="text-gray-800">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${complaint.status === 'closed' ? 'bg-green-100 text-green-800' :
                complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
              }`}>
              {complaint.status}
            </span>
          </p>
        </div>

        {complaintOfficer && (
          <div className="border-t pt-3 mt-2">
            <p className="text-xs text-blue-600 mb-2">Handled By Officer</p>
            <OfficerCard
              officer={complaintOfficer}
              size="small"
              showViewButton={false}
              className="bg-white"
            />
          </div>
        )}

        <div>
          <p className="text-xs text-blue-600">Description</p>
          <p className="text-gray-800 text-sm">{complaint.description}</p>
        </div>
        <div className="pt-2">
          <button
            onClick={onViewFullComplaint}
            className="w-full text-blue-600 hover:text-blue-800 text-sm py-2 border border-blue-500 rounded-md flex items-center justify-center hover:bg-blue-50 transition-colors"
          >
            <Visibility fontSize="small" className="mr-1" />
            View Full Complaint
          </button>
        </div>
      </div>
    </SidebarCard>
  );
};

export default CaseComplaintCard;
