// This file has been moved to EvidencesPage.jsx
import { Link, useNavigate } from 'react-router-dom';
import {
    CalendarMonth,
    AccessTime,
    Add,
    Assignment,
    LocationOn,
    NavigateNext,
    NavigateBefore,
    KeyboardArrowDown,
    Group,
    Fingerprint
} from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import PageHeader from '../../components/common/PageHeader';
import SearchInterface from '../../components/searchsection/SearchInterface';
import CreateEvidenceModal from '../../components/modals/CreateEvidenceModal';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../../components/Spinner';
import { useEffect, useState } from 'react';
import OfficerCard from '../../components/cards/OfficerCard';

const EvidencesPage = () => {
    const [evidences, setEvidences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [evidencesPerPage, setEvidencesPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [sortField, setSortField] = useState('collected_dt');
    const [sortOrder, setSortOrder] = useState('desc');
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

    useEffect(() => {
        setTotalPages(Math.ceil(evidences.length / evidencesPerPage));
        setCurrentPage(1);
    }, [evidences, evidencesPerPage]);

    const fetchEvidences = async () => {
        try {
            let endpoint = '/evidences/getAllEvidence';
            let params = {};

            // Role-based filtering
            if (user.role === 'Police Constable' || user.role === 'Sergeant') {
                // Only their collected evidences
                params.officer_id = user.user_id;
            } else if (user.role === 'Inspector' || user.role === 'Sub Inspector') {
                // Their collected evidences + their case-related evidences
                params.include_user_and_cases = user.user_id;
            }
            // OIC and Crime OIC see all evidences (no additional params needed)

            const response = await apiClient.get(endpoint, { params });
            setEvidences(response.data.evidences || []);
            console.log('Fetched evidences:', response.data.evidences);
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

            // Apply role-based filtering to search as well
            if (user.role === 'Police Constable' || user.role === 'Sergeant') {
                params.officer_id = user.user_id;
            } else if (user.role === 'Inspector' || user.role === 'Sub Inspector') {
                params.include_user_and_cases = user.user_id;
            }

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

    const shouldShowCollectedByColumn = () => {
        // Hide "Collected By" column for Police Constable and Sergeant 
        // since they only see their own collected evidences
        return user.role !== 'Police Constable' && user.role !== 'Sergeant';
    };

    const handleEvidenceModalClose = () => {
        setOpenCreateModal(false);
        // Refresh evidence data after creation
        fetchEvidences();
    };

    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder(field === 'collected_dt' ? 'desc' : 'asc');
        }
    };

    // Sort evidences function
    const sortEvidences = (evidencesToSort) => {
        if (!evidencesToSort || evidencesToSort.length === 0) return [];

        return [...evidencesToSort].sort((a, b) => {
            let aValue, bValue;

            switch (sortField) {
                case 'collected_dt':
                    aValue = new Date(a.collected_dt || 0);
                    bValue = new Date(b.collected_dt || 0);
                    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                case 'evidence_id':
                    aValue = a.evidence_id || '';
                    bValue = b.evidence_id || '';
                    break;
                case 'type':
                    aValue = a.type || '';
                    bValue = b.type || '';
                    break;
                default:
                    aValue = a[sortField] || '';
                    bValue = b[sortField] || '';
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    };

    // Get current evidences with sorting
    const getCurrentEvidences = () => {
        const sortedEvidences = sortEvidences(evidences);
        const indexOfLastEvidence = currentPage * evidencesPerPage;
        const indexOfFirstEvidence = indexOfLastEvidence - evidencesPerPage;
        return sortedEvidences.slice(indexOfFirstEvidence, indexOfLastEvidence);
    };

    // Get sort icon
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

    // Pagination functions
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

    const currentEvidences = getCurrentEvidences();

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
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
                >
                    Retry
                </button>
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
                        icon: <Add fontSize='medium' className='text-white rounded-full' />,
                        label: 'Add Evidence',
                        onClick: () => setOpenCreateModal(true),
                        styles: 'h-10 bg-gray-800 text-white border-gray-900'
                    }] : [])
                ]}
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

                {/* Redesigned Data Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Table Header with count and pagination controls */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-700">All Evidence Records</h3>
                            <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">
                                {evidences.length}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>Show</span>
                                <select
                                    className="border border-gray-300 rounded px-2 py-1 bg-white"
                                    value={evidencesPerPage}
                                    onChange={(e) => setEvidencesPerPage(Number(e.target.value))}
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
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                        <div
                                            className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                            onClick={() => handleSort('evidence_id')}
                                        >
                                            <span>Evidence ID</span>
                                            {getSortIcon('evidence_id')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                        <div
                                            className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                            onClick={() => handleSort('type')}
                                        >
                                            <span>Type & Location</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                        <div
                                            className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                            onClick={() => handleSort('collected_dt')}
                                        >
                                            <span>Collected Date</span>
                                            {getSortIcon('collected_dt')}
                                        </div>
                                    </th>
                                    {shouldShowCollectedByColumn() && (
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                            <span>Collected By</span>
                                        </th>
                                    )}
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                                        <span>Linked To</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentEvidences.length > 0 ? (
                                    currentEvidences.map((evidence) => (
                                        <tr
                                            key={evidence.evidence_id}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/evidences/${evidence.evidence_id}`)}
                                        >
                                            <td className="px-6 py-6 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <Link
                                                    to={`/evidences/${evidence.evidence_id}`}
                                                    className="hover:underline text-gray-900 font-medium flex items-center"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="bg-gray-100 p-1 rounded-lg mr-4 text-gray-900 flex-shrink-0">
                                                        <Assignment fontSize="small" />
                                                    </div>
                                                    <span className="font-semibold">{evidence.evidence_id}</span>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="max-w-md">
                                                    <span className="text-sm font-medium text-gray-800 leading-relaxed block">
                                                        {evidence.type}
                                                    </span>
                                                    <div className="flex items-center mt-1">
                                                        <LocationOn className="mr-1 text-gray-400" style={{ fontSize: '0.8rem' }} />
                                                        <span className="text-xs text-gray-500">
                                                            {evidence.location || 'Location not specified'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <div className="flex bg-gray-100 p-2 rounded-lg mr-3 flex-shrink-0">
                                                        <CalendarMonth className="text-gray-600" style={{ fontSize: '1rem' }} />
                                                    </div>
                                                    <div className="flex flex-col space-y-1">
                                                        <span className="">{formatDate(evidence.collected_dt)}</span>
                                                        <span className="text-xs text-gray-500 flex items-center">
                                                            <AccessTime className="mr-1.5" style={{ fontSize: '0.75rem' }} />
                                                            {formatTime(evidence.collected_dt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            {shouldShowCollectedByColumn() && (

                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {evidence.officer_id === user.user_id ? (
                                                            <div className="bg-gray-700 text-white rounded-2xl px-4 py-1 inline-flex items-center">
                                                                <span className="font-semibold text-sm">You</span>
                                                            </div>
                                                        ) : evidence.officer_name ? (
                                                            <div className="w-full max-w-xs">
                                                                <OfficerCard
                                                                    officer={{
                                                                        id: evidence.officer_id,
                                                                        name: evidence.officer_name,
                                                                        role: evidence.officer_role,
                                                                        profilePic: evidence.officer_profile
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
                                            <td className="px-6 py-6">
                                                <div className="flex flex-col gap-2">                                                    {/* Investigation (if any) */}
                                                    {evidence.investigation_topic && (
                                                        <div className="group relative w-fit">
                                                            <Link
                                                                to={`/investigations/${evidence.investigation_id}`}
                                                                className="hover:underline text-green-600 text-sm font-medium flex items-center"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Fingerprint className="mr-1" style={{ fontSize: '0.8rem' }} />
                                                                <span className="truncate max-w-32">
                                                                    {
                                                                        (() => {
                                                                            const topic = evidence.investigation_topic;
                                                                            const words = topic.split(' ');
                                                                            return words.length > 6
                                                                                ? words.slice(0, 6).join(' ') + '...'
                                                                                : topic;
                                                                        })()
                                                                    }
                                                                </span>
                                                            </Link>
                                                            <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 z-10 max-w-sm break-words whitespace-normal">
                                                                <div className="font-medium">{evidence.investigation_topic}</div>
                                                                <div className="text-gray-300 mt-1">Investigation ID: {evidence.investigation_id}</div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Linked Cases */}
                                                    {Array.isArray(evidence.linked_cases) && evidence.linked_cases.length > 0 ? (
                                                        evidence.linked_cases.map((caseObj) => (
                                                            <div key={caseObj.case_id} className="flex flex-col space-y-1">
                                                                {/* Only show case if it has a topic */}                                                                {caseObj.case_topic && (
                                                                    <div className="group relative w-fit">
                                                                        <Link
                                                                            to={`/cases/${caseObj.case_id}`}
                                                                            className="hover:underline text-blue-600 text-sm font-medium flex items-center"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            <Group className="mr-1" style={{ fontSize: '0.8rem' }} />
                                                                            <span className="truncate max-w-32">
                                                                                {
                                                                                    (() => {
                                                                                        const topic = caseObj.case_topic;
                                                                                        const words = topic.split(' ');
                                                                                        return words.length > 8
                                                                                            ? words.slice(0, 8).join(' ') + '...'
                                                                                            : topic;
                                                                                    })()
                                                                                }
                                                                            </span>
                                                                        </Link>
                                                                        {/* Always show tooltip with full topic and case ID */}
                                                                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 z-10 max-w-sm break-words whitespace-normal">
                                                                            <div className="font-medium">{caseObj.case_topic}</div>
                                                                            <div className="text-gray-300 mt-1">Case ID: {caseObj.case_id}</div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {/* Show complaint for oicnotreviewed cases */}
                                                                {caseObj.case_status === 'oicnotreviewed' && caseObj.complain_id && caseObj.complaint_description && (
                                                                    <div className={caseObj.case_topic ? "ml-4" : ""}>
                                                                        <div className="group relative w-fit">
                                                                            <Link
                                                                                to={`/complaints/${caseObj.complain_id}`}
                                                                                className="hover:underline text-orange-600 text-sm flex items-center"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                <span className="w-1 h-1 bg-orange-500 rounded-full mr-2 flex-shrink-0"></span>
                                                                                <span className="truncate text-sm max-w-36">
                                                                                    {
                                                                                        (() => {
                                                                                            const desc = caseObj.complaint_description;
                                                                                            const words = desc.split(' ');
                                                                                            return words.length > 8
                                                                                                ? words.slice(0, 8).join(' ') + '...'
                                                                                                : desc;
                                                                                        })()
                                                                                    }
                                                                                </span>
                                                                            </Link>
                                                                            <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 z-10 max-w-sm break-words whitespace-normal">
                                                                                <div className="font-medium">{caseObj.complaint_description}</div>
                                                                                <div className="text-gray-300 mt-1">Complaint ID: {caseObj.complain_id}</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : evidence.case_topic
                                                        ? (<div className="flex flex-col space-y-1">
                                                            <div className="group relative w-full">
                                                                <Link
                                                                    to={`/cases/${evidence.case_id}`}
                                                                    className="hover:underline text-blue-600 text-sm font-medium flex items-center"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <Group className="mr-1" style={{ fontSize: '0.8rem' }} />
                                                                    <span className="truncate max-w-32">
                                                                        {
                                                                            (() => {
                                                                                const topic = evidence.case_topic;
                                                                                const words = topic.split(' ');
                                                                                return words.length > 8
                                                                                    ? words.slice(0, 8).join(' ') + '...'
                                                                                    : topic;
                                                                            })()
                                                                        }
                                                                    </span>
                                                                </Link>
                                                                {/* Always show tooltip with full topic and case ID */}
                                                                <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 z-10 max-w-sm break-words whitespace-normal">
                                                                    <div className="font-medium">{evidence.case_topic}</div>
                                                                    <div className="text-gray-300 mt-1">Case ID: {evidence.case_id}</div>
                                                                </div>
                                                            </div>

                                                            {/* Show complaint for oicnotreviewed cases */}
                                                            {evidence.case_status === 'oicnotreviewed' && evidence.complain_id && evidence.complaint_description && (
                                                                <div className="ml-4">
                                                                    <div className="group relative w-fit">
                                                                        <Link
                                                                            to={`/complaints/${evidence.complain_id}`}
                                                                            className="hover:underline text-orange-600 text-sm flex items-center"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            <span className="w-1 h-1 bg-orange-500 rounded-full mr-2 flex-shrink-0"></span>
                                                                            <span className="truncate max-w-36">
                                                                                {
                                                                                    (() => {
                                                                                        const desc = evidence.complaint_description;
                                                                                        const words = desc.split(' ');
                                                                                        return words.length > 8
                                                                                            ? words.slice(0, 8).join(' ') + '...'
                                                                                            : desc;
                                                                                    })()
                                                                                }
                                                                            </span>
                                                                        </Link>
                                                                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 z-10 max-w-sm break-words whitespace-normal">
                                                                            <div className="font-medium">{evidence.complaint_description}</div>
                                                                            <div className="text-gray-300 mt-1">Complaint ID: {evidence.complain_id}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        ) : (                                                        /* Show standalone complaint if no case but has oicnotreviewed complaint */
                                                            evidence.case_status === 'oicnotreviewed' && evidence.complain_id && evidence.complaint_description ? (
                                                                <div className="group relative w-fit">
                                                                    <Link
                                                                        to={`/complaints/${evidence.complain_id}`}
                                                                        className="hover:underline text-orange-600 text-sm flex items-center"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <span className="w-1 h-1 bg-orange-500 rounded-full mr-2 flex-shrink-0"></span>
                                                                        <span className="truncate max-w-36">
                                                                            {
                                                                                (() => {
                                                                                    const desc = evidence.complaint_description;
                                                                                    const words = desc.split(' ');
                                                                                    return words.length > 8
                                                                                        ? words.slice(0, 8).join(' ') + '...'
                                                                                        : desc;
                                                                                })()
                                                                            }
                                                                        </span>
                                                                    </Link>
                                                                    <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 z-10 max-w-sm break-words whitespace-normal">
                                                                        <div className="font-medium">{evidence.complaint_description}</div>
                                                                        <div className="text-gray-300 mt-1">Complaint ID: {evidence.complain_id}</div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 italic text-sm">Not linked</span>
                                                            )
                                                        )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={shouldShowCollectedByColumn() ? 5 : 4} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="rounded-full bg-gray-100 p-4 mb-4">
                                                    <Assignment className="text-gray-400" style={{ fontSize: '2.5rem' }} />
                                                </div>
                                                <p className="text-gray-500 text-lg font-medium">No evidence records found</p>
                                                <p className="text-sm text-gray-400 mt-2">Try adjusting your search criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {evidences.length > 0 && (
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
                                        Showing <span className="font-medium">{((currentPage - 1) * evidencesPerPage) + 1}</span> to <span className="font-medium">
                                            {Math.min(currentPage * evidencesPerPage, evidences.length)}
                                        </span> of{' '}
                                        <span className="font-medium">{evidences.length}</span> results
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