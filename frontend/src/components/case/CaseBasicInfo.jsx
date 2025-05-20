import React, { useState, useEffect } from 'react';
import { Description, Person, CalendarToday, Category } from '@mui/icons-material';
import CustomDropdown from '../dropdowns/CustomDropdown';
import CustomOfficerDropdown from '../dropdowns/CustomOfficerDropdown';
import OfficerCard from '../cards/OfficerCard';
import { apiClient } from '../../config/apiConfig';

const CaseBasicInfo = ({ caseData, isEditing, editedCase, handleInputChange, formatDate, canChangeLeader }) => {
    const [officers, setOfficers] = useState([]);

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
        async function fetchOfficers() {
            try {
                const response = await apiClient.post('/officers/getAll', {
                    roles: ["Sub Inspector", "Inspector", "Sergeant"]
                });

                if (response.data) {
                    setOfficers(response.data);
                }
            } catch (error) {
                console.error("Error fetching officers:", error);
            }
        }
        fetchOfficers();
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

        </div>
    );
};

export default CaseBasicInfo;
