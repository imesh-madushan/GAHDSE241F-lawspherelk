import React from 'react';
import {
    Star,
    Shield,
    CalendarMonth,
    Mail,
    Phone,
    Map as MapPin,
    AccessTime,
    Lock,
    LockOpen
} from '@mui/icons-material';

const OfficerBasicInfo = ({ officer, formatDate, calculateServiceDuration, currentUserRole, handleToggleAccount }) => {
    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Profile Image & Basic Info */}
            <div className="flex flex-col items-center lg:w-1/4">
                <div className="relative">
                    <div className="h-48 w-48 rounded-full overflow-hidden border-4 border-blue-600 shadow-lg">
                        <img
                            src={officer.profile_pic || "https://via.placeholder.com/150"}
                            alt={officer.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2">
                        <Shield fontSize="medium" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold mt-4 text-center">{officer.name}</h1>
                <div className="flex items-center mt-2 text-gray-600">
                    <Star className="h-5 w-5 text-blue-600 mr-1" />
                    <span className="font-medium">{officer.role}</span>
                </div>
            </div>

            {/* Officer Details */}
            <div className="flex-1 lg:w-3/4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Phone className="h-5 w-5 mr-2 text-blue-600" />
                            Contact Information
                        </h2>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <Mail className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{officer.email}</p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <Phone className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium">{officer.phone}</p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <MapPin className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="font-medium">{officer.address}</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Service Information */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Shield className="h-5 w-5 mr-2 text-blue-600" />
                            Service Information
                        </h2>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <AccessTime className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Joined</p>
                                    <p className="font-medium">{formatDate(officer.created_dt)}</p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <CalendarMonth className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Service Duration</p>
                                    <p className="font-medium">{calculateServiceDuration(officer.created_dt)}</p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <Shield className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Department</p>
                                    <p className="font-medium">
                                        {officer.role === 'Crime OIC' ? 'Crime Division' :
                                            officer.role === 'OIC' ? 'Administration' :
                                                officer.role === 'Forensic Officer' ? 'Forensic Department' : 'Field Operations'}
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfficerBasicInfo;