import React, { useState, useRef, useEffect } from 'react';
import { KeyboardArrowDown, Search, FolderOpen, MoreHoriz } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import { caseStatusList } from '../../../data';

const searchOptions = [
    { value: 'topic', label: 'Topic' },
    { value: 'case_id', label: 'Case ID' }
];

const CustomCaseDropdown = ({
    filters = {},
    selectedCaseId,
    onCaseSelect,
    className = "",
    isAutoSelected = false,
    dropdownLocked = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchType, setSearchType] = useState('topic');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [displayLimit, setDisplayLimit] = useState(10);

    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const selectedCase = searchResults.find(c => c.case_id === selectedCaseId);

    // Handle outside clicks to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Search cases when term/type changes
    useEffect(() => {
        const delayDebounceSearch = setTimeout(async () => {
            setIsLoading(true);
            try {
                let params = { limit: 25 };
                if (filters.status) params.status = filters.status;
                if (searchType === 'topic') params.topic = searchTerm;
                if (searchType === 'case_id') params.case_id = searchTerm;
                const { data } = await apiClient.get('/cases/search', { params });
                setSearchResults(data.cases || []);
            } catch (error) {
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }

        }, 300);

        return () => clearTimeout(delayDebounceSearch);
    }, [searchTerm, searchType, isOpen]);

    // New useEffect to fetch selected case details if auto-selected
    useEffect(() => {
        const fetchSelectedCase = async () => {
            if (selectedCaseId && !selectedCase && isAutoSelected) {
                try {
                    const { data } = await apiClient.get(`/cases/${selectedCaseId}`);
                    if (data.caseData) {
                        setSearchResults(prev => [data.caseData, ...prev]);
                    }
                } catch (error) {
                    console.error('Error fetching selected case:', error);
                }
            }
        };

        fetchSelectedCase();
    }, [selectedCaseId, selectedCase, isAutoSelected]);

    const loadMoreResults = () => {
        setDisplayLimit(prev => prev + 10);
    };

    // Function to truncate text with ellipsis
    const truncateText = (text, maxLength = 35) => {
        if (!text) return "Untitled Case";
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const displayedCases = searchResults.slice(0, displayLimit);

    // Helper function to get status styles
    const getStatusStyles = (status) => {
        const statusItem = caseStatusList.find(item => item.value === status);
        return statusItem ? statusItem.styles : 'text-gray-500 bg-gray-100 border-gray-200';
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Selected case display */}
            <div
                onClick={() => !dropdownLocked && setIsOpen(!isOpen)}
                className={`w-full border rounded-lg p-3 flex items-center justify-between transition-all 
                    ${!dropdownLocked ? 'cursor-pointer' : 'cursor-not-allowed'} 
                    ${isOpen ? 'border-blue-400 ring-2 ring-blue-100 shadow-md' : 'border-gray-300 hover:border-blue-300'}
                    ${isAutoSelected ? 'bg-blue-50 border-blue-300' : 'bg-white'}
                    ${dropdownLocked ? 'opacity-75' : ''}`}
            >
                <div className="flex items-center flex-1 min-w-0">
                    {selectedCase ? (
                        <div className="flex items-center w-full">
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-3 flex-shrink-0">
                                <FolderOpen className="text-blue-700" fontSize="small" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-semibold text-gray-900 truncate">
                                            {truncateText(selectedCase.topic, 30)}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500 font-medium">#{selectedCase.case_id}</span>
                                            {selectedCase.case_type && (
                                                <>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-gray-500">{selectedCase.case_type}</span>
                                                </>
                                            )}
                                            {isAutoSelected && (
                                                <>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-blue-600 font-medium">Auto-selected</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusStyles(selectedCase.case_status || selectedCase.status)}`}>
                                        {selectedCase.case_status || selectedCase.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500 flex items-center">
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg mr-3">
                                <FolderOpen className="text-gray-400" fontSize="small" />
                            </div>
                            <span className="text-sm">Select a case...</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center ml-2">
                    {!dropdownLocked && (
                        <div className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}>
                            <KeyboardArrowDown fontSize="small" />
                        </div>
                    )}
                </div>
            </div>

            {/* Dropdown menu - only show if not locked */}
            {isOpen && !dropdownLocked && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <div className="flex gap-2 mb-2">
                            <select
                                value={searchType}
                                onChange={e => setSearchType(e.target.value)}
                                className="text-xs px-2 py-1 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {searchOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                    <Search className="text-gray-400" fontSize="small" />
                                </div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder={`Search by ${searchOptions.find(o => o.value === searchType).label}...`}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-4">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            </div>
                        ) : displayedCases.length > 0 ? (
                            <>
                                {displayedCases.map(caseObj => (
                                    <div
                                        key={caseObj.case_id}
                                        className={`p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${selectedCaseId === caseObj.case_id ? 'bg-blue-50 border-r-2 border-blue-500' : ''}`}
                                        onClick={() => { onCaseSelect(caseObj); setIsOpen(false); }}
                                    >
                                        <div className="flex items-center w-full">
                                            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-3 flex-shrink-0">
                                                <FolderOpen className="text-blue-700" fontSize="small" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-sm font-semibold text-gray-900 truncate">
                                                            {truncateText(caseObj.topic, 30)}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs text-gray-500 font-medium">#{caseObj.case_id}</span>
                                                            {caseObj.case_type && (
                                                                <>
                                                                    <span className="text-xs text-gray-400">•</span>
                                                                    <span className="text-xs text-gray-500">{caseObj.case_type}</span>
                                                                </>
                                                            )}
                                                            {selectedCaseId === caseObj.case_id && (
                                                                <>
                                                                    <span className="text-xs text-gray-400">•</span>
                                                                    <span className="text-xs text-blue-600 font-medium">Auto-selected</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusStyles(caseObj.case_status || caseObj.status)}`}>
                                                        {caseObj.case_status || caseObj.status}
                                                    </span>
                                                </div>
                                            </div>
                                            {selectedCaseId === caseObj.case_id && (
                                                <div className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {searchResults.length > displayLimit && (
                                    <div
                                        className="text-center py-2 text-blue-600 hover:bg-blue-50 cursor-pointer text-sm border-t border-gray-100"
                                        onClick={loadMoreResults}
                                    >
                                        <MoreHoriz fontSize="small" className="mr-1" />
                                        Load more ({searchResults.length - displayLimit} remaining)
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 px-3 text-center">
                                <div className="flex bg-gray-100 rounded-full p-3 mb-3">
                                    <FolderOpen className="text-gray-400" fontSize="small" />
                                </div>
                                <p className="text-gray-500 text-sm">No cases found</p>
                                {searchTerm && (
                                    <p className="text-gray-400 text-xs mt-1">Try adjusting your search terms</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomCaseDropdown;
