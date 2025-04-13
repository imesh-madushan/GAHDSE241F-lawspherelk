import React from 'react';

const CaseCard = ({ caseData, actions }) => {
  const statusColors = {
    'Open': 'bg-green-100 text-green-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Closed': 'bg-gray-100 text-gray-800',
    'Critical': 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg">{caseData.topic}</h3>
          <p className="text-gray-600 text-sm">Case #{caseData.case_id.substring(0, 8)}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[caseData.status]}`}>
          {caseData.status}
        </span>
      </div>
      
      <div className="mb-3">
        <p className="text-gray-600 text-sm mb-1">
          <span className="material-icons align-middle mr-1 text-sm">folder</span>
          Type: {caseData.case_type}
        </p>
        <p className="text-gray-600 text-sm mb-1">
          <span className="material-icons align-middle mr-1 text-sm">calendar_today</span>
          Started: {new Date(caseData.started_dt).toLocaleDateString()}
        </p>
        <p className="text-gray-600 text-sm">
          <span className="material-icons align-middle mr-1 text-sm">person</span>
          Leader: {caseData.leader_name}
        </p>
      </div>
      
      <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex items-center text-sm px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
          >
            <span className="material-icons mr-1 text-sm">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CaseCard;