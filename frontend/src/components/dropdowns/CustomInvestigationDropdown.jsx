import React, { useState, useEffect, useRef } from 'react';
import { ExpandMore, Search, Assignment } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import { investigationStatusList } from '../../../data';

const CustomInvestigationDropdown = ({
    filters = {},
    selectedInvestigationId,
    onInvestigationSelect,
    className = '',
    placeholder = 'Search and select investigation...',
    isAutoSelected = false,
    dropdownLocked = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [investigations, setInvestigations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedInvestigation, setSelectedInvestigation] = useState(null);
    const [lastCaseId, setLastCaseId] = useState(filters.case_id || '');
    const dropdownRef = useRef(null);

    // Clear selected investigation and search results when case_id changes
    useEffect(() => {
        if (filters.case_id !== lastCaseId) {
            setSelectedInvestigation(null);
            setInvestigations([]);
            setLastCaseId(filters.case_id);
        }
    }, [filters.case_id, lastCaseId]);

    useEffect(() => {
        if (isOpen) {
            fetchInvestigations();
        }
    }, [isOpen, searchTerm, filters]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Auto-select investigation if ID is provided and not already selected
    useEffect(() => {
        const fetchSelectedInvestigation = async () => {
            if (selectedInvestigationId && !selectedInvestigation && isAutoSelected) {
                try {
                    const { data } = await apiClient.get(`/investigations/${selectedInvestigationId}`);
                    if (data.success && data.investigation) {
                        setInvestigations(prev => [data.investigation, ...prev]);
                        setSelectedInvestigation(data.investigation);
                    }
                } catch (error) {
                    console.error('Error fetching selected investigation:', error);
                }
            }
        };

        fetchSelectedInvestigation();
    }, [selectedInvestigationId, selectedInvestigation, isAutoSelected]);

    const fetchInvestigations = async () => {
        setLoading(true);
        try {
            const searchParams = {
                ...filters,
                searchTerm: searchTerm.trim(),
                searchType: 'topic'
            };

            const response = await apiClient.get('/investigations/search', { params: searchParams });
            setInvestigations(response.data?.investigations || []);
        } catch (error) {
            console.error('Error fetching investigations:', error);
            setInvestigations([]);
        }
        setLoading(false);
    };

    const handleInvestigationSelect = (investigation) => {
        setSelectedInvestigation(investigation);
        onInvestigationSelect(investigation);
        setIsOpen(false);
        setSearchTerm('');
    };

    const truncateText = (text, maxLength = 35) => {
        if (!text) return "Untitled Investigation";
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // Helper function to get status styles
    const getStatusStyles = (status) => {
        const statusItem = investigationStatusList.find(item => item.value === status);
        return statusItem ? statusItem.styles : 'text-gray-500 bg-gray-100 border-gray-200';
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div
                className={`w-full px-4 py-3 border rounded-lg bg-white transition-all flex items-center justify-between 
                    ${!dropdownLocked ? 'cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'cursor-not-allowed'} 
                    ${isOpen ? 'border-blue-400 ring-2 ring-blue-100 shadow-md' : 'border-gray-300 hover:border-blue-300'}
                    ${isAutoSelected ? 'bg-green-50 border-green-300' : 'bg-white'}
                    ${dropdownLocked ? 'opacity-75' : ''}`}
                onClick={() => !dropdownLocked && setIsOpen(!isOpen)}
            >
                <div className="flex items-center flex-1 min-w-0">
                    {selectedInvestigation ? (
                        <div className="flex items-center w-full">
                            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mr-3 flex-shrink-0">
                                <Assignment className="text-green-700" fontSize="small" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-semibold text-gray-900 truncate">
                                            {truncateText(selectedInvestigation.topic, 30)}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500 font-medium">#{selectedInvestigation.investigation_id}</span>
                                            {selectedInvestigation.case_topic && (
                                                <>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-gray-500 truncate">{truncateText(selectedInvestigation.case_topic, 20)}</span>
                                                </>
                                            )}
                                            {isAutoSelected && (
                                                <>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-green-600 font-medium">Auto-selected</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusStyles(selectedInvestigation.status)}`}>
                                        {selectedInvestigation.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center text-gray-500">
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg mr-3">
                                <Assignment className="text-gray-400" fontSize="small" />
                            </div>
                            <span className="text-sm">{placeholder}</span>
                        </div>
                    )}
                </div>
                {!dropdownLocked && (
                    <ExpandMore className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </div>

            {/* Dropdown menu - only show if not locked */}
            {isOpen && !dropdownLocked && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search investigations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-2 text-sm">Loading investigations...</p>
                            </div>
                        ) : investigations.length > 0 ? (
                            investigations.map((investigation) => (
                                <div
                                    key={investigation.investigation_id}
                                    className={`p-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${selectedInvestigationId === investigation.investigation_id ? 'bg-green-50 border-r-2 border-green-500' : ''}`}
                                    onClick={() => handleInvestigationSelect(investigation)}
                                >
                                    <div className="flex items-center w-full">
                                        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mr-3 flex-shrink-0">
                                            <Assignment className="text-green-700" fontSize="small" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-sm font-semibold text-gray-900 truncate">
                                                        {truncateText(investigation.topic, 30)}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-500 font-medium">#{investigation.investigation_id}</span>
                                                        {investigation.case_topic && (
                                                            <>
                                                                <span className="text-xs text-gray-400">•</span>
                                                                <span className="text-xs text-gray-500 truncate">{truncateText(investigation.case_topic, 20)}</span>
                                                            </>
                                                        )}
                                                        {selectedInvestigationId === investigation.investigation_id && (
                                                            <>
                                                                <span className="text-xs text-gray-400">•</span>
                                                                <span className="text-xs text-green-600 font-medium">Auto-selected</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusStyles(investigation.status)}`}>
                                                    {investigation.status}
                                                </span>
                                            </div>
                                        </div>
                                        {selectedInvestigationId === investigation.investigation_id && (
                                            <div className="ml-2 w-2 h-2 bg-green-600 rounded-full"></div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-gray-500">
                                <div className="flex bg-gray-100 rounded-full p-3 mb-3 mx-auto w-fit">
                                    <Assignment className="text-gray-400" fontSize="small" />
                                </div>
                                <p className="text-sm">No investigations found</p>
                                {searchTerm && (
                                    <p className="text-xs mt-1 text-gray-400">Try adjusting your search terms</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomInvestigationDropdown;
