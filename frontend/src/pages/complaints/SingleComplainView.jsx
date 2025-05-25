import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Description as FileText,
    CalendarToday,
    Person as User,
    Edit,
    RemoveRedEye as Eye,
    BusinessCenter as Briefcase,
    LocalOffer as Tag,
    Phone,
    LocationOn as MapPin,
    FindInPage as FileSearch,
    PersonAdd as UserPlus,
    Folder,
    Close,
    Email,
    Badge
} from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import PageHeader from '../../components/common/PageHeader';
import OfficerCard from '../../components/cards/OfficerCard';
import StatusBadge from '../../components/badges/StatusBadge';
import OutlinedButton from '../../components/buttons/OutlinedButton';
import SidebarCard from '../../components/cards/SidebarCard';

const SingleComplaintView = () => {
    const { complaintId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [officers, setOfficers] = useState([]);
    const [showStartCaseModal, setShowStartCaseModal] = useState(false);
    const [caseTopicInput, setCaseTopicInput] = useState('');
    const [caseTypeInput, setCaseTypeInput] = useState('');
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [closeCommentInput, setCloseCommentInput] = useState('');
    const [showAssignLeaderModal, setShowAssignLeaderModal] = useState(false);
    const [selectedCaseLeader, setSelectedCaseLeader] = useState('');

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
            icon: <Briefcase fontSize='small' />,
            label: 'Start Case',
            onClick: () => setShowStartCaseModal(true),
            styles: 'bg-blue-700 text-white hover:bg-blue-800 border-blue-700 h-10'
        },
        viewrelatedcase: {
            icon: <Eye fontSize='small' />,
            label: 'View Related Case',
            onClick: () => navigate(`/cases/${complaint.case.case_id}`),
            styles: 'bg-green-700 text-white hover:bg-green-800 border-green-700 h-10'
        },
        closeComplaint: {
            icon: <Close fontSize='small' />,
            label: 'Close Complaint',
            onClick: () => setShowCloseModal(true),
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
        return (user.role === "Crime OIC" || user.role === "OIC" || user.user_id === complaint.case?.leader_id) &&
            complaint.case?.status !== "oicnotreviewed";
    };

    const handleStartCase = async () => {
        if (!caseTopicInput || !caseTypeInput) return;

        try {
            const response = await apiClient.post('/cases/create', {
                complaintId: complaintId,
                topic: caseTopicInput,
                caseType: caseTypeInput
            });

            if (response.data.caseId) {
                setShowStartCaseModal(false);
                // Navigate to the newly created case
                navigate(`/cases/${response.data.caseId}`);
            }
        } catch (error) {
            console.error("Error creating case:", error);
            alert(error.response?.data?.message || "Failed to create case");
        }
    };

    const handleCloseComplaint = async () => {
        if (!closeCommentInput) return;

        try {
            const response = await apiClient.post(`/complaints/${complaintId}/close`, {
                comment: closeCommentInput
            });

            if (response.data.success) {
                // Update the complaint status in the state
                setComplaint(prev => ({
                    ...prev,
                    status: 'closed'
                }));
                setShowCloseModal(false);
                alert("Complaint closed successfully");
            }
        } catch (error) {
            console.error("Error closing complaint:", error);
            alert(error.response?.data?.message || "Failed to close complaint");
        }
    };

    const handleAssignCaseLeader = async () => {
        if (!selectedCaseLeader || !complaint.case) return;

        try {
            const response = await apiClient.post(`/cases/${complaint.case.case_id}/assignleader`, {
                leaderId: selectedCaseLeader
            });

            if (response.data.success) {
                // Update the case with the new leader
                setComplaint(prev => ({
                    ...prev,
                    case: {
                        ...prev.case,
                        leader_id: selectedCaseLeader,
                        leader_name: officers.find(o => o.user_id === selectedCaseLeader)?.name || 'Unknown',
                        leader_role: officers.find(o => o.user_id === selectedCaseLeader)?.role || 'Unknown',
                        status: 'in-progress' // Update status to in-progress
                    }
                }));

                setShowAssignLeaderModal(false);
                alert("Case leader assigned successfully");
            }
        } catch (error) {
            console.error("Error assigning case leader:", error);
            alert(error.response?.data?.message || "Failed to assign case leader");
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
                onBack={() => navigate('/complaints')}
            />

            {/* Content section */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Top Card - Complaint Header */}
                <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
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

                                <StatusBadge status={complaint.status} />

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

                                {canCloseComplaint() && (
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
                                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                                Complaint Details
                            </h2>

                            <div className="bg-gray-50 p-5 rounded-lg text-gray-800 whitespace-pre-wrap">
                                {complaint.description}
                            </div>

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
                                            <UserPlus className="h-4 w-4 mr-1" />
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
                                    <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                                    Linked Case
                                </h2>

                                {complaint.case.status !== 'oicnotreviewed' ? (
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
                                                    <Eye className="h-5 w-5" />
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
                                                        <UserPlus className="h-4 w-4 mr-1" />
                                                        No leader assigned
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                                            <Eye className="text-yellow-700" />
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
                                <Tag className="h-5 w-5 mr-2 text-blue-600" />
                                Evidence
                            </h2>

                            {complaint.firstEvidence ? (
                                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors bg-white">
                                    <div className="flex justify-between">
                                        <div className="flex items-start">
                                            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                                                <FileSearch className="text-indigo-700" />
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
                                        <FileSearch className="text-gray-500 h-4 w-4" />
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
                                    <User className="h-5 w-5 mr-2 text-blue-600" />
                                    Complainant Details
                                </h2>
                            </div>

                            {complaint.complainer ? (
                                <div className="p-6">
                                    <div className="flex flex-col space-y-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                <User className="text-blue-700" />
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
                                                    <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
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
                                        <User className="text-gray-400" />
                                    </div>
                                    <p className="text-sm">No complainant details available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {/* These would remain the same as before */}
            {/* Assign Officer Modal, Start Case Modal, Close Complaint Modal, Assign Leader Modal */}

            {/* For brevity, I'm skipping the modal code since it would be the same, 
                but you could also modernize those designs to match the new UI */}
        </div>
    );
};

export default SingleComplaintView;