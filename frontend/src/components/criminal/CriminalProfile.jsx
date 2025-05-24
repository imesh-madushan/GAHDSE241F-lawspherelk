import React, { useRef } from 'react';
import {
    Person,
    Fingerprint,
    LocationOn,
    Phone,
    Event,
    Description,
    CloudUpload,
    Warning,
    CreditScore,
    Balance,
    Gavel,
    Attachment
} from '@mui/icons-material';

const CriminalProfile = ({ criminal, calculateAge, formatDate, isEditing, handleInputChange }) => {
    const fileInputRef = useRef(null);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            handleInputChange({
                target: {
                    name: 'photo',
                    value: imageUrl
                }
            });
        }
    };

    const formatRiskScore = (score) => {
        const numScore = parseFloat(score) || 0;
        return numScore.toFixed(0);
    };

    return (
        <div className="mb-6 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Personal Info */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-6 flex flex-col items-center">
                        <div className="relative">
                            {criminal.photo ? (
                                <img
                                    src={criminal.photo}
                                    alt={criminal.name}
                                    className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-xl"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gray-400 flex items-center justify-center border-4 border-white shadow-xl">
                                    <Person style={{ fontSize: 50 }} className="text-gray-600" />
                                </div>
                            )}

                            {isEditing && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 bg-gray-600 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg transition-colors"
                                >
                                    <CloudUpload fontSize="small" />
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </button>
                            )}
                        </div>
                        <div className="mt-4 text-center">
                            <h2 className="text-xl font-bold text-white">{criminal.name}</h2>
                            <span className="inline-block px-3 py-1 mt-2 bg-gray-800 bg-opacity-50 rounded-full text-xs font-medium text-gray-100">
                                ID: {criminal.criminal_id?.substring(0, 8)}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg">
                                    <Person className="text-gray-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-xs text-gray-500">Full Name</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={criminal.name || ''}
                                            onChange={handleInputChange}
                                            className="w-full mt-1 px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium">{criminal.name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg">
                                    <Fingerprint className="text-gray-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-xs text-gray-500">NIC Number</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="nic"
                                            value={criminal.nic || ''}
                                            onChange={handleInputChange}
                                            className="w-full mt-1 px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium">{criminal.nic || 'Not available'}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg">
                                    <Phone className="text-gray-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-xs text-gray-500">Phone Number</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="phone"
                                            value={criminal.phone || ''}
                                            onChange={handleInputChange}
                                            className="w-full mt-1 px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium">{criminal.phone || 'Not available'}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg">
                                    <Event className="text-gray-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-xs text-gray-500">Date of Birth</p>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            name="dob"
                                            value={criminal.dob ? new Date(criminal.dob).toISOString().split('T')[0] : ''}
                                            onChange={handleInputChange}
                                            className="w-full mt-1 px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium">
                                            {criminal.dob ? formatDate(criminal.dob) : 'Not available'}
                                            {criminal.dob && ` (${calculateAge(criminal.dob)} years)`}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg mt-1">
                                    <LocationOn className="text-gray-600" />
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="text-xs text-gray-500">Address</p>
                                    {isEditing ? (
                                        <textarea
                                            name="address"
                                            value={criminal.address || ''}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full mt-1 px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium">{criminal.address || 'Not available'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle & Right Column Combined - Criminal Stats & Biometric */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Criminal Stats */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center">
                            <Balance className="text-gray-600 mr-2" />
                            <h3 className="font-semibold text-gray-800">Criminal Summary</h3>
                        </div>

                        <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-red-50 rounded-lg p-4 border border-red-100 flex flex-col items-center">
                                    <div className="text-3xl font-bold text-red-700">
                                        {criminal.total_crimes || 0}
                                    </div>
                                    <div className="text-xs text-red-600 font-medium uppercase tracking-wide mt-2 text-center">
                                        Convicted Crimes
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-col items-center">
                                    <div className="text-3xl font-bold text-gray-700">
                                        {formatRiskScore(criminal.total_risk)}
                                    </div>
                                    <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mt-2 text-center">
                                        Risk Score
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-col items-center">
                                    <div className="text-3xl font-bold text-gray-700">
                                        {criminal.evidence?.length || 0}
                                    </div>
                                    <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mt-2 text-center">
                                        Evidence Items
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Biometric Information */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center">
                            <Fingerprint className="text-gray-600 mr-2" />
                            <h3 className="font-semibold text-gray-800">Biometric Data</h3>
                        </div>

                        <div className="p-5">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-600">Fingerprint Hash</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="fingerprint_hash"
                                        value={criminal.fingerprint_hash || ''}
                                        onChange={handleInputChange}
                                        className="w-full mt-2 px-3 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm font-mono"
                                    />
                                ) : (
                                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm font-mono break-all">
                                        {criminal.fingerprint_hash || 'Not available'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CriminalProfile;