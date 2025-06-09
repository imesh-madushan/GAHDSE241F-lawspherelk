import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Gavel, CalendarToday, Person, Edit, RemoveRedEye, BusinessCenter, LocalOffer,
    Phone, LocationOn, FindInPage, PersonAdd, Folder, Close, Email, Badge,
    Save, Cancel, History, AccessTime, Warning, Scale, FolderOpen, Assignment, DeviceHub
} from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import PageHeader from '../../components/common/PageHeader';
import OfficerCard from '../../components/cards/OfficerCard';
import StatusBadge from '../../components/badges/StatusBadge';
import OutlinedButton from '../../components/buttons/OutlinedButton';
import { crimeTypes } from '../../../data';
import StatusPopup from '../../components/common/StatusPopup';
import { offenceStatusList } from '../../../data';
import OffenceTabNavigation from '../../components/offence/OffenceTabNavigation';
import EvidenceTab from '../../components/offence/tabs/EvidenceTab';
import VictimsTab from '../../components/offence/tabs/VictimsTab';
import CreateEvidenceModal from '../../components/modals/CreateEvidenceModal';
import LinkEvidenceModal from '../../components/modals/LinkEvidenceModal';
import CreateVictimModal from '../../components/modals/CreateVictimModal';

const SingleOffenceView = () => {
    const { offenceId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [offence, setOffence] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [popup, setPopup] = useState({ open: false, status: "success", message: "", description: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [editedOffence, setEditedOffence] = useState({});
    const [touched, setTouched] = useState({});
    const [activeTab, setActiveTab] = useState('evidence');
    const [tabCounts, setTabCounts] = useState({
        evidence: 0,
        victims: 0
    });
    const [showCreateEvidenceModal, setShowCreateEvidenceModal] = useState(false);
    const [showLinkEvidenceModal, setShowLinkEvidenceModal] = useState(false);
    const [showCreateVictimModal, setShowCreateVictimModal] = useState(false);

    // Format date helper function
    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
        } catch (e) {
            return 'N/A';
        }
    };

    // Format date for datetime-local input
    const formatDateTimeLocal = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toISOString().slice(0, 16);
        } catch (e) {
            return '';
        }
    };

    // Get risk level and color
    const getRiskLevel = (score) => {
        if (score >= 70) return { level: 'High', color: 'text-red-600', bgColor: 'bg-red-100' };
        if (score >= 40) return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
        return { level: 'Low', color: 'text-green-600', bgColor: 'bg-green-100' };
    };

    // Calculate tab counts
    const calculateTabCounts = (offenceData) => {
        setTabCounts({
            evidence: offenceData.evidence?.length || 0,
            victims: offenceData.victims?.length || 0
        });
    };

    useEffect(() => {
        const fetchOffenceData = async () => {
            setLoading(true);
            try {
                const { data } = await apiClient.get(`/crimeoffences/${offenceId}`);
                console.log("Offence data fetched:", data.offence);
                if (data.offence) {
                    setOffence(data.offence);
                    setEditedOffence(data.offence);
                    calculateTabCounts(data.offence);
                } else {
                    setError("No offence data returned from server");
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching offence:", err);
                setError(err.response?.data?.message || "Failed to load offence data");
                setLoading(false);
            }
        };

        fetchOffenceData();
    }, [offenceId]);

    // Determine permissions
    const canEdit = () => {
        return user?.role === "OIC" || user?.role === "Crime OIC" || user?.user_id === offence?.case_leader_id;
    };

    const canChangeStatus = () => {
        return user?.role === "OIC";
    };

    const canAddEvidence = () => {
        return user?.role === "OIC" || user?.role === "Crime OIC" || user?.user_id === offence?.case_leader_id;
    };

    const canAddVictim = () => {
        return user?.role === "OIC" || user?.role === "Crime OIC" || user?.user_id === offence?.case_leader_id;
    };

    // Edit handlers
    const handleEditToggle = () => {
        if (isEditing) {
            setEditedOffence(offence);
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }
    };

    const handleCancelEdit = () => {
        setEditedOffence(offence);
        setIsEditing(false);
        setTouched({});
    };

    // Validation helpers
    const isCrimeTypeValid = editedOffence.crime_type && editedOffence.crime_type.trim().length > 0;
    const isReportedDateValid = editedOffence.reported_dt && editedOffence.reported_dt.trim().length > 0;
    const isHappenedDateValid = editedOffence.happened_dt && editedOffence.happened_dt.trim().length > 0;

    const isFormValid = isCrimeTypeValid && isReportedDateValid && isHappenedDateValid;

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Auto-update risk score when crime type changes
        if (name === 'crime_type') {
            const selectedCrime = crimeTypes.find(c =>
                typeof c === 'object' ? c.type === value : c === value
            );
            const riskScore = selectedCrime && typeof selectedCrime === 'object' ? selectedCrime.points : 0;

            setEditedOffence(prev => ({
                ...prev,
                [name]: value,
                risk_score: riskScore
            }));
        } else {
            setEditedOffence(prev => ({
                ...prev,
                [name]: value
            }));
        }

        setTouched(t => ({ ...t, [name]: true }));
    };

    const validateDates = () => {
        if (editedOffence.reported_dt && editedOffence.happened_dt) {
            const reportedDate = new Date(editedOffence.reported_dt);
            const happenedDate = new Date(editedOffence.happened_dt);

            if (happenedDate > reportedDate) {
                return "Happened date cannot be after reported date";
            }
        }
        return null;
    };

    const handleSaveChanges = async () => {
        setTouched({ crime_type: true, reported_dt: true, happened_dt: true, status: true });

        if (!isFormValid) {
            setPopup({
                open: true,
                status: "error",
                message: "Please fill all required fields.",
                description: "Crime type, reported date, and happened date are required."
            });
            return;
        }

        const dateError = validateDates();
        if (dateError) {
            setPopup({
                open: true,
                status: "error",
                message: "Invalid date configuration.",
                description: dateError
            });
            return;
        }

        // Only send changed fields
        const payload = { offence_id: offenceId };

        if (editedOffence.crime_type !== offence.crime_type)
            payload.crime_type = editedOffence.crime_type;
        if (editedOffence.status !== offence.status)
            payload.status = editedOffence.status;
        if (editedOffence.risk_score !== offence.risk_score)
            payload.risk_score = editedOffence.risk_score;
        if (editedOffence.reported_dt !== offence.reported_dt)
            payload.reported_dt = editedOffence.reported_dt;
        if (editedOffence.happened_dt !== offence.happened_dt)
            payload.happened_dt = editedOffence.happened_dt;

        // If nothing changed, don't send request
        if (Object.keys(payload).length <= 1) {
            setPopup({
                open: true,
                status: "info",
                message: "No changes detected.",
                description: ""
            });
            setIsEditing(false);
            return;
        }

        try {
            const response = await apiClient.put(`/crimeoffences/update`, payload);
            if (response.data && response.data.success) {
                setOffence(prev => ({
                    ...prev,
                    ...editedOffence
                }));
                setPopup({
                    open: true,
                    status: "success",
                    message: "Offence updated successfully",
                    description: ""
                });
                setIsEditing(false);
            } else {
                setPopup({
                    open: true,
                    status: "error",
                    message: "Failed to update offence",
                    description: response.data?.message || ""
                });
            }
        } catch (err) {
            setPopup({
                open: true,
                status: "error",
                message: "Failed to update offence",
                description: err.response?.data?.message || ""
            });
        }
    };

    const handlePopupClose = () => {
        setPopup({ ...popup, open: false });
    };

    // Quick actions - only Link Evidence and Add Victim
    const quickActions = [
        ...(canAddEvidence() ? [
            {
                icon: <FolderOpen fontSize="small" />,
                label: 'Link Evidence',
                onClick: () => setShowLinkEvidenceModal(true),
                styles: 'w-full bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600'
            }
        ] : []),
        ...(canAddVictim() ? [
            {
                icon: <PersonAdd fontSize="small" />,
                label: 'Add Victim',
                onClick: () => setShowCreateVictimModal(true),
                styles: 'w-full bg-red-600 text-white hover:bg-red-700 border-red-600'
            }
        ] : [])
    ];

    // Render tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'evidence':
                return (
                    <EvidenceTab
                        offence={offence}
                        formatDate={formatDate}
                        canAddEvidence={canAddEvidence()}
                    />
                );
            case 'victims':
                return (
                    <VictimsTab
                        offence={offence}
                        formatDate={formatDate}
                        canAddVictim={canAddVictim()}
                    />
                );
            default:
                return (
                    <EvidenceTab
                        offence={offence}
                        formatDate={formatDate}
                        canAddEvidence={canAddEvidence()}
                    />
                );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-800"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-red-500 text-xl mb-4">Error: {error}</div>
                <button
                    onClick={() => navigate('/crimeoffences')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Return to Crime Offences
                </button>
            </div>
        );
    }

    if (!offence) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500 text-xl">No offence data found</div>
            </div>
        );
    }

    const riskData = getRiskLevel(offence.risk_score);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header section with breadcrumb */}
            <PageHeader
                title={isEditing ? "Edit Crime Offence" : "Crime Offence"}
                breadcrumbItems={[
                    { label: 'Dashboard', link: '/dashboard' },
                    { label: 'Crime Offences', link: '/crimeoffences' },
                    { label: offenceId.substring(0, 8) }
                ]}
                onBack={() => navigate(-1)}
                actions={[
                    ...(canEdit() ? [
                        isEditing ? {
                            icon: <Cancel fontSize='small' />,
                            label: 'Cancel',
                            onClick: handleCancelEdit,
                            styles: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        } : {
                            icon: <Edit fontSize='small' />,
                            label: 'Edit Offence',
                            onClick: handleEditToggle,
                            styles: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                        },
                        isEditing ? {
                            icon: <Save fontSize='small' />,
                            label: 'Save Changes',
                            onClick: handleSaveChanges,
                            styles: 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                        } : null
                    ].filter(Boolean) : []),
                    {
                        icon: <History fontSize='small' />,
                        onClick: () => navigate(`/recordhistory/crimeoffence/${offenceId}`),
                        styles: 'bg-white rounded-full text-gray-700 border-purple-600'
                    }
                ]}
            />

            {/* Content section */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Top Card - Offence Header */}
                <div className="bg-white rounded-xl shadow-sm mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                    <Gavel className="text-blue-700" />
                                </div>
                                <div>
                                    <div className="text-gray-500 text-sm font-medium">Offence Reference</div>
                                    <h1 className="text-xl font-bold text-gray-900">{'#' + offenceId}</h1>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                                <div className="flex items-center text-gray-500">
                                    <CalendarToday className="h-4 w-4 mr-1" />
                                    <span className="text-sm">Reported: {formatDate(offence.reported_dt)}</span>
                                </div>

                                <StatusBadge
                                    status={offence.status}
                                    statusList={offenceStatusList}
                                    isEditing={(isEditing && canChangeStatus())}
                                    handleInputChange={handleInputChange}
                                />

                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${riskData.bgColor} ${riskData.color}`}>
                                    <Warning className="h-4 w-4 inline mr-1" />
                                    {riskData.level} Risk ({offence.risk_score} pts)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="col-span-2 space-y-6">
                        {/* Crime Details Card - Always Visible */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Scale className="h-5 w-5 mr-2 text-blue-600" />
                                Crime Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Crime Type {isEditing && <span className="text-red-500">*</span>}
                                    </label>
                                    {isEditing ? (
                                        <>
                                            <select
                                                name="crime_type"
                                                value={editedOffence.crime_type || ''}
                                                onChange={handleInputChange}
                                                className={`w-full p-3 border rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${touched.crime_type && !isCrimeTypeValid ? 'border-red-500' : 'border-blue-300'
                                                    }`}
                                            >
                                                <option value="">Select crime type</option>
                                                {crimeTypes.map(type =>
                                                    typeof type === 'object'
                                                        ? <option key={type.type} value={type.type}>{type.type} ({type.points} pts)</option>
                                                        : <option key={type} value={type}>{type}</option>
                                                )}
                                            </select>
                                            {touched.crime_type && !isCrimeTypeValid && (
                                                <span className="text-xs text-red-600">Crime type is required.</span>
                                            )}
                                        </>
                                    ) : (
                                        <div className="bg-gray-50 p-3 rounded-lg text-gray-800">
                                            {offence.crime_type}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Risk Score</label>
                                    <div className="bg-gray-50 p-3 rounded-lg text-gray-800">
                                        {editedOffence.risk_score || offence.risk_score} points
                                        {isEditing && (
                                            <p className="text-xs text-gray-500 mt-1">Automatically updated based on crime type</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reported Date/Time {isEditing && <span className="text-red-500">*</span>}
                                    </label>
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="datetime-local"
                                                name="reported_dt"
                                                value={formatDateTimeLocal(editedOffence.reported_dt)}
                                                onChange={handleInputChange}
                                                className={`w-full p-3 border rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${touched.reported_dt && !isReportedDateValid ? 'border-red-500' : 'border-blue-300'
                                                    }`}
                                            />
                                            {touched.reported_dt && !isReportedDateValid && (
                                                <span className="text-xs text-red-600">Reported date is required.</span>
                                            )}
                                        </>
                                    ) : (
                                        <div className="bg-gray-50 p-3 rounded-lg text-gray-800 flex items-center">
                                            <AccessTime className="h-4 w-4 mr-2 text-gray-500" />
                                            {formatDate(offence.reported_dt)}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Happened Date/Time {isEditing && <span className="text-red-500">*</span>}
                                    </label>
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="datetime-local"
                                                name="happened_dt"
                                                value={formatDateTimeLocal(editedOffence.happened_dt)}
                                                onChange={handleInputChange}
                                                className={`w-full p-3 border rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${touched.happened_dt && !isHappenedDateValid ? 'border-red-500' : 'border-blue-300'
                                                    }`}
                                            />
                                            {touched.happened_dt && !isHappenedDateValid && (
                                                <span className="text-xs text-red-600">Happened date is required.</span>
                                            )}
                                        </>
                                    ) : (
                                        <div className="bg-gray-50 p-3 rounded-lg text-gray-800 flex items-center">
                                            <AccessTime className="h-4 w-4 mr-2 text-gray-500" />
                                            {formatDate(offence.happened_dt)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <OffenceTabNavigation
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            tabCounts={tabCounts}
                        />

                        {/* Tab Content */}
                        <div className="bg-white rounded-xl shadow-sm">
                            <div className="p-6">
                                {renderTabContent()}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar (existing criminal info and risk assessment) */}
                    <div className="col-span-1 space-y-6">
                        {/* Criminal Info Card */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                                <h2 className="font-semibold text-gray-800 flex items-center">
                                    <Person className="h-5 w-5 mr-2 text-blue-600" />
                                    Criminal Details
                                </h2>
                            </div>

                            {offence.criminal_id ? (
                                <div className="p-6">
                                    <div className="flex flex-col space-y-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                                                <Person className="text-red-700" />
                                            </div>
                                            <div>
                                                <Link
                                                    to={`/criminals/${offence.criminal_id}`}
                                                    className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                                                >
                                                    {offence.criminal_name}
                                                </Link>
                                                <div className="flex items-center mt-0.5">
                                                    <Badge className="h-3.5 w-3.5 text-gray-400 mr-1" />
                                                    <span className="text-xs text-gray-500">{offence.criminal_id}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-gray-100">
                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="flex items-center">
                                                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm">{offence.criminal_phone || "N/A"}</span>
                                                </div>

                                                <div className="flex items-start">
                                                    <LocationOn className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                                    <span className="text-sm">{offence.criminal_address || "N/A"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 text-center text-gray-500">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                        <Person className="text-gray-400" />
                                    </div>
                                    <p className="text-sm">No criminal assigned</p>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                                <h2 className="font-semibold text-gray-800 flex items-center">
                                    <DeviceHub className="h-5 w-5 mr-2 text-blue-600" />
                                    Quick Actions
                                </h2>
                            </div>
                            <div className="p-6">
                                {quickActions.length > 0 ? (
                                    <div className="space-y-3">
                                        {quickActions.map((action, index) => (
                                            <div key={index} className="w-full">
                                                <OutlinedButton action={action} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                            <DeviceHub className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium">No actions available</p>
                                        <p className="text-xs text-gray-400 mt-1">Contact your administrator for access</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Popup */}
            <StatusPopup
                open={popup.open}
                status={popup.status}
                message={popup.message}
                description={popup.description}
                onClose={handlePopupClose}
                okLabel={popup.status === "success" ? "OK" : "Close"}
            />

            {/* Create Evidence Modal */}
            <CreateEvidenceModal
                open={showCreateEvidenceModal}
                onClose={() => setShowCreateEvidenceModal(false)}
                canCreate={canAddEvidence()}
                context="offence"
                contextId={offenceId}
            />

            {/* Link Evidence Modal */}
            <LinkEvidenceModal
                open={showLinkEvidenceModal}
                onClose={() => setShowLinkEvidenceModal(false)}
                offenceId={offenceId}
                caseId={offence?.case_id}
            />

            {/* Create Victim Modal */}
            <CreateVictimModal
                open={showCreateVictimModal}
                onClose={() => setShowCreateVictimModal(false)}
                offenceId={offenceId}
                canCreate={canAddVictim()}
            />
        </div>
    );
};

export default SingleOffenceView;
