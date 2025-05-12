import React, { useRef } from 'react';
import { Person, Fingerprint, LocationOn, Phone, Event, LocalPolice, CloudUpload } from '@mui/icons-material';

const CriminalProfile = ({ criminal, calculateAge, formatDate, isEditing, handleInputChange }) => {
    const fileInputRef = useRef(null);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Here you would typically handle the file upload
            // For now, we'll just create a local URL
            const imageUrl = URL.createObjectURL(file);
            handleInputChange({
                target: {
                    name: 'photo',
                    value: imageUrl
                }
            });
        }
    };

    const getRiskLevel = (score) => {
        if (score >= 70) return { level: 'High', color: 'bg-red-500' };
        if (score >= 40) return { level: 'Medium', color: 'bg-yellow-500' };
        return { level: 'Low', color: 'bg-green-500' };
    };


    return (
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
            <div className="md:flex">
                <div className="md:w-1/3 bg-gray-800 text-white p-6">
                    <div className="flex justify-center">
                        {criminal.photo ? (
                            <img
                                src={criminal.photo}
                                alt={criminal.name}
                                className="w-51 h-51 object-cover rounded-full border-2 border-gray-300/60 shadow-xl shadow-gray-600/40"
                            />
                        ) : (
                            <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                                <Person style={{ fontSize: 80 }} className="text-gray-400" />
                            </div>
                        )}
                    </div>
                    {isEditing && (
                        <div className="mt-4 flex justify-center">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                <CloudUpload className="mr-2" />
                                Upload Photo
                            </button>
                        </div>
                    )}
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center">
                            <Fingerprint className="mr-2 text-gray-400" />
                            <span className="text-sm text-gray-300">ID: {criminal.criminal_id}</span>
                        </div>
                        <div className="flex items-center">
                            <LocalPolice className="mr-2 text-gray-400" />
                            <div className="flex-1">
                                <label className="block text-sm text-gray-300 mb-1">NIC Number</label>
                                <input
                                    type="text"
                                    name="nic"
                                    value={criminal.nic}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-1.5 bg-gray-700/50 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-400 text-sm disabled:opacity-50"
                                    placeholder="Enter NIC number"
                                />
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Phone className="mr-2 text-gray-400" />
                            <div className="flex-1">
                                <label className="block text-sm text-gray-300 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={criminal.phone}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-1.5 bg-gray-700/50 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-400 text-sm disabled:opacity-50"
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>
                        <div className="flex">
                            <LocationOn className="mr-2 mt-1 text-gray-400 flex-shrink-0" />
                            <div className="flex-1">
                                <label className="block text-sm text-gray-300 mb-1">Address</label>
                                <textarea
                                    name="address"
                                    value={criminal.address}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-1.5 bg-gray-700/50 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-400 text-sm resize-none disabled:opacity-50"
                                    rows="2"
                                    placeholder="Enter full address"
                                />
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Event className="mr-2 text-gray-400" />
                            <div className="flex-1">
                                <label className="block text-sm text-gray-300 mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={criminal.dob}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-1.5 bg-gray-700/50 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-400 text-sm disabled:opacity-50"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:w-2/3 p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Criminal Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-700">Risk Assessment</h3>
                                <div className={`${getRiskLevel(criminal.total_risk).color} text-white text-sm px-3 py-1 rounded-full`}>
                                    {getRiskLevel(criminal.total_risk).level} Risk
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                                <div
                                    className={`h-2.5 rounded-full ${getRiskLevel(criminal.total_risk).color}`}
                                    style={{ width: `${Math.min(criminal.total_risk, 100)}%` }}
                                ></div>
                            </div>
                            <div className="text-xs text-right text-gray-500">Score: {criminal.total_risk.toFixed(2)}/100</div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h3 className="font-semibold text-gray-700 mb-2">Criminal Activity</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Total Crimes:</span>
                                <span className="text-lg font-bold text-gray-800">{criminal.total_crimes}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-gray-600">Status:</span>
                                <span className={`text-sm px-3 py-1 rounded-full ${criminal.offences[0]?.status === "Under Investigation"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                    }`}>
                                    {criminal.offences[0]?.status || "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="font-semibold text-gray-700 mb-3">Biometric Information</h3>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center">
                                <Fingerprint className="text-gray-600 mr-2" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-700">Fingerprint Hash</div>
                                    <input
                                        type="text"
                                        name="fingerprint_hash"
                                        value={criminal.fingerprint_hash}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full mt-1 px-3 py-1.5 bg-white rounded-lg border border-gray-300 focus:outline-none focus:border-gray-400 text-xs font-mono disabled:opacity-50"
                                        placeholder="Enter fingerprint hash"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CriminalProfile; 