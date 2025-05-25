import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../config/apiConfig';
import ComplaintCard from '../../components/ComplaintCard';
import { Add, FilterList, NewReleases, Visibility } from '@mui/icons-material';
import OutlinedButton from '../../components/buttons/OutlinedButton';
import Spinner from '../../components/Spinner';
import PageHeader from '../../components/common/PageHeader';
import SearchInterface from '../../components/searchsection/SearchInterface';
import CreateComplaintModal from '../../components/complaints/CreateComplaintModal';

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
    ]

    const filterConfig = [
        {
            id: 'status',
            label: 'Status',
            options: [
                { value: 'all', label: 'All' },
                { value: 'new', label: 'New', colorVariant: 'blue' },
                { value: 'viewed', label: 'Viewed', colorVariant: 'green' }
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

    // Add search handler for complaints
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
                setSelectedStatus(searchParams.status); // sync filter buttons
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
                <div className="mb-0">
                    <SearchInterface
                        searchOptions={searchOptions}
                        filters={filterConfig}
                        onSearch={handleSearch}
                    />
                </div>


                {/* Complaints List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {complaints.length === 0 ? (
                        <div className="col-span-2 text-center py-8">
                            <p className="text-gray-500">No complaints found</p>
                        </div>
                    ) : (
                        complaints.map((complaint) => (
                            <ComplaintCard
                                key={complaint.complain_id}
                                complaint={complaint}
                            />
                        ))
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