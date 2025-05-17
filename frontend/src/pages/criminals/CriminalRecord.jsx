import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageHeader from '../../components/common/PageHeader';
import OutlinedButton from '../../components/buttons/OutlinedButton';
import CriminalProfile from '../../components/criminal/CriminalProfile';
import CriminalTabs from '../../components/criminal/CriminalTabs';
import OffencesTab from '../../components/criminal/tabs/OffencesTab';
import EvidenceTab from '../../components/criminal/tabs/EvidenceTab';
import ForensicTab from '../../components/criminal/tabs/ForensicTab';
import { Print, Edit, Save, Cancel } from '@mui/icons-material';

// Icons
import {
    Person,
    Fingerprint,
    LocationOn,
    Phone,
    Event,
    Warning,
    Description,
    Gavel,
    ArrowBack,
    CalendarMonth,
    AccessTime,
    EmojiEvents,
    LocalPolice,
    KeyboardArrowRight,
    Add,
    Archive,
    Attachment
} from '@mui/icons-material';
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
            console.log(response.data.criminalData);
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

    // Risk level calculation
    const getRiskLevel = (score) => {
        if (score >= 70) return { level: 'High', color: 'bg-red-500' };
        if (score >= 40) return { level: 'Medium', color: 'bg-yellow-500' };
        return { level: 'Low', color: 'bg-green-500' };
    };

    const handleEditToggle = () => {
        if (isEditing) {
            setCriminalData(editedCriminal);
            setIsEditing(false);
        } else {
            setEditedCriminal(criminalData);
            setIsEditing(true);
        }
    };

    const handleSaveChanges = () => {
        // Here you would typically make an API call to save the changes
        // For now, we'll just update the local state
        setCriminalData(editedCriminal);
        setIsEditing(false);
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

    const riskInfo = getRiskLevel(criminalData.total_risk);

    return (
        <div className="bg-gray-100 min-h-screen">
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
                        styles: 'text-blue-700',
                        onClick: () => window.print()
                    },
                    isEditing ? {
                        icon: <Cancel fontSize='small' />,
                        label: 'Cancel',
                        onClick: handleCancelEdit,
                        styles: 'text-red-700'
                    } : {
                        icon: <Edit fontSize='small' />,
                        label: 'Edit Record',
                        onClick: handleEditToggle,
                        styles: 'text-blue-700'
                    },
                    isEditing ? {
                        icon: <Save fontSize='small' />,
                        label: 'Save',
                        onClick: handleSaveChanges,
                        styles: 'text-green-700'
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

                <CriminalTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                <div className="p-4">
                    {activeTab === 'offences' && (
                        <OffencesTab
                            offences={isEditing ? editedCriminal.offences : criminalData.offences}
                            formatDate={formatDate}
                            formatTime={formatTime}
                            getRiskLevel={getRiskLevel}
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

            {/* Footer */}
            <footer className="bg-gray-200 text-gray-600 py-4 mt-auto">
                <div className="container mx-auto px-4 text-center text-sm">
                    <p>&copy; 2025 LawSphere LK - Sri Lanka Police Department</p>
                    <p className="text-xs mt-1">Accessed by: Officer ID - OFF123 | Station: Colombo Central</p>
                </div>
            </footer>
        </div>
    );
};

export default CriminalRecord;