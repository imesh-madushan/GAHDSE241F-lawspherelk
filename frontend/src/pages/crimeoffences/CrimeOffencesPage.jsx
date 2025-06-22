import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarMonth, AccessTime, Add, Assignment, NavigateBefore, NavigateNext, KeyboardArrowDown } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import PageHeader from '../../components/common/PageHeader';
import SearchInterface from '../../components/searchsection/SearchInterface';
import CreateOffenceModal from '../../components/modals/CreateOffenceModal';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../contexts/AuthContext';

const CrimeOffencesPage = () => {
    const [offences, setOffences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [offencesPerPage, setOffencesPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [sortField, setSortField] = useState('reported_dt');
    const [sortOrder, setSortOrder] = useState('desc');
    const { user } = useAuth();

    const navigate = useNavigate();

    const searchOptions = [
        { value: 'crime_type', label: 'Crime Type' },
        { value: 'offence_id', label: 'Offence ID' },
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
                { value: 'low', label: 'Low Risk', colorVariant: 'green' }]
        }
    ];

    useEffect(() => {
        fetchOffences();
    }, []);

    useEffect(() => {
        setTotalPages(Math.ceil(offences.length / offencesPerPage));
        setCurrentPage(1);
    }, [offences, offencesPerPage]);

    const fetchOffences = async () => {
        try {
            const response = await apiClient.get('/crimeoffences/getAllOffences');
            console.log('Fetched offences:', response.data.offences);
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
                    case 'offence_id':
                        params.offence_id = searchParams.searchTerm.trim();
                        break;
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

    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder(field === 'reported_dt' ? 'desc' : 'asc');
        }
    };

    // Sort offences function
    const sortOffences = (offencesToSort) => {
        if (!offencesToSort || offencesToSort.length === 0) return [];

        return [...offencesToSort].sort((a, b) => {
            let aValue, bValue;

            switch (sortField) {
                case 'offence_id':
                    aValue = a.offence_id || '';
                    bValue = b.offence_id || '';
                    break;
                case 'crime_type':
                    aValue = a.crime_type || '';
                    bValue = b.crime_type || '';
                    break;
                case 'status':
                    aValue = a.status || '';
                    bValue = b.status || '';
                    break;
                case 'reported_dt':
                    aValue = new Date(a.reported_dt || 0);
                    bValue = new Date(b.reported_dt || 0);
                    break;
                default:
                    aValue = a[sortField] || '';
                    bValue = b[sortField] || '';
            }

            if (sortField === 'reported_dt') {
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }

            if (sortOrder === 'asc') {
                return aValue.toString().localeCompare(bValue.toString());
            } else {
                return bValue.toString().localeCompare(aValue.toString());
            }
        });
    };

    // Get current offences with sorting
    const getCurrentOffences = () => {
        const sortedOffences = sortOffences(offences);
        const indexOfLastOffence = currentPage * offencesPerPage;
        const indexOfFirstOffence = indexOfLastOffence - offencesPerPage;
        return sortedOffences.slice(indexOfFirstOffence, indexOfLastOffence);
    };

    // Get sort icon based on current sort state
    const getSortIcon = (field) => {
        if (sortField !== field) {
            return <KeyboardArrowDown fontSize="small" className="ml-1 text-gray-400" />;
        }

        return (
            <KeyboardArrowDown
                fontSize="small"
                className={`ml-1 text-black transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
            />
        );
    };

    // Update current offences to use the new function
    const currentOffences = getCurrentOffences();

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
    }; if (loading) {
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
                    className="px-4 py-2 bg-black text-yellow-300 rounded hover:bg-gray-900"
                >
                    Retry
                </button>
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
                        icon: <Add fontSize='medium' className='text-white rounded-full' />,
                        label: 'Create Offence',
                        onClick: () => setOpenCreateModal(true),
                        styles: 'h-10 bg-gray-800 text-white border-gray-800'
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
                </div>                {/* Modern Data Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Table Header with count and pagination controls */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-700">All Crime Offences</h3>
                            <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">
                                {offences.length}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>Show</span>
                                <select
                                    className="border border-gray-300 rounded px-2 py-1 bg-white"
                                    value={offencesPerPage}
                                    onChange={(e) => setOffencesPerPage(Number(e.target.value))}
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
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                        <div
                                            className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                            onClick={() => handleSort('offence_id')}
                                        >
                                            <span>Offence ID</span>
                                            {getSortIcon('offence_id')}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                        <div
                                            className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                            onClick={() => handleSort('crime_type')}
                                        >
                                            <span>Crime Type</span>
                                            {getSortIcon('crime_type')}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                        <div
                                            className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                            onClick={() => handleSort('status')}
                                        >
                                            <span>Status</span>
                                            {getSortIcon('status')}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                        <div
                                            className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                            onClick={() => handleSort('reported_dt')}
                                        >
                                            <span>Reported Date</span>
                                            {getSortIcon('reported_dt')}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                        <span>Criminal</span>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                        <span>Case</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentOffences.length > 0 ? (
                                    currentOffences.map((offence) => (
                                        <tr
                                            key={offence.offence_id}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/crimeoffences/${offence.offence_id}`)}
                                        >
                                            <td className="px-6 py-6 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <Link
                                                    to={`/crimeoffences/${offence.offence_id}`}
                                                    className="hover:underline text-gray-900 flex items-center"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="bg-gray-100 p-2 rounded-lg mr-4 text-gray-900 flex-shrink-0">
                                                        <Assignment fontSize="small" />
                                                    </div>
                                                    <span className="font-semibold">{offence.offence_id}</span>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="max-w-md group relative">
                                                    <span className="text-sm text-gray-900 line-clamp-2 leading-relaxed cursor-pointer">
                                                        {
                                                            (() => {
                                                                const crimeType = offence.crime_type || 'No crime type specified';
                                                                const words = crimeType.split(' ');
                                                                return words.length > 15
                                                                    ? words.slice(0, 15).join(' ') + '...'
                                                                    : crimeType;
                                                            })()
                                                        }
                                                    </span>
                                                    {offence.crime_type && offence.crime_type.split(' ').length > 15 && (
                                                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-10 bg-gray-900 text-white text-sm rounded px-3 py-2 max-w-sm break-words whitespace-normal">
                                                            {offence.crime_type}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className={`inline-flex items-center text-sm font-medium text-gray-900`}>
                                                        <span className={`h-2.5 w-2.5 rounded-full mr-3 flex-shrink-0 ${offence.status === "Under Investigation"
                                                                ? "bg-yellow-500"
                                                                : offence.status === "Convicted"
                                                                    ? "bg-red-500"
                                                                    : "bg-green-500"
                                                            }`}></span>
                                                        {offence.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <div className="flex bg-gray-100 p-2 rounded-lg mr-3 flex-shrink-0">
                                                        <CalendarMonth className="text-gray-600" style={{ fontSize: '1rem' }} />
                                                    </div>
                                                    <div className="flex flex-col space-y-1">
                                                        <span className="">{formatDate(offence.reported_dt)}</span>
                                                        {offence.reported_dt && (
                                                            <span className="text-xs text-gray-500 flex items-center">
                                                                <AccessTime className="mr-1.5" style={{ fontSize: '0.75rem' }} />
                                                                {formatTime(offence.reported_dt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap text-sm">
                                                <div className="group relative">
                                                    <Link
                                                        to={`/criminals/${offence.criminal_id}`}
                                                        className="hover:underline text-blue-900 cursor-pointer flex items-center"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className="flex-shrink-0 mr-3">
                                                            {offence.criminal_profile_pic ? (
                                                                <img
                                                                    className="h-10 w-10 rounded-full object-cover border-2 border-gray-300"
                                                                    src={offence.criminal_profile_pic}
                                                                    alt={offence.criminal_name || 'Criminal'}
                                                                />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                                    <span className="text-xs font-medium text-gray-600">
                                                                        {offence.criminal_name ? offence.criminal_name.charAt(0).toUpperCase() : 'U'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            {
                                                                (() => {
                                                                    const criminalName = offence.criminal_name || 'Unknown Criminal';
                                                                    const words = criminalName.split(' ');
                                                                    return words.length > 4
                                                                        ? words.slice(0, 4).join(' ') + '...'
                                                                        : criminalName;
                                                                })()
                                                            }
                                                        </div>
                                                    </Link>
                                                    {/* Always show tooltip with full name and criminal ID */}
                                                    <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-10 bg-gray-900 text-white text-sm rounded px-3 py-2 max-w-sm break-words whitespace-normal">
                                                        <div className="font-medium">{offence.criminal_name || 'Unknown Criminal'}</div>
                                                        <div className="text-gray-300 mt-1">{offence.criminal_id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap text-sm">
                                                <div className="group relative">
                                                    <Link
                                                        to={`/cases/${offence.case_id}`}
                                                        className="hover:underline text-blue-900 cursor-pointer"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {
                                                            (() => {
                                                                const caseTopic = offence.case_topic || 'Untitled Case';
                                                                const words = caseTopic.split(' ');
                                                                return words.length > 6
                                                                    ? words.slice(0, 6).join(' ') + '...'
                                                                    : caseTopic;
                                                            })()
                                                        }
                                                    </Link>
                                                    <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-10 bg-gray-900 text-white text-sm rounded px-3 py-2 max-w-sm break-words whitespace-normal">
                                                        <div className="font-medium">{offence.case_topic || 'Untitled Case'}</div>
                                                        <div className="text-gray-300 mt-1">Case ID: {offence.case_id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="rounded-full bg-gray-100 p-4 mb-4">
                                                    <Assignment className="text-gray-400" style={{ fontSize: '2.5rem' }} />
                                                </div>
                                                <p className="text-gray-500 text-lg font-medium">No crime offences found</p>
                                                <p className="text-sm text-gray-400 mt-2">Try adjusting your search criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {offences.length > 0 && (
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
                                        Showing <span className="font-medium">{((currentPage - 1) * offencesPerPage) + 1}</span> to <span className="font-medium">
                                            {Math.min(currentPage * offencesPerPage, offences.length)}
                                        </span> of{' '}
                                        <span className="font-medium">{offences.length}</span> results
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

                                        {/* Page numbers */}
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