import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../config/apiConfig';
import CaseCard from '../../components/CaseCard';
import { Add, FilterList, List, Pending, CheckCircle } from '@mui/icons-material';
import FilledButton from '../../components/buttons/FilledButton';
import OutlinedButton from '../../components/buttons/OutlinedButton';
import Spinner from '../../components/Spinner';
import PageHeader from '../../components/common/PageHeader'; // <-- Add this import
import SearchInterface from '../../components/searchsection/SearchInterface';

const CasesPage = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const navigate = useNavigate();

    // Add breadcrumb items for PageHeader
    const breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Cases' }
    ];

    // Search/filter config
    const searchOptions = [
        { value: 'topic', label: 'Case Topic' },
        { value: 'case_id', label: 'Case ID' },
        { value: 'case_type', label: 'Case Type' },
        { value: 'officer', label: 'Officer Name' }
    ];

    const filterConfig = [
        {
            id: 'status',
            label: 'Status',
            options: [
                { value: 'all', label: 'All' },
                { value: 'inprogress', label: 'In Progress', colorVariant: 'blue' },
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

    ]

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

    // Add search handler
    const handleSearch = async (searchParams) => {
        setLoading(true);
        try {
            let endpoint = '/cases/search';
            let params = {};

            // Handle search term and type
            if (searchParams.searchTerm && searchParams.searchTerm.trim() !== '') {
                switch (searchParams.searchType) {
                    case 'topic':
                        params.topic = searchParams.searchTerm.trim();
                        break;
                    case 'case_id':
                        params.case_id = searchParams.searchTerm.trim();
                        break;
                    case 'case_type':
                        params.case_type = searchParams.searchTerm.trim();
                        break;
                    case 'officer':
                        params.officer = searchParams.searchTerm.trim();
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
            console.log(params);

            const response = await apiClient.get(endpoint, { params });
            if (response.data.cases) {
                setCases(response.data.cases);
            } else {
                setCases([]);
            }
            setError(null);
        } catch (error) {
            setCases([]);
            setError('Failed to fetch cases. Please try again.');
        }
        setLoading(false);
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
            />
            <div className="container mx-auto px-4 py-4">
                {/* Search Section */}
                <div className="mb-2">
                    <SearchInterface
                        searchOptions={searchOptions}
                        filters={filterConfig}
                        onSearch={handleSearch}
                    />
                </div>


                {/* Cases List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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