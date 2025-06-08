import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from '@mui/icons-material';

const InvestigationTab = ({ evidence }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Investigation</h3>
            {evidence.investigation_id ? (
                <div className="bg-white rounded-lg shadow border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                        <h3 className="text-base font-semibold text-blue-900 flex items-center">
                            <Search className="mr-2 text-blue-600" />
                            Investigation Details
                        </h3>
                    </div>
                    <div className="p-3">
                        <Link
                            to={`/investigations/${evidence.investigation_id}`}
                            className="block hover:bg-gray-50 p-2 rounded-lg transition-colors border border-gray-200 mb-2"
                        >
                            <div className="font-medium text-blue-600 hover:text-blue-800 text-base">
                                {evidence.investigation_topic}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Status: <span className="font-medium">{evidence.investigation_status}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                ID: {evidence.investigation_id}
                            </div>
                        </Link>

                        {evidence.investigation_officers && evidence.investigation_officers.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Investigation Officers</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {evidence.investigation_officers.map(officer => (
                                        <Link
                                            key={officer.user_id}
                                            to={`/officers/${officer.user_id}`}
                                            className="flex items-center bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                                {officer.profile_pic ? (
                                                    <img
                                                        src={officer.profile_pic}
                                                        alt={officer.name}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-gray-600 text-xs font-semibold">
                                                        {officer.name?.charAt(0)?.toUpperCase() || 'O'}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 text-sm">{officer.name}</div>
                                                <div className="text-gray-500 text-xs">{officer.role}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow-sm">
                    No investigation linked to this evidence
                </div>
            )}
        </div>
    );
};

export default InvestigationTab;
