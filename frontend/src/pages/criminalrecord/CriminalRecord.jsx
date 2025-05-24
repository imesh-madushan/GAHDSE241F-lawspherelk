import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Print, Edit, Save, Cancel } from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import CriminalProfile from '../../components/criminal/CriminalProfile';
import CriminalTabs from '../../components/criminal/CriminalTabs';
import OffencesTab from '../../components/criminal/tabs/OffencesTab';
import EvidenceTab from '../../components/criminal/tabs/EvidenceTab';
import ForensicTab from '../../components/criminal/tabs/ForensicTab';
import { apiClient } from '../../config/apiConfig';

const CriminalRecord = () => {
    const { criminalId } = useParams();
    const [criminalData, setCriminalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('offences');
    const [isEditing, setIsEditing] = useState(false);
    const [editedCriminal, setEditedCriminal] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCriminalData();
    }, [criminalId]);

    const fetchCriminalData = async () => {
        try {
            const response = await apiClient.get(`/criminals/${criminalId}`);
            setCriminalData(response.data.criminalData);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch criminal data');
            setLoading(false);
        }
    };

    // Calculate age from DOB
    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Format time
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleEditToggle = () => {
        if (isEditing) {
            setCriminalData(editedCriminal);
            setIsEditing(false);
        } else {
            setEditedCriminal({ ...criminalData });
            setIsEditing(true);
        }
    };

    const handleSaveChanges = async () => {
        try {
            setLoading(true);
            // You would typically make an API call here
            const response = await apiClient.put(`/criminals/${criminalId}`, editedCriminal);
            setCriminalData(response.data.criminal || editedCriminal);
            setIsEditing(false);
            setLoading(false);
        } catch (err) {
            console.error("Error saving criminal data:", err);
            // Keep the edited data for now so user doesn't lose changes
            setCriminalData(editedCriminal);
            setIsEditing(false);
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditedCriminal(criminalData);
        setIsEditing(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedCriminal(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (!criminalData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-gray-500">No criminal data found</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <PageHeader
                title="Criminal Record"
                breadcrumbItems={[
                    { label: 'Dashboard', link: '/dashboard' },
                    { label: 'Criminals', link: '/criminals' },
                    { label: criminalData.name }
                ]}
                onBack={() => navigate('/criminals')}
                actions={[
                    {
                        icon: <Print fontSize='small' />,
                        label: 'Print Record',
                        styles: 'text-blue-700 border border-blue-700',
                        onClick: () => window.print()
                    },
                    isEditing ? {
                        icon: <Cancel fontSize='small' />,
                        label: 'Cancel',
                        onClick: handleCancelEdit,
                        styles: 'text-red-700 border border-red-700'
                    } : {
                        icon: <Edit fontSize='small' />,
                        label: 'Edit Record',
                        onClick: handleEditToggle,
                        styles: 'text-blue-700 border border-blue-700'
                    },
                    isEditing ? {
                        icon: <Save fontSize='small' />,
                        label: 'Save',
                        onClick: handleSaveChanges,
                        styles: 'bg-green-700 text-white'
                    } : null
                ].filter(Boolean)}
            />

            <div className="container mx-auto p-4">
                <CriminalProfile
                    criminal={isEditing ? editedCriminal : criminalData}
                    calculateAge={calculateAge}
                    formatDate={formatDate}
                    isEditing={isEditing}
                    handleInputChange={handleInputChange}
                />

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <CriminalTabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                    <div className="p-6">
                        {activeTab === 'offences' && (
                            <OffencesTab
                                offences={isEditing ? editedCriminal.offences : criminalData.offences}
                                formatDate={formatDate}
                                formatTime={formatTime}
                                isEditing={isEditing}
                            />
                        )}

                        {activeTab === 'evidence' && (
                            <EvidenceTab
                                evidence={isEditing ? editedCriminal.evidence : criminalData.evidence}
                                formatDate={formatDate}
                                formatTime={formatTime}
                                isEditing={isEditing}
                            />
                        )}

                        {activeTab === 'forensic' && (
                            <ForensicTab />
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-200 text-gray-600 py-4 mt-8">
                <div className="container mx-auto px-4 text-center text-sm">
                    <p>&copy; 2025 LawSphere LK - Sri Lanka Police Department</p>
                    <p className="text-xs mt-1">Accessed by: Officer ID - OFF123 | Station: Colombo Central</p>
                </div>
            </footer>
        </div>
    );
};

export default CriminalRecord;