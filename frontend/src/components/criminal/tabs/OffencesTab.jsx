import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarMonth, AccessTime } from '@mui/icons-material';

const OffencesTab = ({ offences, formatDate, formatTime, getRiskLevel, isEditing }) => {
    const formatRiskScore = (score) => {
        // Convert to number and handle null/undefined cases
        const numScore = parseFloat(score) || 0;
        return numScore.toFixed(2);
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Criminal Offences</h3>
            {offences.length > 0 ? (
                <div className="space-y-4">
                    {offences.map((offence) => (
                        <div key={offence.offence_id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-medium text-lg text-gray-800">{offence.crime_type}</h4>
                                    <div className="text-sm text-gray-500">Offence ID: {offence.offence_id}</div>
                                </div>
                                <div className={`text-sm px-3 py-1 rounded-full ${offence.status === "Under Investigation"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : offence.status === "Convicted"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-green-100 text-green-800"
                                    }`}>
                                    {offence.status}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <div>
                                    <div className="text-xs text-gray-500">Reported</div>
                                    <div className="flex items-center">
                                        <CalendarMonth className="mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                        <span className="text-sm">{formatDate(offence.reported_dt)}</span>
                                        <AccessTime className="ml-2 mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                        <span className="text-sm">{formatTime(offence.reported_dt)}</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-gray-500">Incident Occurred</div>
                                    <div className="flex items-center">
                                        <CalendarMonth className="mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                        <span className="text-sm">{formatDate(offence.happened_dt)}</span>
                                        <AccessTime className="ml-2 mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                        <span className="text-sm">{formatTime(offence.happened_dt)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <div>
                                    <div className="text-xs text-gray-500">Related Case</div>
                                    <Link to={`/cases/${offence.case_id}`} className="text-sm text-blue-800 hover:underline">
                                        {offence.case_id}
                                    </Link>
                                </div>

                                <div>
                                    <div className="text-xs text-gray-500">Risk Score</div>
                                    <div className="flex items-center">
                                        <div className="w-20 bg-gray-200 rounded-full h-1.5 mr-2">
                                            <div
                                                className={`h-1.5 rounded-full ${getRiskLevel(offence.risk_score).color}`}
                                                style={{ width: `${Math.min(offence.risk_score, 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm">{formatRiskScore(offence.risk_score)}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-gray-500 mb-1">Victims</div>
                                {offence.victims && offence.victims.length > 0 ? (
                                    offence.victims.map((victim, index) => (
                                        <div key={index} className="text-sm mb-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="font-medium">{victim.name}</span>
                                                    <span className="text-gray-500 ml-2">(NIC: {victim.nic})</span>
                                                </div>
                                            </div>
                                            {victim.phone && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Phone: {victim.phone}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-500">No victims recorded</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">No offence records found</div>
            )}
        </div>
    );
};

export default OffencesTab; 