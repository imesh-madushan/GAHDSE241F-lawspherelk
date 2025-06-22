import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    History,
    Person,
    Search,
    FilterList,
    AccessTime,
    TableChart,
    ChevronRight,
    KeyboardArrowDown as ChevronDown,
    FileCopy as ContentCopy,
    Check,
    GetApp as FileDownload,
    ArrowBack
} from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import { format } from 'date-fns';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/Spinner';
import OfficerCard from '../../components/cards/OfficerCard';
import { exportBatchDetailsToCSV } from '../../utils/exportUtils';

const SingleAuditView = () => {
    const { batchId } = useParams();
    const navigate = useNavigate();
    const [auditDetails, setAuditDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [groupedChanges, setGroupedChanges] = useState({});
    const [filters, setFilters] = useState({
        table: 'all',
        action: 'all',
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRecords, setExpandedRecords] = useState({});
    const [copiedField, setCopiedField] = useState(null);

    // Handle navigation back to audit list
    const handleBack = () => {
        navigate('/audit');
    };    // Function to group changes by table and record ID
    const groupChangesByTable = useCallback((logs) => {
        const grouped = {};
        logs.forEach(log => {
            if (!grouped[log.tableName]) {
                grouped[log.tableName] = {};
            }

            if (!grouped[log.tableName][log.recordId]) {
                grouped[log.tableName][log.recordId] = [];
            }

            grouped[log.tableName][log.recordId].push(log);
        });

        setGroupedChanges(grouped);

        // Initialize expanded state for all records
        const initialExpandedState = {};
        Object.keys(grouped).forEach(tableName => {
            initialExpandedState[tableName] = {};
            Object.keys(grouped[tableName]).forEach(recordId => {
                initialExpandedState[tableName][recordId] = true; // Start expanded
            });
        });
        setExpandedRecords(initialExpandedState);
    }, []); const fetchAuditDetails = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/audit/logs?batchId=${batchId}`);
            if (response.data.auditLogs && response.data.auditLogs.length > 0) {
                setAuditDetails(response.data.auditLogs[0]);
                groupChangesByTable(response.data.auditLogs[0].logs);
            } else {
                setError('No audit details found for this batch.');
            }
        } catch (err) {
            setError('Failed to fetch audit details. Please try again.');
            console.error('Error fetching audit details:', err);
        } finally {
            setLoading(false);
        }
    }, [batchId, groupChangesByTable]);
    // Fetch audit details when batchId changes
    useEffect(() => {
        if (batchId) {
            fetchAuditDetails();
        }
    }, [batchId, fetchAuditDetails]); const getActionColor = (actionType) => {
        switch (actionType) {
            case 'INSERT':
                return 'bg-green-100 text-green-700';
            case 'UPDATE':
                return 'bg-gray-100 text-gray-700';
            case 'DELETE':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDateTime = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'N/A';
        }
    };

    const copyToClipboard = (text, fieldId) => {
        if (!text) return;

        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(fieldId);
            setTimeout(() => setCopiedField(null), 2000);
        });
    };

    const toggleRecordExpanded = (tableName, recordId) => {
        setExpandedRecords(prev => ({
            ...prev,
            [tableName]: {
                ...prev[tableName],
                [recordId]: !prev[tableName][recordId]
            }
        }));
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const filterLogs = () => {
        if (filters.table === 'all' && filters.action === 'all' && !searchTerm) {
            return groupedChanges;
        }

        const filteredChanges = {};
        Object.keys(groupedChanges).forEach(tableName => {
            // Filter by table
            if (filters.table !== 'all' && tableName !== filters.table) {
                return;
            }

            filteredChanges[tableName] = {};

            Object.keys(groupedChanges[tableName]).forEach(recordId => {
                const recordLogs = groupedChanges[tableName][recordId];

                // Filter by action type and search term
                const filteredRecordLogs = recordLogs.filter(log => {
                    const matchesAction = filters.action === 'all' || log.actionType === filters.action;
                    const matchesSearch = !searchTerm ||
                        (log.value && log.value.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
                        log.fieldName.toLowerCase().includes(searchTerm.toLowerCase());

                    return matchesAction && matchesSearch;
                });

                if (filteredRecordLogs.length > 0) {
                    filteredChanges[tableName][recordId] = filteredRecordLogs;
                }
            });

            // Remove empty tables
            if (Object.keys(filteredChanges[tableName]).length === 0) {
                delete filteredChanges[tableName];
            }
        });

        return filteredChanges;
    };

    const getUniqueTableNames = () => {
        return Object.keys(groupedChanges);
    };

    const getActionCounts = () => {
        if (!auditDetails || !auditDetails.logs) return {};

        return auditDetails.logs.reduce((acc, log) => {
            acc[log.actionType] = (acc[log.actionType] || 0) + 1;
            return acc;
        }, {});
    };

    // Breadcrumb items
    const breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Audit Logs', link: '/audit' },
        { label: `${batchId}` }
    ];

    const filteredChanges = auditDetails ? filterLogs() : {};
    const uniqueTables = getUniqueTableNames();
    const actionCounts = getActionCounts();
    const hasFiltersApplied = filters.table !== 'all' || filters.action !== 'all' || searchTerm;

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <PageHeader
                    title="Audit Log Details"
                    breadcrumbItems={breadcrumbItems}
                    onBack={handleBack}
                />
                <div className="flex justify-center items-center p-16">
                    <Spinner />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <PageHeader
                    title="Audit Log Details"
                    breadcrumbItems={breadcrumbItems}
                    onBack={handleBack}
                />
                <div className="bg-red-50 text-red-700 p-6 rounded-lg shadow-sm">
                    <p className="font-medium text-lg mb-2">Error</p>
                    <p>{error}</p>
                    <button
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        onClick={fetchAuditDetails}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!auditDetails) {
        return (
            <div className="container mx-auto px-4 py-8">
                <PageHeader
                    title="Audit Log Details"
                    breadcrumbItems={breadcrumbItems}
                    onBack={handleBack}
                />
                <div className="bg-gray-50 text-gray-700 p-6 rounded-lg shadow-sm">
                    <p>No audit details available for batch ID: {batchId}</p>
                </div>
            </div>
        );
    } return (
        <div className="bg-gray-100 min-h-screen">
            <PageHeader
                title="Audit Log Details"
                breadcrumbItems={breadcrumbItems}
                showBackButton={true}
                onBack={handleBack}
                actions={[
                    {
                        icon: <FileDownload fontSize="small" />,
                        label: 'Export Details',
                        onClick: () => exportBatchDetailsToCSV(auditDetails),
                        styles: 'bg-gray-800 text-white hover:bg-gray-900'
                    }
                ]}
            />

            <div className="container mx-auto px-4 py-4">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">                    {/* Header Section with Official Styling */}
                    <div className="bg-gray-100 border-b border-gray-200">
                        <div className="p-6">
                            {/* Main Header */}
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                                <div className="flex items-center mb-4 lg:mb-0">
                                    <div className="p-4 bg-gray-900 rounded-xl mr-4 shadow-lg">
                                        <History className="text-white text-2xl" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                            Batch #{auditDetails.batchId}
                                        </h1>
                                        <div className="flex items-center text-gray-600">
                                            <AccessTime className="h-4 w-4 mr-2" />
                                            <span className="text-sm font-medium">
                                                {formatDateTime(auditDetails.changedAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Officer Information Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                                    Changed By Officer
                                </h3>                                <OfficerCard
                                    officer={{
                                        id: auditDetails.changedBy,
                                        name: auditDetails.userName || 'Unknown User',
                                        role: auditDetails.userRole || 'No Role',
                                        profilePic: auditDetails.userProfilePic
                                    }}
                                    size="medium"
                                    className="border-0 hover:bg-gray-50 rounded-lg p-2"
                                />
                            </div>                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-100 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs uppercase font-semibold text-gray-700 mb-1 tracking-wide">
                                                Total Changes
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900">
                                                {auditDetails.logs.length}
                                            </p>
                                        </div>
                                        <div className="p-2 bg-gray-800 rounded-lg">
                                            <History className="text-white text-xl" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-100 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs uppercase font-semibold text-gray-700 mb-1 tracking-wide">
                                                Tables Affected
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900">
                                                {uniqueTables.length}
                                            </p>
                                        </div>
                                        <div className="p-2 bg-gray-800 rounded-lg">
                                            <TableChart className="text-white text-xl" />
                                        </div>
                                    </div>
                                </div>                                <div className="bg-gray-100 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs uppercase font-semibold text-gray-700 mb-1 tracking-wide">
                                                Action Types
                                            </p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {actionCounts.INSERT && (
                                                    <span className="bg-green-100 border border-green-300 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                                        {actionCounts.INSERT} INSERT
                                                    </span>
                                                )}                                                {actionCounts.UPDATE && (
                                                    <span className="bg-gray-100 border border-gray-300 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                                                        {actionCounts.UPDATE} UPDATE
                                                    </span>
                                                )}
                                                {actionCounts.DELETE && (
                                                    <span className="bg-red-100 border border-red-300 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                                                        {actionCounts.DELETE} DELETE
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="bg-gray-50 border-b border-gray-200 p-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center">
                                <FilterList className="text-gray-500 mr-2" />
                                <span className="text-sm font-semibold text-gray-700 mr-2">Filter:</span>
                            </div>

                            <div className="flex items-center">
                                <label htmlFor="table-filter" className="text-sm text-gray-600 mr-2">Table:</label>                                <select
                                    id="table-filter"
                                    value={filters.table}
                                    onChange={(e) => handleFilterChange('table', e.target.value)}
                                    className="border border-gray-300 rounded-md text-sm py-1 px-2 bg-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                                >
                                    <option value="all">All Tables</option>
                                    {uniqueTables.map(table => (
                                        <option key={table} value={table}>{table}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center">
                                <label htmlFor="action-filter" className="text-sm text-gray-600 mr-2">Action:</label>                                <select
                                    id="action-filter"
                                    value={filters.action}
                                    onChange={(e) => handleFilterChange('action', e.target.value)}
                                    className="border border-gray-300 rounded-md text-sm py-1 px-2 bg-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                                >
                                    <option value="all">All Actions</option>
                                    <option value="INSERT">Insert</option>
                                    <option value="UPDATE">Update</option>
                                    <option value="DELETE">Delete</option>
                                </select>
                            </div>

                            <div className="flex-grow flex items-center relative">
                                <div className="relative w-full max-w-md">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search changes..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="border border-gray-300 rounded-md py-1 pl-10 pr-4 w-full text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {hasFiltersApplied && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium">Filters applied:</span>                                        {filters.table !== 'all' && <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Table: {filters.table}</span>}
                                        {filters.action !== 'all' && <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Action: {filters.action}</span>}
                                        {searchTerm && <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Search: "{searchTerm}"</span>}
                                    </div>                                    <button
                                        onClick={() => {
                                            setFilters({ table: 'all', action: 'all' });
                                            setSearchTerm('');
                                        }}
                                        className="text-sm text-gray-700 hover:text-gray-900 font-medium"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Changes Content */}
                    <div className="p-6 overflow-auto" style={{ maxHeight: '60vh' }}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            Database Changes
                            {Object.keys(filteredChanges).length === 0 && hasFiltersApplied && (
                                <span className="text-sm font-normal text-gray-500 ml-2">
                                    (No results match your filters)
                                </span>
                            )}
                        </h3>

                        {Object.keys(filteredChanges).length === 0 && hasFiltersApplied ? (
                            <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
                                <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                                    <Search className="text-gray-400" style={{ fontSize: '2rem' }} />
                                </div>
                                <p className="text-gray-600 text-lg font-medium mb-2">No results match your current filters</p>
                                <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters</p>                                <button
                                    onClick={() => {
                                        setFilters({ table: 'all', action: 'all' });
                                        setSearchTerm('');
                                    }}
                                    className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            Object.keys(filteredChanges).map(tableName => (
                                <div key={tableName} className="mb-6 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <TableChart className="mr-2 text-gray-600" />
                                                <span className="font-semibold text-gray-900">{tableName}</span>
                                            </div>
                                            <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-full">
                                                {Object.keys(filteredChanges[tableName]).length} record(s)
                                            </span>
                                        </div>
                                    </div>

                                    {Object.keys(filteredChanges[tableName]).map(recordId => (
                                        <div key={recordId} className="border-b border-gray-100 last:border-b-0">
                                            <div
                                                className="bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                                                onClick={() => toggleRecordExpanded(tableName, recordId)}
                                            >
                                                <div className="flex items-center">
                                                    <div className="font-medium text-gray-900">Record ID: {recordId}</div>
                                                    <span className="ml-3 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                        {filteredChanges[tableName][recordId].length} change(s)
                                                    </span>
                                                </div>
                                                <button className="text-gray-500 hover:text-gray-700">
                                                    {expandedRecords[tableName]?.[recordId] ? (
                                                        <ChevronDown />
                                                    ) : (
                                                        <ChevronRight />
                                                    )}
                                                </button>
                                            </div>
                                            {expandedRecords[tableName]?.[recordId] && (
                                                <div className="bg-gray-50">
                                                    {filteredChanges[tableName][recordId].map((log, idx) => (
                                                        <div key={idx} className="p-3 border-b border-gray-200 last:border-b-0 bg-white mx-1 mb-1 rounded-md shadow-sm">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-grow">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <span className="font-medium text-gray-900 text-sm">{log.fieldName}</span>
                                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getActionColor(log.actionType)}`}>
                                                                            {log.actionType}
                                                                        </span>
                                                                    </div>                                                                    <div className="mt-2 relative group">
                                                                        <div className="bg-gray-50 p-2 rounded-md text-xs border border-gray-200 break-words max-h-20 overflow-y-auto">
                                                                            <p className="text-gray-800 leading-relaxed">{log.value || '(empty value)'}</p>
                                                                        </div>
                                                                        <button
                                                                            className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                copyToClipboard(log.value, `${log.tableName}-${log.recordId}-${log.fieldName}`);
                                                                            }}
                                                                            title="Copy value"
                                                                        >
                                                                            {copiedField === `${log.tableName}-${log.recordId}-${log.fieldName}` ? (
                                                                                <Check fontSize="small" className="text-green-500" />
                                                                            ) : (
                                                                                <ContentCopy fontSize="small" className="text-gray-500" />
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleAuditView;
