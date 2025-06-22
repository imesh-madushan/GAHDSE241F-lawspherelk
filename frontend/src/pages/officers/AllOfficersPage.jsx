import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Add, NavigateBefore, NavigateNext, KeyboardArrowUp, KeyboardArrowDown, Person, Assignment } from '@mui/icons-material';
import SearchInterface from '../../components/searchsection/SearchInterface';
import CreateOfficerModal from '../../components/modals/CreateOfficerModal';
import { apiClient } from '../../config/apiConfig';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../../components/Spinner';

const OfficersPage = () => {
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [officersPerPage, setOfficersPerPage] = useState(10);
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const searchOptions = [
        { value: 'name', label: 'Name' },
        { value: 'id', label: 'Officer ID' },
        { value: 'nic', label: 'NIC' },
        { value: 'phone', label: 'Phone Number' },
        { value: 'email', label: 'Email' }
    ]

    const filterConfig = [
        {
            id: 'role',
            label: 'Role',
            options: [
                { value: 'all', label: 'All' },
                { value: 'OIC', label: 'OIC' },
                { value: 'Crime OIC', label: 'Crime OIC' },
                { value: 'Sub Inspector', label: 'Sub Inspector' },
                { value: 'Inspector', label: 'Inspector' },
                { value: 'Sergeant', label: 'Sergeant' },
                { value: 'Police Constable', label: 'Police Constable' },                { value: 'Forensic Leader', label: 'Forensic Leader' },
            ]
        }
    ];

    useEffect(() => {
        fetchOfficers();
    }, []);    const fetchOfficers = async () => {
        setLoading(true);        try {
            const res = await apiClient.post('/officers/getAll');
            console.log(res.data);
            setOfficers(res.data.officers);
        } catch {
            setOfficers([]);
        }
        setLoading(false);
    };    const handleSearch = async (searchParams) => {
        let params = {};
        if (searchParams.searchTerm && searchParams.searchTerm.trim() !== '') {
            if (searchParams.searchType === 'name') {
                params.name = searchParams.searchTerm.trim();
            }
            if (searchParams.searchType === 'id') {
                params.id = searchParams.searchTerm.trim();
            }
            if (searchParams.searchType === 'nic') {
                params.nic = searchParams.searchTerm.trim();
            }
            if (searchParams.searchType === 'phone') {
                params.phone = searchParams.searchTerm.trim();
            }
            if (searchParams.searchType === 'email') {
                params.email = searchParams.searchTerm.trim();
            }
        }
        if (searchParams.role && searchParams.role !== 'all') {
            params.role = searchParams.role;
        }

        setLoading(true);        try {
            const res = await apiClient.post('/officers/search', params);
            setOfficers(res.data);
        } catch {
            setOfficers([]);
        }
        setLoading(false);
        setCurrentPage(1);
    };

    // Sorting and pagination helper functions
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? 
            <KeyboardArrowUp fontSize="small" /> : 
            <KeyboardArrowDown fontSize="small" />;
    };

    const sortedOfficers = [...officers].sort((a, b) => {
        if (!sortField) return 0;
        
        let aValue = a[sortField] || '';
        let bValue = b[sortField] || '';
        
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        
        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Pagination calculations
    const totalPages = Math.ceil(sortedOfficers.length / officersPerPage);
    const startIndex = (currentPage - 1) * officersPerPage;
    const currentOfficers = sortedOfficers.slice(startIndex, startIndex + officersPerPage);

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

    const canCreateOfficer = () => {
        return user && user.role === 'OIC';
    };

    const handleOfficerModalClose = () => {
        setOpenCreateModal(false);
        // Refresh officers data after creation
        fetchOfficers();
    };    // Helper function to get role-based border colors with faded ring effect
    const getRoleBorderColors = (role) => {
        switch (role) {
            case 'OIC':
            case 'Crime OIC':
                return {
                    shadow: 'shadow-[0_0_0_2px_rgba(147,51,234,0.3),0_0_0_4px_rgba(147,51,234,0.1)]', // purple fade
                    bg: 'bg-purple-100',
                    text: 'text-purple-700'
                };
            case 'Inspector':
            case 'Sub Inspector':
                return {
                    shadow: 'shadow-[0_0_0_2px_rgba(37,99,235,0.3),0_0_0_4px_rgba(37,99,235,0.1)]', // blue fade
                    bg: 'bg-blue-100',
                    text: 'text-blue-700'
                };
            case 'Sergeant':
                return {
                    shadow: 'shadow-[0_0_0_2px_rgba(34,197,94,0.3),0_0_0_4px_rgba(34,197,94,0.1)]', // green fade
                    bg: 'bg-green-100',
                    text: 'text-green-700'
                };
            case 'Forensic Leader':
                return {
                    shadow: 'shadow-[0_0_0_2px_rgba(249,115,22,0.3),0_0_0_4px_rgba(249,115,22,0.1)]', // orange fade
                    bg: 'bg-orange-100',
                    text: 'text-orange-700'
                };
            case 'Police Constable':
                return {
                    shadow: 'shadow-[0_0_0_2px_rgba(75,85,99,0.3),0_0_0_4px_rgba(75,85,99,0.1)]', // gray fade
                    bg: 'bg-gray-100',
                    text: 'text-gray-700'
                };
            default:
                return {
                    shadow: 'shadow-[0_0_0_2px_rgba(156,163,175,0.2),0_0_0_4px_rgba(156,163,175,0.1)]', // light gray fade
                    bg: 'bg-gray-100',
                    text: 'text-gray-600'
                };
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <PageHeader
                title="Police Officers"
                breadcrumbItems={[
                    { label: 'Dashboard', link: '/dashboard' },
                    { label: 'Police Officers' }
                ]}
                actions={[
                    ...(canCreateOfficer() ? [{
                        icon: <Add fontSize='small' className='text-white rounded-full' />,
                        label: 'Create Officer',
                        onClick: () => setOpenCreateModal(true),
                        styles: 'h-10 bg-gray-800 text-white border-gray-800'
                    }] : [])
                ]}
                showBackButton={true}
                onBack={() => navigate(-1)}
            />            <div className="container mx-auto p-4">
                {/* Search Section */}
                <div className="mb-6">
                    <SearchInterface
                        searchOptions={searchOptions}
                        filters={filterConfig}
                        onSearch={handleSearch}
                    />
                </div>

                {/* Modern Data Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Table Header with count and pagination controls */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-700">Police Officers</h3>
                            <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">
                                {officers.length}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>Show</span>
                                <select
                                    className="border border-gray-300 rounded px-2 py-1 bg-white"
                                    value={officersPerPage}
                                    onChange={(e) => setOfficersPerPage(Number(e.target.value))}
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
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                                        <span>Profile</span>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                                        <div
                                            className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                            onClick={() => handleSort('id')}
                                        >
                                            <span>Officer ID</span>
                                            {getSortIcon('id')}
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
                                            onClick={() => handleSort('role')}
                                        >
                                            <span>Role</span>
                                            {getSortIcon('role')}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                        <span>NIC</span>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                        <span>Phone</span>
                                    </th>                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                                        <span>Email</span>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                                        <span>Account Status</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-16 text-center">
                                            <div className="flex justify-center">
                                                <Spinner />
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentOfficers.length > 0 ? (
                                    currentOfficers.map((officer) => (
                                        <tr
                                            key={officer.id}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/officers/${officer.id}`)}
                                        >
                                            {/* Profile */}
                                            <td className="px-6 py-6 whitespace-nowrap">
                                                <Link 
                                                    to={`/officers/${officer.id}`}
                                                    className="block"
                                                    onClick={(e) => e.stopPropagation()}
                                                >                                                    {officer.image ? (
                                                        <img
                                                            src={officer.image}
                                                            alt={officer.name}
                                                            className={`w-12 h-12 rounded-full object-cover border-2 border-white ${getRoleBorderColors(officer.role).shadow}`}
                                                        />
                                                    ) : (
                                                        <div className={`w-12 h-12 rounded-full ${getRoleBorderColors(officer.role).bg} flex items-center justify-center border-2 border-white ${getRoleBorderColors(officer.role).shadow}`}>
                                                            <span className={`text-sm font-medium ${getRoleBorderColors(officer.role).text}`}>
                                                                {officer.name?.charAt(0)?.toUpperCase() || 'U'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </Link>
                                            </td>
                                            {/* Officer ID */}
                                            <td className="px-6 py-6 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <Link
                                                    to={`/officers/${officer.id}`}
                                                    className="hover:underline text-gray-900"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <span className="font-semibold">{officer.id}</span>
                                                </Link>
                                            </td>
                                            {/* Name */}
                                            <td className="px-6 py-6">
                                                <div className="group relative">
                                                    <Link 
                                                        to={`/officers/${officer.id}`} 
                                                        className="text-blue-900 hover:underline cursor-pointer"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <span className="">
                                                            {
                                                                (() => {
                                                                    const name = officer.name || 'Unknown Officer';
                                                                    const words = name.split(' ');
                                                                    return words.length > 3
                                                                        ? words.slice(0, 3).join(' ') + '...'
                                                                        : name;
                                                                })()
                                                            }
                                                        </span>
                                                    </Link>
                                                    {/* Show tooltip when name is truncated */}
                                                    {officer.name && officer.name.split(' ').length > 3 && (
                                                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-10 bg-gray-900 text-white text-sm rounded px-3 py-2 max-w-sm break-words whitespace-normal">
                                                            <div className="font-medium">{officer.name}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            {/* Role */}
                                            <td className="px-6 py-6 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    officer.role === 'OIC' || officer.role === 'Crime OIC' 
                                                        ? 'bg-purple-100 text-purple-800' 
                                                        : officer.role === 'Inspector' || officer.role === 'Sub Inspector'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : officer.role === 'Sergeant'
                                                                ? 'bg-green-100 text-green-800'
                                                                : officer.role === 'Forensic Leader'
                                                                    ? 'bg-orange-100 text-orange-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {officer.role}
                                                </span>
                                            </td>
                                            {/* NIC */}
                                            <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-900">{officer.nic}</td>
                                            {/* Phone */}
                                            <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-900">{officer.phone}</td>                                            {/* Email */}
                                            <td className="px-6 py-6">
                                                <div className="group relative">
                                                    <span className="text-sm text-gray-900 cursor-pointer">
                                                        {
                                                            (() => {
                                                                const email = officer.email || 'No email';
                                                                return email.length > 25
                                                                    ? email.substring(0, 25) + '...'
                                                                    : email;
                                                            })()
                                                        }
                                                    </span>
                                                    {officer.email && officer.email.length > 25 && (
                                                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-10 bg-gray-900 text-white text-sm rounded px-3 py-2 max-w-sm break-words whitespace-normal">
                                                            {officer.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>                                            {/* Account Status */}
                                            <td className="px-6 py-6 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className="inline-flex items-center text-sm font-medium text-gray-900">
                                                        <span className={`h-2.5 w-2.5 rounded-full mr-3 flex-shrink-0 ${
                                                            officer.account_locked ? 'bg-red-500' : 'bg-green-500'
                                                        }`}></span>
                                                        {officer.account_locked ? 'Blocked' : 'Active'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="rounded-full bg-gray-100 p-4 mb-4">
                                                    <Person className="text-gray-400" style={{ fontSize: '2.5rem' }} />
                                                </div>
                                                <p className="text-gray-500 text-lg font-medium">No officers found</p>
                                                <p className="text-sm text-gray-400 mt-2">Try adjusting your search criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {officers.length > 0 && (
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
                                        Showing <span className="font-medium">{((currentPage - 1) * officersPerPage) + 1}</span> to <span className="font-medium">
                                            {Math.min(currentPage * officersPerPage, officers.length)}
                                        </span> of{' '}
                                        <span className="font-medium">{officers.length}</span> results
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
                                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                            const pageNum = i + 1;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        currentPage === pageNum
                                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

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
            {/* Create Officer Modal */}
            <CreateOfficerModal
                open={openCreateModal}
                onClose={handleOfficerModalClose}
                canCreate={canCreateOfficer()}
            />
        </div>
    );
};

export default OfficersPage;