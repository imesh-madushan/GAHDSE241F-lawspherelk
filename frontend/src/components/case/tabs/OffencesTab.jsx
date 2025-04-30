import React from 'react';
import { Add, CalendarToday, Person, Gavel, Visibility, Balance } from '@mui/icons-material';
import OutlinedButton from '../../buttons/OutlinedButton';

const OffencesTab = ({ caseData, canEdit, formatDate }) => {
    const addOffenceAction = {
        icon: <Add fontSize="small" />,
        label: 'Register Offence',
        onClick: () => console.log('Register new offence'),
        styles: 'text-blue-600'
    };

    if (!caseData.offences) {
        return <div className="text-center py-10 text-gray-500">No offence data available.</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Registered Offences</h3>
                {canEdit && <OutlinedButton action={addOffenceAction} />}
            </div>

            {caseData.offences.length > 0 ? (
                <div className="space-y-6">
                    {caseData.offences.map((offence, index) => (
                        <div key={offence.id || index} className="rounded-lg bg-white border border-gray-200 shadow-sm overflow-hidden">
                            {/* Header with offence type and status */}
                            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                                <div className="flex items-center">
                                    <Gavel className="text-blue-600 mr-2" />
                                    <h4 className="font-semibold text-gray-800">{offence.type}</h4>
                                </div>
                                <span className={`px-3 py-1 text-xs rounded-full font-medium ${offence.status === 'Confirmed'
                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                    }`}>
                                    {offence.status}
                                </span>
                            </div>

                            {/* Offence details */}
                            <div className="p-4">
                                <p className="text-gray-600 mb-4">{offence.description}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-start">
                                            <Balance className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" fontSize="small" />
                                            <div>
                                                <p className="text-xs text-gray-500">Legal Reference</p>
                                                <p className="text-sm text-gray-800">{offence.section}</p>
                                                <p className="text-xs text-gray-600">{offence.act}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <CalendarToday className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" fontSize="small" />
                                            <div>
                                                <p className="text-xs text-gray-500">Registered On</p>
                                                <p className="text-sm text-gray-800">{formatDate(offence.registered_dt)}</p>
                                                <p className="text-xs text-gray-600">By: {offence.registered_by}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-start">
                                            <Person className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" fontSize="small" />
                                            <div>
                                                <p className="text-xs text-gray-500">Suspect</p>
                                                <p className="text-sm text-gray-800">{offence.suspect}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Gavel className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" fontSize="small" />
                                            <div>
                                                <p className="text-xs text-gray-500">Punishment</p>
                                                <p className="text-sm text-gray-800">{offence.punishment}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-4">
                                    <button className="text-blue-600 hover:text-blue-800 flex items-center text-sm transition-colors">
                                        <Visibility fontSize="small" className="mr-1" />
                                        View Full Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
                    <Gavel style={{ fontSize: 48 }} className="text-gray-300 mx-auto mb-3" />
                    <h4 className="text-gray-600 font-medium mb-1">No Offences Registered</h4>
                    <p className="text-gray-500 text-sm">No offences have been registered for this case yet.</p>
                    {canEdit && (
                        <div className="mt-4">
                            <OutlinedButton action={addOffenceAction} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OffencesTab;
