import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../config/apiConfig';
import CaseCard from '../../components/CaseCard';
import { Add, FilterList, List, Pending, CheckCircle } from '@mui/icons-material';
import FilledButton from '../../components/buttons/FilledButton';
import OutlinedButton from '../../components/buttons/OutlinedButton';
import Spinner from '../../components/Spinner';
import PageHeader from '../../components/common/PageHeader'; // <-- Add this import

const CasesPage = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const navigate = useNavigate();

    const statusFilters = [
        { value: 'all', label: 'All Cases', icon: <List />, styles: 'bg-gray-100 text-gray-800 border-gray-300' },
        { value: 'inprogress', label: 'In Progress', icon: <Pending />, styles: 'bg-blue-100 text-blue-800 border-blue-300' },
        { value: 'closed', label: 'Closed', icon: <CheckCircle />, styles: 'bg-red-100 text-red-800 border-red-300' }
    ];

    // Add breadcrumb items for PageHeader
    const breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Cases' }
    ];

    useEffect(() => {
        fetchCases();
    }, [selectedStatus]);

    const fetchCases = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedStatus !== 'all') {
                params.status = selectedStatus;
            }

            const { data } = await apiClient.get('/cases/getAllCases', { params });
            if (data.cases) {
                setCases(data.cases);
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setCases([]);
            } else {
                setError('Failed to fetch cases. Please try again.');
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
        <div className="bg-gray-100 min-h-screen">
            <PageHeader
                title="Cases"
                breadcrumbItems={breadcrumbItems}
                showBackButton={true}
                onBack={() => navigate(-1)}
                actions={[
                    {
                        icon: <Add fontSize='small' />,
                        label: 'Create New Case',
                        onClick: () => navigate('/cases/new'),
                        styles: 'h-10 bg-blue-600 text-white border-blue-600'
                    }
                ]}
            />
            <div className="container mx-auto px-4 py-6">
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

                {/* Cases List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cases.length === 0 ? (
                        <div className="col-span-2 text-center py-8">
                            <p className="text-gray-500">No cases found</p>
                        </div>
                    ) : (
                        cases.map((caseData) => (
                            <CaseCard
                                key={caseData.case_id}
                                caseData={caseData}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CasesPage;