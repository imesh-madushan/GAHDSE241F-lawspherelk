import React from 'react';
import { Person, Badge, CalendarToday, Comment } from '@mui/icons-material';
import { format } from 'date-fns';
import OutlinedButton from './buttons/OutlinedButton'; // import the outlined_button component

const ComplaintCard = ({ complaint, actions }) => {
  const statusColors = {
    'new': 'bg-red-100 text-red-600 border-blue-300',
    'Under Review': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Assigned': 'bg-green-100 text-green-800 border-green-300',
    'Rejected': 'bg-red-100 text-red-800 border-red-300',
    'Resolved': 'bg-gray-100 text-gray-800 border-gray-300',
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
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border-l-16 border-1 border-indigo-500">
      <div className="p-5">
        {/* header section */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center">
              <h3 className="font-bold text-lg text-gray-800">
                Complaint
              </h3>
              <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${statusColors[complaint.complaint_status]}`}>
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
        <div className="mb-4 bg-indigo-50 rounded-lg p-4">
          <div className="flex items-start mb-2">
            <Comment className="text-indigo-400 mr-2 mt-0.5" fontSize="small" />
            <p className="text-gray-700 text-sm">{complaint.description}</p>
          </div>
        </div>

        {/* Complainer and Officer info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-100 backdrop-blur-3xl  p-3 rounded-lg mb-4">
          <div className="flex items-center">
            <div className="flex bg-indigo-100 p-2 rounded-full mr-3">
              <Person className="text-indigo-600" fontSize="small" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Complainer</p>
              <p className="text-sm font-medium">{complaint.witness_name}</p>
            </div>
          </div>

          {complaint.officer_name && (
            <div className="flex items-center">
              <div className="flex bg-indigo-100 p-2 rounded-full mr-3">
                <Badge className="text-indigo-600" fontSize="small" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Filed By</p>
                <p className="text-sm font-medium">{complaint.officer_name}</p>
              </div>
            </div>
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

        {/* action buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-gray-200">
          {actions.map((action, index) => (
            <OutlinedButton
              key={index} 
              action={action}
            /> 
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;