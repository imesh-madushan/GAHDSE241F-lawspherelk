import React from 'react';
import { Gavel, CalendarMonth, AccessTime, Description } from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const CasesTab = ({ data }) => {
    const navigate = useNavigate();

    const formatDate = (dateString) => format(new Date(dateString), 'dd MMM yyyy');
    const formatTime = (dateString) => format(new Date(dateString), 'hh:mm a');

    const getStatusBadge = (status) => {
        let bgColor, textColor;
        switch (status?.toLowerCase()) {
            case 'inprogress':
                bgColor = 'bg-blue-100';
                textColor = 'text-blue-700';
                break;
            case 'completed':
                bgColor = 'bg-green-100';
                textColor = 'text-green-700';
                break;
            case 'pending':
                bgColor = 'bg-yellow-100';
                textColor = 'text-yellow-700';
                break;
            default:
                bgColor = 'bg-gray-100';
                textColor = 'text-gray-700';
        }
        return (
            <span className={`${bgColor} ${textColor} text-xs px-2 py-1 rounded-full`}>
                {status}
            </span>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Case Records</h3>
            </div>

            {data && data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.map((caseItem) => (
                        <div key={caseItem.case_id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-gray-50 rounded-lg mr-3">
                                            <Gavel className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{caseItem.topic}</h4>
                                            <p className="text-sm text-gray-500">ID: {caseItem.case_id}</p>
                                        </div>
                                    </div>
                                    {getStatusBadge(caseItem.status)}
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Type</div>
                                        <p className="text-sm text-gray-700">{caseItem.case_type}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Start Date</div>
                                            <div className="flex items-center text-sm">
                                                <CalendarMonth className="mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                                <span>{formatDate(caseItem.started_dt)}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">End Date</div>
                                            <div className="flex items-center text-sm">
                                                <AccessTime className="mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                                <span>{caseItem.end_dt ? formatDate(caseItem.end_dt) : 'Ongoing'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {caseItem.complaint_description && (
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Complaint Description</div>
                                            <p className="text-sm text-gray-700 line-clamp-2">{caseItem.complaint_description}</p>
                                        </div>
                                    )}

                                    <div className="pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => navigate(`/cases/${caseItem.case_id}`)}
                                            className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
                                        >
                                            <Description className="mr-2" style={{ fontSize: '1rem' }} />
                                            View Case Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500">No case records found</p>
                </div>
            )}
        </div>
    );
};

export default CasesTab;