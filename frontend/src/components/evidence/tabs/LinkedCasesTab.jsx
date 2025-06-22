import React from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen } from '@mui/icons-material';

const LinkedCasesTab = ({ evidence }) => {
    return (
        <div>
            <h3 className="text-base font-semibold text-gray-800 mb-3">Linked Cases</h3>
            {evidence.linked_cases && evidence.linked_cases.length > 0 ? (
                <div className="space-y-2">
                    {evidence.linked_cases.map(caseItem => (
                        <div key={caseItem.case_id} className="bg-white rounded-lg shadow border border-gray-200">
                            <Link
                                to={`/cases/${caseItem.case_id}`}
                                className="block hover:bg-gray-50 p-3 rounded-lg transition-colors"
                            >
                                <div className="flex items-start">
                                    <div className="bg-gray-200 p-1 rounded-full mr-3">
                                        <FolderOpen className="text-gray-600" fontSize="small" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-800 hover:text-gray-900 text-base">
                                            {caseItem.case_topic || 'Untitled Case'}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Type: <span className="font-medium">{caseItem.case_type}</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Status: <span className={`font-medium ${caseItem.case_status === 'inprogress' ? 'text-orange-600' :
                                                caseItem.case_status === 'closed' ? 'text-green-600' :
                                                    caseItem.case_status === 'oicrejected' ? 'text-red-600' :
                                                        'text-gray-600'
                                                }`}>
                                                {caseItem.case_status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            ID: {caseItem.case_id}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-4 text-gray-500 bg-white rounded-lg shadow">
                    No linked cases found for this evidence
                </div>
            )}
        </div>
    );
};

export default LinkedCasesTab;
