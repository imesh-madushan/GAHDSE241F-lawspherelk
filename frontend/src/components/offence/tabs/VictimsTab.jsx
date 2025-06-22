import React, { useState } from 'react';
import { Person, Phone, LocationOn, Badge, CalendarToday } from '@mui/icons-material';
import CreateVictimModal from '../../modals/CreateVictimModal';
import { format } from 'date-fns';

const VictimsTab = ({ offence, formatDate, canAddVictim }) => {
    const [showCreateVictimModal, setShowCreateVictimModal] = useState(false);
    const victims = offence?.victims || [];

    const formatDateOnly = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch (e) {
            return 'N/A';
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                    Victims ({victims.length})
                </h3>
            </div>

            {victims.length > 0 ? (
                <div className="grid gap-4">
                    {victims.map((victim, index) => (
                        <div
                            key={`${victim.nic}_${index}`}
                            className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors bg-white"
                        >
                            <div className="flex items-start">
                                <div className="bg-red-100 p-2 rounded-lg mr-3 flex-shrink-0">
                                    <Person className="text-red-700" fontSize="small" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-gray-900 text-lg">{victim.name}</h4>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            NIC: {victim.nic}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {victim.phone && (
                                            <div className="flex items-center text-gray-600">
                                                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                                <span className="text-sm">{victim.phone}</span>
                                            </div>
                                        )}

                                        {victim.dob && (
                                            <div className="flex items-center text-gray-600">
                                                <CalendarToday className="h-4 w-4 mr-2 text-gray-400" />
                                                <span className="text-sm">DOB: {formatDateOnly(victim.dob)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {victim.address && (
                                        <div className="mt-3 flex items-start text-gray-600">
                                            <LocationOn className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{victim.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Person className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Victims Recorded</h3>
                    <p className="text-gray-500 mb-4">No victims have been recorded for this offence yet.</p>
                </div>
            )}

            {/* Modal */}
            <CreateVictimModal
                open={showCreateVictimModal}
                onClose={() => setShowCreateVictimModal(false)}
                offenceId={offence.offence_id}
                canCreate={canAddVictim}
            />
        </div>
    );
};

export default VictimsTab;
