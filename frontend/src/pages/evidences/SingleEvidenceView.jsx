import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Assignment,
    CalendarMonth,
    LocationOn,
    Person,
    Edit,
    Save,
    Cancel,
    FolderOpen,
    Search,
    People,
    History
} from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import PageHeader from '../../components/common/PageHeader';
import StatusPopup from '../../components/common/StatusPopup';
import OutlinedButton from '../../components/buttons/OutlinedButton';
import { useAuth } from '../../contexts/AuthContext';
import EvidenceTabNavigation from '../../components/evidence/EvidenceTabNavigation';
import WitnessesTab from '../../components/evidence/tabs/WitnessesTab';
import InvestigationTab from '../../components/evidence/tabs/InvestigationTab';
import LinkedCasesTab from '../../components/evidence/tabs/LinkedCasesTab';
import RelatedEvidenceTab from '../../components/evidence/tabs/RelatedEvidenceTab';
import OfficerCard from '../../components/cards/OfficerCard';
import { evidenceTypes } from '../../../data';

const SingleEvidenceView = () => {
    const { evidenceId } = useParams();
    const { user } = useAuth();
    const [evidence, setEvidence] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [editForm, setEditForm] = useState({
        type: '',
        location: '',
        details: '',
        collected_dt: ''
    });
    const [popup, setPopup] = useState({
        open: false,
        status: 'success',
        message: '',
        description: ''
    });
    const [activeTab, setActiveTab] = useState('witnesses');
    const [tabCounts, setTabCounts] = useState({
        witnesses: 0,
        investigation: 0,
        cases: 0,
        related: 0
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchEvidenceDetails();
    }, [evidenceId]);

    // Check if user has edit permissions
    const canEdit = () => {
        if (!user || !evidence) return false;
        return (
            user.role === 'OIC' ||
            user.role === 'Crime OIC' ||
            user.user_id === evidence.officer_id // officer_id is the user_id of the collector
        );
    }


    // Add this new function to calculate tab counts
    const calculateTabCounts = (evidenceData) => {
        setTabCounts({
            witnesses: evidenceData.witnesses?.length || 0,
            investigation: evidenceData.investigation_id ? 1 : 0,
            cases: evidenceData.linked_cases?.length || 0,
            related: evidenceData.related_evidence?.length || 0
        });
    };

    const fetchEvidenceDetails = async () => {
        try {
            const response = await apiClient.get(`/evidences/${evidenceId}`);
            if (response.data.success) {
                setEvidence(response.data.evidence);
                const evidenceData = response.data.evidence;
                // Calculate tab counts
                calculateTabCounts(evidenceData);
                setEditForm({
                    type: evidenceData.type || '',
                    location: evidenceData.location || '',
                    details: evidenceData.details || '',
                    collected_dt: evidenceData.collected_dt ?
                        new Date(evidenceData.collected_dt).toISOString().slice(0, 16) : ''
                });
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching evidence:', err);
            setError('Failed to load evidence details');
            setLoading(false);
        }
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            setEditForm({
                type: evidence.type || '',
                location: evidence.location || '',
                details: evidence.details || '',
                collected_dt: evidence.collected_dt ?
                    new Date(evidence.collected_dt).toISOString().slice(0, 16) : ''
            });
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdate = async () => {
        // Only send changed fields
        const changedFields = {};
        if (editForm.type !== evidence.type) changedFields.type = editForm.type;
        if (editForm.location !== evidence.location) changedFields.location = editForm.location;
        if (editForm.details !== evidence.details) changedFields.details = editForm.details;
        if (
            (editForm.collected_dt && evidence.collected_dt && editForm.collected_dt !== new Date(evidence.collected_dt).toISOString().slice(0, 16)) ||
            (!editForm.collected_dt && evidence.collected_dt) ||
            (editForm.collected_dt && !evidence.collected_dt)
        ) {
            changedFields.collected_dt = editForm.collected_dt;
        }

        if (!editForm.type.trim() || !editForm.details.trim()) {
            setPopup({
                open: true,
                status: 'error',
                message: 'Validation Error',
                description: 'Evidence type and details are required'
            });
            return;
        }

        // If nothing changed, do not send request
        if (Object.keys(changedFields).length === 0) {
            setPopup({
                open: true,
                status: 'info',
                message: 'No changes detected',
                description: ''
            });
            setIsEditing(false);
            return;
        }

        setUpdateLoading(true);
        try {
            const updateData = {
                evidence_id: evidenceId,
                ...changedFields
            };

            const response = await apiClient.put('/evidences/update', updateData);

            if (response.data.success) {
                setPopup({
                    open: true,
                    status: 'success',
                    message: 'Evidence Updated',
                    description: 'Evidence details have been successfully updated'
                });
                setIsEditing(false);
                fetchEvidenceDetails();
            } else {
                throw new Error(response.data.message || 'Update failed');
            }
        } catch (err) {
            setPopup({
                open: true,
                status: 'error',
                message: 'Update Failed',
                description: err.response?.data?.message || 'Failed to update evidence'
            });
        }
        setUpdateLoading(false);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Not specified';
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'witnesses':
                return (
                    <WitnessesTab
                        evidence={evidence}
                        formatDate={formatDate}
                    />
                );
            case 'investigation':
                return (
                    <InvestigationTab
                        evidence={evidence}
                    />
                );
            case 'cases':
                return (
                    <LinkedCasesTab
                        evidence={evidence}
                    />
                );
            case 'related':
                return (
                    <RelatedEvidenceTab
                        evidence={evidence}
                        formatDateTime={formatDateTime}
                    />
                );
            default:
                return <WitnessesTab evidence={evidence} formatDate={formatDate} />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
            </div>
        );
    }

    if (error || !evidence) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-500">{error || 'Evidence not found'}</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <StatusPopup
                open={popup.open}
                status={popup.status}
                message={popup.message}
                description={popup.description}
                onClose={() => setPopup({ ...popup, open: false })}
            />

            <PageHeader
                title={isEditing ? "Edit Evidence" : "Evidence"}
                breadcrumbItems={[
                    { label: 'Dashboard', link: '/dashboard' },
                    { label: 'Evidence', link: '/evidences' },
                    { label: evidence.evidence_id }
                ]}
                actions={[
                    ...(canEdit() ? [{
                        icon: isEditing ? <Cancel fontSize="small" /> : <Edit fontSize="small" />,
                        label: isEditing ? 'Cancel' : 'Edit Evidence',
                        onClick: handleEditToggle,
                        styles: isEditing
                            ? 'h-10 bg-red-50 text-red-700 border-red-700'
                            : 'h-10 bg-blue-50 text-blue-600 border-blue-600'
                    }] : []),
                    ...(isEditing ? [{
                        icon: <Save fontSize="small" />,
                        label: updateLoading ? 'Saving...' : 'Save',
                        onClick: handleUpdate,
                        disabled: updateLoading,
                        styles: 'h-10 bg-green-600 text-white border-green-600'
                    }] : []),
                    {
                        icon: <History fontSize='small' />,
                        onClick: () => navigate(`/recordhistory/evidence/${evidenceId}`),
                        styles: 'bg-white rounded-full text-gray-700 border-purple-600'
                    }
                ]}
                onBack={() => navigate(-1)}
            />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Evidence Details Card - Always Visible */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <h2 className="text-xl font-semibold text-blue-900 flex items-center">
                            <Assignment className="mr-3 text-blue-600" />
                            Evidence Details
                        </h2>
                    </div>
                    <div className="p-6">
                        {/* Evidence Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-500">Evidence ID</label>
                                <div className="text-lg font-semibold text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                                    {evidence.evidence_id}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-500">Type</label>
                                {isEditing ? (
                                    <select
                                        name="type"
                                        value={editForm.type}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {evidenceTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                                        <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-3 flex-shrink-0">
                                            <Assignment className="text-blue-600" fontSize="small" />
                                        </div>
                                        <span className="font-medium text-gray-900">{evidence.type}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-500 flex items-center">
                                    <CalendarMonth className="w-4 h-4 mr-1" />
                                    Collection Date & Time
                                </label>
                                {isEditing ? (
                                    <input
                                        type="datetime-local"
                                        name="collected_dt"
                                        value={editForm.collected_dt}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                ) : (
                                    <div className="text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-lg">
                                        {formatDateTime(evidence.collected_dt)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-500 flex items-center">
                                    <LocationOn className="w-4 h-4 mr-1" />
                                    Location
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="location"
                                        value={editForm.location}
                                        onChange={handleFormChange}
                                        placeholder="Evidence collection location"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                ) : (
                                    <div className="text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-lg">
                                        {evidence.location || 'Not specified'}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-500">Details</label>
                                {isEditing ? (
                                    <textarea
                                        name="details"
                                        value={editForm.details}
                                        onChange={handleFormChange}
                                        rows={4}
                                        placeholder="Evidence details and description"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    />
                                ) : (
                                    <div className="text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap">
                                        {evidence.details}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <OfficerCard
                                officer={{
                                    id: evidence.officer_id,
                                    name: evidence.collected_by,
                                    role: evidence.officer_role,
                                    profilePic: evidence.officer_profile,
                                    type: "Collected By"
                                }}
                                size="small"
                                className="bg-white border border-gray-200 hover:border-blue-300"
                            />
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mb-0">
                    <EvidenceTabNavigation
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        tabCounts={tabCounts}
                    />
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 border-t-0">
                    <div className="p-6">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleEvidenceView;
