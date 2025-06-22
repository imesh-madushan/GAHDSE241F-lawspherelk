import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Print, Edit, Save, Cancel, History, Gavel, Attachment, Add, DeviceHub } from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import CriminalProfile from '../../components/criminal/CriminalProfile';
import CriminalTabs from '../../components/criminal/CriminalTabs';
import OffencesTab from '../../components/criminal/tabs/OffencesTab';
import EvidenceTab from '../../components/criminal/tabs/EvidenceTab';
import ForensicTab from '../../components/criminal/tabs/ForensicTab';
import { apiClient } from '../../config/apiConfig';
import StatusPopup from '../../components/common/StatusPopup';
import CreateOffenceModal from '../../components/modals/CreateOffenceModal';
import CreateEvidenceModal from '../../components/modals/CreateEvidenceModal';
import OutlinedButton from '../../components/buttons/OutlinedButton';
import { useAuth } from '../../contexts/AuthContext';

const CriminalRecord = () => {
    const { user } = useAuth();
    const { criminalId } = useParams();
    const [criminalData, setCriminalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('offences');
    const [isEditing, setIsEditing] = useState(false);
    const [editedCriminal, setEditedCriminal] = useState(null);
    const [popup, setPopup] = useState({ open: false, status: '', message: '', description: '' });
    const [pendingUpdate, setPendingUpdate] = useState(null);
    const [showCreateOffenceModal, setShowCreateOffenceModal] = useState(false);
    const [showCreateEvidenceModal, setShowCreateEvidenceModal] = useState(false);
    const [newProfileImage, setNewProfileImage] = useState(null);
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
        // Validation: name, nic, dob required
        if (!editedCriminal.name || !editedCriminal.name.trim()) {
            setPopup({ open: true, status: 'error', message: 'Name is required', description: 'Criminal name cannot be empty.' });
            return;
        }
        if (!editedCriminal.nic || !editedCriminal.nic.trim()) {
            setPopup({ open: true, status: 'error', message: 'NIC is required', description: 'NIC cannot be empty.' });
            return;
        }
        if (!editedCriminal.dob || !editedCriminal.dob.trim()) {
            setPopup({ open: true, status: 'error', message: 'Date of Birth is required', description: 'DOB cannot be empty.' });
            return;
        }

        // Check for changes in regular fields
        const changedFields = {};
        [
            'name', 'nic', 'phone', 'address', 'dob', 'fingerprint_hash'
        ].forEach(field => {
            if (editedCriminal[field] !== criminalData[field]) {
                changedFields[field] = editedCriminal[field];
            }
        });

        // Check if there are any changes (including new profile image)
        const hasChanges = Object.keys(changedFields).length > 0 || newProfileImage;

        if (!hasChanges) {
            setPopup({ open: true, status: 'info', message: 'No changes detected', description: 'No modifications were made to update.' });
            setIsEditing(false);
            return;
        }

        try {
            // Create FormData for file upload (same pattern as CreateCriminalModal)
            const formData = new FormData();

            // Add criminal_id
            formData.append('criminal_id', criminalData.criminal_id);

            // Add changed fields
            Object.keys(changedFields).forEach(key => {
                formData.append(key, changedFields[key]);
            });

            // Add profile image if exists
            if (newProfileImage) {
                formData.append('profileImage', newProfileImage);
            }

            const response = await apiClient.put('/criminals/update', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data && response.data.success) {
                setPopup({ open: true, status: 'success', message: 'Criminal record updated successfully', description: 'All changes have been saved.' });
                setPendingUpdate(editedCriminal);
                setIsEditing(false);
                setNewProfileImage(null);
                // Refresh data to get updated photo URL
                fetchCriminalData();
            } else {
                setPopup({ open: true, status: 'error', message: 'Update failed', description: response.data?.message || 'Failed to update criminal record.' });
            }
        } catch (err) {
            setPopup({ open: true, status: 'error', message: 'Update failed', description: err?.response?.data?.message || 'An error occurred while updating the record.' });
        }
    };

    const handlePopupClose = () => {
        setPopup(prev => ({ ...prev, open: false }));
        if (popup.status === 'success' && pendingUpdate) {
            setCriminalData(pendingUpdate);
            setEditedCriminal(pendingUpdate);
            setPendingUpdate(editedCriminal);
            setIsEditing(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Handle profile image upload
        if (name === 'newProfileImage') {
            setNewProfileImage(value);
            return;
        }

        setEditedCriminal(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCancelEdit = () => {
        setEditedCriminal(criminalData);
        setNewProfileImage(null);
        setIsEditing(false);
    };

    // Define authorization permissions
    const canAddOffence = ['Crime OIC', 'OIC'].includes(user.role);

    // Quick action handlers
    const handleAddOffence = () => {
        setShowCreateOffenceModal(true);
    };

    // Define quick actions
    const quickActions = [
        ...(canAddOffence ? [{
            icon: <Gavel fontSize="small" />,
            label: 'Add Offence',
            onClick: handleAddOffence,
            styles: 'w-full bg-gray-800 text-white hover:bg-gray-900 border-gray-800'
        }] : [])
    ]; if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
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
                title={isEditing ? "Edit Criminal Record" : "Criminal Record"}
                breadcrumbItems={[
                    { label: 'Dashboard', link: '/dashboard' },
                    { label: 'Criminals', link: '/criminals' },
                    { label: criminalData.name }
                ]}
                onBack={() => navigate(-1)}
                actions={[
                    {
                        icon: <Print fontSize='small' />,
                        label: 'Print Record',
                        styles: 'text-gray-800 border border-gray-800',
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
                        styles: 'text-gray-800 border border-gray-800'
                    },
                    isEditing ? {
                        icon: <Save fontSize='small' />,
                        label: 'Save',
                        onClick: handleSaveChanges,
                        styles: 'bg-gray-800 text-white'
                    } : null,
                    // {
                    //     icon: <History fontSize='small' />,
                    //     onClick: () => navigate(`/recordhistory/criminalrecord/${criminalId}`),
                    //     styles: 'bg-white rounded-full text-gray-700 border-gray-400'
                    // }
                ].filter(Boolean)}
            />

            <div className="container mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-3">
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

                    {/* Right Sidebar */}
                    <div className="lg:col-span-1 space-y-6">                        {/* Criminal Summary Card */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                                <h2 className="font-semibold text-gray-800">Criminal Summary</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Total Offences:</span>
                                    <span className="font-bold text-xl text-red-600">{criminalData.offences?.length || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Evidence Items:</span>
                                    <span className="font-bold text-xl text-blue-600">{criminalData.evidence?.length || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Age:</span>
                                    <span className="font-medium text-lg">{calculateAge(criminalData.dob)} years</span>
                                </div>
                            </div>
                        </div>                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                                <h2 className="font-semibold text-gray-800 flex items-center">
                                    <DeviceHub className="h-5 w-5 mr-2 text-gray-700" />
                                    Quick Actions
                                </h2>
                            </div>
                            <div className="p-6 space-y-3">
                                {quickActions.length > 0 ? (
                                    quickActions.map((action, index) => (
                                        <div key={index} className="w-full">
                                            <OutlinedButton action={action} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        <DeviceHub className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm">No actions available for your role</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateOffenceModal
                open={showCreateOffenceModal}
                onClose={() => setShowCreateOffenceModal(false)}
                canCreate={canAddOffence}
                context="criminal"
                contextId={criminalId}
            />

            <StatusPopup
                open={popup.open}
                status={popup.status}
                message={popup.message}
                description={popup.description}
                onClose={handlePopupClose}
                okLabel={popup.status === 'success' ? 'Ok' : 'Close'}
            />

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