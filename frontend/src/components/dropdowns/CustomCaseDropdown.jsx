import React, { useState, useRef, useEffect } from 'react';
import { KeyboardArrowDown, Search, FolderOpen, MoreHoriz } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';

const searchOptions = [
    { value: 'topic', label: 'Topic' },
    { value: 'case_id', label: 'Case ID' }
];

const CustomCaseDropdown = ({
    filters = {},
    selectedCaseId,
    onCaseSelect,
    className = ""
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
                let params = { limit: 25  };
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

    const loadMoreResults = () => {
        setDisplayLimit(prev => prev + 10);
    };

    // Function to truncate text with ellipsis
    const truncateText = (text, maxLength = 35) => {
        if (!text) return "Untitled Case";
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const displayedCases = searchResults.slice(0, displayLimit);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Selected case display */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full border rounded-lg p-1.5 flex items-center justify-between cursor-pointer transition-all 
                    ${isOpen ? 'border-blue-400 ring-2 ring-blue-100 shadow-md' : 'border-gray-200 hover:border-blue-300'}`}
            >
                <div className="flex items-center flex-1 min-w-0">
                    {selectedCase ? (
                        <>
                            <FolderOpen className="text-blue-700 mr-1.5" style={{ fontSize: '1rem' }} />
                            <div className="truncate">
                                <div className="text-gray-900 font-medium truncate text-sm">
                                    {truncateText(selectedCase.topic)}
                                </div>
                                <div className="text-xs text-gray-500 truncate">{selectedCase.case_id}</div>
                            </div>
                        </>
                    ) : (
                        <div className="text-gray-500 flex items-center">
                            <FolderOpen className="mr-1.5 text-gray-400" style={{ fontSize: '1rem' }} />
                            <span className="text-sm">Select Case</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center ml-2">
                    <div className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}>
                        <KeyboardArrowDown fontSize="small" />
                    </div>
                </div>
            </div>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg z-50 border border-gray-200 overflow-hidden">
                    <div className="sticky top-0 p-2 border-b border-gray-200 bg-gray-50">
                        <div className="flex gap-2 mb-2">
                            <select
                                value={searchType}
                                onChange={e => setSearchType(e.target.value)}
                                className="text-xs px-2 py-1 border border-gray-300 rounded bg-white"
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
                                    className="block w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto py-1">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-4">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            </div>
                        ) : displayedCases.length > 0 ? (
                            <>
                                {displayedCases.map(caseObj => (
                                    <div
                                        key={caseObj.case_id}
                                        className={`px-3 py-1.5 hover:bg-blue-50 cursor-pointer flex items-center transition-colors text-sm ${selectedCaseId === caseObj.case_id ? 'bg-blue-50' : ''}`}
                                        onClick={() => { onCaseSelect(caseObj); setIsOpen(false); }}
                                    >
                                        <FolderOpen className="text-blue-700 mr-2 flex-shrink-0" fontSize="small" />
                                        <div className="truncate flex-1">
                                            <div className="text-gray-900 font-medium truncate">
                                                {truncateText(caseObj.topic)}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate">{caseObj.case_id}</div>
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
                            <div className="flex flex-col items-center justify-center py-4 px-3 text-center">
                                <div className="flex bg-gray-100 rounded-full p-1.5 mb-2">
                                    <FolderOpen className="text-gray-400" fontSize="small" />
                                </div>
                                <p className="text-gray-500 text-xs">No cases found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomCaseDropdown;
