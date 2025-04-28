import React from 'react';
import { format } from 'date-fns';
import {
  Folder,
  Person,
  CalendarToday,
  FactCheck,
  Visibility,
  AssignmentInd,
  Edit,
} from '@mui/icons-material';

import OutlinedButton from './buttons/OutlinedButton'; // import the outlined_button component
import { useAuth } from '../contexts/AuthContext';

const CaseCard = ({ caseData }) => {
  const { user } = useAuth();

  const handleViewClick = () => {
    // set to history push state
    window.history.pushState({}, '', `/cases/${caseData.case_id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
    // 
  }

  const handleUpdateClick = () => {
  }

  const handleReassignClick = () => {
  }

  const actions = {
    view: { icon: <Visibility fontSize='small' />, label: 'View', onClick: handleViewClick },
    update: { icon: <Edit fontSize='small' />, label: 'Update', onClick: handleUpdateClick },
    reassign: { icon: <AssignmentInd fontSize='small' />, label: 'Reassign', onClick: handleReassignClick }
  };

  //mapping for role and actions
  const roleActions = {
    'OIC': [actions.view],
    'Crime OIC': [actions.view, actions.update, actions.reassign],
    'Sub Inspector': [actions.view, actions.update],
    'Sergeant': [actions.view],
  }

  const statusColors = {
    'open': 'bg-green-100 text-green-800 border-green-300',
    'inprogress': 'bg-blue-100 text-blue-800 border-blue-300',
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'closed': 'bg-gray-100 text-gray-800 border-gray-300',
    'critical': 'bg-red-100 text-red-800 border-red-300',
  };

  // format date nicely
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const customIcon = (icon) => {
    return (
      <div className={`flex  mr-2 p-2 rounded-full ${statusColors[caseData.case_status].split(' ')[0]}`}>
        <span className="flex items-center justify-center material-icons text-gray-700 text-base">{icon}</span>
      </div>
    );
  }

  return (
    <div className={`bg-white my-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border-l-16 border-1 ${statusColors[caseData.case_status].split(' ')[2]}`}>
      <div className="p-5">
        {/* header section */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg text-gray-800">{caseData.topic}</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[caseData.status]}`}>
            {caseData.case_status}
          </span>
        </div>

        {/* details section */}
        <div className="mb-4 bg-gray-50 p-3 rounded-lg">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center">
              {customIcon(<Folder fontSize='small' />)}
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="text-sm font-medium">{caseData.case_type}</p>
              </div>
            </div>

            <div className="flex items-center">
              {customIcon(<CalendarToday fontSize='small' />)}
              <div>
                <p className="text-xs text-gray-500">Started</p>
                <p className="text-sm font-medium">{formatDate(caseData.started_dt)}</p>
              </div>
            </div>

            <div className="flex items-center">
              {customIcon(<Person fontSize='small' />)}
              <div>
                <p className="text-xs text-gray-500">Leader</p>
                <p className="text-sm font-medium">{caseData.leader_name}</p>
              </div>
            </div>

            <div className="flex items-center">
              {customIcon(<FactCheck fontSize='small' />)}
              <div>
                <p className="text-xs text-gray-500">Evidence</p>
                <p className="text-sm font-medium">{caseData.evidenceCount || 0} items</p>
              </div>
            </div>
          </div>
        </div>

        {/* action buttons */}
        <div className="flex flex-wrap gap-2 mt-4 pt-1 border-gray-200">
          {roleActions[user.role].map((action, index) => (
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

export default CaseCard;