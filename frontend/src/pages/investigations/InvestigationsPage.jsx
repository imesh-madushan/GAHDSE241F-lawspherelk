import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarMonth, AccessTime, Add, Group, Fingerprint } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import PageHeader from '../../components/common/PageHeader';
import SearchInterface from '../../components/searchsection/SearchInterface';
import { useAuth } from '../../contexts/AuthContext';
import CreateInvestigationModal from '../../components/modals/CreateInvestigationModal';

const InvestigationsPage = () => {
    const [investigations, setInvestigations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const { user } = useAuth();

    const navigate = useNavigate();

    const searchOptions = [
        { value: 'topic', label: 'Investigation Topic' },
        { value: 'investigation_id', label: 'Investigation ID' },
        { value: 'case_id', label: 'Case ID' },
        { value: 'officer_name', label: 'Officer Name' },
        { value: 'location', label: 'Location' }
    ];

    const filterConfig = [
        {
            id: 'status',
            label: 'Status',
            options: [
                { value: 'all', label: 'All' },
                { value: 'inprogress', label: 'In Progress', colorVariant: 'blue' },
                { value: 'completed', label: 'Completed', colorVariant: 'green' },
                { value: 'closed', label: 'Closed', colorVariant: 'gray' }
            ]
        }
    ];

    useEffect(() => {
        fetchInvestigations();
    }, []);

    const fetchInvestigations = async () => {
        try {
            const response = await apiClient.get('/investigations/getAllInvestigations');
            setInvestigations(response.data.investigations);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch investigations data');
            setLoading(false);
        }
    };

    const handleSearch = async (searchParams) => {
        try {
            setLoading(true);
            let endpoint = '/investigations/search';
            let params = {};

            if (searchParams.searchTerm && searchParams.searchTerm.trim() !== '') {
                switch (searchParams.searchType) {
                    case 'topic':
                        params.topic = searchParams.searchTerm.trim();
                        break;
                    case 'investigation_id':
                        params.investigation_id = searchParams.searchTerm.trim();
                        break;
                    case 'case_id':
                        params.case_id = searchParams.searchTerm.trim();
                        break;
                    case 'officer_name':
                        params.officer_name = searchParams.searchTerm.trim();
                        break;
                    case 'location':
                        params.location = searchParams.searchTerm.trim();
                        break;
                }
            }

            if (searchParams.status && searchParams.status !== 'all') {
                params.status = searchParams.status;
            }

            const response = await apiClient.get(endpoint, { params });
            setInvestigations(response.data.investigations);
            setLoading(false);
        } catch (err) {
            console.error('Search error:', err);
            setError('Search failed');
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'inprogress':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'closed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'inprogress':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            case 'closed':
                return 'Closed';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <PageHeader
                title="Investigations"
                breadcrumbItems={[
                    { label: 'Dashboard', link: '/dashboard' },
                    { label: 'Investigations' }
                ]}
                actions={[
                    ...(user && (
                        user.role === 'OIC' ||
                        user.role === 'Crime OIC' ||
                        user.role === 'Inspector' ||
                        user.role === 'Sub Inspector'
                    ) ? [{
                        icon: <Add fontSize='small' className='bg-white text-blue-800 rounded-full' />,
                        label: 'Create Investigation',
                        onClick: () => setOpenCreateModal(true),
                        styles: 'h-10 bg-blue-800 text-white border-blue-800'
                    }] : [])
                ]}
                onBack={() => navigate(-1)}
            />

            <div className="container mx-auto p-4">
                {/* Modern Search Interface */}
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
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investigation ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Related Case</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Officers</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evidence</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {investigations.map((investigation) => (
                                    <tr key={investigation.investigation_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <Link to={`/investigations/${investigation.investigation_id}`} className="hover:underline text-blue-600">
                                                {investigation.investigation_id}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="font-medium">{investigation.topic}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(investigation.status)}`}>
                                                {getStatusLabel(investigation.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <CalendarMonth className="mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                                <span>{formatDate(investigation.start_dt)}</span>
                                                <AccessTime className="ml-2 mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                                <span>{formatTime(investigation.start_dt)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="max-w-xs truncate" title={investigation.location}>
                                                {investigation.location || 'Not specified'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {investigation.case_id ? (
                                                <div>
                                                    <Link to={`/cases/${investigation.case_id}`} className="hover:underline text-blue-600">
                                                        {investigation.case_topic || 'Untitled Case'}
                                                    </Link>
                                                    <div className="text-gray-500 text-xs mt-1">ID: {investigation.case_id}</div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">No case linked</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <Group className="mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                                <span>{investigation.officer_count || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <Fingerprint className="mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                                <span>{investigation.evidence_count || 0}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {investigations.length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-2xl shadow-sm">
                        No investigations found matching your search criteria
                    </div>
                )}
            </div>
            <CreateInvestigationModal
                open={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                canCreate={
                    user &&
                    (
                        user.role === 'OIC' ||
                        user.role === 'Crime OIC' ||
                        user.role === 'Inspector' ||
                        user.role === 'Sub Inspector'
                    )
                }
            />
        </div>
    );
};

export default InvestigationsPage;
