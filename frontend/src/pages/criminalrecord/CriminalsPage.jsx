import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../config/apiConfig';
import PageHeader from '../../components/common/PageHeader';
import SearchInterface from '../../components/searchsection/SearchInterface';
import CreateCriminalModal from '../../components/modals/CreateCriminalModal';
import Spinner from '../../components/Spinner';
import { Add, Assignment, NavigateBefore, NavigateNext, KeyboardArrowDown, Person } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const CriminalsPage = () => {
    const [criminals, setCriminals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [criminalsPerPage, setCriminalsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [sortField, setSortField] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const { user } = useAuth();

    const navigate = useNavigate();

    // Search/filter config
    const searchOptions = [
        { value: 'name', label: 'Name' },
        { value: 'nic', label: 'NIC' },
        { value: 'id', label: 'Criminal ID' },
        { value: 'fingerprint', label: 'Fingerprint' }];

    // No risk filter, only search options
    useEffect(() => {
        fetchCriminals();
    }, []);

    useEffect(() => {
        setTotalPages(Math.ceil(criminals.length / criminalsPerPage));
        setCurrentPage(1);
    }, [criminals, criminalsPerPage]);

    const fetchCriminals = async () => {
        try {
            const response = await apiClient.get('/criminals/getAllCriminals');
            setCriminals(response.data.criminals);
            console.log(response.data.criminals);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch criminals data');
            setLoading(false);
        }
    };

    const handleSearch = async (searchParams) => {
        try {
            setLoading(true);
            let endpoint = '/criminals/search';
            let params = {};

            if (searchParams.searchTerm && searchParams.searchTerm.trim() !== '') {
                if (searchParams.searchType === 'name') params.name = searchParams.searchTerm.trim();
                if (searchParams.searchType === 'nic') params.nic = searchParams.searchTerm.trim();
                if (searchParams.searchType === 'id') params.criminal_id = searchParams.searchTerm.trim();
                if (searchParams.searchType === 'fingerprint') params.fingerprint = searchParams.searchTerm.trim();
            }

            const response = await apiClient.get(endpoint, { params });
            setCriminals(response.data.criminals);
            setError(null);
        } catch (err) {
            setError('Search failed');
            setCriminals([]);
        } setLoading(false);
    };

    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    // Sort criminals function
    const sortCriminals = (criminalsToSort) => {
        if (!criminalsToSort || criminalsToSort.length === 0) return [];

        return [...criminalsToSort].sort((a, b) => {
            let aValue, bValue;

            switch (sortField) {
                case 'criminal_id':
                    aValue = a.criminal_id || '';
                    bValue = b.criminal_id || '';
                    break;
                case 'name':
                    aValue = a.name || '';
                    bValue = b.name || '';
                    break;
                case 'nic':
                    aValue = a.nic || '';
                    bValue = b.nic || '';
                    break;
                case 'total_crimes':
                    aValue = parseInt(a.total_crimes) || 0;
                    bValue = parseInt(b.total_crimes) || 0;
                    break;
                case 'total_risk':
                    aValue = parseInt(a.total_risk) || 0;
                    bValue = parseInt(b.total_risk) || 0;
                    break;
                default:
                    aValue = a[sortField] || '';
                    bValue = b[sortField] || '';
            }

            if (sortField === 'total_crimes' || sortField === 'total_risk') {
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }

            if (sortOrder === 'asc') {
                return aValue.toString().localeCompare(bValue.toString());
            } else {
                return bValue.toString().localeCompare(aValue.toString());
            }
        });
    };

    // Get current criminals with sorting
    const getCurrentCriminals = () => {
        const sortedCriminals = sortCriminals(criminals);
        const indexOfLastCriminal = currentPage * criminalsPerPage;
        const indexOfFirstCriminal = indexOfLastCriminal - criminalsPerPage;
        return sortedCriminals.slice(indexOfFirstCriminal, indexOfLastCriminal);
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

    // Update current criminals to use the new function
    const currentCriminals = getCurrentCriminals();

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
                title="Criminal Records"
                breadcrumbItems={[
                    { label: 'Dashboard', link: '/dashboard' },
                    { label: 'Criminal Records' }
                ]}
                actions={[
                    ...(user && (
                        user.role === 'OIC' ||
                        user.role === 'Crime OIC' ||
                        user.role === 'Inspector' ||
                        user.role === 'Sub Inspector'
                    ) ? [{
                        icon: <Add fontSize='medium' className='text-white rounded-full' />,
                        label: 'Add Criminal',
                        onClick: () => setOpenCreateModal(true),
                        styles: 'h-10 bg-gray-800 text-white border-gray-800'
                    }] : [])
                ]}
                onBack={() => navigate(-1)}
            />

            <div className="container mx-auto p-4">
                {/* Search Section */}
                <div className="mb-6">
                    <SearchInterface
                        searchOptions={searchOptions}
                        filters={null}
                        onSearch={handleSearch}
                    />
                </div>                {/* Modern Data Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Table Header with count and pagination controls */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-700">All Criminal Records</h3>
                            <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">
                                {criminals.length}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>Show</span>
                                <select
                                    className="border border-gray-300 rounded px-2 py-1 bg-white"
                                    value={criminalsPerPage}
                                    onChange={(e) => setCriminalsPerPage(Number(e.target.value))}
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
                            <thead className="bg-gray-50">                                <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                                    <span>Profile</span>
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                                    <div
                                        className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                        onClick={() => handleSort('criminal_id')}
                                    >
                                        <span>Criminal ID</span>
                                        {getSortIcon('criminal_id')}
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                                    <div
                                        className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                        onClick={() => handleSort('name')}
                                    >
                                        <span>Name</span>
                                        {getSortIcon('name')}
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                    <div
                                        className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                        onClick={() => handleSort('nic')}
                                    >
                                        <span>NIC</span>
                                        {getSortIcon('nic')}
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                    <span>Phone</span>
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                    <span>Address</span>
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                                    <div
                                        className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                        onClick={() => handleSort('total_crimes')}
                                    >
                                        <span>Total Crimes</span>
                                        {getSortIcon('total_crimes')}
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                                    <div
                                        className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                        onClick={() => handleSort('total_risk')}
                                    >
                                        <span>Total Risk</span>
                                        {getSortIcon('total_risk')}
                                    </div>
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentCriminals.length > 0 ? (
                                    currentCriminals.map((criminal) => (
                                        <tr
                                            key={criminal.criminal_id}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/criminals/${criminal.criminal_id}`)}
                                        >                                            <td className="px-6 py-6 whitespace-nowrap">
                                                <div className="flex items-center space-x-3">
                                                    {criminal.photo ? (
                                                        <img
                                                            src={criminal.photo}
                                                            alt={criminal.name}
                                                            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-300 border-2 border-white"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center ring-2 ring-gray-300">
                                                            <span className="text-sm font-medium text-gray-600">
                                                                {criminal.name?.charAt(0)?.toUpperCase() || 'U'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <Link
                                                    to={`/criminals/${criminal.criminal_id}`}
                                                    className="hover:underline text-gray-900"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <span className="font-semibold">{criminal.criminal_id}</span>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="group relative">
                                                    <div>
                                                        <span className="">
                                                            {
                                                                (() => {
                                                                    const name = criminal.name || 'Unknown Criminal';
                                                                    const words = name.split(' ');
                                                                    return words.length > 4
                                                                        ? words.slice(0, 4).join(' ') + '...'
                                                                        : name;
                                                                })()
                                                            }
                                                        </span>
                                                    </div>
                                                    {/* Show tooltip when name is truncated */}
                                                    {criminal.name && criminal.name.split(' ').length > 4 && (
                                                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-10 bg-gray-900 text-white text-sm rounded px-3 py-2 max-w-sm break-words whitespace-normal">
                                                            <div className="">{criminal.name}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-900">{criminal.nic}</td>
                                            <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-900">{criminal.phone}</td>
                                            <td className="px-6 py-6">
                                                <div className="max-w-md group relative">
                                                    <span className="text-sm text-gray-900 line-clamp-2 leading-relaxed cursor-pointer">
                                                        {
                                                            (() => {
                                                                const address = criminal.address || 'No address available';
                                                                const words = address.split(' ');
                                                                return words.length > 8
                                                                    ? words.slice(0, 8).join(' ') + '...'
                                                                    : address;
                                                            })()
                                                        }
                                                    </span>
                                                    {criminal.address && criminal.address.split(' ').length > 8 && (
                                                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-10 bg-gray-900 text-white text-sm rounded px-3 py-2 max-w-sm break-words whitespace-normal">
                                                            {criminal.address}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${criminal.total_crimes > 5
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : criminal.total_crimes > 2
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {criminal.total_crimes || 0}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${criminal.total_risk > 70
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : criminal.total_risk > 40
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {criminal.total_risk || 0}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (<tr>
                                    <td colSpan={8} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="rounded-full bg-gray-100 p-4 mb-4">
                                                <Person className="text-gray-400" style={{ fontSize: '2.5rem' }} />
                                            </div>
                                            <p className="text-gray-500 text-lg font-medium">No criminal records found</p>
                                            <p className="text-sm text-gray-400 mt-2">Try adjusting your search criteria</p>
                                        </div>
                                    </td>
                                </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {criminals.length > 0 && (
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
                                        Showing <span className="font-medium">{((currentPage - 1) * criminalsPerPage) + 1}</span> to <span className="font-medium">
                                            {Math.min(currentPage * criminalsPerPage, criminals.length)}
                                        </span> of{' '}
                                        <span className="font-medium">{criminals.length}</span> results
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

            {/* Create Criminal Modal */}
            <CreateCriminalModal
                open={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                onCriminalCreated={criminal => {
                    setOpenCreateModal(false);
                    setCriminals(prev => [criminal, ...prev]);
                }}
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

export default CriminalsPage;