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
import OfficerCard from './cards/OfficerCard'; // <-- Use the correct OfficerCard import
import { Link } from 'react-router-dom';
import { capitalizeFirstLetter } from '../utils/Preprocessors';

const CaseCard = ({ caseData }) => {
  const { user } = useAuth();
  console.log('CaseCard caseData:', caseData);
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
      <div className={`flex  mr-2 p-2 rounded-full ${statusColors[caseData.case_status]?.split(' ')[0]}`}>
        <span className="flex items-center justify-center material-icons text-gray-700 text-base">{icon}</span>
      </div>
    );
  }

  return (
    <div className={`bg-white my-0 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border-l-16 border-1 ${statusColors[caseData.case_status]?.split(' ')[2]}`}>
      <div className="p-4">
        {/* header section */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <Link to={`/cases/${caseData.case_id}`} className="font-bold text-lg text-gray-800 hover:underline hover:text-blue-900">{capitalizeFirstLetter(caseData.topic)}</Link>
            <div className="text-xs text-gray-500 mb-1">#{caseData.case_id}</div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[caseData.case_status]}`}>
            {caseData.case_status}
          </span>
        </div>

        {/* details section */}
        <div className="mb-1 bg-gray-50 p-3 rounded-lg">
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
              <div>
                {caseData.leader_id ? (
                  <OfficerCard
                    officer={{
                      id: caseData.leader_id,
                      name: caseData.leader_name,
                      role: caseData.leader_role,
                      profilePic: caseData.leader_profile,
                      type: "Case Leader"
                    }}
                    size="small"
                    className="bg-white border border-gray-200 shadow-sm mt-1"
                  />
                ) : (
                  <span className="text-sm text-gray-500">No leader assigned</span>
                )}
              </div>
            </div>

            <div className="flex items-center">
              {customIcon(<FactCheck fontSize='small' />)}
              <div>
                <p className="text-xs text-gray-500">Evidence</p>
                <p className="text-sm font-medium">{caseData.evidence_count || 0} items</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseCard;