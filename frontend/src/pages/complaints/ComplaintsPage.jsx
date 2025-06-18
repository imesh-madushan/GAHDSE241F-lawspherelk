import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    CalendarMonth,
    AccessTime,
    Add,
    Assignment,
    Person,
    NavigateNext,
    NavigateBefore,
    MoreVert,
    KeyboardArrowDown
} from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import Spinner from '../../components/Spinner';
import PageHeader from '../../components/common/PageHeader';
import SearchInterface from '../../components/searchsection/SearchInterface';
import CreateComplaintModal from '../../components/modals/CreateComplaintModal';
import { useAuth } from '../../contexts/AuthContext';
import OfficerCard from '../../components/cards/OfficerCard';

const ComplaintsPage = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [complaintsPerPage, setComplaintsPerPage] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [sortField, setSortField] = useState('complain_dt');
    const [sortOrder, setSortOrder] = useState('desc'); // Default to newest first
    const navigate = useNavigate();
    const { user } = useAuth();

    const breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Complaints' }
    ];

    const searchOptions = [
        { value: 'description', label: 'Description' },
        { value: 'complain_id', label: 'Complaint ID' },
        { value: 'officer', label: 'Officer Name' },
        { value: 'complainer', label: 'Complainer Name' }
    ];

    const filterConfig = [
        {
            id: 'status',
            label: 'Status',
            options: [
                { value: 'all', label: 'All' },
                { value: 'new', label: 'New', colorVariant: 'blue' },
                { value: 'viewed', label: 'Viewed', colorVariant: 'green' },
                { value: 'closed', label: 'Closed', colorVariant: 'red' }
            ]
        },
        {
            id: 'timePeriod',
            label: 'Time Period',
            options: [
                { value: 'all', label: 'All Time' },
                { value: 'last_7_days', label: 'Last 7 Days' },
                { value: 'last_30_days', label: 'Last 30 Days' },
                { value: 'last_90_days', label: 'Last 90 Days' }
            ]
        }
    ];

    useEffect(() => {
        fetchComplaints();
    }, [selectedStatus]);

    useEffect(() => {
        setTotalPages(Math.ceil(complaints.length / complaintsPerPage));
        setCurrentPage(1);
    }, [complaints, complaintsPerPage]);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedStatus !== 'all') {
                params.status = selectedStatus;
            }

            const { data } = await apiClient.get('/complaints/getAllComplaints', { params });
            if (data.complaints) {
                let filtered = data.complaints;
                console.log('Fetched complaints:', filtered);
                // Officer role-based filtering
                if (user && user.role && user.role !== 'OIC' && user.role !== 'Crime OIC') {
                    filtered = filtered.filter(c => c.officer_id === user.user_id);
                }
                setComplaints(filtered);
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setComplaints([]);
            } else {
                setError('Failed to fetch complaints. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (searchParams) => {
        setLoading(true);
        try {
            let endpoint = '/complaints/search';
            let params = {};

            // Handle search term and type
            if (searchParams.searchTerm && searchParams.searchTerm.trim() !== '') {
                switch (searchParams.searchType) {
                    case 'description':
                        params.description = searchParams.searchTerm.trim();
                        break;
                    case 'complain_id':
                        params.complain_id = searchParams.searchTerm.trim();
                        break;
                    case 'officer':
                        params.officer = searchParams.searchTerm.trim();
                        break;
                    case 'complainer':
                        params.complainer = searchParams.searchTerm.trim();
                        break;
                    default:
                        break;
                }
            }

            // Handle filters
            if (searchParams.status && searchParams.status !== 'all') {
                params.status = searchParams.status;
                setSelectedStatus(searchParams.status);
            }
            if (searchParams.timePeriod && searchParams.timePeriod !== 'all') {
                params.timePeriod = searchParams.timePeriod;
            }

            const response = await apiClient.get(endpoint, { params });
            if (response.data.complaints) {
                let filtered = response.data.complaints;
                // Officer role-based filtering
                if (user && user.role && user.role !== 'OIC' && user.role !== 'Crime OIC') {
                    filtered = filtered.filter(c => c.officer_id === user.user_id);
                }
                setComplaints(filtered);
            } else {
                setComplaints([]);
            }
            setError(null);
        } catch (error) {
            setComplaints([]);
            setError('Failed to fetch complaints. Please try again.');
        }
        setLoading(false);
    };

    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder(field === 'complain_dt' ? 'desc' : 'asc'); // Default desc for dates, asc for others
        }
    };

    // Sort complaints function
    const sortComplaints = (complaintsToSort) => {
        if (!complaintsToSort || complaintsToSort.length === 0) return [];

        return [...complaintsToSort].sort((a, b) => {
            let aValue, bValue;

            switch (sortField) {
                case 'complain_dt':
                    aValue = new Date(a.complain_dt || 0);
                    bValue = new Date(b.complain_dt || 0);
                    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;

                case 'complain_id':
                    aValue = a.complain_id || '';
                    bValue = b.complain_id || '';
                    break;

                case 'complaint_status':
                    aValue = a.complaint_status || '';
                    bValue = b.complaint_status || '';
                    break;

                default:
                    aValue = a[sortField] || '';
                    bValue = b[sortField] || '';
            }

            // For string comparisons
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    };

    // Get current complaints with sorting
    const getCurrentComplaints = () => {
        const sortedComplaints = sortComplaints(complaints);
        const indexOfLastComplaint = currentPage * complaintsPerPage;
        const indexOfFirstComplaint = indexOfLastComplaint - complaintsPerPage;
        return sortedComplaints.slice(indexOfFirstComplaint, indexOfLastComplaint);
    };

    // Get sort icon based on current sort state
    const getSortIcon = (field) => {
        if (sortField !== field) {
            return <KeyboardArrowDown fontSize="small" className="ml-1 text-gray-400" />;
        }

        return (
            <KeyboardArrowDown
                fontSize="small"
                className={`ml-1 text-black transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''
                    }`}
            />
        );
    };

    // Update current complaints to use the new function
    const currentComplaints = getCurrentComplaints();

    const getStatusDotColor = (status) => {
        switch (status) {
            case 'new':
                return 'bg-blue-500';
            case 'viewed':
                return 'bg-green-500';
            case 'closed':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'new':
                return 'New';
            case 'viewed':
                return 'Viewed';
            case 'closed':
                return 'Closed';
            default:
                return status;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleCreateComplaint = () => {
        setOpenCreateModal(true);
    };

    // Get current complaints
    const indexOfLastComplaint = currentPage * complaintsPerPage;
    const indexOfFirstComplaint = indexOfLastComplaint - complaintsPerPage;
    const displayedComplaints = complaints.slice(indexOfFirstComplaint, indexOfLastComplaint);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-red-500 text-xl mb-4">{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-black text-yellow-300 rounded hover:bg-gray-900"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Determine if officer column should be shown
    const showOfficerCol = user && (user.role === 'OIC' || user.role === 'Crime OIC');

    return (
        <div className="bg-gray-100 min-h-screen">
            <PageHeader
                title="Complaints"
                breadcrumbItems={breadcrumbItems}
                showBackButton={true}
                onBack={() => navigate(-1)}
                actions={[
                    {
                        icon: <Add fontSize='small' className='text-white rounded-full' />,
                        label: 'Create Complaint',
                        onClick: handleCreateComplaint,
                        styles: 'h-10 bg-gray-950 text-white border-black rounded-2xl'
                    }
                ]}
            />
            <div className="container mx-auto px-4 py-4">
                {/* Search Section */}
                <div className="mb-6">
                    <SearchInterface
                        searchOptions={searchOptions}
                        filters={filterConfig}
                        onSearch={handleSearch}
                    />
                </div>

                {/* Redesigned Data Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Table Header with count and pagination controls */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-700">All Complaints</h3>
                            <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">
                                {complaints.length}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>Show</span>
                                <select
                                    className="border border-gray-300 rounded px-2 py-1 bg-white"
                                    value={complaintsPerPage}
                                    onChange={(e) => setComplaintsPerPage(Number(e.target.value))}
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>

                                </select>
                                <span>per page</span>
                            </div>
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className={
                                            showOfficerCol
                                                ? "px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5"
                                                : "px-10 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
                                        }
                                    >
                                        <div
                                            className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                            onClick={() => handleSort('complain_id')}
                                        >
                                            <span>Complaint ID</span>
                                            {getSortIcon('complain_id')}
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className={
                                            showOfficerCol
                                                ? "px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5"
                                                : "px-10 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5"
                                        }
                                    >
                                        <span>Description</span>
                                    </th>
                                    <th
                                        scope="col"
                                        className={
                                            showOfficerCol
                                                ? "px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
                                                : "px-10 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
                                        }
                                    >
                                        <div
                                            className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                            onClick={() => handleSort('complaint_status')}
                                        >
                                            <span>Status</span>
                                            {getSortIcon('complaint_status')}
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className={
                                            showOfficerCol
                                                ? "px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5"
                                                : "px-10 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
                                        }
                                    >
                                        <div
                                            className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                            onClick={() => handleSort('complain_dt')}
                                        >
                                            <span>Complaint Date</span>
                                            {getSortIcon('complain_dt')}
                                        </div>
                                    </th>
                                    {showOfficerCol && (
                                        <th
                                            scope="col"
                                            className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
                                        >
                                            <span>Officer</span>
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentComplaints.length > 0 ? (
                                    currentComplaints.map((complaint) => (
                                        <tr
                                            key={complaint.complain_id}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/complaints/${complaint.complain_id}`)}
                                        >
                                            <td className={showOfficerCol ? "px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-900" : "px-10 py-6 whitespace-nowrap text-sm font-medium text-gray-900"}>
                                                <Link
                                                    to={`/complaints/${complaint.complain_id}`}
                                                    className="hover:underline text-gray-900 flex items-center"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="bg-gray-100 p-2 rounded-lg mr-4 text-gray-900 flex-shrink-0">
                                                        <Assignment fontSize="small" />
                                                    </div>
                                                    <span className="font-semibold">{complaint.complain_id}</span>
                                                </Link>
                                            </td>
                                            <td className={showOfficerCol ? "px-8 py-6" : "px-10 py-6"}>
                                                <div className="max-w-md">
                                                    <span className="text-sm text-gray-900 line-clamp-2 leading-relaxed">
                                                        {
                                                            (() => {
                                                                const desc = complaint.description || 'No description available';
                                                                const words = desc.split(' ');
                                                                return words.length > 50
                                                                    ? words.slice(0, 50).join(' ') + '...'
                                                                    : desc;
                                                            })()
                                                        }
                                                    </span>
                                                </div>
                                            </td>
                                            <td className={showOfficerCol ? "px-8 py-6 whitespace-nowrap" : "px-10 py-6 whitespace-nowrap"}>
                                                <div className="flex items-center">
                                                    <span className={`inline-flex items-center text-sm font-medium text-gray-900`}>
                                                        <span className={`h-2.5 w-2.5 rounded-full mr-3 flex-shrink-0 ${getStatusDotColor(complaint.complaint_status)}`}></span>
                                                        {getStatusLabel(complaint.complaint_status)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className={showOfficerCol ? "px-8 py-6 whitespace-nowrap text-sm text-gray-900" : "px-10 py-6 whitespace-nowrap text-sm text-gray-900"}>
                                                <div className="flex items-center">
                                                    <div className="flex bg-gray-100 p-2 rounded-lg mr-3 flex-shrink-0">
                                                        <CalendarMonth className="text-gray-600" style={{ fontSize: '1rem' }} />
                                                    </div>
                                                    <div className="flex flex-col space-y-1">
                                                        <span className="font-medium">{formatDate(complaint.complain_dt)}</span>
                                                        {complaint.complain_dt && (
                                                            <span className="text-xs text-gray-500 flex items-center">
                                                                <AccessTime className="mr-1.5" style={{ fontSize: '0.75rem' }} />
                                                                {formatTime(complaint.complain_dt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            {showOfficerCol && (
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {complaint.officer_id === user.user_id ? (
                                                            <div className="bg-gray-700 text-white rounded-2xl px-4 py-1 inline-flex items-center">
                                                                <span className="font-semibold text-sm">You</span>
                                                            </div>
                                                        ) : complaint.officer_name ? (
                                                            <div className="w-full max-w-xs">
                                                                <OfficerCard
                                                                    officer={{
                                                                        id: complaint.officer_id,
                                                                        name: complaint.officer_name,
                                                                        role: complaint.officer_role,
                                                                        profilePic: complaint.officer_profile
                                                                    }}
                                                                    size="small"
                                                                    className="border-0 p-0 hover:bg-transparent"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 italic">Not assigned</span>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={showOfficerCol ? 5 : 4} className={showOfficerCol ? "px-8 py-16 text-center" : "px-10 py-16 text-center"}>
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="rounded-full bg-gray-100 p-4 mb-4">
                                                    <Assignment className="text-gray-400" style={{ fontSize: '2.5rem' }} />
                                                </div>
                                                <p className="text-gray-500 text-lg font-medium">No complaints found</p>
                                                <p className="text-sm text-gray-400 mt-2">Try adjusting your search criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {complaints.length > 0 && (
                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages}
                                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{((currentPage - 1) * complaintsPerPage) + 1}</span> to <span className="font-medium">
                                            {Math.min(currentPage * complaintsPerPage, complaints.length)}
                                        </span> of{' '}
                                        <span className="font-medium">{complaints.length}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={prevPage}
                                            disabled={currentPage === 1}
                                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            <span className="sr-only">Previous</span>
                                            <NavigateBefore fontSize="small" />
                                        </button>

                                        {/* Page numbers */}
                                        {[...Array(totalPages).keys()].map(number => (
                                            <button
                                                key={number + 1}
                                                onClick={() => paginate(number + 1)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                                    ${currentPage === number + 1
                                                        ? 'z-10 bg-gray-700 border-gray-700 text-white'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {number + 1}
                                            </button>
                                        ))}

                                        <button
                                            onClick={nextPage}
                                            disabled={currentPage === totalPages}
                                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            <span className="sr-only">Next</span>
                                            <NavigateNext fontSize="small" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Complaint Modal Component */}
            <CreateComplaintModal
                open={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
            />
        </div>
    );
};

export default ComplaintsPage;