import React from 'react';
import { Add, CalendarToday, Folder } from '@mui/icons-material';
import OutlinedButton from '../../buttons/OutlinedButton';

const InvestigationsTab = ({ caseData, canAddInvestigation, formatDate }) => {
  const actions = {
    Add: { icon: <Add fontSize='small' />, label: 'Add Investigation', onClick: () => { }, styles: 'text-blue-600 bg-blue-50' },
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Investigations</h3>
        {canAddInvestigation && (
          <OutlinedButton
            action={actions.Add}
          />
        )}
      </div>

      <div className="space-y-4">
        {caseData.investigations.map((investigation, index) => (
          <div key={index} className="rounded-lg bg-white p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-800">{investigation.topic}</h4>
              <span className={`px-2 py-1 text-xs rounded-md ${investigation.status === 'Completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
                } font-medium`}>
                {investigation.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <p className="flex items-center">
                <CalendarToday fontSize="small" className="mr-1 text-blue-600" />
                Start: {formatDate(investigation.start_dt)}
              </p>
              <p className="flex items-center">
                <Folder fontSize="small" className="mr-1 text-blue-600" />
                Location: {investigation.location}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvestigationsTab;
