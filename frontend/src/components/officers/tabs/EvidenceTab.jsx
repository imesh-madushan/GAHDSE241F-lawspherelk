import React from 'react';
import { Fingerprint, Description, LocationOn } from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const EvidenceTab = ({ data }) => {
    const navigate = useNavigate();
    const formatDate = (dateString) => format(new Date(dateString), 'dd MMM yyyy');

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Evidence Records</h3>
            </div>

            {data && data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.map((evidence) => (
                        <div key={evidence.evidence_id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-gray-50 rounded-lg mr-3">
                                            <Fingerprint className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Evidence #{evidence.evidence_id}</h4>
                                            <p className="text-sm text-gray-500">Collected on {formatDate(evidence.collected_dt)}</p>
                                        </div>
                                    </div>
                                    <span className="flex text-center items-center bg-gray-100 text-gray-700 text-[0.63rem] px-3 py-1 rounded-full font-medium">
                                        {evidence.type}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {evidence.details && (
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Details</div>
                                            <p className="text-sm text-gray-700 line-clamp-3">{evidence.details}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center text-sm text-gray-600">
                                        <LocationOn className="mr-1 text-gray-400" style={{ fontSize: '1rem' }} />
                                        <span>{evidence.location}</span>
                                    </div>

                                    {evidence.investigation_topic && (
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Related Investigation</div>
                                            <p className="text-sm text-gray-700">{evidence.investigation_topic}</p>
                                        </div>
                                    )}

                                    {evidence.case_topic && (
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Related Case</div>
                                            <p className="text-sm text-gray-700">{evidence.case_topic}</p>
                                        </div>
                                    )}

                                    {evidence.witnesses && (
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Witnesses</div>
                                            <p className="text-sm text-gray-700 line-clamp-1">{evidence.witnesses}</p>
                                        </div>
                                    )}

                                    <div className="pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => navigate(`/evidence/${evidence.evidence_id}`)}
                                            className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
                                        >
                                            <Description className="mr-2" style={{ fontSize: '1rem' }} />
                                            View Evidence Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500">No evidence records found</p>
                </div>
            )}
        </div>
    );
};

export default EvidenceTab;