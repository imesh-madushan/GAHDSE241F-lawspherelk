import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarMonth, AccessTime, Add, Assignment, Person, Visibility } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import Spinner from '../../components/Spinner';
import PageHeader from '../../components/common/PageHeader';
import SearchInterface from '../../components/searchsection/SearchInterface';
import CreateComplaintModal from '../../components/modals/CreateComplaintModal';

const ComplaintsPage = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const navigate = useNavigate();

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

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedStatus !== 'all') {
                params.status = selectedStatus;
            }

            const { data } = await apiClient.get('/complaints/getAllComplaints', { params });
            if (data.complaints) {
                setComplaints(data.complaints);
                console.log('Fetched complaints:', data.complaints);
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
                setComplaints(response.data.complaints);
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

    const getStatusStyle = (status) => {
        switch (status) {
            case 'new':
                return 'bg-blue-100 text-blue-800';
            case 'viewed':
                return 'bg-green-100 text-green-800';
            case 'closed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <PageHeader
                title="Complaints"
                breadcrumbItems={breadcrumbItems}
                showBackButton={true}
                onBack={() => navigate(-1)}
                actions={[
                    {
                        icon: <Add fontSize='small' className='bg-white text-blue-800 rounded-full' />,
                        label: 'Create New Complaint',
                        onClick: handleCreateComplaint,
                        styles: 'h-10 bg-blue-800 text-white border-blue-800'
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

                {/* Data Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Officer</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {complaints.map((complaint) => (
                                    <tr key={complaint.complain_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <Link to={`/complaints/${complaint.complain_id}`} className="hover:underline text-blue-600 font-medium">
                                                {complaint.complain_id}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start">
                                                <Assignment className="mr-2 text-blue-600 mt-1" fontSize="small" />
                                                <div className="max-w-xs">
                                                    <span className="text-sm text-gray-900 line-clamp-2">
                                                        {complaint.description || 'No description available'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(complaint.complaint_status)}`}>
                                                {getStatusLabel(complaint.complaint_status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <CalendarMonth className="mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                                <span>{formatDate(complaint.complain_dt)}</span>
                                                {complaint.complain_dt && (
                                                    <>
                                                        <AccessTime className="ml-2 mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                                        <span>{formatTime(complaint.complain_dt)}</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {complaint.officer_name ? (
                                                <div className="flex items-center">
                                                    <Person className="mr-1 text-gray-400" fontSize="small" />
                                                    <div>
                                                        <Link to={`/officers/${complaint.officer_id}`} className="hover:underline text-blue-600">
                                                            {complaint.officer_name}
                                                        </Link>
                                                        <div className="text-gray-500 text-xs mt-1">{complaint.officer_role}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">Not assigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Link
                                                to={`/complaints/${complaint.complain_id}`}
                                                className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                                            >
                                                <Visibility fontSize="small" className="mr-1" />
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {complaints.length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-2xl shadow-sm">
                        No complaints found matching your search criteria
                    </div>
                )}
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