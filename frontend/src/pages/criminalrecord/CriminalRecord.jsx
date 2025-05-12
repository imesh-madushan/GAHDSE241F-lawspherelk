import { useState, useEffect } from 'react';
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

const CriminalRecord = () => {
    const { criminalId } = useParams();
    const [criminal, setCriminal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('offences');
    const [isEditing, setIsEditing] = useState(false);
    const [editedCriminal, setEditedCriminal] = useState(null);
    const navigate = useNavigate();

    // Mock data - replace with actual API calls in production
    useEffect(() => {
        // Simulate API call
        const fetchCriminalData = async () => {
            try {
                // In production, replace with:
                // const response = await axios.get(`/api/criminals/${criminalId}`);
                // setCriminal(response.data);

                // Mock data for development
                setTimeout(() => {
                    setCriminal({
                        criminal_id: criminalId,
                        nic: "199523145678",
                        name: "Rajiv Kumar",
                        phone: "+94 75 123 4567",
                        address: "45/2, Main Street, Colombo 5, Sri Lanka",
                        dob: "1995-03-15",
                        fingerprint_hash: "fp:2345:ab78:9823:1234",
                        photo: "https://randomuser.me/api/portraits/men/35.jpg",
                        total_crimes: 4,
                        total_risk: 68.50,
                        offences: [
                            {
                                offence_id: "OFF001",
                                status: "Convicted",
                                crime_type: "Theft",
                                risk_score: 20.50,
                                reported_dt: "2023-08-15T10:30:00",
                                happened_dt: "2023-08-12T22:15:00",
                                case_id: "CASE389",
                                victims: [
                                    { name: "John Silva", nic: "198534567890" }
                                ]
                            },
                            {
                                offence_id: "OFF120",
                                status: "Under Investigation",
                                crime_type: "Breaking and Entering",
                                risk_score: 48.00,
                                reported_dt: "2024-01-23T14:45:00",
                                happened_dt: "2024-01-22T02:30:00",
                                case_id: "CASE426",
                                victims: [
                                    { name: "Marina Fernando", nic: "197645678901" },
                                    { name: "Sunil Fernando", nic: "197823456789" }
                                ]
                            }
                        ],
                        evidence: [
                            {
                                evidence_id: "EV234",
                                type: "Fingerprint",
                                location: "Front door handle",
                                details: "Partial print matching suspect",
                                collected_dt: "2024-01-23T16:20:00",
                                offence_id: "U001",
                                officer_profile: "https://randomuser.me/api/portraits/women/31.jpg",
                                officer_role: "Sub Inspector",
                                case_id: "CASE426"
                            },
                            {
                                evidence_id: "EV235",
                                type: "CCTV Footage",
                                location: "Corner shop camera",
                                details: "Shows suspect near the premises",
                                collected_dt: "2024-01-23T18:45:00",
                                offence_id: "U003",
                                case_id: "CASE426",
                                officer_profile: "https://randomuser.me/api/portraits/women/33.jpg",
                                officer_role: "Sub Inspector",
                            },
                            {
                                evidence_id: "EV102",
                                type: "Stolen Item",
                                location: "Suspect's residence",
                                details: "Jewelry matching victim's description",
                                collected_dt: "2023-08-16T09:30:00",
                                offence_id: "U004",
                                case_id: "CASE389",
                                officer_profile: "https://randomuser.me/api/portraits/women/35.jpg",
                                officer_role: "Sub Inspector",
                            }
                        ]
                    });
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error("Error fetching criminal data:", error);
                setLoading(false);
            }
        };

        fetchCriminalData();
    }, [criminalId]);

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
            setCriminal(editedCriminal);
            setIsEditing(false);
        } else {
            setEditedCriminal(criminal);
            setIsEditing(true);
        }
    };

    const handleSaveChanges = () => {
        // Here you would typically make an API call to save the changes
        // For now, we'll just update the local state
        setCriminal(editedCriminal);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditedCriminal(criminal);
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
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto"></div>
                    <p className="mt-3 text-gray-700">Loading criminal record...</p>
                </div>
            </div>
        );
    }

    if (!criminal) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-center p-6 bg-white rounded-lg shadow-lg">
                    <Warning className="text-red-500 text-6xl mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Criminal Record Not Found</h2>
                    <p className="text-gray-700 mb-4">The criminal record you're looking for doesn't exist or has been removed.</p>
                    <button
                        onClick={() => navigate('/criminals')}
                        className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900"
                    >
                        Return to Criminal List
                    </button>
                </div>
            </div>
        );
    }

    console.log(criminal);

    const riskInfo = getRiskLevel(criminal.total_risk);

    return (
        <div className="bg-gray-100 min-h-screen">
            <PageHeader
                title="Criminal Record"
                breadcrumbItems={[
                    { label: 'Dashboard', link: '/dashboard' },
                    { label: 'Criminal Records', link: '/criminals' },
                    { label: criminal.criminal_id }
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
                    criminal={isEditing ? editedCriminal : criminal}
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
                            offences={isEditing ? editedCriminal.offences : criminal.offences}
                            formatDate={formatDate}
                            formatTime={formatTime}
                            getRiskLevel={getRiskLevel}
                            isEditing={isEditing}
                        />
                    )}

                    {activeTab === 'evidence' && (
                        <EvidenceTab
                            evidence={isEditing ? editedCriminal.evidence : criminal.evidence}
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