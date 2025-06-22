import React from 'react';
import { People } from '@mui/icons-material';

const WitnessesTab = ({ evidence, formatDate }) => {
    return (
        <div>
            <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                <People className="mr-2 text-gray-600" fontSize="small" />
                Witnesses
            </h3>
            {evidence.witnesses && evidence.witnesses.length > 0 ? (
                <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                    <table className="min-w-full text-xs">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left font-semibold text-gray-600">#</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-600">Name</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-600">NIC</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-600">Phone</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-600">Email</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-600">Address</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-600">Date of Birth</th>
                            </tr>
                        </thead>
                        <tbody>
                            {evidence.witnesses.map((witness, idx) => (
                                <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="px-3 py-2">{idx + 1}</td>
                                    <td className="px-3 py-2 font-medium text-gray-900">{witness.name}</td>
                                    <td className="px-3 py-2">{witness.nic}</td>
                                    <td className="px-3 py-2">{witness.phone || <span className="text-gray-400">-</span>}</td>
                                    <td className="px-3 py-2">{witness.email || <span className="text-gray-400">-</span>}</td>
                                    <td className="px-3 py-2">{witness.address || <span className="text-gray-400">-</span>}</td>
                                    <td className="px-3 py-2">{witness.dob ? formatDate(witness.dob) : <span className="text-gray-400">-</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-4 text-gray-500 bg-white rounded-lg shadow">
                    No witnesses recorded for this evidence
                </div>
            )}
        </div>
    );
};

export default WitnessesTab;
