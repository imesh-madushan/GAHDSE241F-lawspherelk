import React from 'react';
import { History, Person, AccessTime, TableChart } from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';

const AuditBatchCard = ({ batch, onClick }) => {
    // Format dates and times
    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch (error) {
            console.log('Date formatting error:', error);
            return 'N/A';
        }
    };    const formatTime = (dateString) => {
        try {
            return format(new Date(dateString), 'h:mm a');
        } catch (error) {
            console.log('Time formatting error:', error);
            return 'N/A';
        }
    };
    
    const timeAgo = (dateString) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (error) {
            console.log('Time ago formatting error:', error);
            return 'N/A';
        }
    };

    // Count the changes by action type
    const actionCounts = batch.logs.reduce((acc, log) => {
        acc[log.actionType] = (acc[log.actionType] || 0) + 1;
        return acc;
    }, {});

    // Get unique tables affected
    const tablesAffected = [...new Set(batch.logs.map(log => log.tableName))];

    // Get badge color based on action type
    const getActionBadgeClass = (actionType) => {
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
    };

    return (
        <div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden hover:shadow-md transition-all cursor-pointer"
            onClick={onClick}
        >
            <div className="p-4">
                <div className="flex flex-col sm:flex-row justify-between">
                    {/* Left side with batch ID and timestamp */}
                    <div className="flex items-start mb-3 sm:mb-0">
                        <div className="p-2 bg-gray-50 rounded-full mr-3">
                            <History className="text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900">Batch: {batch.batchId}</h4>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                                <AccessTime className="h-4 w-4 mr-1" />
                                <span>{formatDate(batch.changedAt)} • {formatTime(batch.changedAt)}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{timeAgo(batch.changedAt)}</div>
                        </div>
                    </div>

                    {/* Right side with user info */}
                    <div className="flex items-center">
                        <div className="mr-3">
                            {batch.userProfilePic ? (
                                <img 
                                    src={batch.userProfilePic} 
                                    alt={batch.userName} 
                                    className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Person className="text-blue-600" />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-medium text-gray-800">{batch.userName || 'Unknown User'}</p>
                            <p className="text-xs text-gray-500">{batch.userRole || 'No Role'}</p>
                        </div>
                    </div>
                </div>

                {/* Tables and actions section */}
                <div className="mt-4 border-t pt-3 border-gray-100">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                        <TableChart className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="mr-1 font-medium">Tables affected:</span>
                        <span className="text-gray-700">
                            {tablesAffected.join(', ')}
                        </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                        {actionCounts.INSERT && (
                            <span className={`text-xs px-2 py-1 rounded-full ${getActionBadgeClass('INSERT')}`}>
                                {actionCounts.INSERT} Insert{actionCounts.INSERT > 1 ? 's' : ''}
                            </span>
                        )}
                        {actionCounts.UPDATE && (
                            <span className={`text-xs px-2 py-1 rounded-full ${getActionBadgeClass('UPDATE')}`}>
                                {actionCounts.UPDATE} Update{actionCounts.UPDATE > 1 ? 's' : ''}
                            </span>
                        )}
                        {actionCounts.DELETE && (
                            <span className={`text-xs px-2 py-1 rounded-full ${getActionBadgeClass('DELETE')}`}>
                                {actionCounts.DELETE} Delete{actionCounts.DELETE > 1 ? 's' : ''}
                            </span>
                        )}
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                            {batch.logs.length} total change{batch.logs.length > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditBatchCard;
