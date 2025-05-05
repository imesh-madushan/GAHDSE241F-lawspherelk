import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowBack,
    Edit,
    BusinessCenter as Briefcase,
    PersonAdd as UserPlus
} from '@mui/icons-material';
import Breadcrumb from '../navigation/Breadcrumb';

const ComplaintHeader = ({
    complaintId,
    onBack,
    canStartCase,
    canAssignOfficer,
    onStartCase,
    onAssignOfficer
}) => {

    const breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Complaints', link: '/complaints' },
        { label: complaintId.substring(0, 8) }
    ];

    return (
        <div className="bg-white shadow-md sticky top-0 z-10 backdrop-blur-md bg-opacity-90">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-3">
                {/* Breadcrumb */}
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center">
                        <button
                            onClick={onBack}
                            className="flex mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ArrowBack />
                        </button>
                        <h1 className="text-xl font-bold text-gray-800">
                            Complaint Details
                        </h1>
                    </div>
                    <div className="flex items-center space-x-3">
                        {canStartCase && (
                            <button
                                onClick={onStartCase}
                                className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 flex items-center"
                            >
                                <Briefcase className="h-4 w-4 mr-2" fontSize="small" />
                                Start Case
                            </button>
                        )}

                        {canAssignOfficer && (
                            <button
                                onClick={onAssignOfficer}
                                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 flex items-center"
                            >
                                <UserPlus className="h-4 w-4 mr-2" fontSize="small" />
                                Assign Officer
                            </button>
                        )}

                        <Link
                            to={`/complaints/${complaintId}/edit`}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 flex items-center"
                        >
                            <Edit className="h-4 w-4 mr-2" fontSize="small" />
                            Edit
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintHeader;
