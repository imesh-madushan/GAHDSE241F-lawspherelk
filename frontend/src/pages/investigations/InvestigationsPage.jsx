import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    CalendarMonth,
    AccessTime,
    Add,
    Group,
    Fingerprint,
    NavigateNext,
    NavigateBefore,
    KeyboardArrowDown,
    Assignment
} from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import PageHeader from '../../components/common/PageHeader';
import SearchInterface from '../../components/searchsection/SearchInterface';
import OfficerCard from '../../components/cards/OfficerCard';
import { useAuth } from '../../contexts/AuthContext';
import CreateInvestigationModal from '../../components/modals/CreateInvestigationModal';
import Spinner from '../../components/Spinner';

const InvestigationsPage = () => {
    const [investigations, setInvestigations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [investigationsPerPage, setInvestigationsPerPage] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [sortField, setSortField] = useState('start_dt');
    const [sortOrder, setSortOrder] = useState('desc');
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

    useEffect(() => {
        setTotalPages(Math.ceil(investigations.length / investigationsPerPage));
        setCurrentPage(1);
    }, [investigations, investigationsPerPage]);

    const fetchInvestigations = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/investigations/getAllInvestigations');
            if (response.data.investigations) {
                console.log('Fetched investigations:', response.data.investigations);
                let filtered = response.data.investigations;

                // Role-based filtering
                if (user && user.role) {
                    switch (user.role) {
                        case 'OIC':
                        case 'Crime OIC':
                            // See all investigations
                            break;
                        case 'Inspector':
                        case 'Sub Inspector':
                            // Only investigations where user is the case leader
                            filtered = filtered.filter(inv =>
                                inv.case_leader_id === user.user_id
                            );
                            break;
                        case 'Sergeant':
                        case 'Police Constable':
                            // Only investigations they are part of
                            filtered = filtered.filter(inv =>
                                inv.officers && (
                                    inv.officers.includes(user.name) ||
                                    inv.officers.includes(user.user_id) ||
                                    (Array.isArray(inv.investigation_officers) &&
                                        inv.investigation_officers.some(officer =>
                                            officer.officer_id === user.user_id
                                        ))
                                )
                            );
                            break;
                        default:
                            break;
                    }
                }

                setInvestigations(filtered);
            }
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setInvestigations([]);
            } else {
                setError('Failed to fetch investigations data');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (searchParams) => {
        setLoading(true);
        try {
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
            if (response.data.investigations) {
                let filtered = response.data.investigations;
                if (user && user.role) {
                    switch (user.role) {
                        case 'OIC':
                        case 'Crime OIC':
                            break;
                        case 'Inspector':
                        case 'Sub Inspector':
                            filtered = filtered.filter(inv =>
                                inv.case_leader_id === user.user_id
                            );
                            break;
                        case 'Sergeant':
                        case 'Police Constable':
                            filtered = filtered.filter(inv =>
                                inv.officers && (
                                    inv.officers.includes(user.name) ||
                                    inv.officers.includes(user.user_id) ||
                                    (Array.isArray(inv.investigation_officers) &&
                                        inv.investigation_officers.some(officer =>
                                            officer.officer_id === user.user_id
                                        ))
                                )
                            );
                            break;
                        default:
                            break;
                    }
                }
                setInvestigations(filtered);
            } else {
                setInvestigations([]);
            }
            setError(null);
        } catch (err) {
            console.error('Search error:', err);
            setInvestigations([]);
            setError('Search failed');
        } finally {
            setLoading(false);
        }
    };

    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder(field === 'start_dt' ? 'desc' : 'asc');
        }
    };

    // Sort investigations function
    const sortInvestigations = (investigationsToSort) => {
        if (!investigationsToSort || investigationsToSort.length === 0) return [];

        return [...investigationsToSort].sort((a, b) => {
            let aValue, bValue;

            switch (sortField) {
                case 'start_dt':
                    aValue = new Date(a.start_dt || 0);
                    bValue = new Date(b.start_dt || 0);
                    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                case 'investigation_id':
                    aValue = a.investigation_id || '';
                    bValue = b.investigation_id || '';
                    break;
                case 'status':
                    aValue = a.status || '';
                    bValue = b.status || '';
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

    // Get current investigations with sorting
    const getCurrentInvestigations = () => {
        const sortedInvestigations = sortInvestigations(investigations);
        const indexOfLastInvestigation = currentPage * investigationsPerPage;
        const indexOfFirstInvestigation = indexOfLastInvestigation - investigationsPerPage;
        return sortedInvestigations.slice(indexOfFirstInvestigation, indexOfLastInvestigation);
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

    const currentInvestigations = getCurrentInvestigations();

    const getStatusDotColor = (status) => {
        switch (status) {
            case 'inprogress':
                return 'bg-blue-500';
            case 'completed':
                return 'bg-green-500';
            case 'closed':
                return 'bg-gray-500';
            default:
                return 'bg-gray-500';
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
                title="Investigations"
                breadcrumbItems={[
                    { label: 'Dashboard', link: '/dashboard' },
                    { label: 'Investigations' }
                ]}
                showBackButton={true}
                onBack={() => navigate(-1)}
                actions={[
                    ...(user && (
                        user.role === 'OIC' ||
                        user.role === 'Crime OIC' ||
                        user.role === 'Inspector' ||
                        user.role === 'Sub Inspector'
                    ) ? [{
                        icon: <Add fontSize='small' className='text-white rounded-full' />,
                        label: 'Create Investigation',
                        onClick: () => setOpenCreateModal(true),
                        styles: 'h-10 bg-gray-950 text-white border-black rounded-2xl'
                    }] : [])
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

                {/* Redesigned Data Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Table Header with count and pagination controls */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-700">All Investigations</h3>
                            <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">
                                {investigations.length}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>Show</span>
                                <select
                                    className="border border-gray-300 rounded px-2 py-1 bg-white"
                                    value={investigationsPerPage}
                                    onChange={(e) => setInvestigationsPerPage(Number(e.target.value))}
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
                                    <th className="px-10 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                        <div
                                            className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                            onClick={() => handleSort('investigation_id')}
                                        >
                                            <span>Investigation ID</span>
                                            {getSortIcon('investigation_id')}
                                        </div>
                                    </th>
                                    <th className="px-10 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                        <span>Topic & Location</span>
                                    </th>
                                    <th className="px-10 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                        <div
                                            className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                            onClick={() => handleSort('status')}
                                        >
                                            <span>Status</span>
                                            {getSortIcon('status')}
                                        </div>
                                    </th>
                                    <th className="px-10 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                        <div
                                            className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                            onClick={() => handleSort('start_dt')}
                                        >
                                            <span>Start Date</span>
                                            {getSortIcon('start_dt')}
                                        </div>
                                    </th>
                                    <th className="px-10 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                        <span>Related Case</span>
                                    </th>
                                    <th className="px-10 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                        <span>Team & Evidence</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentInvestigations.length > 0 ? (
                                    currentInvestigations.map((investigation) => (
                                        <tr
                                            key={investigation.investigation_id}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/investigations/${investigation.investigation_id}`)}
                                        >
                                            <td className="px-10 py-6 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <Link
                                                    to={`/investigations/${investigation.investigation_id}`}
                                                    className="hover:underline text-gray-900 flex items-center"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <span className="font-semibold">{investigation.investigation_id}</span>
                                                </Link>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="max-w-md">
                                                    <span className="text-sm text-gray-900 font-medium leading-relaxed block">
                                                        {investigation.topic}
                                                    </span>
                                                    <span className="text-xs text-gray-500 mt-1 block">
                                                        {investigation.location || 'Location not specified'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className="inline-flex items-center text-sm font-medium text-gray-900">
                                                        <span className={`h-2.5 w-2.5 rounded-full mr-3 flex-shrink-0 ${getStatusDotColor(investigation.status)}`}></span>
                                                        {getStatusLabel(investigation.status)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <div className="flex bg-gray-100 p-2 rounded-lg mr-3 flex-shrink-0">
                                                        <CalendarMonth className="text-gray-600" style={{ fontSize: '1rem' }} />
                                                    </div>
                                                    <div className="flex flex-col space-y-1">
                                                        <span className="font-medium">{formatDate(investigation.start_dt)}</span>
                                                        {investigation.start_dt && (
                                                            <span className="text-xs text-gray-500 flex items-center">
                                                                <AccessTime className="mr-1.5" style={{ fontSize: '0.75rem' }} />
                                                                {formatTime(investigation.start_dt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                {investigation.case_id ? (
                                                    <div className="max-w-xs">
                                                        <Link
                                                            to={`/cases/${investigation.case_id}`}
                                                            className="hover:underline text-blue-900 text-sm font-medium block"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {investigation.case_topic || 'Untitled Case'}
                                                        </Link>
                                                        <span className="text-xs text-gray-500 mt-1 block">
                                                            ID: {investigation.case_id}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">No case linked</span>
                                                )}
                                            </td>
                                            <td className="px-10 py-6 whitespace-nowrap">
                                                <div className="flex flex-col space-y-2">
                                                    <div className="flex items-center">
                                                        <Group className="mr-2 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                                        <span className="bg-blue-50 text-blue-900 text-xs font-medium px-2 py-0.5 rounded-full">
                                                            {investigation.officer_count || 0} Officers
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Fingerprint className="mr-2 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                                        <span className="bg-purple-50 text-purple-900 text-xs font-medium px-2 py-0.5 rounded-full">
                                                            {investigation.evidence_count || 0} Evidence
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-10 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="rounded-full bg-gray-100 p-4 mb-4">
                                                    <Fingerprint className="text-gray-400" style={{ fontSize: '2.5rem' }} />
                                                </div>
                                                <p className="text-gray-500 text-lg font-medium">No investigations found</p>
                                                <p className="text-sm text-gray-400 mt-2">Try adjusting your search criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {investigations.length > 0 && (
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
                                        Showing <span className="font-medium">{((currentPage - 1) * investigationsPerPage) + 1}</span> to <span className="font-medium">
                                            {Math.min(currentPage * investigationsPerPage, investigations.length)}
                                        </span> of{' '}
                                        <span className="font-medium">{investigations.length}</span> results
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

