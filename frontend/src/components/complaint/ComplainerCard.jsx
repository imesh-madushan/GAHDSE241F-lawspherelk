import React from 'react';
import { 
  Person as User, 
  CalendarToday, 
  Phone, 
  LocationOn as MapPin 
} from '@mui/icons-material';

const ComplainerCard = ({ complainer, formatDate }) => {
  if (!complainer) {
    return (
      <div className="bg-white shadow-md rounded-lg p-5 mb-6">
        <h2 className="text-md font-semibold mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-blue-800" />
          Complainant Details
        </h2>
        <p className="text-gray-500 text-sm italic">No complainant details available</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-5 mb-6">
      <h2 className="text-md font-semibold mb-4 flex items-center">
        <User className="h-5 w-5 mr-2 text-blue-800" />
        Complainant Details
      </h2>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
          <p className="text-gray-800 font-medium">{complainer.name}</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">NIC</label>
          <p className="text-gray-800">{complainer.nic}</p>
        </div>

        {complainer.phone && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Contact</label>
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-gray-500 mr-2" />
              <p className="text-gray-800">{complainer.phone}</p>
            </div>
          </div>
        )}

        {complainer.dob && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label>
            <div className="flex items-center">
              <CalendarToday className="h-4 w-4 text-gray-500 mr-2" />
              <p className="text-gray-800">{formatDate(complainer.dob)}</p>
            </div>
          </div>
        )}

        {complainer.address && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
            <div className="flex items-start">
              <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
              <p className="text-gray-800">{complainer.address}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplainerCard;
