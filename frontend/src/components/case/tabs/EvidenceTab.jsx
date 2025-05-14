import React from 'react';
import { Add, Fingerprint, Description, LocationOn, CalendarMonth, AccessTime } from '@mui/icons-material';
import { format } from 'date-fns';
import OutlinedButton from '../../buttons/OutlinedButton';
import OfficerCard from '../../cards/OfficerCard';

const EvidenceTab = ({ caseData, canAddEvidence }) => {
    const actions = {
        Add: { icon: <Add fontSize='small' />, label: 'Add Evidance', onClick: () => { }, styles: 'text-blue-600 bg-blue-50' },
    };

    const formatDate = (dateString) => format(new Date(dateString), 'dd MMM yyyy');
    const formatTime = (dateString) => format(new Date(dateString), 'hh:mm a');

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Evidence Records</h3>
                {canAddEvidence && (
                    <OutlinedButton
                        action={actions.Add}
                    />
                )}
            </div>

            {caseData.evidence && caseData.evidence.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {caseData.evidence.map((item, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-gray-50 rounded-lg mr-3">
                                            {item.type === 'fingerprint' ? <Fingerprint className="text-blue-600" /> : <Description className="text-gray-600" />}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{item.type}</h4>
                                            <p className="text-sm text-gray-500">ID: {item.evidence_id}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Details</div>
                                        <p className="text-sm text-gray-700">{item.details}</p>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-600">
                                        <LocationOn className="mr-1 text-gray-400" style={{ fontSize: '1rem' }} />
                                        <span>{item.location}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Collected Date</div>
                                            <div className="flex items-center text-sm">
                                                <CalendarMonth className="mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                                <span>{formatDate(item.collected_dt)}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Collected Time</div>
                                            <div className="flex items-center text-sm">
                                                <AccessTime className="mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                                <span>{formatTime(item.collected_dt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Officer Card */}
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="text-xs text-gray-500 mb-2">Collected By</div>
                                        <OfficerCard
                                            officer={{
                                                name: item.collected_by,
                                                role: item.officer_role,
                                                profilePic: item.officer_profile
                                            }}
                                            size="small"
                                            className="bg-gray-50 p-3"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500">No evidence records found</p>
                    {canAddEvidence && (
                        <p className="text-sm text-gray-400 mt-2">Click "Add Evidence" to register new evidence</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default EvidenceTab;
