import React from 'react';
import {
    ArrowBack,
    BusinessCenter as Briefcase,
    PersonAdd as UserPlus
} from '@mui/icons-material';
import Breadcrumb from '../navigation/Breadcrumb';

const ComplaintHeader = ({
    complaintId,
    onBack,
    onStartCase,
    onAssignOfficer,
    caseData
}) => {
    const actions = {
        StartCase: { icon: <Briefcase fontSize="small" />, label: 'Start Case', onClick: onStartCase, styles: 'text-blue-700' },
        AssignOfficer: { icon: <UserPlus fontSize="small" />, label: 'Assign Officer', onClick: onAssignOfficer, styles: 'text-green-700' }
    };

    const breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Complaints', link: '/complaints' },
        { label: complaintId.substring(0, 8) }
    ];

    return (
        <div className="bg-white shadow-md sticky top-0 z-10 backdrop-blur-md bg-opacity-90">
            <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-4 py-3">
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
                </div>
            </div>
        </div>
    );
};

export default ComplaintHeader;
