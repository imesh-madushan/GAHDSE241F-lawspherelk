import React, { useState, useEffect } from 'react';
import { Description, Person, CalendarToday, Category } from '@mui/icons-material';
import CustomDropdown from '../dropdowns/CustomDropdown';
import CustomOfficerDropdown from '../dropdowns/CustomOfficerDropdown';
import OfficerCard from '../cards/OfficerCard';

// Sample officers data with additional fields including profile images
const officersList = [
    {
        id: "u5e6f7g8-h9i0-j1k2-l3m4-n5o6p7q8r9s0",
        name: "Inspector Silva",
        role: "Crime Investigation Department",
        image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
        id: "u1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6",
        name: "Inspector Perera",
        role: "Narcotics Bureau",
        image: "https://randomuser.me/api/portraits/men/43.jpg"
    },
    {
        id: "u7x8y9z0-a1b2-c3d4-e5f6-g7h8i9j0k1l2",
        name: "Inspector Fernando",
        role: "Special Task Force",
        image: "https://randomuser.me/api/portraits/men/57.jpg"
    },
    {
        id: "u3p4q5r6-s7t8-u9v0-w1x2-y3z4a5b6c7d8",
        name: "Sub Inspector Gunawardena",
        role: "Criminal Records Division",
        image: "https://randomuser.me/api/portraits/men/21.jpg"
    },
    {
        id: "u9m8n7o6-p5q4-r3s2-t1u0-v9w8x7y6z5a4",
        name: "Sub Inspector Jayasinghe",
        role: "Fraud Investigation Unit",
        image: "https://randomuser.me/api/portraits/men/67.jpg"
    }
];

const CaseBasicInfo = ({ caseData, isEditing, editedCase, handleInputChange, formatDate, canChangeLeader }) => {
    const [officers, setOfficers] = useState(officersList);

    const caseTypeOptions = [
        { value: "Theft", label: "Theft" },
        { value: "Robbery", label: "Robbery" },
        { value: "Assault", label: "Assault" },
        { value: "Fraud", label: "Fraud" },
        { value: "Homicide", label: "Homicide" },
        { value: "Other", label: "Other" }
    ];

    // In a real app, fetch officers from API
    useEffect(() => {
        // Sample API call:
        // async function fetchOfficers() {
        //   const response = await fetch('/api/officers');
        //   const data = await response.json();
        //   setOfficers(data);
        // }
        // fetchOfficers();
    }, []);

    // Handle officer selection
    const handleOfficerSelect = (officer) => {
        handleInputChange({
            target: {
                name: 'leader_id',
                value: officer.id
            }
        });
        handleInputChange({
            target: {
                name: 'leader_name',
                value: officer.name
            }
        });
    };

    // Find the current officer in the list
    const currentOfficer = officers.find(o => o.id === caseData.leader_id) || {
        id: caseData.leader_id,
        name: caseData.leader_name,
        role: "Case Leader" // Fallback role if not in the list
    };

    return (
        <div className="rounded-xl bg-white shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                <Description className="mr-2 text-blue-600" />
                Case Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-gray-700 text-sm mb-1 font-medium">Case Topic</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="topic"
                            value={editedCase.topic}
                            onChange={handleInputChange}
                            className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ) : (
                        <p className="text-gray-600">{caseData.topic}</p>
                    )}
                </div>

                <div>
                    <label className="block text-gray-700 text-sm mb-1 font-medium">Case Type</label>
                    {isEditing ? (
                        <CustomDropdown
                            name="case_type"
                            value={editedCase.case_type}
                            onChange={handleInputChange}
                            options={caseTypeOptions}
                            icon={Category}
                        />
                    ) : (
                        <p className="text-gray-600 flex items-center">
                            <Category className="mr-1 text-blue-600" fontSize="small" />
                            {caseData.case_type}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-gray-700 text-sm mb-1 font-medium">Case Leader</label>
                    {isEditing && canChangeLeader ? (
                        <CustomOfficerDropdown
                            officers={officers}
                            selectedOfficerId={editedCase.leader_id}
                            onOfficerSelect={handleOfficerSelect}
                        />
                    ) : (
                        <OfficerCard officer={currentOfficer} size="large" />
                    )}
                </div>

                <div>
                    <label className="block text-gray-700 text-sm mb-1 font-medium">Start Date</label>
                    <p className="text-gray-600 flex items-center">
                        <CalendarToday className="mr-1 text-blue-600" fontSize="small" />
                        {formatDate(caseData.started_dt)}
                    </p>
                </div>

                <div>
                    <label className="block text-gray-700 text-sm mb-1 font-medium">End Date</label>
                    <p className="text-gray-600 flex items-center">
                        <CalendarToday className="mr-1 text-blue-600" fontSize="small" />
                        {caseData.end_dt ? formatDate(caseData.end_dt) : 'Not completed'}
                    </p>
                </div>
            </div>

            <div className="mt-4">
                <label className="block text-gray-700 text-sm mb-1 font-medium">Description</label>
                {isEditing ? (
                    <textarea
                        name="description"
                        value={editedCase.description}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full bg-blue-10 border border-blue-200 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                ) : (
                    <p className="text-gray-600">{caseData.description}</p>
                )}
            </div>
        </div>
    );
};

export default CaseBasicInfo;
