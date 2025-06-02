import React, { useState, useRef, useEffect } from 'react';
import { KeyboardArrowDown, Search, Person, PersonAdd, MoreHoriz } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';

const searchOptions = [
    { value: 'name', label: 'Name' },
    { value: 'nic', label: 'NIC' },
    { value: 'criminal_id', label: 'ID' }
];

const CustomCriminalDropdown = ({
    criminals = [],
    selectedCriminalId,
    onCriminalSelect,
    onCreateNewCriminal,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchType, setSearchType] = useState('name');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [displayLimit, setDisplayLimit] = useState(10);

    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const selectedCriminal = criminals.find(c => c.criminal_id === selectedCriminalId) ||
        searchResults.find(c => c.criminal_id === selectedCriminalId);

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

    // Search criminals when term/type changes
    useEffect(() => {
        const delayDebounceSearch = setTimeout(async () => {
            if (isOpen && searchTerm.trim().length > 0) {
                setIsLoading(true);
                try {
                    let params = { limit: 25 };
                    if (searchType === 'name') params.name = searchTerm;
                    if (searchType === 'nic') params.nic = searchTerm;
                    if (searchType === 'criminal_id') params.criminal_id = searchTerm;
                    const { data } = await apiClient.get('/criminals/search', { params });
                    setSearchResults(data.criminals || []);
                } catch (error) {
                    setSearchResults([]);
                } finally {
                    setIsLoading(false);
                }
            } else if (searchTerm.trim() === '') {
                setSearchResults(criminals);
            }
        }, 300);

        return () => clearTimeout(delayDebounceSearch);
    }, [searchTerm, searchType, isOpen, criminals]);

    // Initialize search results with provided criminals
    useEffect(() => {
        setSearchResults(criminals);
    }, [criminals]);

    const loadMoreResults = () => {
        setDisplayLimit(prev => prev + 10);
    };

    const displayedCriminals = searchResults.slice(0, displayLimit);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Selected criminal display */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full border rounded-lg p-1.5 flex items-center justify-between cursor-pointer transition-all 
                    ${isOpen ? 'border-blue-400 ring-2 ring-blue-100 shadow-md' : 'border-gray-200 hover:border-blue-300'}`}
            >
                <div className="flex items-center flex-1 min-w-0">
                    {selectedCriminal ? (
                        <>
                            <Person className="text-blue-700 mr-1.5" style={{ fontSize: '1rem' }} />
                            <div className="truncate">
                                <div className="text-gray-900 font-medium truncate text-sm">{selectedCriminal.name}</div>
                                <div className="text-xs text-gray-500 truncate">{selectedCriminal.criminal_id}</div>
                            </div>
                        </>
                    ) : (
                        <div className="text-gray-500 flex items-center">
                            <Person className="mr-1.5 text-gray-400" style={{ fontSize: '1rem' }} />
                            <span className="text-sm">Select Criminal</span>
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
                <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg z-40 border border-gray-200 overflow-hidden">
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
                        {/* Quick create button */}
                        <button
                            className="mt-2 w-full px-2.5 py-1.5 bg-blue-50 text-blue-700 text-sm rounded hover:bg-blue-100 border border-blue-200 flex items-center justify-center gap-1.5 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                                onCreateNewCriminal();
                            }}
                        >
                            <PersonAdd fontSize="small" /> Create New Criminal
                        </button>
                    </div>

                    <div className="max-h-48 overflow-y-auto py-1">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-4">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            </div>
                        ) : displayedCriminals.length > 0 ? (
                            <>
                                {displayedCriminals.map(criminal => (
                                    <div
                                        key={criminal.criminal_id}
                                        className={`px-3 py-1.5 hover:bg-blue-50 cursor-pointer flex items-center transition-colors text-sm ${selectedCriminalId === criminal.criminal_id ? 'bg-blue-50' : ''}`}
                                        onClick={() => { onCriminalSelect(criminal); setIsOpen(false); }}
                                    >
                                        <Person className="text-blue-700 mr-2" fontSize="small" />
                                        <div className="truncate flex-1">
                                            <div className="text-gray-900 font-medium truncate">{criminal.name}</div>
                                            <div className="text-xs text-gray-500 truncate">{criminal.criminal_id}</div>
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
                                    <Person className="text-gray-400" fontSize="small" />
                                </div>
                                <p className="text-gray-500 text-xs mb-2">No criminals found</p>
                                <button
                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 text-xs"
                                    onClick={() => { setIsOpen(false); onCreateNewCriminal(); }}
                                >
                                    <PersonAdd fontSize="small" /> Create New Criminal
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomCriminalDropdown;
