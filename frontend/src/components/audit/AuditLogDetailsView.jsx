import React, { useState, useEffect, useCallback } from 'react'; 
import { 
    History, 
    Person, 
    Search, 
    FilterList, 
    AccessTime,
    TableChart,
    ChevronRight,
    KeyboardArrowDown as ChevronDown,
    ContentCopy,
    Check,
    GetApp as FileDownload
} from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import { format } from 'date-fns';
import Spinner from '../Spinner';
import { exportBatchDetailsToCSV } from '../../utils/exportUtils';

const AuditLogDetailsView = ({ batchId, onBack }) => {
    const [auditDetails, setAuditDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [groupedChanges, setGroupedChanges] = useState({});
    const [filters, setFilters] = useState({
        table: 'all',
        action: 'all',
    });    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRecords, setExpandedRecords] = useState({});
    const [copiedField, setCopiedField] = useState(null);
    
    useEffect(() => {
        if (batchId) {
            fetchAuditDetails();
        }
    }, [batchId, fetchAuditDetails]);

    const fetchAuditDetails = useCallback(async () => {
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
    }, [batchId]);

    const groupChangesByTable = (logs) => {
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
    };

    const getActionColor = (actionType) => {
        switch (actionType) {
            case 'INSERT':
                return 'bg-green-100 text-green-700';
            case 'UPDATE':
                return 'bg-blue-100 text-blue-700';
            case 'DELETE':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };    const formatDateTime = (dateString) => {
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

    const filteredChanges = auditDetails ? filterLogs() : {};
    const uniqueTables = getUniqueTableNames();
    const actionCounts = getActionCounts();
    const hasFiltersApplied = filters.table !== 'all' || filters.action !== 'all' || searchTerm;

    if (loading) {
        return (
            <div className="flex justify-center items-center p-16">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
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
        );
    }

    if (!auditDetails) {
        return (
            <div className="bg-gray-50 text-gray-700 p-6 rounded-lg shadow-sm">
                <p>No audit details available.</p>
            </div>
        );
    }

    return (        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header with basic info */}
            <div className="p-6 border-b">
                <div className="flex items-center mb-4">
                    <button
                        onClick={onBack}
                        className="mr-4 bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full transition-colors"
                        aria-label="Go back"
                    >
                        <ChevronRight className="transform rotate-180" />
                    </button>
                    <h2 className="text-xl font-semibold text-gray-800">Audit Log Details</h2>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div className="flex items-center mb-4 md:mb-0">
                        <div className="p-3 bg-blue-100 rounded-full mr-4">
                            <History className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Batch ID: {auditDetails.batchId}</h2>
                            <div className="flex items-center mt-1 text-gray-500">
                                <AccessTime className="h-4 w-4 mr-1" />
                                <span>{formatDateTime(auditDetails.changedAt)}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => exportBatchDetailsToCSV(auditDetails)}
                        className="bg-green-100 hover:bg-green-200 text-green-700 py-2 px-4 rounded-md flex items-center transition-colors"
                    >
                        <FileDownload className="mr-2" fontSize="small" />
                        Export Details
                    </button>
                </div>
                
                {/* User info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                        <div className="mr-3">
                            {auditDetails.userProfilePic ? (
                                <img 
                                    src={auditDetails.userProfilePic} 
                                    alt={auditDetails.userName} 
                                    className="h-12 w-12 rounded-full object-cover border border-gray-200"
                                />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Person className="text-blue-600" />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">{auditDetails.userName || 'Unknown User'}</p>
                            <p className="text-sm text-gray-600">{auditDetails.userRole || 'No Role'}</p>
                        </div>
                    </div>
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-xs uppercase font-semibold text-blue-700 mb-1">Total Changes</p>
                        <p className="text-2xl font-bold text-blue-800">{auditDetails.logs.length}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs uppercase font-semibold text-gray-700 mb-1">Tables Affected</p>
                        <p className="text-2xl font-bold text-gray-800">{uniqueTables.length}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-xs uppercase font-semibold text-purple-700 mb-1">Actions</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {actionCounts.INSERT && (
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                    {actionCounts.INSERT} Insert{actionCounts.INSERT > 1 ? 's' : ''}
                                </span>
                            )}
                            {actionCounts.UPDATE && (
                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                                    {actionCounts.UPDATE} Update{actionCounts.UPDATE > 1 ? 's' : ''}
                                </span>
                            )}
                            {actionCounts.DELETE && (
                                <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                                    {actionCounts.DELETE} Delete{actionCounts.DELETE > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="border-b bg-gray-50 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center">
                        <FilterList className="text-gray-500 mr-2" />
                        <span className="text-sm text-gray-700 mr-2">Filter:</span>
                    </div>
                    
                    <div className="flex items-center">
                        <label htmlFor="table-filter" className="text-sm text-gray-600 mr-2">Table:</label>
                        <select
                            id="table-filter"
                            value={filters.table}
                            onChange={(e) => handleFilterChange('table', e.target.value)}
                            className="border border-gray-300 rounded-md text-sm py-1 px-2"
                        >
                            <option value="all">All Tables</option>
                            {uniqueTables.map(table => (
                                <option key={table} value={table}>{table}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="flex items-center">
                        <label htmlFor="action-filter" className="text-sm text-gray-600 mr-2">Action:</label>
                        <select
                            id="action-filter"
                            value={filters.action}
                            onChange={(e) => handleFilterChange('action', e.target.value)}
                            className="border border-gray-300 rounded-md text-sm py-1 px-2"
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
                                className="border border-gray-300 rounded-md py-1 pl-10 pr-4 w-full text-sm"
                            />
                        </div>
                    </div>
                </div>
                
                {hasFiltersApplied && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Filters applied:</span> 
                                {filters.table !== 'all' && <span className="ml-2">Table: {filters.table}</span>}
                                {filters.action !== 'all' && <span className="ml-2">Action: {filters.action}</span>}
                                {searchTerm && <span className="ml-2">Search: "{searchTerm}"</span>}
                            </div>
                            <button 
                                onClick={() => {
                                    setFilters({ table: 'all', action: 'all' });
                                    setSearchTerm('');
                                }}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Changes By Table */}
            <div className="p-6 overflow-auto" style={{maxHeight: '60vh'}}>
                <h3 className="text-lg font-semibold mb-4">
                    Changes 
                    {Object.keys(filteredChanges).length === 0 && (
                        <span className="text-sm font-normal text-gray-500 ml-2">
                            (No results match your filters)
                        </span>
                    )}
                </h3>
                
                {Object.keys(filteredChanges).length === 0 && hasFiltersApplied ? (
                    <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
                        <p className="text-gray-600">No results match your current filters.</p>
                        <button 
                            onClick={() => {
                                setFilters({ table: 'all', action: 'all' });
                                setSearchTerm('');
                            }}
                            className="mt-4 text-blue-600 hover:underline"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    Object.keys(filteredChanges).map(tableName => (
                        <div key={tableName} className="mb-6">
                            <h4 className="text-md font-semibold bg-gray-100 p-3 rounded flex items-center justify-between">
                                <div className="flex items-center">
                                    <TableChart className="mr-2 text-gray-600" />
                                    <span>{tableName}</span>
                                </div>
                                <span className="text-xs font-normal text-gray-600">
                                    {Object.keys(filteredChanges[tableName]).length} record(s)
                                </span>
                            </h4>
                            
                            {Object.keys(filteredChanges[tableName]).map(recordId => (
                                <div key={recordId} className="mt-3 border rounded-lg overflow-hidden">
                                    <div 
                                        className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center cursor-pointer hover:bg-gray-100"
                                        onClick={() => toggleRecordExpanded(tableName, recordId)}
                                    >
                                        <p className="font-medium">Record ID: {recordId}</p>
                                        <button className="text-gray-500 hover:text-gray-700">
                                            {expandedRecords[tableName]?.[recordId] ? (
                                                <ChevronDown />
                                            ) : (
                                                <ChevronRight />
                                            )}
                                        </button>
                                    </div>
                                    
                                    {expandedRecords[tableName]?.[recordId] && (
                                        <div className="divide-y">
                                            {filteredChanges[tableName][recordId].map((log, idx) => (
                                                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-grow">
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-medium">{log.fieldName}</span>
                                                                <span className={`text-xs px-2 py-1 rounded-full ${getActionColor(log.actionType)}`}>
                                                                    {log.actionType}
                                                                </span>
                                                            </div>
                                                            <div className="mt-2 relative group">
                                                                <div className="bg-gray-50 p-3 rounded text-sm border border-gray-200 break-words">
                                                                    <p className="text-gray-800">{log.value || '(empty value)'}</p>
                                                                </div>
                                                                <button 
                                                                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    onClick={() => copyToClipboard(log.value, `${log.tableName}-${log.recordId}-${log.fieldName}`)}
                                                                    title="Copy value"
                                                                >
                                                                    {copiedField === `${log.tableName}-${log.recordId}-${log.fieldName}` ? (
                                                                        <Check fontSize="small" className="text-green-500" />
                                                                    ) : (
                                                                        <ContentCopy fontSize="small" className="text-gray-500" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-2 flex items-center">
                                                                <AccessTime className="h-3 w-3 mr-1" />
                                                                {formatDateTime(log.changedAt)}
                                                            </p>
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
    );
};

export default AuditLogDetailsView;
