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
    Folder
} from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import ComplaintHeader from '../../components/complaint/ComplaintHeader';
import OfficerCard from '../../components/cards/OfficerCard';

const SingleComplaintView = () => {
    const { complaintId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [officers, setOfficers] = useState([]);
    const [selectedOfficer, setSelectedOfficer] = useState('');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showStartCaseModal, setShowStartCaseModal] = useState(false);
    const [caseTopicInput, setCaseTopicInput] = useState('');
    const [caseTypeInput, setCaseTypeInput] = useState('');

    // Format date helper function
    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
        } catch (e) {
            return 'N/A';
        }
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
                    console.log("Fetched complaint data:", data.complaintData);
                } else {
                    setError("No complaint data returned from server");
                }

                // Also fetch available officers for assignment (if user has appropriate role)
                if (user.role === "Crime OIC" || user.role === "OIC") {
                    try {
                        const officersResponse = await apiClient.post('/officer/getAll');
                        if (officersResponse.data && officersResponse.data.officers) {
                            setOfficers(officersResponse.data.officers);
                        }
                    } catch (officerError) {
                        console.error("Error fetching officers:", officerError);
                        // Don't set main error - this is a secondary feature
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

    // Determine if current user can start a case (Crime OIC role)
    const canStartCase = () => {
        return user.role === "Crime OIC" &&
            complaint?.status === "viewed" &&
            !complaint?.case;
    };

    // Determine if current user can assign officer
    const canAssignOfficer = () => {
        return user.role === "Crime OIC" || user.role === "OIC";
    };

    const handleAssignOfficer = async () => {
        if (!selectedOfficer) return;

        try {
            const response = await apiClient.post(`/complaints/${complaintId}/assign`, {
                officerId: selectedOfficer
            });

            if (response.data.success) {
                // Update the UI with the newly assigned officer
                setComplaint(prev => ({
                    ...prev,
                    officer_id: selectedOfficer,
                    // The backend should return the updated complaint with officer details
                    // But we can also update from our officers list for immediate feedback
                    officer_name: officers.find(o => o.user_id === selectedOfficer)?.name || 'Unknown',
                    officer_role: officers.find(o => o.user_id === selectedOfficer)?.role || 'Unknown',
                }));

                setShowAssignModal(false);
                // Show success message
                alert("Officer assigned successfully");
            }
        } catch (error) {
            console.error("Error assigning officer:", error);
            alert(error.response?.data?.message || "Failed to assign officer");
        }
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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'new':
                return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">New</span>;
            case 'viewed':
                return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Viewed</span>;
            case 'assigned':
                return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Assigned</span>;
            case 'in-progress':
                return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">In Progress</span>;
            case 'closed':
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Closed</span>;
            default:
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500">{status}</span>;
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
            <ComplaintHeader
                complaintId={complaintId}
                onBack={() => navigate('/complaints')}
                canStartCase={canStartCase()}
                canAssignOfficer={canAssignOfficer()}
                onStartCase={() => setShowStartCaseModal(true)}
                onAssignOfficer={() => setShowAssignModal(true)}
            />

            {/* Content section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-6">
                {/* Complaint reference and status - similar to case reference in SingleCaseView */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <FileText className="text-amber-500 mr-2" />
                        <div>
                            <p className="text-sm text-gray-700">Complaint Reference</p>
                            <p className="font-mono text-gray-500">{complaintId}</p>
                        </div>
                    </div>

                    <div>
                        {getStatusBadge(complaint.status)}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column - Complaint details */}
                    <div className="col-span-2 bg-white shadow-md rounded-lg p-6">
                        <div className="pb-4 mb-4">
                            <div className="flex justify-between items-start">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <FileText className="h-5 w-5 mr-2 text-blue-800" />
                                    Complaint Details
                                </h2>
                            </div>

                            <div className="mt-4 flex flex-col space-y-3">
                                <div className="flex items-center">
                                    <CalendarToday className="h-4 w-4 mr-1" />
                                    <span className="text-sm text-gray-500">Filed on: {formatDate(complaint.complain_dt)}</span>
                                </div>

                                {/* Replace simple text with OfficerCard component */}
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 mb-1">Handled by:</p>
                                    {complaint.officer_id ? (
                                        <OfficerCard
                                            officer={{
                                                name: complaint.officer_name,
                                                role: complaint.officer_role,
                                                profilePic: complaint.officer_profile,
                                                type: "Complaint Handler"
                                            }}
                                            size="small"
                                            className="bg-white border border-gray-200 shadow-sm"
                                        />
                                    ) : (
                                        <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-500 text-sm">
                                            No officer assigned to this complaint
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <div className="bg-gray-50 p-4 rounded-md text-gray-800">
                                    {complaint.description}
                                </div>
                            </div>
                        </div>

                        {/* Linked case section */}
                        {complaint.case ? (
                            <div className="mb-6 border-t border-gray-200 pt-4">
                                <h3 className="text-md font-semibold mb-3 flex items-center">
                                    <Briefcase className="h-5 w-5 mr-2 text-blue-800" />
                                    Linked Case
                                </h3>
                                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium">Case #{complaint.case.case_id}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{complaint.case.topic || "No topic available"}</p>
                                        </div>
                                        <Link to={`/cases/${complaint.case.case_id}`} className="text-blue-800 hover:text-blue-900">
                                            <Eye className="h-5 w-5" />
                                        </Link>
                                    </div>

                                    <div className="mt-3 grid grid-cols-1 gap-3 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">Status:</span>{" "}
                                            <span className={`${complaint.case.status === 'closed' ? 'text-red-600' : 'text-green-600'}`}>
                                                {complaint.case.status || "Unknown"}
                                            </span>
                                        </div>

                                        {/* Show case leader using OfficerCard */}
                                        <div className="mt-2">
                                            <p className="text-sm font-medium text-gray-700 mb-1">Case Leader:</p>
                                            {complaint.case.leader_id ? (
                                                <OfficerCard
                                                    officer={{
                                                        name: complaint.case.leader_name,
                                                        role: complaint.case.leader_role,
                                                        profilePic: complaint.case.leader_profile,
                                                        type: "Case Leader"
                                                    }}
                                                    size="small"
                                                    className="bg-white border border-gray-200 shadow-sm"
                                                />
                                            ) : (
                                                <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-500 text-sm">
                                                    No leader assigned to this case
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            user.role === "Crime OIC" && (
                                <div className="mb-6 border-t border-gray-200 pt-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-md font-semibold flex items-center">
                                            <Briefcase className="h-5 w-5 mr-2 text-blue-800" />
                                            Linked Case
                                        </h3>
                                        <button
                                            onClick={() => setShowStartCaseModal(true)}
                                            className="text-sm text-blue-800 hover:text-blue-900 flex items-center"
                                        >
                                            + Start New Case
                                        </button>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-sm italic mt-2">
                                        No case has been created for this complaint yet.
                                    </div>
                                </div>
                            )
                        )}

                        {/* Evidence section */}
                        <div className="mb-6 border-t border-gray-200 pt-4">
                            <h3 className="text-md font-semibold mb-3 flex items-center">
                                <Tag className="h-5 w-5 mr-2 text-blue-800" />
                                Evidence Items
                            </h3>

                            {complaint.evidence && complaint.evidence.length > 0 ? (
                                <div className="space-y-3">
                                    {complaint.evidence.map(item => (
                                        <div key={item.evidence_id} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                                            <div className="flex justify-between">
                                                <div>
                                                    <h4 className="font-medium text-gray-800">{item.type}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{item.details}</p>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Collected: {formatDate(item.collected_dt)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-sm italic">
                                    No evidence items recorded for this complaint.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right column - Sidebar */}
                    <div className="col-span-1">
                        {/* Complainer information */}
                        {complaint.complainer ? (
                            <div className="bg-white shadow-md rounded-lg p-5 mb-6">
                                <h2 className="text-md font-semibold mb-4 flex items-center">
                                    <User className="h-5 w-5 mr-2 text-blue-800" />
                                    Complainant Details
                                </h2>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                                        <p className="text-gray-800 font-medium">{complaint.complainer.name}</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">NIC</label>
                                        <p className="text-gray-800">{complaint.complainer.nic}</p>
                                    </div>

                                    {complaint.complainer.phone && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Contact</label>
                                            <div className="flex items-center">
                                                <Phone className="h-4 w-4 text-gray-500 mr-2" />
                                                <p className="text-gray-800">{complaint.complainer.phone}</p>
                                            </div>
                                        </div>
                                    )}

                                    {complaint.complainer.dob && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label>
                                            <div className="flex items-center">
                                                <CalendarToday className="h-4 w-4 text-gray-500 mr-2" />
                                                <p className="text-gray-800">{formatDate(complaint.complainer.dob)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {complaint.complainer.address && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                                            <div className="flex items-start">
                                                <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                                                <p className="text-gray-800">{complaint.complainer.address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white shadow-md rounded-lg p-5 mb-6">
                                <h2 className="text-md font-semibold mb-4 flex items-center">
                                    <User className="h-5 w-5 mr-2 text-blue-800" />
                                    Complainant Details
                                </h2>
                                <p className="text-gray-500 text-sm italic">No complainant details available</p>
                            </div>
                        )}

                        {/* Actions panel */}
                        <div className="bg-white shadow-md rounded-lg p-5">
                            <h2 className="text-md font-semibold mb-4 flex items-center">
                                <FileSearch className="h-5 w-5 mr-2 text-blue-800" />
                                Actions
                            </h2>

                            <div className="space-y-3">
                                {canStartCase() && (
                                    <button
                                        onClick={() => setShowStartCaseModal(true)}
                                        className="w-full bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 flex items-center justify-center"
                                    >
                                        <Briefcase className="h-4 w-4 mr-2" />
                                        Start New Case
                                    </button>
                                )}

                                {canAssignOfficer() && (
                                    <button
                                        onClick={() => setShowAssignModal(true)}
                                        className="w-full bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 flex items-center justify-center"
                                    >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Assign Officer
                                    </button>
                                )}

                                <Link
                                    to={`/complaints/${complaintId}/edit`}
                                    className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 flex items-center justify-center"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Complaint
                                </Link>

                                <Link
                                    to="/complaints"
                                    className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100 flex items-center justify-center"
                                >
                                    Back to List
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assign Officer Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Assign Officer to Complaint</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Select an officer to handle this complaint:
                        </p>

                        <select
                            value={selectedOfficer}
                            onChange={(e) => setSelectedOfficer(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Select an Officer --</option>
                            {officers.map(officer => (
                                <option key={officer.user_id} value={officer.user_id}>
                                    {officer.name} ({officer.role})
                                </option>
                            ))}
                        </select>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignOfficer}
                                disabled={!selectedOfficer}
                                className={`px-4 py-2 rounded text-white ${selectedOfficer ? 'bg-blue-800 hover:bg-blue-900' : 'bg-blue-300 cursor-not-allowed'}`}
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Start Case Modal */}
            {showStartCaseModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Start New Case</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Create a new case for this complaint:
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Case Topic</label>
                            <input
                                type="text"
                                value={caseTopicInput}
                                onChange={(e) => setCaseTopicInput(e.target.value)}
                                placeholder="Enter case topic"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
                            <select
                                value={caseTypeInput}
                                onChange={(e) => setCaseTypeInput(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Select Case Type --</option>
                                <option value="theft">Theft</option>
                                <option value="assault">Assault</option>
                                <option value="fraud">Fraud</option>
                                <option value="burglary">Burglary</option>
                                <option value="robbery">Robbery</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowStartCaseModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStartCase}
                                disabled={!caseTopicInput || !caseTypeInput}
                                className={`px-4 py-2 rounded text-white ${caseTopicInput && caseTypeInput ? 'bg-blue-800 hover:bg-blue-900' : 'bg-blue-300 cursor-not-allowed'}`}
                            >
                                Create Case
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SingleComplaintView;