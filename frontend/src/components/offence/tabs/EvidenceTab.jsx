import React, { useState } from 'react';
import { Assignment, LocationOn, RemoveRedEye } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const EvidenceTab = ({ offence, formatDate, canAddEvidence }) => {
    const [showLinkEvidenceModal, setShowLinkEvidenceModal] = useState(false);
    const evidence = offence?.evidence || [];

    return (
        <div>
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                    Evidence ({evidence.length})
                </h3>
            </div>

            {evidence.length > 0 ? (
                <div className="space-y-4">
                    {evidence.map((item) => (
                        <div
                            key={item.evidence_id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors bg-white"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-start flex-1">
                                    <div className="bg-indigo-100 p-2 rounded-lg mr-3 flex-shrink-0">
                                        <Assignment className="text-indigo-700" fontSize="small" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-900">{item.type}</h4>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {item.evidence_id}
                                            </span>
                                        </div>

                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.details}</p>

                                        <div className="space-y-2">
                                            {item.location && (
                                                <div className="flex items-center text-gray-500 text-sm">
                                                    <LocationOn className="h-4 w-4 mr-1" />
                                                    <span className="truncate">{item.location}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center text-gray-500 text-sm">
                                                <span>Collected by: {item.collected_by || 'Unknown'}</span>
                                                {item.officer_role && (
                                                    <span className="ml-1 text-gray-400">({item.officer_role})</span>
                                                )}
                                            </div>

                                            <div className="flex items-center text-gray-500 text-sm">
                                                <span>{formatDate(item.collected_dt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="ml-3 flex-shrink-0">
                                    <Link
                                        to={`/evidences/${item.evidence_id}`}
                                        className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <RemoveRedEye className="h-4 w-4 mr-1" />
                                        View
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Assignment className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Evidence Found</h3>
                    <p className="text-gray-500 mb-4">No evidence has been linked to this offence yet.</p>
                </div>
            )}

        </div>
    );
};

export default EvidenceTab;
