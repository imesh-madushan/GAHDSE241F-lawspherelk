import React, { useState, useEffect } from 'react';
import {
    History,
    Search,
    FilterList,
    Add,
    ArrowBack,
    KeyboardArrowDown,
    NavigateNext,
    NavigateBefore,
    SortByAlpha,
    Info,
    GetApp as FileDownload
} from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import PageHeader from '../../components/common/PageHeader';
import SearchInterface from '../../components/searchsection/SearchInterface';
import AuditBatchCard from '../../components/audit/AuditBatchCard';
import AuditLogDetailsView from '../../components/audit/AuditLogDetailsView';
import Spinner from '../../components/Spinner';
import { exportAuditLogsToCSV } from '../../utils/exportUtils';
// Commented out until needed for permission checks
// import { useAuth } from '../../contexts/AuthContext';

const AuditPage = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [logsPerPage] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [sortField, setSortField] = useState('changedAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedBatchId, setSelectedBatchId] = useState(null);
    const [detailsView, setDetailsView] = useState(false);
    
    // User auth context - can be used for permission checks if needed
    // const { user } = useAuth();

    // Define search options
    const searchOptions = [
        { value: 'batchId', label: 'Batch ID' },
        { value: 'value', label: 'Changed Value' },
        { value: 'tableName', label: 'Table Name' },
        { value: 'recordId', label: 'Record ID' }
    ];

    const filterConfig = [
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
    }, [auditLogs, logsPerPage]);

    const fetchAuditLogs = async () => {
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
    };

    const handleSearch = async (searchParams) => {
        setLoading(true);
        try {
            let endpoint = '/audit/search';
            let params = {};

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
    };

    // Get current logs with sorting
    const getCurrentLogs = () => {
        const sortedLogs = sortLogs(auditLogs);
        const indexOfLastLog = currentPage * logsPerPage;
        const indexOfFirstLog = indexOfLastLog - logsPerPage;
        return sortedLogs.slice(indexOfFirstLog, indexOfLastLog);
    };

    // Handle view details
    const handleViewDetails = (batchId) => {
        setSelectedBatchId(batchId);
        setDetailsView(true);
    };

    // Handle back from details view
    const handleBackToList = () => {
        setDetailsView(false);
        setSelectedBatchId(null);
    };    // Pagination controls
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Breadcrumb items
    const breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Audit Logs' }
    ];

    // If details view is active, show the details component
    if (detailsView && selectedBatchId) {
        return (
            <div className="container mx-auto px-4 py-8">
                <PageHeader
                    title="Audit Log Details"
                    breadcrumbItems={[
                        ...breadcrumbItems,
                        { label: 'Details' }
                    ]}
                    onBack={handleBackToList}
                />
                <AuditLogDetailsView batchId={selectedBatchId} onBack={handleBackToList} />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <PageHeader
                title="Audit Logs"
                breadcrumbItems={breadcrumbItems}
            />

            {/* Info message */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <Info className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            Audit logs track all system changes. Use the search and filters to find specific changes by batch ID, 
                            changed value, table, or record ID. Click on any log to see detailed information.
                        </p>
                    </div>
                </div>
            </div>

            {/* Search & Filter Section */}
            <div className="mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Search Audit Logs</h3>
                    <SearchInterface
                        searchOptions={searchOptions}
                        filters={filterConfig}
                        onSearch={handleSearch}
                        placeholder="Search by batch ID, value, table name..."
                    />
                </div>
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Table Header */}                <div className="bg-gray-50 p-4 border-b flex justify-between items-center sticky top-0 z-10">
                    <h3 className="font-semibold text-gray-800">Audit Log Records</h3>
                    <div className="flex space-x-4">
                        <button 
                            onClick={() => handleSort('changedAt')} 
                            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                            Sort by Date 
                            <KeyboardArrowDown className={`ml-1 text-gray-400 transform ${sortOrder === 'asc' && sortField === 'changedAt' ? 'rotate-180' : ''}`} />
                        </button>
                        <button 
                            onClick={() => exportAuditLogsToCSV(auditLogs)}
                            className="flex items-center text-sm text-green-600 hover:text-green-800"
                            disabled={auditLogs.length === 0}
                        >
                            <FileDownload className="mr-1" fontSize="small" />
                            Export CSV
                        </button>
                        <button 
                            onClick={fetchAuditLogs} 
                            className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="p-16 flex justify-center">
                        <Spinner />
                    </div>
                ) : error ? (
                    <div className="p-8 text-center">
                        <div className="text-red-500 mb-4">
                            <p className="text-lg font-medium">{error}</p>
                        </div>
                        <button 
                            onClick={fetchAuditLogs} 
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : auditLogs.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                            <History className="text-gray-400 text-4xl" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Audit Logs Found</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                            No system changes have been recorded yet, or you don't have permission to view them.
                        </p>
                        <button
                            onClick={fetchAuditLogs}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Refresh Data
                        </button>
                    </div>
                ) : (
                    <div className="p-4">
                        {/* Audit log cards */}
                        <div className="space-y-4">
                            {getCurrentLogs().map((batch) => (
                                <AuditBatchCard
                                    key={batch.batchId}
                                    batch={batch}
                                    onClick={() => handleViewDetails(batch.batchId)}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center mt-6 px-2">
                                <div className="text-sm text-gray-500">
                                    Showing {(currentPage - 1) * logsPerPage + 1} to {Math.min(currentPage * logsPerPage, auditLogs.length)} of {auditLogs.length} entries
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        className={`p-2 rounded-full ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <NavigateBefore />
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            className={`w-8 h-8 rounded-full ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                                            onClick={() => handlePageChange(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        className={`p-2 rounded-full ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <NavigateNext />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditPage;
