import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Description,
    CalendarToday,
    Person,
    Edit,
    RemoveRedEye,
    BusinessCenter,
    LocalOffer,
    Phone,
    LocationOn,
    FindInPage,
    PersonAdd,
    Folder,
    Close,
    Email,
    Badge,
    Save,
    Cancel,
    History,
    Web,
    AttachFile,
    CloudDownload,
    Image,
    VideoFile,
    AudioFile,
    PictureAsPdf,
    Description as DocIcon
} from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/badges/StatusBadge';
import OutlinedButton from '../../components/buttons/OutlinedButton';
import { complainStatusList } from '../../../data';
import CreateCaseModal from '../../components/modals/CreateCaseModal';
import ConfirmationPopup from '../../components/common/ConfirmationPopup';
import StatusPopup from '../../components/common/StatusPopup';

const SingleOnlineComplaintView = () => {
    const { complaintId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showStartCaseModal, setShowStartCaseModal] = useState(false);
    const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
    const [popup, setPopup] = useState({ open: false, status: "success", message: "", description: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [editedComplaint, setEditedComplaint] = useState({});
    const [touched, setTouched] = useState({ description: false });

    // Check if user has permission to view online complaints
    const hasPermission = user && (user.role === 'OIC' || user.role === 'Crime OIC');

    // Format date helper function
    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
        } catch (e) {
            return 'N/A';
        }
    };

    const actions = {
        startCase: {
            icon: <BusinessCenter fontSize='small' />,
            label: 'Start Case',
            onClick: () => setShowStartCaseModal(true),
            styles: 'bg-blue-700 text-white hover:bg-blue-800 border-blue-700 h-10'
        },
        viewrelatedcase: {
            icon: <RemoveRedEye fontSize='small' />,
            label: 'View Related Case',
            onClick: () => navigate(`/cases/${complaint.case?.case_id}`),
            styles: 'bg-green-700 text-white hover:bg-green-800 border-green-700 h-10'
        },
        closeComplaint: {
            icon: <Close fontSize='small' />,
            label: 'Close Complaint',
            onClick: () => setShowCloseConfirmation(true),
            styles: 'bg-red-600 text-white hover:bg-red-700 border-red-600 h-10'
        },
    };

    useEffect(() => {
        if (hasPermission) {
            fetchComplaintData();
        }
    }, [complaintId, hasPermission]);

    const fetchComplaintData = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get(`/complaints/online/${complaintId}`);

            if (data.complaint) {
                setComplaint(data.complaint);
                setEditedComplaint(data.complaint);
            } else {
                setError("No complaint data returned from server");
            }

            setLoading(false);
        } catch (err) {
            console.error("Error fetching online complaint:", err);
            setError(err.response?.data?.message || "Failed to load complaint data");
            setLoading(false);
        }
    };

    // Determine permissions
    const canStartCase = () => {
        return hasPermission &&
            complaint?.case?.status === "oicnotreviewed" &&
            complaint?.status !== "closed";
    };

    const canCloseComplaint = () => {
        return hasPermission && complaint?.status !== "closed";
    };

    const canViewRelatedCase = () => {
        if (
            complaint?.status === "new" ||
            complaint?.case?.status === "oicnotreviewed" ||
            complaint?.case?.status === "oicrejected"
        ) {
            return false;
        }
        return hasPermission;
    };

    const canEdit = hasPermission && complaint?.status === "new";

    const handleConfirmClose = async () => {
        try {
            const response = await apiClient.patch(`/complaints/online/close`, {
                complaint_id: complaintId,
                case_id: complaint.case?.case_id
            });

            if (response.data.success) {
                setComplaint(prev => ({ ...prev, status: 'closed' }));
                setPopup({
                    open: true,
                    status: "success",
                    message: "Online Complaint Closed Successfully",
                    description: `Complaint ${complaintId} has been marked as closed.`
                });
            } else {
                setPopup({
                    open: true,
                    status: "error",
                    message: "Failed to Close Complaint",
                    description: response.data.message || "An error occurred while closing the complaint."
                });
            }
        } catch (error) {
            console.error("Error closing online complaint:", error);
            setPopup({
                open: true,
                status: "error",
                message: "Failed to Close Complaint",
                description: error.response?.data?.message || "An error occurred while closing the complaint."
            });
        }

        setShowCloseConfirmation(false);
    };

    const handlePopupClose = () => {
        setPopup({ ...popup, open: false });
    };

    // Edit handlers
    const handleEditToggle = () => {
        if (isEditing) {
            setEditedComplaint(complaint);
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }
    };

    const handleCancelEdit = () => {
        setEditedComplaint(complaint);
        setIsEditing(false);
    };

    const isDescriptionValid = editedComplaint.description && editedComplaint.description.trim().length > 0;
    const isFormValid = isDescriptionValid;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedComplaint(prev => ({
            ...prev,
            [name]: value
        }));
        setTouched(t => ({ ...t, [name]: true }));
    };

    const getAllowedStatusOptions = () => {
        if (complaint.status === 'new') {
            return complainStatusList;
        }
        if (complaint.status === 'closed') {
            return complainStatusList.filter(opt => opt.value === 'closed' || opt.value === 'viewed');
        }
        if (complaint.status === 'viewed') {
            return complainStatusList.filter(opt => opt.value === 'viewed');
        }
        return complainStatusList;
    };

    const handleSaveChanges = async () => {
        setTouched({ description: true });
        if (!isFormValid) {
            setPopup({
                open: true,
                status: "error",
                message: "Please fill all required fields.",
                description: "Complaint description is required."
            });
            return;
        }

        if (
            editedComplaint.status === 'new' &&
            complaint.status !== 'new'
        ) {
            setPopup({
                open: true,
                status: "error",
                message: "Invalid status change.",
                description: "You cannot set the complaint status back to 'New' once it has been viewed or closed."
            });
            return;
        }

        const payload = { complaint_id: complaintId };
        if (editedComplaint.description !== complaint.description)
            payload.description = editedComplaint.description;
        if (editedComplaint.status !== complaint.status)
            payload.status = editedComplaint.status;

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
            const response = await apiClient.put(`/complaints/online/update`, payload);
            if (response.data && response.data.success) {
                setComplaint(prev => ({
                    ...prev,
                    ...editedComplaint
                }));
                setPopup({
                    open: true,
                    status: "success",
                    message: "Online complaint updated successfully",
                    description: ""
                });
                setIsEditing(false);
            } else {
                setPopup({
                    open: true,
                    status: "error",
                    message: "Failed to update online complaint",
                    description: response.data?.message || ""
                });
            }
        } catch (err) {
            setPopup({
                open: true,
                status: "error",
                message: "Failed to update online complaint",
                description: err.response?.data?.message || ""
            });
        }
    };

    // Get file icon based on file type
    const getFileIcon = (fileType) => {
        if (fileType?.startsWith('image/')) return <Image className="text-blue-600" />;
        if (fileType?.startsWith('video/')) return <VideoFile className="text-purple-600" />;
        if (fileType?.startsWith('audio/')) return <AudioFile className="text-green-600" />;
        if (fileType?.includes('pdf')) return <PictureAsPdf className="text-red-600" />;
        if (fileType?.includes('word') || fileType?.includes('document')) return <DocIcon className="text-blue-600" />;
        return <AttachFile className="text-gray-600" />;
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Handle file download
    const handleFileDownload = (fileUrl, fileName) => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // If user doesn't have permission, show access denied
    if (!hasPermission) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-red-500 text-xl mb-4">Access Denied</div>
                <p className="text-gray-600 mb-4">You don't have permission to view online complaints.</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

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
                    onClick={() => navigate('/onlinecomplaints')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Return to Online Complaints List
                </button>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500 text-xl">No complaint data found</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header section */}
            <PageHeader
                title="Online Complaint Details"
                breadcrumbItems={[
                    { label: 'Dashboard', link: '/dashboard' },
                    { label: 'Online Complaints', link: '/onlinecomplaints' },
                    { label: complaintId.substring(0, 8) }
                ]}
                onBack={() => navigate(-1)}
                actions={[
                ]}
            />

            {/* Content section */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Top Card - Complaint Header */}
                <div className="bg-white rounded-xl shadow-sm mb-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-3 rounded-lg mr-4">
                                    <Web className="text-green-700" />
                                </div>
                                <div>
                                    <div className="text-gray-500 text-sm font-medium">Online Complaint Reference</div>
                                    <h1 className="text-xl font-bold text-gray-900">{'#' + complaintId}</h1>
                                    <div className="text-sm text-green-700 font-medium mt-1">
                                        {complaint.complaint_type}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                                <div className="flex items-center text-gray-500">
                                    <CalendarToday className="h-4 w-4 mr-1" />
                                    <span className="text-sm">Submitted: {formatDate(complaint.complaint_date)}</span>
                                </div>

                                <StatusBadge
                                    status={complaint.status}
                                    statusList={getAllowedStatusOptions()}
                                    isEditing={false}
                                />

                                {canStartCase() && (
                                    <OutlinedButton action={actions.startCase} />
                                )}

                                {canViewRelatedCase() && (
                                    <OutlinedButton action={actions.viewrelatedcase} />
                                )}

                                {(canCloseComplaint() && complaint.case?.status === "oicnotreviewed") && (
                                    <OutlinedButton action={actions.closeComplaint} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="col-span-2 space-y-6">
                        {/* Complaint Description Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Description className="h-5 w-5 mr-2 text-green-600" />
                                Complaint Details
                            </h2>
                            {isEditing ? (
                                <>
                                    <textarea
                                        name="description"
                                        value={editedComplaint.description}
                                        onChange={handleInputChange}
                                        onBlur={() => setTouched(t => ({ ...t, description: true }))}
                                        className={`w-full p-3 border rounded-lg bg-green-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${touched.description && !isDescriptionValid ? 'border-red-500' : 'border-green-300'
                                            }`}
                                        rows={4}
                                        placeholder="Enter complaint details"
                                    />
                                    {touched.description && !isDescriptionValid && (
                                        <span className="text-xs text-red-600">Description is required.</span>
                                    )}
                                </>
                            ) : (
                                <div className="bg-gray-50 p-5 rounded-lg text-gray-800 whitespace-pre-wrap">
                                    {complaint.description}
                                </div>
                            )}
                        </div>

                        {/* Evidence Files Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <LocalOffer className="h-5 w-5 mr-2 text-green-600" />
                                Evidence Files
                            </h2>

                            {complaint.evidence_files && complaint.evidence_files.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {complaint.evidence_files.map((file, index) => (
                                        <div
                                            key={file.evidence_id || index}
                                            className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors bg-white"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start flex-1">
                                                    <div className="bg-gray-100 p-2 rounded-lg mr-3 flex-shrink-0">
                                                        {getFileIcon(file.file_type)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="font-medium text-gray-900 truncate">
                                                            {file.file_name}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {file.file_type}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {formatFileSize(file.file_size)}
                                                        </p>                                                        {file.uploaded_at && (
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {formatDate(file.uploaded_at)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {file.file_url && (
                                                    <button
                                                        onClick={() => handleFileDownload(file.file_url, file.file_name)}
                                                        className="ml-2 bg-green-100 text-green-700 hover:bg-green-200 p-2 rounded-lg transition-colors flex-shrink-0"
                                                        title="Download file"
                                                    >
                                                        <CloudDownload className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-lg text-gray-500 text-sm flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                        <AttachFile className="text-gray-500 h-4 w-4" />
                                    </div>
                                    <p>No evidence files attached to this complaint.</p>
                                </div>
                            )}
                        </div>

                        {/* Linked Case Card */}
                        {complaint.case && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <BusinessCenter className="h-5 w-5 mr-2 text-green-600" />
                                    Linked Case
                                </h2>

                                {complaint.status === 'closed' ? (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                            <Close className="text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-gray-700 font-medium">Complaint Closed</p>
                                            <p className="text-gray-600 text-sm">This complaint has been closed.</p>
                                        </div>
                                    </div>
                                ) : complaint.case.status !== 'oicnotreviewed' ? (
                                    <div className="border border-green-100 rounded-lg overflow-hidden">
                                        <div className="bg-green-50 p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium text-green-900">Case #{complaint.case.case_id}</h4>
                                                    <p className="text-green-700 mt-1">{complaint.case.topic || "No topic available"}</p>
                                                </div>
                                                {canViewRelatedCase() && (
                                                    <button
                                                        onClick={() => navigate(`/cases/${complaint.case.case_id}`)}
                                                        className="bg-green-100 text-green-700 hover:bg-green-200 p-2 rounded-lg transition-colors"
                                                    >
                                                        <RemoveRedEye className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-white">
                                            <div className="flex items-center mb-4">
                                                <span className="text-sm text-gray-500">Type:</span>
                                                <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                    {complaint.case.case_type || "N/A"}
                                                </span>
                                            </div>

                                            <div className="flex items-center mb-4">
                                                <span className="text-sm text-gray-500">Status:</span>
                                                <span className={`ml-2 font-medium ${complaint.case.status === 'inprogress' ? 'text-green-700' :
                                                    complaint.case.status === 'closed' ? 'text-red-700' : 'text-yellow-700'
                                                    }`}>
                                                    {complaint.case.status || "Unknown"}
                                                </span>
                                                <div className={`h-3 w-3 rounded-full ml-2 ${complaint.case.status === 'inprogress' ? 'bg-green-500' :
                                                    complaint.case.status === 'closed' ? 'bg-red-500' : 'bg-yellow-500'
                                                    }`} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                                            <RemoveRedEye className="text-yellow-700" />
                                        </div>
                                        <div>
                                            <p className="text-yellow-800 font-medium">Case Review Required</p>
                                            <p className="text-yellow-700 text-sm">This complaint has an associated case that needs OIC review.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Complainant Info */}
                    <div className="col-span-1 space-y-6">
                        {/* Complainant Info Card */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-green-50 px-6 py-4 border-b border-gray-100">
                                <h2 className="font-semibold text-gray-800 flex items-center">
                                    <Person className="h-5 w-5 mr-2 text-green-600" />
                                    Complainant Details
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-col space-y-4">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                            <Person className="text-green-700" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{complaint.complainant_full_name}</h3>
                                            <div className="flex items-center mt-0.5">
                                                <Badge className="h-3.5 w-3.5 text-gray-400 mr-1" />
                                                <span className="text-xs text-gray-500">{complaint.nic_no}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-gray-100">
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="flex items-center">
                                                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-sm">{complaint.phone_no || "N/A"}</span>
                                            </div>

                                            <div className="flex items-center">
                                                <Email className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-sm">{complaint.email || "N/A"}</span>
                                            </div>

                                            <div className="flex items-start">
                                                <LocationOn className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                                <span className="text-sm">{complaint.address || "N/A"}</span>
                                            </div>

                                            <div className="flex items-center">
                                                <CalendarToday className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-sm">DOB: {complaint.dob ? format(new Date(complaint.dob), 'MMM dd, yyyy') : "N/A"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateCaseModal
                open={showStartCaseModal}
                onClose={() => setShowStartCaseModal(false)}
                complaintId={complaintId}
                caseId={complaint.case?.case_id}
                isOnlineComplaint={true}
            />

            {/* Close Confirmation Popup */}
            <ConfirmationPopup
                open={showCloseConfirmation}
                title="Close Online Complaint"
                message="Are you sure you want to close this online complaint? This action will mark the complaint as resolved."
                confirmLabel="Yes, Close"
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={handleConfirmClose}
                onCancel={() => setShowCloseConfirmation(false)}
            />

            {/* Status Popup */}
            <StatusPopup
                open={popup.open}
                status={popup.status}
                message={popup.message}
                description={popup.description}
                onClose={handlePopupClose}
                okLabel={popup.status === "success" ? "OK" : "Close"}
            />
        </div>
    );
};

export default SingleOnlineComplaintView;