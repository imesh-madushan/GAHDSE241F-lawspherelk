import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Search, CalendarToday, Person, Edit, LocationOn,
    BusinessCenter, Add, Remove, Save, Cancel, History,
    Group, Description, FolderOpen, Assignment, DeviceHub
} from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { toMySqlDatetime } from '../../utils/Preprocessors';
import PageHeader from '../../components/common/PageHeader';
import OfficerCard from '../../components/cards/OfficerCard';
import StatusBadge from '../../components/badges/StatusBadge';
import OutlinedButton from '../../components/buttons/OutlinedButton';
import StatusPopup from '../../components/common/StatusPopup';
import ConfirmationPopup from '../../components/common/ConfirmationPopup';
import CustomOfficerDropdown from '../../components/dropdowns/CustomOfficerDropdown';
import CreateEvidenceModal from '../../components/modals/CreateEvidenceModal';

const investigationStatusList = [
    { value: 'inprogress', label: 'In Progress', colorVariant: 'blue' },
    { value: 'closed', label: 'Closed', colorVariant: 'gray' }
];

const SingleInvestigationView = () => {
    const { investigationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [investigation, setInvestigation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedInvestigation, setEditedInvestigation] = useState({});
    const [popup, setPopup] = useState({ open: false, status: "success", message: "", description: "" });
    const [confirmationPopup, setConfirmationPopup] = useState({ open: false, type: '', data: null });
    const [availableOfficers, setAvailableOfficers] = useState([]);
    const [selectedOfficerToAdd, setSelectedOfficerToAdd] = useState(null);
    const [showAddOfficer, setShowAddOfficer] = useState(false);
    const [selectedOfficersForAdd, setSelectedOfficersForAdd] = useState([]);
    const [openCreateEvidenceModal, setOpenCreateEvidenceModal] = useState(false);

    // Format date helper function
    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
        } catch (e) {
            return 'N/A';
        }
    };

    const formatDateOnly = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch (e) {
            return 'N/A';
        }
    };

    useEffect(() => {
        fetchInvestigationData();
        if (canManageOfficers()) {
            fetchAvailableOfficers();
        }
    }, [investigationId]);

    const fetchInvestigationData = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get(`/investigations/${investigationId}`);
            if (data.success && data.investigation) {
                setInvestigation(data.investigation);
                setEditedInvestigation(data.investigation);
                console.log("Investigation data fetched successfully:", data.investigation);
            } else {
                setError("Investigation not found");
            }
        } catch (err) {
            console.error("Error fetching investigation:", err);
            setError(err.response?.data?.message || "Failed to load investigation data");
        }
        setLoading(false);
    };

    const fetchAvailableOfficers = async () => {
        try {
            const response = await apiClient.post('/officers/search', {
                dropRoles: ['OIC', 'Crime OIC'],
                dropIds: investigation?.officers?.map(o => o.user_id) || []
            });
            setAvailableOfficers(response.data || []);
        } catch (err) {
            console.error("Error fetching officers:", err);
        }
    };

    // Permission checks
    const canEdit = () => {
        if (!investigation || !user) return false;
        if (investigation.status === 'closed') {
            return false;
        }

        return user.role === 'OIC' ||
            user.role === 'Crime OIC' ||
            user.user_id === investigation.leader_id;
    };

    const canManageOfficers = () => {
        if (!investigation || !user) return false;
        // Prevent add/remove if investigation is closed
        if (investigation.status === 'closed') return false; return user.role === 'OIC' ||
            user.role === 'Crime OIC' ||
            user.user_id === investigation.leader_id;
    };

    const canViewRelatedCase = () => {
        if (!investigation || !user) return false;

        // Check if user has permission to view the case
        const isOIC = user.role === "OIC";
        const isCrimeOIC = user.role === "Crime OIC";
        const isCaseLeader = investigation?.leader_id === user.user_id;

        return isOIC || isCrimeOIC || isCaseLeader;
    };

    const canAddEvidence = () => {
        if (!investigation || !user) return false;
        if (investigation.status === 'closed') return false;
        const isWorkingOfficer = investigation.officers?.some(o => o.user_id === user.user_id);
        return user.role === 'OIC' ||
            user.role === 'Crime OIC' ||
            user.user_id === investigation.leader_id ||
            isWorkingOfficer;
    };

    // Edit handlers
    const handleEditToggle = () => {
        if (isEditing) {
            setEditedInvestigation(investigation);
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }
    };

    const handleCancelEdit = () => {
        setEditedInvestigation(investigation);
        setIsEditing(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedInvestigation(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveChanges = async () => {
        if (!editedInvestigation.topic?.trim() || !editedInvestigation.location?.trim()) {
            setPopup({
                open: true,
                status: "error",
                message: "Please fill all required fields",
                description: "Topic and location are required fields"
            });
            return;
        }

        const payload = { investigation_id: investigationId };

        // Only send changed fields
        if (editedInvestigation.topic !== investigation.topic) {
            payload.topic = editedInvestigation.topic;
        }
        if (editedInvestigation.location !== investigation.location) {
            payload.location = editedInvestigation.location;
        }
        if (editedInvestigation.status !== investigation.status) {
            payload.status = editedInvestigation.status;
            if (editedInvestigation.status === 'closed') {
                payload.end_dt = toMySqlDatetime(new Date());
            }
        }

        if (Object.keys(payload).length <= 1) {
            setPopup({
                open: true,
                status: "info",
                message: "No changes detected",
                description: ""
            });
            setIsEditing(false);
            return;
        }

        try {
            const response = await apiClient.put('/investigations/update', payload);
            if (response.data.success) {
                setInvestigation(prev => ({ ...prev, ...editedInvestigation }));
                setPopup({
                    open: true,
                    status: "success",
                    message: "Investigation updated successfully",
                    description: ""
                });
                setIsEditing(false);
            } else {
                setPopup({
                    open: true,
                    status: "error",
                    message: "Failed to update investigation",
                    description: response.data.message || ""
                });
            }
        } catch (err) {
            setPopup({
                open: true,
                status: "error",
                message: "Failed to update investigation",
                description: err.response?.data?.message || ""
            });
        }
    };

    // Officer management
    const handleAddOfficer = async () => {
        if (!selectedOfficerToAdd) return;

        try {
            const response = await apiClient.post('/investigations/addOfficer', {
                investigation_id: investigationId,
                officer_id: selectedOfficerToAdd.id
            });

            if (response.data.success) {
                await fetchInvestigationData();
                setPopup({
                    open: true,
                    status: "success",
                    message: "Officer added successfully",
                    description: `${selectedOfficerToAdd.name} has been added to the investigation`
                });
                setSelectedOfficerToAdd(null);
                setShowAddOfficer(false);
                fetchAvailableOfficers();
            }
        } catch (err) {
            setPopup({
                open: true,
                status: "error",
                message: "Failed to add officer",
                description: err.response?.data?.message || ""
            });
        }
    };

    const handleRemoveOfficer = async (officerId) => {
        try {
            const response = await apiClient.post('/investigations/removeOfficer', {
                investigation_id: investigationId,
                officer_id: officerId
            });

            if (response.data.success) {
                await fetchInvestigationData();
                setPopup({
                    open: true,
                    status: "success",
                    message: "Officer removed successfully",
                    description: ""
                });
                fetchAvailableOfficers();
            }
        } catch (err) {
            setPopup({
                open: true,
                status: "error",
                message: "Failed to remove officer",
                description: err.response?.data?.message || ""
            });
        }
        setConfirmationPopup({ open: false, type: '', data: null });
    };

    const handlePopupClose = () => {
        setPopup({ ...popup, open: false });
    };

    // Evidence creation handler
    const handleCreateEvidence = () => {
        setOpenCreateEvidenceModal(true);
    };

    const handleEvidenceModalClose = () => {
        setOpenCreateEvidenceModal(false);
        // Refresh investigation data to show new evidence
        fetchInvestigationData();
    };

    // Quick action handlers
    const handleAddEvidence = () => {
        setOpenCreateEvidenceModal(true);
    };

    // Define quick actions
    const quickActions = [
        ...(canAddEvidence() ? [{
            icon: <Assignment fontSize="small" />,
            label: 'Add Evidence',
            onClick: handleAddEvidence,
            styles: 'w-full bg-blue-600 text-white hover:bg-blue-700 border-blue-600'
        }] : [])
    ];

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
                    onClick={() => navigate('/investigations')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Return to Investigations List
                </button>
            </div>
        );
    }

    if (!investigation) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500 text-xl">No investigation data found</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <PageHeader
                title="Investigation Details"
                breadcrumbItems={[
                    { label: 'Dashboard', link: '/dashboard' },
                    { label: 'Investigations', link: '/investigations' },
                    { label: investigationId.substring(0, 8) }
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
                            label: 'Edit Investigation',
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
                        onClick: () => navigate(`/recordhistory/investigation/${investigationId}`),
                        styles: 'bg-white rounded-full text-gray-700 border-purple-600'
                    }
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Investigation Header Card */}
                <div className="bg-white rounded-xl shadow-sm mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                    <Search className="text-blue-700" />
                                </div>
                                <div>
                                    <div className="text-gray-500 text-sm font-medium">Investigation Reference</div>
                                    <h1 className="text-xl font-bold text-gray-900">{'#' + investigationId}</h1>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                                <div className="flex items-center text-gray-500">
                                    <CalendarToday className="h-4 w-4 mr-1" />
                                    <span className="text-sm">Started: {formatDate(investigation.start_dt)}</span>
                                </div>

                                <StatusBadge
                                    status={isEditing ? editedInvestigation.status : investigation.status}
                                    statusList={investigationStatusList}
                                    isEditing={isEditing}
                                    name="status"
                                    handleInputChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="col-span-2 space-y-6">
                        {/* Investigation Details Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Description className="h-5 w-5 mr-2 text-blue-600" />
                                Investigation Details
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Topic {isEditing && <span className="text-red-500">*</span>}
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="topic"
                                            value={editedInvestigation.topic || ''}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-blue-300 rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Investigation topic"
                                        />
                                    ) : (
                                        <div className="bg-gray-50 p-3 rounded-lg text-gray-800">
                                            {investigation.topic}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <LocationOn className="w-4 h-4 inline mr-1" />
                                        Location {isEditing && <span className="text-red-500">*</span>}
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            name="location"
                                            value={editedInvestigation.location || ''}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full p-3 border border-blue-300 rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            placeholder="Investigation location"
                                        />
                                    ) : (
                                        <div className="bg-gray-50 p-3 rounded-lg text-gray-800 whitespace-pre-wrap">
                                            {investigation.location}
                                        </div>
                                    )}
                                </div>

                                {investigation.end_dt && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            End Date
                                        </label>
                                        <div className="bg-gray-50 p-3 rounded-lg text-gray-800">
                                            {formatDate(investigation.end_dt)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Related Case Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <FolderOpen className="h-5 w-5 mr-2 text-blue-600" />
                                Related Case
                            </h2>

                            <div className="border border-blue-100 rounded-lg overflow-hidden">
                                <div className="bg-blue-50 p-4">
                                    <div className="flex justify-between items-start">                                        <div>
                                        <h4 className="font-medium text-blue-900">Case #{investigation.case_id}</h4>
                                        <p className="text-blue-700 mt-1">{investigation.case_topic || "No topic available"}</p>
                                    </div>
                                        {canViewRelatedCase() && (
                                            <Link
                                                to={`/cases/${investigation.case_id}`}
                                                className="bg-blue-100 text-blue-700 hover:bg-blue-200 p-2 rounded-lg transition-colors"
                                            >
                                                <BusinessCenter className="h-5 w-5" />
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-white">
                                    <div className="flex items-center mb-4">
                                        <span className="text-sm text-gray-500">Type:</span>
                                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                            {investigation.case_type || "N/A"}
                                        </span>
                                    </div>

                                    <div className="flex items-center mb-4">
                                        <span className="text-sm text-gray-500">Status:</span>
                                        <span className={`ml-2 font-medium ${investigation.case_status === 'inprogress' ? 'text-green-700' :
                                            investigation.case_status === 'closed' ? 'text-red-700' : 'text-yellow-700'
                                            }`}>
                                            {investigation.case_status || "Unknown"}
                                        </span>
                                    </div>

                                    {investigation.case_leader_name && investigation.leader_id && (
                                        <div className="mt-3">
                                            <div className="text-sm text-gray-500 mb-2">Case Leader:</div>
                                            <OfficerCard
                                                officer={{
                                                    id: investigation.leader_id,
                                                    name: investigation.case_leader_name,
                                                    profilePic: investigation.case_leader_profile_pic,
                                                    role: investigation.case_leader_role,
                                                    type: "Case Leader"
                                                }}
                                                size="small"
                                                className="border border-gray-100 hover:border-blue-300"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Evidence Card - Remove the Add Evidence button */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Assignment className="h-5 w-5 mr-2 text-blue-600" />
                                Evidence ({investigation.evidence?.length || 0})
                            </h2>

                            {investigation.evidence && investigation.evidence.length > 0 ? (
                                <div className="space-y-3">
                                    {investigation.evidence.map((evidence) => (
                                        <div key={evidence.evidence_id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start">
                                                    <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                                                        <Assignment className="text-indigo-700" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{evidence.type}</h4>
                                                        <p className="text-gray-600 mt-1">{evidence.details}</p>
                                                        {evidence.location && (
                                                            <p className="text-gray-500 text-sm mt-1">
                                                                <LocationOn className="h-3 w-3 inline mr-1" />
                                                                {evidence.location}
                                                            </p>
                                                        )}
                                                        <p className="text-gray-500 text-xs mt-2">
                                                            Collected by: {evidence.officer_name} • {formatDate(evidence.collected_dt)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-100 text-xs text-gray-600 px-2 py-1 rounded-md whitespace-nowrap">
                                                    {evidence.evidence_id}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-lg text-gray-500 text-sm flex items-center">
                                    <Assignment className="h-4 w-4 mr-2" />
                                    <p>No evidence collected for this investigation yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Officers and Quick Actions */}
                    <div className="col-span-1 space-y-6">
                        {/* Investigation Officers Card */}
                        <div className="bg-white rounded-xl shadow-sm ">
                            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                                <div className="flex justify-between items-center">
                                    <h2 className="font-semibold text-gray-800 flex items-center">
                                        <Group className="h-5 w-5 mr-2 text-blue-600" />
                                        Officers ({investigation.officers?.length || 0})
                                    </h2>
                                    {canManageOfficers() && !showAddOfficer && (
                                        <button
                                            onClick={() => setShowAddOfficer(true)}
                                            className="flex bg-blue-600  hover:cursor-pointer text-white p-1 rounded-full hover:bg-blue-700 transition-colors"
                                        >
                                            <Add fontSize="small" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-6">
                                {showAddOfficer && canManageOfficers() && (
                                    <div className="mb-4 p-4 rounded-lg border border-blue-200">
                                        <div className="text-sm font-medium text-gray-700 mb-2">Add More Officers to Investigation</div>
                                        <CustomOfficerDropdown
                                            filters={{
                                                dropRoles: ['OIC', 'Crime OIC'],
                                                dropIds: investigation.officers?.map(o => o.user_id) || []
                                            }}
                                            selectedOfficerId={selectedOfficerToAdd?.id}
                                            onOfficerSelect={setSelectedOfficerToAdd}
                                            setError={() => { }}
                                            className="mb-3"
                                        />
                                        <div className="flex gap-2">
                                            <OutlinedButton
                                                action={{
                                                    label: 'Add',
                                                    onClick: handleAddOfficer,
                                                    styles: 'bg-blue-600 text-white hover:bg-blue-700',
                                                }}
                                            />
                                            <OutlinedButton
                                                action={{
                                                    label: 'Cancel',
                                                    onClick: () => {
                                                        setShowAddOfficer(false);
                                                        setSelectedOfficerToAdd(null);
                                                    },
                                                    styles: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {investigation.officers && investigation.officers.length > 0 ? (
                                    <div className="space-y-3">
                                        {investigation.officers.map((officer) => (
                                            <div key={officer.user_id} className="flex items-center justify-between">
                                                <OfficerCard
                                                    officer={{
                                                        name: officer.name,
                                                        role: officer.role,
                                                        profilePic: officer.profile_pic,
                                                        type: "Investigation Officer"
                                                    }}
                                                    size="small"
                                                    className="border border-gray-100 hover:border-blue-300 flex-1"
                                                />
                                                {canManageOfficers() && (
                                                    <button
                                                        onClick={() => setConfirmationPopup({
                                                            open: true,
                                                            type: 'removeOfficer',
                                                            data: officer
                                                        })}
                                                        className="ml-2 text-red-600 hover:text-red-800 p-1 rounded"
                                                    >
                                                        <Remove fontSize="small" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                            <Group className="text-gray-400" />
                                        </div>
                                        <p className="text-sm">No officers assigned to this investigation</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Quick Actions */}
                        {quickActions.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="bg-gradient-to-r from-gray-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                                    <h2 className="font-semibold text-gray-800 flex items-center">
                                        <DeviceHub className="h-5 w-5 mr-2 text-blue-600" />
                                        Quick Actions
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {quickActions.map((action, index) => (
                                            <div key={index} className="w-full">
                                                <OutlinedButton action={action} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
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
            />

            {/* Confirmation Popup for Officer Removal */}
            <ConfirmationPopup
                open={confirmationPopup.open && confirmationPopup.type === 'removeOfficer'}
                title="Remove Officer"
                message={`Are you sure you want to remove ${confirmationPopup.data?.name} from this investigation?`}
                confirmLabel="Remove"
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={() => handleRemoveOfficer(confirmationPopup.data?.user_id)}
                onCancel={() => setConfirmationPopup({ open: false, type: '', data: null })}
            />

            {/* Create Evidence Modal */}
            <CreateEvidenceModal
                open={openCreateEvidenceModal}
                onClose={handleEvidenceModalClose}
                canCreate={canAddEvidence()}
                context="investigation"
                contextId={investigationId}
            />
        </div>
    );
};

export default SingleInvestigationView;
