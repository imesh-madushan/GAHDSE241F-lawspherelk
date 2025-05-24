import React from 'react';
import { Person, Badge, CalendarToday, Comment } from '@mui/icons-material';
import { format } from 'date-fns';
import OutlinedButton from './buttons/OutlinedButton'; // import the outlined_button component
import { useAuth } from '../contexts/AuthContext';
import {
  Folder,
  Visibility,
  Assignment,
} from '@mui/icons-material';
import OfficerCard from './cards/OfficerCard';
import { Link } from 'react-router-dom';

const ComplaintCard = ({ complaint }) => {
  console.log(complaint);
  const { user } = useAuth();

  const statusColors = {
    'new': {
      badge: 'bg-blue-100 text-blue-600',
      border: 'border-blue-500',
      icon: 'bg-blue-100 text-blue-600'
    },
    'viewed': {
      badge: 'bg-gray-100 text-gray-800',
      border: 'border-gray-500',
      icon: 'bg-gray-100 text-gray-600'
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className={`bg-white rounded-xl my-0 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border-l-4 ${statusColors[complaint.complaint_status].border}`}>
      <div className="p-4">
        {/* header section */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center">
              <Link to={`/complaints/${complaint.complain_id}`} className="font-bold text-lg text-gray-800 hover:text-blue-900 hover:underline">
                {complaint.complain_id ? `#${complaint.complain_id}` : 'Complaint'}
              </Link>
              <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${statusColors[complaint.complaint_status].badge}`}>
                {formatStatus(complaint.complaint_status)}
              </span>
            </div>
            <div className="flex items-center mt-1 text-gray-500">
              <CalendarToday fontSize="small" className="mr-1" />
              <span className="text-xs">{formatDate(complaint.complain_dt)}</span>
            </div>
          </div>
        </div>

        {/* description */}
        <div className="mb-4 bg-gray-50 rounded-lg p-3">
          <div className="flex items-start mb-2">
            <Comment className={`${statusColors[complaint.complaint_status].icon} mr-2 mt-0.5`} fontSize="small" />
            <p className="text-gray-700 text-sm">{complaint.description}</p>
          </div>
        </div>

        {/* Complainer and Officer info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 backdrop-blur-3xl p-2 rounded-lg mb-2">
          <div className="flex items-center">
            <div className={`flex ${statusColors[complaint.complaint_status].icon} p-2 rounded-full mr-3`}>
              <Person fontSize="small" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Complainer</p>
              <p className="text-sm font-medium">{complaint.witness_name}</p>
            </div>
          </div>

          {complaint.officer_name && (
            <OfficerCard
              officer={{
                id: complaint.officer_id,
                name: complaint.officer_name,
                role: complaint.officer_role,
                profilePic: complaint.officer_profile,
                type: "Complaint Writer",
              }}
              size="small"
              className="bg-white border border-gray-200 shadow-sm"
            />
          )}
        </div>

        {/* Metadata tags (optional) */}
        {complaint.tags && (
          <div className="flex flex-wrap gap-2 mb-4">
            {complaint.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintCard;