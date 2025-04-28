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

const ComplaintCard = ({ complaint }) => {
  const { user } = useAuth();

  const statusColors = {
    'new': 'bg-red-100 text-red-600 border-blue-300',
    'viewed': 'bg-gray-100 text-gray-800 border-gray-300'
  };

  const actions = {
    view: { icon: <Visibility fontSize='small' />, label: 'View', onClick: () => { } },
    assign: { icon: <Assignment fontSize='small' />, label: 'Assign', onClick: () => { } },
    createCase: { icon: <Folder fontSize='small' />, label: 'Create Case', onClick: () => { } }
  }

  //mapping for roles and cases
  const roleActions = {
    'OIC': [actions.view],
    'Crime OIC': [actions.view, actions.assign, actions.createCase],
    'Sub Inspector': [actions.view],
  }

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

    return(
    <div className = "bg-white rounded-xl my-4 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border-l-16 border-1 border-indigo-500" >
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
            {roleActions[user.role].map((action, index) => (
              <OutlinedButton
                key={index}
                action={action}
              />
            ))}
          </div>
        </div>
    </div >
  );
};

export default ComplaintCard;