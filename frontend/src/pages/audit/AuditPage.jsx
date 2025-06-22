import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    History,
    KeyboardArrowDown,
    NavigateNext,
    NavigateBefore,
    CalendarMonth,
    AccessTime
} from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import PageHeader from '../../components/common/PageHeader';
import SearchInterface from '../../components/searchsection/SearchInterface';
import AuditBatchCard from '../../components/audit/AuditBatchCard';
import Spinner from '../../components/Spinner';
// Commented out until needed for permission checks
// import { useAuth } from '../../contexts/AuthContext';

const AuditPage = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [logsPerPage, setLogsPerPage] = useState(8);
    const [totalPages, setTotalPages] = useState(1);
    const [sortField, setSortField] = useState('changedAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const navigate = useNavigate();

    // User auth context - can be used for permission checks if needed
    // const { user } = useAuth();

    // Define search options
    const searchOptions = [
        { value: 'batchId', label: 'Batch ID' },
        { value: 'value', label: 'Changed Value' },
        { value: 'tableName', label: 'Table Name' },
        { value: 'recordId', label: 'Record ID' }
    ]; const filterConfig = [
        {
            id: 'actionType',
            label: 'Action Type',
            options: [
                { value: 'all', label: 'All Actions' },
                { value: 'INSERT', label: 'Insert', colorVariant: 'green' },
                { value: 'UPDATE', label: 'Update', colorVariant: 'blue' },
                { value: 'DELETE', label: 'Delete', colorVariant: 'red' }
            ]
        }
    ];

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    useEffect(() => {
        setTotalPages(Math.ceil(auditLogs.length / logsPerPage));
        setCurrentPage(1);
    }, [auditLogs, logsPerPage]); const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/audit/logs');
            if (data.auditLogs) {
                setAuditLogs(data.auditLogs);
            }
        } catch (err) {
            console.error("Error fetching audit logs:", err);
            if (err.response && err.response.status === 404) {
                setAuditLogs([]);
            } else {
                setError('Failed to fetch audit logs. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }; const handleSearch = async (searchParams) => {
        setLoading(true);
        try {
            let endpoint = '/audit/search';
            let params = {};

            // Handle search term and type
            if (searchParams.searchTerm && searchParams.searchTerm.trim() !== '') {
                switch (searchParams.searchType) {
                    case 'batchId':
                        params.batchId = searchParams.searchTerm.trim();
                        break;
                    case 'value':
                        params.value = searchParams.searchTerm.trim();
                        break;
                    case 'tableName':
                        params.tableName = searchParams.searchTerm.trim();
                        break;
                    case 'recordId':
                        params.recordId = searchParams.searchTerm.trim();
                        break;
                    default:
                        break;
                }
            }

            // Handle filters
            if (searchParams.actionType && searchParams.actionType !== 'all') {
                params.actionType = searchParams.actionType;
            }

            const response = await apiClient.get(endpoint, { params });
            if (response.data.auditLogs) {
                setAuditLogs(response.data.auditLogs);
            } else {
                setAuditLogs([]);
            }
            setError(null);
        } catch (err) {
            console.error("Error searching audit logs:", err);
            setAuditLogs([]);
            setError('Failed to fetch audit logs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle sort
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    // Sort logs function
    const sortLogs = (logsToSort) => {
        if (!logsToSort || logsToSort.length === 0) return [];

        return [...logsToSort].sort((a, b) => {
            let aValue, bValue;

            switch (sortField) {
                case 'changedAt':
                    aValue = new Date(a.changedAt || 0);
                    bValue = new Date(b.changedAt || 0);
                    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                case 'batchId':
                    aValue = a.batchId || '';
                    bValue = b.batchId || '';
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
    };    // Get current logs with sorting
    const getCurrentLogs = () => {
        const sortedLogs = sortLogs(auditLogs);
        const indexOfLastLog = currentPage * logsPerPage;
        const indexOfFirstLog = indexOfLastLog - logsPerPage;
        return sortedLogs.slice(indexOfFirstLog, indexOfLastLog);
    };

    // Handle view details
    const handleViewDetails = (batchId) => {
        navigate(`/audit/${batchId}`);
    };

    // Change page
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

    // Breadcrumb items
    const breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' }, { label: 'Audit Logs' }
    ]; return (
        <div className="bg-gray-100 min-h-screen">
            <PageHeader
                title="Audit Logs"
                breadcrumbItems={breadcrumbItems}
                showBackButton={true}
                onBack={() => navigate(-1)}
                actions={[]}
            />

            <div className="container mx-auto px-4 py-4">
                {/* Search Section */}
                <div className="mb-6">
                    <SearchInterface
                        searchOptions={searchOptions}
                        filters={filterConfig}
                        onSearch={handleSearch}
                    />
                </div>                {/* Data Container */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Header with count and controls */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-700">Audit Log Records</h3>
                            <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">
                                {auditLogs.length}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>Show</span>
                                <select
                                    className="border border-gray-300 rounded px-2 py-1 bg-white"
                                    value={logsPerPage}
                                    onChange={(e) => setLogsPerPage(Number(e.target.value))}
                                >
                                    <option value={8}>8</option>
                                    <option value={16}>16</option>
                                    <option value={24}>24</option>
                                    <option value={48}>48</option>
                                </select>
                                <span>per page</span>
                            </div>
                            <button
                                onClick={() => handleSort('changedAt')}
                                className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Sort by Date
                                <KeyboardArrowDown className={`ml-1 text-gray-400 transform ${sortOrder === 'asc' && sortField === 'changedAt' ? 'rotate-180' : ''}`} />
                            </button>
                            <button
                                onClick={fetchAuditLogs}
                                className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Spinner />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="text-red-500 text-xl mb-4">{error}</div>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-black text-yellow-300 rounded hover:bg-gray-900"
                            >
                                Retry
                            </button>
                        </div>
                    ) : auditLogs.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="rounded-full bg-gray-100 p-4 mb-4 inline-block">
                                <History className="text-gray-400" style={{ fontSize: '2.5rem' }} />
                            </div>
                            <p className="text-gray-500 text-lg font-medium">No audit logs found</p>
                            <p className="text-sm text-gray-400 mt-2">Try adjusting your search criteria</p>
                        </div>
                    ) : (
                        <>
                            {/* Card Grid */}
                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-3">
                                    {getCurrentLogs().map((batch) => (
                                        <AuditBatchCard
                                            key={batch.batchId}
                                            batch={batch}
                                            onClick={() => handleViewDetails(batch.batchId)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
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
                                                Showing <span className="font-medium">{((currentPage - 1) * logsPerPage) + 1}</span> to <span className="font-medium">
                                                    {Math.min(currentPage * logsPerPage, auditLogs.length)}
                                                </span> of{' '}
                                                <span className="font-medium">{auditLogs.length}</span> results
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditPage;
