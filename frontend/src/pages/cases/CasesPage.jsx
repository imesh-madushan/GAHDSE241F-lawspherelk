import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarMonth, AccessTime, Add, Assignment, Person } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import SearchInterface from '../../components/searchsection/SearchInterface';
import Spinner from '../../components/Spinner';
import { caseStatusList } from '../../../data';

const CasesPage = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const { user } = useAuth();
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
                ...caseStatusList.map(status => ({
                    value: status.value,
                    label: status.label,
                    colorVariant: status.styles.includes('yellow') ? 'yellow' :
                        status.styles.includes('blue') ? 'blue' :
                            status.styles.includes('green') ? 'green' :
                                status.styles.includes('red') ? 'red' : 'gray'
                }))
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
                console.log('Fetched cases:', data.cases);
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

    const getStatusStyle = (status) => {
        const statusObj = caseStatusList.find(s => s.value === status);
        return statusObj ? statusObj.styles : 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status) => {
        const statusObj = caseStatusList.find(s => s.value === status);
        return statusObj ? statusObj.label : status;
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
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leader</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evidence Count</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {cases.map((caseData) => (
                                    <tr key={caseData.case_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <Link to={`/cases/${caseData.case_id}`} className="hover:underline text-blue-600 font-medium">
                                                {caseData.case_id}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Assignment className="mr-2 text-blue-600" fontSize="small" />
                                                <span className="text-sm text-gray-900 font-medium">
                                                    {caseData.topic || 'Untitled Case'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {caseData.case_type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(caseData.case_status)}`}>
                                                {getStatusLabel(caseData.case_status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <CalendarMonth className="mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                                <span>{formatDate(caseData.started_dt)}</span>
                                                {caseData.started_dt && (
                                                    <>
                                                        <AccessTime className="ml-2 mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                                        <span>{formatTime(caseData.started_dt)}</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {caseData.leader_name ? (
                                                <div className="flex items-center">
                                                    <Person className="mr-1 text-gray-400" fontSize="small" />
                                                    <div>
                                                        <Link to={`/officers/${caseData.leader_id}`} className="hover:underline text-blue-600">
                                                            {caseData.leader_name}
                                                        </Link>
                                                        <div className="text-gray-500 text-xs mt-1">{caseData.leader_role}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">Not assigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                    {caseData.evidence_count || 0} Evidence
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {cases.length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-2xl shadow-sm">
                        No cases found matching your search criteria
                    </div>
                )}
            </div>
        </div>
    );
};

export default CasesPage;