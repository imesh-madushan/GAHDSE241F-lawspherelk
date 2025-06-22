import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    CalendarMonth,
    AccessTime,
    Add,
    Assignment,
    Person,
    NavigateNext,
    NavigateBefore,
    KeyboardArrowDown
} from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import SearchInterface from '../../components/searchsection/SearchInterface';
import OfficerCard from '../../components/cards/OfficerCard';
import Spinner from '../../components/Spinner';
import { caseStatusList } from '../../../data';

const CasesPage = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [casesPerPage, setCasesPerPage] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [sortField, setSortField] = useState('started_dt');
    const [sortOrder, setSortOrder] = useState('desc');
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

    useEffect(() => {
        setTotalPages(Math.ceil(cases.length / casesPerPage));
        setCurrentPage(1);
    }, [cases, casesPerPage]);

    const fetchCases = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedStatus !== 'all') {
                params.status = selectedStatus;
            }

            const { data } = await apiClient.get('/cases/getAllCases', { params });
            if (data.cases) {
                let filtered = data.cases;
                console.log('Fetched cases:', filtered);
                // Role-based filtering
                if (user && user.role && user.role !== 'OIC' && user.role !== 'Crime OIC') {
                    filtered = filtered.filter(c =>
                        c.leader_id === user.user_id || c.assigned_officer_id === user.user_id
                    );
                }
                setCases(filtered);
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
                setSelectedStatus(searchParams.status);
            }
            if (searchParams.timePeriod && searchParams.timePeriod !== 'all') {
                params.timePeriod = searchParams.timePeriod;
            }

            const response = await apiClient.get(endpoint, { params });
            if (response.data.cases) {
                let filtered = response.data.cases;
                // Role-based filtering
                if (user && user.role && user.role !== 'OIC' && user.role !== 'Crime OIC') {
                    filtered = filtered.filter(c =>
                        c.leader_id === user.user_id || c.assigned_officer_id === user.user_id
                    );
                }
                setCases(filtered);
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

    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder(field === 'started_dt' ? 'desc' : 'asc');
        }
    };

    // Sort cases function
    const sortCases = (casesToSort) => {
        if (!casesToSort || casesToSort.length === 0) return [];

        return [...casesToSort].sort((a, b) => {
            let aValue, bValue;

            switch (sortField) {
                case 'started_dt':
                    aValue = new Date(a.started_dt || 0);
                    bValue = new Date(b.started_dt || 0);
                    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                case 'case_id':
                    aValue = a.case_id || '';
                    bValue = b.case_id || '';
                    break;
                case 'case_status':
                    aValue = a.case_status || '';
                    bValue = b.case_status || '';
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

    // Get current cases with sorting
    const getCurrentCases = () => {
        const sortedCases = sortCases(cases);
        const indexOfLastCase = currentPage * casesPerPage;
        const indexOfFirstCase = indexOfLastCase - casesPerPage;
        return sortedCases.slice(indexOfFirstCase, indexOfLastCase);
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

    const currentCases = getCurrentCases();

    const getStatusDotColor = (status) => {
        switch (status) {
            case 'inprogress':
                return 'bg-blue-500';
            case 'closed':
                return 'bg-green-500';
            case 'pending':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-500';
        }
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

    // Determine if leader column should be shown
    const showLeaderCol = user && (user.role === 'OIC' || user.role === 'Crime OIC');

    return (
        <div className="bg-gray-100 min-h-screen">
            <PageHeader
                title="Cases"
                breadcrumbItems={breadcrumbItems}
                showBackButton={true}
                onBack={() => navigate(-1)}
                actions={[
                    {
                        icon: <Add fontSize='medium' className='text-white rounded-full' />,
                        label: 'Create Case',
                        onClick: () => navigate('/cases/create'),
                        styles: 'h-10 bg-gray-800 text-white border-black rounded-2xl'
                    }
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
                            <h3 className="font-semibold text-gray-700">All Cases</h3>
                            <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">
                                {cases.length}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>Show</span>
                                <select
                                    className="border border-gray-300 rounded px-2 py-1 bg-white"
                                    value={casesPerPage}
                                    onChange={(e) => setCasesPerPage(Number(e.target.value))}
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
                                    <th
                                        scope="col"
                                        className={
                                            showLeaderCol
                                                ? "px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
                                                : "px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5"
                                        }
                                    >
                                        <div
                                            className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                            onClick={() => handleSort('case_id')}
                                        >
                                            <span>Case ID</span>
                                            {getSortIcon('case_id')}
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className={
                                            showLeaderCol
                                                ? "px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
                                                : "px-10 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3"
                                        }
                                    >
                                        <span>Topic & Type</span>
                                    </th>
                                    <th
                                        scope="col"
                                        className={
                                            showLeaderCol
                                                ? "px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
                                                : "px-10 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
                                        }
                                    >
                                        <div
                                            className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                            onClick={() => handleSort('case_status')}
                                        >
                                            <span>Status</span>
                                            {getSortIcon('case_status')}
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className={
                                            showLeaderCol
                                                ? "px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
                                                : "px-10 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
                                        }
                                    >
                                        <div
                                            className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                            onClick={() => handleSort('started_dt')}
                                        >
                                            <span>Started Date</span>
                                            {getSortIcon('started_dt')}
                                        </div>
                                    </th>
                                    {showLeaderCol && (
                                        <th
                                            scope="col"
                                            className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
                                        >
                                            <span>Leader</span>
                                        </th>
                                    )}
                                    <th
                                        scope="col"
                                        className={
                                            showLeaderCol
                                                ? "px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
                                                : "px-10 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
                                        }
                                    >
                                        <span>Evidence</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentCases.length > 0 ? (
                                    currentCases.map((caseData) => (
                                        <tr
                                            key={caseData.case_id}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/cases/${caseData.case_id}`)}
                                        >
                                            <td className={showLeaderCol ? "px-6 py-6 whitespace-nowrap text-sm font-medium text-gray-900" : "px-10 py-6 whitespace-nowrap text-sm font-medium text-gray-900"}>
                                                <Link
                                                    to={`/cases/${caseData.case_id}`}
                                                    className="hover:underline text-gray-900 flex items-center"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="bg-gray-100 p-2 rounded-lg mr-4 text-gray-900 flex-shrink-0">
                                                        <Assignment fontSize="small" />
                                                    </div>
                                                    <span className="font-semibold">{caseData.case_id}</span>
                                                </Link>
                                            </td>                                            <td className={showLeaderCol ? "px-8 py-6" : "px-10 py-6"}>
                                                <div className="max-w-md">
                                                    <span className="text-sm text-gray-900 font-medium leading-relaxed block">
                                                        {
                                                            (() => {
                                                                const topic = caseData.topic || 'Untitled Case';
                                                                const words = topic.split(' ');
                                                                return words.length > 15
                                                                    ? words.slice(0, 15).join(' ') + '...'
                                                                    : topic;
                                                            })()
                                                        }
                                                    </span>
                                                    <span className="text-xs text-gray-500 mt-1 block">
                                                        {caseData.case_type}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className={showLeaderCol ? "px-8 py-6 whitespace-nowrap" : "px-10 py-6 whitespace-nowrap"}>
                                                <div className="flex items-center">
                                                    <span className="inline-flex items-center text-sm font-medium text-gray-900">
                                                        <span className={`h-2.5 w-2.5 rounded-full mr-3 flex-shrink-0 ${getStatusDotColor(caseData.case_status)}`}></span>
                                                        {getStatusLabel(caseData.case_status)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className={showLeaderCol ? "px-8 py-6 whitespace-nowrap text-sm text-gray-900" : "px-10 py-6 whitespace-nowrap text-sm text-gray-900"}>
                                                <div className="flex items-center">
                                                    <div className="flex bg-gray-100 p-2 rounded-lg mr-3 flex-shrink-0">
                                                        <CalendarMonth className="text-gray-600" style={{ fontSize: '1rem' }} />
                                                    </div>
                                                    <div className="flex flex-col space-y-1">
                                                        <span className="">{formatDate(caseData.started_dt)}</span>
                                                        {caseData.started_dt && (
                                                            <span className="text-xs text-gray-500 flex items-center">
                                                                <AccessTime className="mr-1.5" style={{ fontSize: '0.75rem' }} />
                                                                {formatTime(caseData.started_dt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            {showLeaderCol && (
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {caseData.leader_id === user.user_id ? (
                                                            <div className="bg-gray-700 text-white rounded-2xl px-4 py-1 inline-flex items-center">
                                                                <span className="font-semibold text-sm">You</span>
                                                            </div>
                                                        ) : caseData.leader_name ? (
                                                            <div className="w-full max-w-xs">
                                                                <OfficerCard
                                                                    officer={{
                                                                        id: caseData.leader_id,
                                                                        name: caseData.leader_name,
                                                                        role: caseData.leader_role,
                                                                        profilePic: caseData.leader_profile
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
                                            <td className={showLeaderCol ? "px-8 py-6 whitespace-nowrap" : "px-10 py-6 whitespace-nowrap"}>
                                                <div className="flex items-center">
                                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                        {caseData.evidence_count || 0} Evidence
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={showLeaderCol ? 6 : 5} className={showLeaderCol ? "px-8 py-16 text-center" : "px-10 py-16 text-center"}>
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="rounded-full bg-gray-100 p-4 mb-4">
                                                    <Assignment className="text-gray-400" style={{ fontSize: '2.5rem' }} />
                                                </div>
                                                <p className="text-gray-500 text-lg font-medium">No cases found</p>
                                                <p className="text-sm text-gray-400 mt-2">Try adjusting your search criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {cases.length > 0 && (
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
                                        Showing <span className="font-medium">{((currentPage - 1) * casesPerPage) + 1}</span> to <span className="font-medium">
                                            {Math.min(currentPage * casesPerPage, cases.length)}
                                        </span> of{' '}
                                        <span className="font-medium">{cases.length}</span> results
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
        </div>
    );
};

export default CasesPage;