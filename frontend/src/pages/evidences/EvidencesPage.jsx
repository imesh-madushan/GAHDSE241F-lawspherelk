import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarMonth, AccessTime, Add, Assignment, LocationOn, Visibility } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import PageHeader from '../../components/common/PageHeader';
import SearchInterface from '../../components/searchsection/SearchInterface';
import CreateEvidenceModal from '../../components/modals/CreateEvidenceModal';
import { useAuth } from '../../contexts/AuthContext';
import { compCaseStatusList } from '../../../data';

const EvidencesPage = () => {
    const [evidences, setEvidences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const { user } = useAuth();

    const navigate = useNavigate();

    const searchOptions = [
        { value: 'type', label: 'Evidence Type' },
        { value: 'evidence_id', label: 'Evidence ID' },
        { value: 'location', label: 'Location' },
        { value: 'case_id', label: 'Case ID' },
        { value: 'investigation_id', label: 'Investigation ID' },
        { value: 'offence_id', label: 'Offence ID' },
        { value: 'officer_name', label: 'Collected By' }
    ];

    const filterConfig = [
        {
            id: 'evidence_type',
            label: 'Evidence Type',
            options: [
                { value: 'all', label: 'All Types' },
                { value: 'Voice Statement', label: 'Voice Statement' },
                { value: 'Written Statement', label: 'Written Statement' },
                { value: 'Fingerprint', label: 'Fingerprint' },
                { value: 'Photograph', label: 'Photograph' },
                { value: 'Video Footage', label: 'Video Footage' },
                { value: 'CCTV Recording', label: 'CCTV Recording' },
                { value: 'DNA Sample', label: 'DNA Sample' },
                { value: 'Document', label: 'Document' },
                { value: 'Digital Document', label: 'Digital Document' },
                { value: 'Mobile Phone', label: 'Mobile Phone' },
                { value: 'Other', label: 'Other' }
            ]
        },
        {
            id: 'linking_type',
            label: 'Linked To',
            options: [
                { value: 'all', label: 'All' },
                { value: 'case', label: 'Case Only', colorVariant: 'blue' },
                { value: 'investigation', label: 'Investigation', colorVariant: 'green' },
                { value: 'offence', label: 'Offence', colorVariant: 'red' }
            ]
        }
    ];

    useEffect(() => {
        fetchEvidences();
    }, []);

    const fetchEvidences = async () => {
        try {
            const response = await apiClient.get('/evidences/getAllEvidence');
            setEvidences(response.data.evidences || []);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch evidence data');
            setLoading(false);
        }
    };

    const handleSearch = async (searchParams) => {
        try {
            setLoading(true);
            let endpoint = '/evidences/search';
            let params = {};

            if (searchParams.searchTerm && searchParams.searchTerm.trim() !== '') {
                switch (searchParams.searchType) {
                    case 'type':
                        params.type = searchParams.searchTerm.trim();
                        break;
                    case 'evidence_id':
                        params.evidence_id = searchParams.searchTerm.trim();
                        break;
                    case 'location':
                        params.location = searchParams.searchTerm.trim();
                        break;
                    case 'case_id':
                        params.case_id = searchParams.searchTerm.trim();
                        break;
                    case 'investigation_id':
                        params.investigation_id = searchParams.searchTerm.trim();
                        break;
                    case 'offence_id':
                        params.offence_id = searchParams.searchTerm.trim();
                        break;
                    case 'officer_name':
                        params.officer_name = searchParams.searchTerm.trim();
                        break;
                }
            }

            if (searchParams.evidence_type && searchParams.evidence_type !== 'all') {
                params.evidence_type = searchParams.evidence_type;
            }
            if (searchParams.linking_type && searchParams.linking_type !== 'all') {
                params.linking_type = searchParams.linking_type;
            }
            
            const response = await apiClient.get(endpoint, { params });
            setEvidences(response.data.evidences || []);
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

    const canAddEvidence = () => {
        return user && (
            user.role === 'OIC' ||
            user.role === 'Crime OIC' ||
            user.role === 'Inspector' ||
            user.role === 'Sub Inspector' ||
            user.role === 'Sergeant' ||
            user.role === 'Police Constable' ||
            user.role === 'Forensic Officer'
        );
    };

    const handleEvidenceModalClose = () => {
        setOpenCreateModal(false);
        // Refresh evidence data after creation
        fetchEvidences();
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
                title="Evidence Records"
                breadcrumbItems={[
                    { label: 'Dashboard', link: '/dashboard' },
                    { label: 'Evidence' }
                ]}
                actions={[
                    ...(canAddEvidence() ? [{
                        icon: <Add fontSize='small' className='bg-white text-blue-800 rounded-full' />,
                        label: 'Add Evidence',
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
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evidence ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collected Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collected By</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Linked To</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {evidences.map((evidence) => (
                                    <tr key={evidence.evidence_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <Link to={`/evidences/${evidence.evidence_id}`} className="hover:underline text-blue-600 font-medium">
                                                {evidence.evidence_id}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Assignment className="mr-2 text-blue-600" fontSize="small" />
                                                <span className="text-sm text-gray-900">{evidence.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <LocationOn className="mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                                <span>{evidence.location || 'Not specified'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <CalendarMonth className="mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                                <span>{formatDate(evidence.collected_dt)}</span>
                                                <AccessTime className="ml-2 mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                                <span>{formatTime(evidence.collected_dt)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center group relative w-fit">
                                                <Link to={`/officers/${evidence.officer_id}`} className="hover:underline text-blue-600">
                                                    {evidence.collected_by}
                                                </Link>
                                                <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                                                    ID: {evidence.officer_id}
                                                </div>
                                            </div>
                                            <div className="text-gray-500 text-xs mt-1">{evidence.officer_role}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {/* Linked To: show all linked cases and investigation topics, no IDs unless hover */}
                                            <div className="flex flex-col gap-1">
                                                {/* Investigation (if any) */}
                                                {evidence.investigation_topic && (
                                                    <div className="group relative w-fit">
                                                        <Link
                                                            to={`/investigations/${evidence.investigation_id}`}
                                                            className="hover:underline text-green-600"
                                                        >
                                                            {evidence.investigation_topic}
                                                        </Link>
                                                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                                                            ID: {evidence.investigation_id}
                                                        </div>
                                                    </div>
                                                )}
                                                {/* All linked cases (can be multiple) */}
                                                {Array.isArray(evidence.linked_cases) && evidence.linked_cases.length > 0 ? (
                                                    evidence.linked_cases.map((caseObj) => (
                                                        <div key={caseObj.case_id} className="group relative w-fit">
                                                            <Link
                                                                to={`/cases/${caseObj.case_id}`}
                                                                className="hover:underline text-blue-600"
                                                            >
                                                                {caseObj.case_topic || 'Untitled Case'}
                                                            </Link>
                                                            <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                                                                ID: {caseObj.case_id}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : evidence.case_status && compCaseStatusList.some(s => s.value === evidence.case_status) ? (
                                                    <span className={
                                                        compCaseStatusList.find(s => s.value === evidence.case_status)?.styles
                                                    }>
                                                        {
                                                            compCaseStatusList.find(s => s.value === evidence.case_status)?.label
                                                        }
                                                    </span>
                                                ) : evidence.case_topic ? (
                                                    <div className="group relative w-fit">
                                                        <Link
                                                            to={`/cases/${evidence.case_id}`}
                                                            className="hover:underline text-blue-600"
                                                        >
                                                            {evidence.case_topic}
                                                        </Link>
                                                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                                                            ID: {evidence.case_id}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">Not linked</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {evidences.length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-2xl shadow-sm">
                        No evidence records found matching your search criteria
                    </div>
                )}
            </div>

            {/* Create Evidence Modal */}
            <CreateEvidenceModal
                open={openCreateModal}
                onClose={handleEvidenceModalClose}
                canCreate={canAddEvidence()}
                context="general"
                contextId={null}
            />
        </div>
    );
};

export default EvidencesPage;
