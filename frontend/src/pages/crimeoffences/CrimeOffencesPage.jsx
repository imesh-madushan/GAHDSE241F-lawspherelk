import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarMonth, AccessTime, Add } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import PageHeader from '../../components/common/PageHeader';
import SearchInterface from '../../components/searchsection/SearchInterface';
import CreateOffenceModal from '../../components/modals/CreateOffenceModal';
import { useAuth } from '../../contexts/AuthContext';

const CrimeOffencesPage = () => {
    const [offences, setOffences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const { user } = useAuth();

    const searchOptions = [
        { value: 'crime_type', label: 'Crime Type' },
        { value: 'criminal_name', label: 'Criminal Name' },
        { value: 'criminal_id', label: 'Criminal ID' },
        { value: 'fingerprint', label: 'Fingerprint' },
        { value: 'case_id', label: 'Case ID' }
    ];

    const filterConfig = [
        {
            id: 'status',
            label: 'Status',
            options: [
                { value: 'all', label: 'All' },
                { value: 'Alleged', label: 'Alleged', colorVariant: 'yellow' },
                { value: 'Convicted', label: 'Convicted', colorVariant: 'red' },
                { value: 'Acquitted', label: 'Acquitted', colorVariant: 'green' }
            ]
        },
        {
            id: 'risk',
            label: 'Risk Level',
            options: [
                { value: 'all', label: 'All' },
                { value: 'high', label: 'High Risk', colorVariant: 'red' },
                { value: 'medium', label: 'Medium Risk', colorVariant: 'yellow' },
                { value: 'low', label: 'Low Risk', colorVariant: 'green' }
            ]
        }
    ]

    useEffect(() => {
        fetchOffences();
    }, []);

    const fetchOffences = async () => {
        try {
            const response = await apiClient.get('/crimeoffences/getAllOffences');
            setOffences(response.data.offences);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch offences data');
            setLoading(false);
        }
    };

    const handleSearch = async (searchParams) => {
        try {
            setLoading(true);
            let endpoint = '/crimeoffences/search';
            let params = {};

            if (searchParams.searchTerm && searchParams.searchTerm.trim() !== '') {
                switch (searchParams.searchType) {
                    case 'crime_type':
                        params.crime_type = searchParams.searchTerm.trim();
                        break;
                    case 'criminal_name':
                        params.criminal_name = searchParams.searchTerm.trim();
                        break;
                    case 'criminal_id':
                        params.criminal_id = searchParams.searchTerm.trim();
                        break;
                    case 'fingerprint':
                        params.fingerprint = searchParams.searchTerm.trim();
                        break;
                    case 'case_id':
                        params.case_id = searchParams.searchTerm.trim();
                        break;
                }
            }

            if (searchParams.status && searchParams.status !== 'all') {
                params.status = searchParams.status;
            }
            if (searchParams.risk && searchParams.risk !== 'all') {
                params.risk_level = searchParams.risk;
            }

            const response = await apiClient.get(endpoint, { params });
            setOffences(response.data.offences);
            setLoading(false);
        } catch (err) {
            console.error('Search error:', err);
            setError('Search failed');
            setLoading(false);
        }
    };

    const getRiskLevel = (score) => {
        if (score >= 70) return { level: 'High', color: 'bg-red-500' };
        if (score >= 40) return { level: 'Medium', color: 'bg-yellow-500' };
        return { level: 'Low', color: 'bg-green-500' };
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
                title="Crime Offences"
                breadcrumbItems={[
                    { label: 'Dashboard', link: '/dashboard' },
                    { label: 'Crime Offences' }
                ]}
                actions={[
                    ...(user && (
                        user.role === 'OIC' ||
                        user.role === 'Crime OIC' ||
                        user.role === 'Inspector' ||
                        user.role === 'Sub Inspector'
                    ) ? [{
                        icon: <Add fontSize='small' className='bg-white text-blue-800 rounded-full' />,
                        label: 'Create Offence',
                        onClick: () => setOpenCreateModal(true),
                        styles: 'h-10 bg-blue-800 text-white border-blue-800'
                    }] : [])
                ]}
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
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offence ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crime Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criminal</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {offences.map((offence) => (
                                    <tr key={offence.offence_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <Link to={`/crimeoffences/${offence.offence_id}`} className="hover:underline text-blue-600">
                                                {offence.offence_id}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{offence.crime_type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${offence.status === "Under Investigation"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : offence.status === "Convicted"
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-green-100 text-green-800"
                                                }`}>
                                                {offence.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <CalendarMonth className="mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                                <span>{formatDate(offence.reported_dt)}</span>
                                                <AccessTime className="ml-2 mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                                <span>{formatTime(offence.reported_dt)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Link to={`/criminals/${offence.criminal_id}`} className="hover:underline text-blue-600">
                                                {offence.criminal_name}
                                            </Link>
                                            <div className="text-gray-500 text-xs mt-1">ID: {offence.criminal_id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Link to={`/cases/${offence.case_id}`} className="hover:underline text-blue-600">
                                                {offence.case_topic || 'Untitled Case'}
                                            </Link>
                                            <div className="text-gray-500 text-xs mt-1">ID: {offence.case_id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-sm">{offence.risk_score}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {offences.length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-2xl shadow-sm">
                        No offences found matching your search criteria
                    </div>
                )}
            </div>

            <CreateOffenceModal
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

export default CrimeOffencesPage;