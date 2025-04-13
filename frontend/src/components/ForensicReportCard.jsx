import React from 'react';

const ForensicReportCard = ({ report, actions }) => {
  const statusColors = {
    'Requested': 'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-md">Report #{report.report_id.substring(0, 8)}</h3>
          <p className="text-gray-600 text-sm">Type: {report.analysis_type}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
          {report.status}
        </span>
      </div>
      
      <div className="mb-3">
        <p className="text-gray-600 text-sm mb-1">
          <span className="material-icons align-middle mr-1 text-sm">event</span>
          Requested: {new Date(report.requested_dt).toLocaleDateString()}
        </p>
        {report.start_dt && (
          <p className="text-gray-600 text-sm mb-1">
            <span className="material-icons align-middle mr-1 text-sm">play_arrow</span>
            Started: {new Date(report.start_dt).toLocaleDateString()}
          </p>
        )}
        {report.end_dt && (
          <p className="text-gray-600 text-sm mb-1">
            <span className="material-icons align-middle mr-1 text-sm">check_circle</span>
            Completed: {new Date(report.end_dt).toLocaleDateString()}
          </p>
        )}
        <p className="text-gray-600 text-sm">
          <span className="material-icons align-middle mr-1 text-sm">science</span>
          Evidence: #{report.evidence_id.substring(0, 8)}
        </p>
      </div>
      
      {report.result && (
        <div className="mb-3 bg-gray-50 p-2 rounded">
          <p className="text-sm font-medium mb-1">Results:</p>
          <p className="text-sm text-gray-700">{report.result}</p>
        </div>
      )}
      
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

export default ForensicReportCard;