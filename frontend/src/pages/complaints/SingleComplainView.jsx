import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
    History
} from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import PageHeader from '../../components/common/PageHeader';
import OfficerCard from '../../components/cards/OfficerCard';
import StatusBadge from '../../components/badges/StatusBadge';
import OutlinedButton from '../../components/buttons/OutlinedButton';
import { compCaseStatusList, complainStatusList } from '../../../data';
import CreateCaseModal from '../../components/modals/CreateCaseModal';
import ConfirmationPopup from '../../components/common/ConfirmationPopup';
import StatusPopup from '../../components/common/StatusPopup';

const SingleComplaintView = () => {
    const { complaintId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [officers, setOfficers] = useState([]);
    const [showStartCaseModal, setShowStartCaseModal] = useState(false);
    const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
    const [popup, setPopup] = useState({ open: false, status: "success", message: "", description: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [editedComplaint, setEditedComplaint] = useState({});
    const [editedComplainer, setEditedComplainer] = useState({});
    const [touched, setTouched] = useState({ description: false, name: false, nic: false });

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
            onClick: () => navigate(`/cases/${complaint.case.case_id}`),
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
        // Fetch complaint data from the backend
        const fetchComplaintData = async () => {
            setLoading(true);
            try {
                // Fetch the complaint data
                const { data } = await apiClient.get(`/complaints/${complaintId}`);

                if (data.complaintData) {
                    setComplaint(data.complaintData);
                    setEditedComplaint(data.complaintData); // set for editing
                    setEditedComplainer(data.complaintData.complainer || {});
                } else {
                    setError("No complaint data returned from server");
                }

                // Also fetch available officers for assignment (if user has appropriate role)
                if (user.role === "Crime OIC" || user.role === "OIC") {
                    try {
                        const officersResponse = await apiClient.post('/officers/getAll');
                        if (officersResponse.data && officersResponse.data.officers) {
                            setOfficers(officersResponse.data.officers);
                        }
                    } catch (officerError) {
                        console.error("Error fetching officers:", officerError);
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching complaint:", err);
                setError(err.response?.data?.message || "Failed to load complaint data");
                setLoading(false);
            }
        };

        fetchComplaintData();
    }, [complaintId, user.role]);

    // Determine permissions
    const canStartCase = () => {
        return (user.role === "Crime OIC" || user.role === "OIC") &&
            complaint?.case?.status === "oicnotreviewed" &&
            complaint?.status !== "closed";
    };

    const canCloseComplaint = () => {
        return (user.role === "Crime OIC" || user.role === "OIC") &&
            complaint?.status !== "closed";
    };

    const canViewRelatedCase = () => {
        return complaint?.case?.status !== "oicnotreviewed";
    };


    // Only allow edit if complaint is not viewed or closed
    const canEdit =
        (user.role === "OIC" || user.role === "Crime OIC" || user.id === complaint?.officer_id) &&
        complaint?.status === "new";

    const handleConfirmClose = async () => {
        try {
            const response = await apiClient.patch(`/complaints/close`, {
                complain_id: complaintId,
                case_id: complaint.case?.case_id
            });

            if (response.data.success) {
                setComplaint(prev => ({ ...prev, status: 'closed' }));
                setPopup({
                    open: true,
                    status: "success",
                    message: "Complaint Closed Successfully",
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
            console.error("Error closing complaint:", error);
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
            setEditedComplainer(complaint.complainer || {});
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }
    };

    const handleCancelEdit = () => {
        setEditedComplaint(complaint);
        setEditedComplainer(complaint.complainer || {});
        setIsEditing(false);
    };

    // Validation helpers
    const isDescriptionValid = editedComplaint.description && editedComplaint.description.trim().length > 0;
    const isNameValid = editedComplainer.name && editedComplainer.name.trim().length > 0;
    const isNicValid = editedComplainer.nic && editedComplainer.nic.trim().length > 0;

    const isFormValid = isDescriptionValid && isNameValid && isNicValid;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedComplaint(prev => ({
            ...prev,
            [name]: value
        }));
        setTouched(t => ({ ...t, [name]: true }));
    };

    const handleComplainerInputChange = (e) => {
        const { name, value } = e.target;
        setEditedComplainer(prev => ({
            ...prev,
            [name]: name === "dob" && value ? value.slice(0, 10) : value // Ensure only date part for dob
        }));
        setTouched(t => ({ ...t, [name]: true }));
    };

    // Only allow valid status transitions:
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
        setTouched({ description: true, name: true, nic: true });
        if (!isFormValid) {
            setPopup({
                open: true,
                status: "error",
                message: "Please fill all required fields.",
                description: "Complaint description, complainant name, and NIC are required."
            });
            return;
        }

        // Prevent setting status to 'new' if complaint is not new
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

        // Only send changed fields for audit log accuracy
        const payload = { complain_id: complaintId };
        // Compare complaint fields
        if (editedComplaint.description !== complaint.description)
            payload.description = editedComplaint.description;
        if (editedComplaint.status !== complaint.status)
            payload.status = editedComplaint.status;

        // Compare complainer fields
        const complainerPayload = {};
        if (editedComplainer.name !== (complaint.complainer?.name || ""))
            complainerPayload.name = editedComplainer.name;
        if (editedComplainer.nic !== (complaint.complainer?.nic || ""))
            complainerPayload.nic = editedComplainer.nic;
        if (editedComplainer.phone !== (complaint.complainer?.phone || ""))
            complainerPayload.phone = editedComplainer.phone;
        if (editedComplainer.email !== (complaint.complainer?.email || ""))
            complainerPayload.email = editedComplainer.email;
        if (editedComplainer.address !== (complaint.complainer?.address || ""))
            complainerPayload.address = editedComplainer.address;
        if (
            (editedComplainer.dob && complaint.complainer?.dob && editedComplainer.dob !== complaint.complainer.dob) ||
            (editedComplainer.dob && !complaint.complainer?.dob) ||
            (!editedComplainer.dob && complaint.complainer?.dob)
        ) {
            complainerPayload.dob = editedComplainer.dob;
        }

        if (Object.keys(complainerPayload).length > 0) {
            // Always send NIC for update if any complainer field changed
            complainerPayload.nic = editedComplainer.nic;
            payload.complainer = complainerPayload;
        }

        // If nothing changed, don't send request
        if (Object.keys(payload).length <= 1 && !payload.complainer) {
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
            const response = await apiClient.put(`/complaints/update`, payload);
            if (response.data && response.data.success) {
                setComplaint(prev => ({
                    ...prev,
                    ...((payload.description !== undefined || payload.status !== undefined) ? editedComplaint : prev),
                    complainer: {
                        ...prev.complainer,
                        ...complainerPayload
                    }
                }));
                setPopup({
                    open: true,
                    status: "success",
                    message: "Complaint updated successfully",
                    description: ""
                });
                setIsEditing(false);
            } else {
                setPopup({
                    open: true,
                    status: "error",
                    message: "Failed to update complaint",
                    description: response.data?.message || ""
                });
            }
        } catch (err) {
            setPopup({
                open: true,
                status: "error",
                message: "Failed to update complaint",
                description: err.response?.data?.message || ""
            });
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
                    onClick={() => navigate('/complaints')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Return to Complaints List
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
            {/* Header section with breadcrumb */}
            <PageHeader
                title="Complaint Details"
                breadcrumbItems={[
                    { label: 'Dashboard', link: '/dashboard' },
                    { label: 'Complaints', link: '/complaints' },
                    { label: complaintId.substring(0, 8) }
                ]}
                onBack={() => navigate(-1)}
                actions={[
                    ...(canEdit ? [
                        isEditing ? {
                            icon: <Cancel fontSize='small' />,
                            label: 'Cancel',
                            onClick: handleCancelEdit,
                            styles: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        } : {
                            icon: <Edit fontSize='small' />,
                            label: 'Edit Complaint',
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
                        onClick: () => navigate(`/recordhistory/complaints/${complaintId}`),
                        styles: 'bg-white rounded-full text-gray-700 border-purple-600'
                    }
                ]}
            />

            {/* Content section */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Top Card - Complaint Header */}
                <div className="bg-white rounded-xl shadow-sm mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                    <Folder className="text-blue-700" />
                                </div>
                                <div>
                                    <div className="text-gray-500 text-sm font-medium">Complaint Reference</div>
                                    <h1 className="text-xl font-bold text-gray-900">{'#' + complaintId}</h1>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                                <div className="flex items-center text-gray-500">
                                    <CalendarToday className="h-4 w-4 mr-1" />
                                    <span className="text-sm">Filed: {formatDate(complaint.complain_dt)}</span>
                                </div>

                                {/* Show status as readonly (not editable) while editing */}
                                <StatusBadge
                                    status={complaint.status}
                                    statusList={getAllowedStatusOptions()}
                                    isEditing={false}
                                // No handleInputChange or name prop needed since not editable
                                />

                                {canStartCase() && (
                                    <OutlinedButton
                                        action={actions.startCase}
                                    />
                                )}

                                {canViewRelatedCase() && (
                                    <OutlinedButton
                                        action={actions.viewrelatedcase}
                                    />
                                )}

                                {(canCloseComplaint() && complaint.case?.status === "oicnotreviewed") && (
                                    <OutlinedButton
                                        action={actions.closeComplaint}
                                    />
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
                                <Description className="h-5 w-5 mr-2 text-blue-600" />
                                Complaint Details
                            </h2>
                            {isEditing ? (
                                <>
                                    <textarea
                                        name="description"
                                        value={editedComplaint.description}
                                        onChange={handleInputChange}
                                        onBlur={() => setTouched(t => ({ ...t, description: true }))}
                                        className={`w-full p-3 border rounded-lg bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${touched.description && !isDescriptionValid ? 'border-red-500' : 'border-blue-300'
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

                            <div className="mt-2 flex-col items-center">
                                <div className="flex-grow ml-0 mt-3">
                                    {complaint.officer_id ? (
                                        <OfficerCard
                                            officer={{
                                                name: complaint.officer_name,
                                                role: complaint.officer_role,
                                                profilePic: complaint.officer_profile,
                                                type: "Complaint Handler"
                                            }}
                                            size="small"
                                            className="bg-white border border-gray-200 hover:border-blue-300"
                                        />
                                    ) : (
                                        <div className="inline-flex items-center bg-yellow-50 px-3 py-1 rounded-md text-yellow-700 text-sm">
                                            <PersonAdd className="h-4 w-4 mr-1" />
                                            No officer assigned
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Linked Case Card */}
                        {complaint.case && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <BusinessCenter className="h-5 w-5 mr-2 text-blue-600" />
                                    Linked Case
                                </h2>

                                {complaint.status === 'closed' ? (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                            <Close className="text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-gray-700 font-medium">Complaint Closed</p>
                                            <p className="text-gray-600 text-sm">This complaint has been closed and the related case information is no longer accessible.</p>
                                        </div>
                                    </div>
                                ) : complaint.case.status !== 'oicnotreviewed' ? (
                                    <div className="border border-blue-100 rounded-lg overflow-hidden">
                                        <div className="bg-blue-50 p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium text-blue-900">Case #{complaint.case.case_id}</h4>
                                                    <p className="text-blue-700 mt-1">{complaint.case.topic || "No topic available"}</p>
                                                </div>
                                                <Link
                                                    to={`/cases/${complaint.case.case_id}`}
                                                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 p-2 rounded-lg transition-colors"
                                                >
                                                    <RemoveRedEye className="h-5 w-5" />
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-white">
                                            <div className="flex items-center mb-4">
                                                <span className="text-sm text-gray-500">Type:</span>
                                                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                    {complaint.case.case_type || "N/A"}
                                                </span>
                                            </div>

                                            <div className="flex items-center mb-4">
                                                <span className="text-sm text-gray-500">Status:</span>
                                                <span className={`ml-2 font-medium ${complaint.case.status === 'inprogress' ? 'text-green-700' :
                                                    complaint.case.status === 'closed' ? 'text-red-700' : 'text-yellow-700'}`}>
                                                    {complaint.case.status || "Unknown"}
                                                </span>
                                                <div className={`h-3 w-3 rounded-full ml-2 
                                                    ${complaint.case.status === 'inprogress' ? 'bg-green-500' :
                                                        complaint.case.status === 'closed' ? 'bg-red-500' : 'bg-yellow-500'}`}
                                                />
                                            </div>

                                            <div className="mt-3">
                                                {complaint.case.leader_id ? (
                                                    <OfficerCard
                                                        officer={{
                                                            name: complaint.case.leader_name,
                                                            role: complaint.case.leader_role,
                                                            profilePic: complaint.case.leader_profile,
                                                            type: "Case Leader"
                                                        }}
                                                        size="small"
                                                        className="border border-gray-100 hover:border-blue-300"
                                                    />
                                                ) : (
                                                    <div className="inline-flex items-center bg-yellow-50 px-3 py-1 rounded-md text-yellow-700 text-sm">
                                                        <PersonAdd className="h-4 w-4 mr-1" />
                                                        No leader assigned
                                                    </div>
                                                )}
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

                        {/* Evidence Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <LocalOffer className="h-5 w-5 mr-2 text-blue-600" />
                                Evidence
                            </h2>

                            {complaint.firstEvidence ? (
                                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors bg-white">
                                    <div className="flex justify-between">
                                        <div className="flex items-start">
                                            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                                                <FindInPage className="text-indigo-700" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">{complaint.firstEvidence.type}</h4>
                                                <p className="text-gray-600 mt-1">{complaint.firstEvidence.details}</p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-100 h-fit text-xs text-gray-600 px-2 py-1 rounded-md whitespace-nowrap">
                                            {formatDate(complaint.firstEvidence.collected_dt)}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-lg text-gray-500 text-sm flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                        <FindInPage className="text-gray-500 h-4 w-4" />
                                    </div>
                                    <p>No evidence items recorded for this complaint.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="col-span-1 space-y-6">
                        {/* Complainer Info Card */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                                <h2 className="font-semibold text-gray-800 flex items-center">
                                    <Person className="h-5 w-5 mr-2 text-blue-600" />
                                    Complainant Details
                                </h2>
                            </div>
                            {isEditing ? (
                                <div className="p-6">
                                    <div className="flex flex-col space-y-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                <Person className="text-blue-700" />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={editedComplainer.name || ""}
                                                    onChange={handleComplainerInputChange}
                                                    onBlur={() => setTouched(t => ({ ...t, name: true }))}
                                                    className={`font-medium text-gray-900 bg-blue-50 border rounded px-2 py-1 ${touched.name && !isNameValid ? 'border-red-500' : 'border-blue-200'
                                                        }`}
                                                    placeholder="Name"
                                                />
                                                {touched.name && !isNameValid && (
                                                    <span className="text-xs text-red-600 block">Name is required.</span>
                                                )}
                                                <div className="flex items-center mt-0.5">
                                                    <Badge className="h-3.5 w-3.5 text-gray-400 mr-1" />
                                                    <input
                                                        type="text"
                                                        name="nic"
                                                        value={editedComplainer.nic || ""}
                                                        onChange={handleComplainerInputChange}
                                                        onBlur={() => setTouched(t => ({ ...t, nic: true }))}
                                                        className={`text-xs text-gray-500 bg-blue-50 border rounded px-1 py-0.5 ${touched.nic && !isNicValid ? 'border-red-500' : 'border-blue-200'
                                                            }`}
                                                        placeholder="NIC"
                                                    />
                                                </div>
                                                {touched.nic && !isNicValid && (
                                                    <span className="text-xs text-red-600 block">NIC is required.</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-gray-100">
                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="flex items-center">
                                                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                                    <input
                                                        type="text"
                                                        name="phone"
                                                        value={editedComplainer.phone || ""}
                                                        onChange={handleComplainerInputChange}
                                                        className="text-sm bg-blue-50 border border-blue-200 rounded px-2 py-1"
                                                        placeholder="Phone"
                                                    />
                                                </div>

                                                <div className="flex items-center">
                                                    <Email className="h-4 w-4 text-gray-400 mr-2" />
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={editedComplainer.email || ""}
                                                        onChange={handleComplainerInputChange}
                                                        className="text-sm bg-blue-50 border border-blue-200 rounded px-2 py-1"
                                                        placeholder="Email"
                                                    />
                                                </div>

                                                <div className="flex items-start">
                                                    <LocationOn className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                                    <textarea
                                                        name="address"
                                                        value={editedComplainer.address || ""}
                                                        onChange={handleComplainerInputChange}
                                                        className="text-sm bg-blue-50 border border-blue-200 rounded px-2 py-1"
                                                        placeholder="Address"
                                                        rows={2}
                                                    />
                                                </div>

                                                <div className="flex items-center">
                                                    <CalendarToday className="h-4 w-4 text-gray-400 mr-2" />
                                                    <input
                                                        type="date"
                                                        name="dob"
                                                        value={editedComplainer.dob ? editedComplainer.dob.slice(0, 10) : ""}
                                                        onChange={handleComplainerInputChange}
                                                        className="text-sm bg-blue-50 border border-blue-200 rounded px-2 py-1"
                                                        placeholder="DOB"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : complaint.complainer ? (
                                <div className="p-6">
                                    <div className="flex flex-col space-y-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                <Person className="text-blue-700" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">{complaint.complainer.name}</h3>
                                                <div className="flex items-center mt-0.5">
                                                    <Badge className="h-3.5 w-3.5 text-gray-400 mr-1" />
                                                    <span className="text-xs text-gray-500">{complaint.complainer.nic}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-gray-100">
                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="flex items-center">
                                                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm">{complaint.complainer.phone || "N/A"}</span>
                                                </div>

                                                <div className="flex items-center">
                                                    <Email className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm">{complaint.complainer.email || "N/A"}</span>
                                                </div>

                                                <div className="flex items-start">
                                                    <LocationOn className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                                    <span className="text-sm">{complaint.complainer.address || "N/A"}</span>
                                                </div>

                                                <div className="flex items-center">
                                                    <CalendarToday className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm">DOB: {complaint.complainer.dob ? format(new Date(complaint.complainer.dob), 'MMM dd, yyyy') : "N/A"}</span>
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
                                    <p className="text-sm">No complainant details available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateCaseModal
                open={showStartCaseModal}
                onClose={() => setShowStartCaseModal(false)}
                complaintId={complaintId}
                caseId={complaint.case.case_id}
            />

            {/* Close Confirmation Popup */}
            <ConfirmationPopup
                open={showCloseConfirmation}
                title="Close Complaint"
                message="Are you sure you want to close this complaint? This action will mark the complaint as resolved and may affect related cases."
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

export default SingleComplaintView;