import {
  Person,
  Badge,
} from '@mui/icons-material';

const ComplaintCard = ({ complaint, actions }) => {
    const statusColors = {
      'new': 'bg-blue-100 text-blue-800',
      'Under Review': 'bg-yellow-100 text-yellow-800',
      'Assigned': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Resolved': 'bg-gray-100 text-gray-800',
    };
  
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-grow">
            <h3 className="font-bold text-md">{`Complaint #${complaint.complain_id.substring(0, 8)}`}</h3>
            <p className="text-gray-600 text-sm">
              {new Date(complaint.complain_dt).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[complaint.complaint_status]}`}>
            {complaint.complaint_status.charAt(0).toUpperCase() + complaint.complaint_status.slice(1)}
          </span>
        </div>
        
        <div className="mb-3">
          <p className="text-sm text-gray-700 line-clamp-2">{complaint.description}</p>
        </div>
        
        <div className="mb-3">
          <div className="flex items-center text-gray-600 text-sm mb-1">
            <Person className="material-icons align-middle mr-1 text-sm"/>
            <p className=''>Complainer: {complaint.witness_name}</p>
          </div>
          {complaint.officer_name && (
            <div className="flex items-center text-gray-600 text-sm">
              <Badge className="material-icons align-middle mr-1 text-sm"/>
              <p>Filled By: {complaint.officer_name}</p>
            </div>
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
  
  export default ComplaintCard;