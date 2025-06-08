import React from 'react';
import { Link } from 'react-router-dom';
import { Assignment } from '@mui/icons-material';

const RelatedEvidenceTab = ({ evidence, formatDateTime }) => {
    return (
        <div>
            <h3 className="text-base font-semibold text-gray-800 mb-3">Related Evidence</h3>
            {evidence.related_evidence && evidence.related_evidence.length > 0 ? (
                <div className="space-y-2">
                    {evidence.related_evidence.map(relatedEvidence => (
                        <div key={relatedEvidence.evidence_id} className="bg-white rounded-lg shadow border border-gray-200">
                            <Link
                                to={`/evidences/${relatedEvidence.evidence_id}`}
                                className="block hover:bg-gray-50 p-3 rounded-lg transition-colors"
                            >
                                <div className="flex items-start">
                                    <div className="bg-green-100 p-1 rounded-full mr-3">
                                        <Assignment className="text-green-600" fontSize="small" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-blue-600 hover:text-blue-800 text-base">
                                            {relatedEvidence.evidence_id}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Type: <span className="font-medium">{relatedEvidence.type}</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Collected: <span className="font-medium">{formatDateTime(relatedEvidence.collected_dt)}</span>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            By: {relatedEvidence.collected_by}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-4 text-gray-500 bg-white rounded-lg shadow">
                    No related evidence found
                </div>
            )}
        </div>
    );
};

export default RelatedEvidenceTab;
