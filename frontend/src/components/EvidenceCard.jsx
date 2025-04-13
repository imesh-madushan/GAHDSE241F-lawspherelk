import React from 'react';

const EvidenceCard = ({ evidence, actions }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-md">Evidence #{evidence.evidence_id.substring(0, 8)}</h3>
          <p className="text-gray-600 text-sm">Type: {evidence.type}</p>
        </div>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {evidence.status}
        </span>
      </div>
      
      <div className="mb-3">
        <p className="text-sm text-gray-700">{evidence.details}</p>
      </div>
      
      <div className="mb-3">
        <p className="text-gray-600 text-sm mb-1">
          <span className="material-icons align-middle mr-1 text-sm">place</span>
          Location: {evidence.location}
        </p>
        <p className="text-gray-600 text-sm mb-1">
          <span className="material-icons align-middle mr-1 text-sm">person</span>
          Collected by: {evidence.officer_name}
        </p>
        {evidence.case_id && (
          <p className="text-gray-600 text-sm">
            <span className="material-icons align-middle mr-1 text-sm">folder</span>
            Case: #{evidence.case_id.substring(0, 8)}
          </p>
        )}
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

export default EvidenceCard;