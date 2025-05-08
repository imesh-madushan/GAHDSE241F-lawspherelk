import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../config/apiConfig';
import ComplaintCard from '../../components/ComplaintCard';
import { Add, FilterList, NewReleases, Visibility } from '@mui/icons-material';
import OutlinedButton from '../../components/buttons/OutlinedButton';
import Spinner from '../../components/Spinner';

const ComplaintsPage = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const navigate = useNavigate();

    const statusFilters = [
        { value: 'all', label: 'All Complaints', icon: <FilterList />, styles: 'bg-gray-100 text-gray-800 border-gray-300' },
        { value: 'new', label: 'New Complaints', icon: <NewReleases />, styles: 'bg-blue-100 text-blue-800 border-blue-300' },
        { value: 'viewed', label: 'Viewed Complaints', icon: <Visibility />, styles: 'bg-green-100 text-green-800 border-green-300' }
    ];

    const actions = {
        createComplaint: {
            icon: <Add fontSize='small' />,
            label: 'Create New Complaint',
            onClick: () => navigate('/complaints/new'),
            styles: 'h-10 bg-blue-600 text-white border-blue-600'
        }
    };

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
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Complaints</h1>
                <OutlinedButton action={actions.createComplaint} />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex items-center space-x-4">
                    <FilterList className="text-gray-600" />
                    <div className="flex space-x-2">
                        {statusFilters.map((filter) => (
                            <OutlinedButton
                                key={filter.value}
                                action={{
                                    icon: filter.icon,
                                    label: filter.label,
                                    onClick: () => setSelectedStatus(filter.value),
                                    styles: selectedStatus === filter.value
                                        ? filter.styles
                                        : 'bg-gray-100 text-gray-700 border-gray-300'
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Complaints List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    );
};

export default ComplaintsPage; 