import React, { useState, useEffect, useRef } from 'react';
import { Search, Assignment, KeyboardArrowDown, MoreHoriz } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';

const searchOptions = [
    { value: 'type', label: 'Evidence Type' },
    { value: 'evidence_id', label: 'Evidence ID' },
    { value: 'details', label: 'Details' }
];

const CustomEvidenceDropdown = ({
    filters = {},
    selectedEvidenceId,
    onEvidenceSelect,
    className = "",
    placeholder = "Search and select evidence...",
    isAutoSelected = false,
    dropdownLocked = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchType, setSearchType] = useState('type');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [displayLimit, setDisplayLimit] = useState(10);
    const [hasSearched, setHasSearched] = useState(false);
    const [lastCaseId, setLastCaseId] = useState(filters.case_id || '');

    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    const selectedEvidence = searchResults.find(e => e.evidence_id === selectedEvidenceId);

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

    // Search evidence with debouncing
    useEffect(() => {
        if (isOpen && (searchTerm.trim() || !hasSearched)) {
            // Clear existing timeout
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            // Set new timeout
            searchTimeoutRef.current = setTimeout(() => {
                searchEvidence();
            }, 300);
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm, searchType, isOpen]);

    // Fetch selected evidence details if auto-selected
    useEffect(() => {
        if (selectedEvidenceId && !selectedEvidence && isAutoSelected) {
            fetchSelectedEvidence();
        }
    }, [selectedEvidenceId, selectedEvidence, isAutoSelected]);

    // Always search when dropdown is open and searchTerm/searchType/filters.case_id changes
    useEffect(() => {
        if (isOpen) {
            searchEvidence();
        }
        // eslint-disable-next-line
    }, [isOpen, searchTerm, searchType, filters.case_id]);

    // If case_id filter changes, reset searchTerm and results
    useEffect(() => {
        if (filters.case_id !== lastCaseId) {
            setSearchTerm('');
            setSearchResults([]);
            setLastCaseId(filters.case_id);
        }
    }, [filters.case_id, lastCaseId]);

    const searchEvidence = async () => {
        setIsLoading(true);
        setHasSearched(true);
        try {
            const params = {
                limit: 50
            };

            // Only add search term if it exists
            if (searchTerm.trim()) {
                params[searchType] = searchTerm.trim();
            }

            // Always apply latest filters (especially case_id)
            if (filters.case_id) {
                params.case_id = filters.case_id;
            }
            if (filters.investigation_id) {
                params.investigation_id = filters.investigation_id;
            }
            if (filters.exclude_offence) {
                params.exclude_offence = filters.exclude_offence;
            }

            const response = await apiClient.get('/evidences/search', { params });
            setSearchResults(response.data.evidence || []);
        } catch (error) {
            console.error('Error searching evidence:', error);
            setSearchResults([]);
        }
        setIsLoading(false);
    };

    const fetchSelectedEvidence = async () => {
        try {
            const response = await apiClient.get(`/evidences/${selectedEvidenceId}`);
            if (response.data.success && response.data.evidence) {
                setSearchResults(prev => {
                    const exists = prev.find(e => e.evidence_id === selectedEvidenceId);
                    return exists ? prev : [response.data.evidence, ...prev];
                });
            }
        } catch (error) {
            console.error('Error fetching selected evidence:', error);
        }
    };

    const loadMoreResults = () => {
        setDisplayLimit(prev => prev + 10);
    };

    const truncateText = (text, maxLength = 35) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const displayedEvidence = searchResults.slice(0, displayLimit);

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return 'N/A';
        }
    };

    const handleDropdownOpen = () => {
        if (!dropdownLocked) {
            setIsOpen(true);
            if (!hasSearched && searchResults.length === 0) {
                // Load initial results only once
                setSearchTerm('');
            }
        }
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Selected evidence display */}
            <div
                onClick={handleDropdownOpen}
                className={`w-full border rounded-lg p-3 flex items-center justify-between transition-all 
                    ${!dropdownLocked ? 'cursor-pointer' : 'cursor-not-allowed'} 
                    ${isOpen ? 'border-blue-400 ring-2 ring-blue-100 shadow-md' : 'border-gray-300 hover:border-blue-300'}
                    ${isAutoSelected ? 'bg-indigo-50 border-indigo-300' : 'bg-white'}
                    ${dropdownLocked ? 'opacity-75' : ''}`}
            >
                <div className="flex items-center flex-1 min-w-0">
                    {selectedEvidence ? (
                        <div className="flex items-center w-full">
                            <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg mr-3 flex-shrink-0">
                                <Assignment className="text-indigo-700" fontSize="small" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-900 truncate">
                                    {truncateText(selectedEvidence.type, 30)}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500 font-medium">#{selectedEvidence.evidence_id}</span>
                                    {selectedEvidence.collected_by && (
                                        <>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-500">{truncateText(selectedEvidence.collected_by, 20)}</span>
                                        </>
                                    )}
                                    {selectedEvidence.collected_dt && (
                                        <>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-500">{formatDate(selectedEvidence.collected_dt)}</span>
                                        </>
                                    )}
                                    {isAutoSelected && (
                                        <>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-indigo-600 font-medium">Auto-selected</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500 flex items-center">
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg mr-3">
                                <Assignment className="text-gray-400" fontSize="small" />
                            </div>
                            <span className="text-sm">{placeholder}</span>
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

            {/* Dropdown menu */}
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
                        ) : displayedEvidence.length > 0 ? (
                            <>
                                {displayedEvidence.map(evidence => (
                                    <div
                                        key={evidence.evidence_id}
                                        className={`p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${selectedEvidenceId === evidence.evidence_id ? 'bg-indigo-50 border-r-2 border-indigo-500' : ''}`}
                                        onClick={() => { onEvidenceSelect(evidence); setIsOpen(false); }}
                                    >
                                        <div className="flex items-center w-full">
                                            <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg mr-3 flex-shrink-0">
                                                <Assignment className="text-indigo-700" fontSize="small" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-gray-900 truncate">
                                                    {truncateText(evidence.type, 30)}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-500 font-medium">#{evidence.evidence_id}</span>
                                                    {evidence.collected_by && (
                                                        <>
                                                            <span className="text-xs text-gray-400">•</span>
                                                            <span className="text-xs text-gray-500">{truncateText(evidence.collected_by, 20)}</span>
                                                        </>
                                                    )}
                                                    {evidence.collected_dt && (
                                                        <>
                                                            <span className="text-xs text-gray-400">•</span>
                                                            <span className="text-xs text-gray-500">{formatDate(evidence.collected_dt)}</span>
                                                        </>
                                                    )}
                                                </div>
                                                {evidence.details && (
                                                    <div className="text-xs text-gray-600 mt-1 truncate">
                                                        {truncateText(evidence.details, 50)}
                                                    </div>
                                                )}
                                            </div>
                                            {selectedEvidenceId === evidence.evidence_id && (
                                                <div className="ml-2 w-3 h-3 bg-indigo-600 rounded-full flex-shrink-0"></div>
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
                        ) : hasSearched ? (
                            <div className="flex flex-col items-center justify-center py-6 px-3 text-center">
                                <div className="flex bg-gray-100 rounded-full p-3 mb-3">
                                    <Assignment className="text-gray-400" fontSize="small" />
                                </div>
                                <p className="text-gray-500 text-sm">No evidence found</p>
                                {searchTerm && (
                                    <p className="text-gray-400 text-xs mt-1">Try adjusting your search terms</p>
                                )}
                            </div>
                        ) : (
                            <div className="flex justify-center items-center py-4">
                                <p className="text-gray-500 text-sm">Start typing to search evidence...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomEvidenceDropdown;
