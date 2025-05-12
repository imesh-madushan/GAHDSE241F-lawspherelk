import React from 'react';
import { Add, Fingerprint, PhotoCamera, Description, LocationOn, AccessTime, CalendarMonth, Badge } from '@mui/icons-material';
import OutlinedButton from '../../buttons/OutlinedButton';

const EvidenceTab = ({ evidence, formatDate, formatTime, isEditing }) => {
    const getEvidenceIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'fingerprint':
                return <Fingerprint className="text-blue-600" />;
            case 'cctv footage':
                return <PhotoCamera className="text-purple-600" />;
            default:
                return <Description className="text-gray-600" />;
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Evidence Records</h3>
                {isEditing && (
                    <OutlinedButton
                        icon={<Add />}
                        label="Add Evidence"
                        onClick={() => console.log('Add evidence clicked')}
                    />
                )}
            </div>

            {evidence && evidence.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {evidence.map((item) => (
                        <div key={item.evidence_id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-gray-50 rounded-lg mr-3">
                                            {getEvidenceIcon(item.type)}
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
                                        <div className="flex items-center bg-gray-50 rounded-lg p-3">
                                            <img
                                                src={item.officer_profile}
                                                alt="Officer"
                                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                            />
                                            <div className="ml-3">
                                                <div className="flex items-center">
                                                    <Badge className="text-gray-400 mr-1" style={{ fontSize: '0.9rem' }} />
                                                    <span className="text-sm font-medium text-gray-700">{item.officer_role}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">Evidence Collector</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500">No evidence records found</p>
                    {isEditing && (
                        <p className="text-sm text-gray-400 mt-2">Click "Add Evidence" to register new evidence</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default EvidenceTab; 