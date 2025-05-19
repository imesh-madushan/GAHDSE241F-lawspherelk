import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';

const SearchBar = ({
    searchTerm,
    setSearchTerm,
    searchType,
    setSearchType,
    showFilters,
    setShowFilters,
    handleSearch,
}) => {
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const searchOptions = [
        { value: 'crime', label: 'Crime Type' },
        { value: 'suspect', label: 'Suspect Name' },
        { value: 'case', label: 'Case Number' },
        { value: 'location', label: 'Location' },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsTypeDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search criminal records..."
                        className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        data-testid="search-input"
                    />
                </div>

                <div className="flex gap-2 sm:flex-shrink-0">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            data-testid="search-type-dropdown"
                        >
                            <span>{searchOptions.find(option => option.value === searchType)?.label || 'Search by'}</span>
                            <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isTypeDropdownOpen && (
                            <div className="absolute right-0 z-10 mt-1 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                    {searchOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setSearchType(option.value);
                                                setIsTypeDropdownOpen(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-sm ${searchType === option.value
                                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${showFilters
                                ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                                : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'
                            }`}
                        aria-expanded={showFilters ? 'true' : 'false'}
                        data-testid="filter-toggle"
                    >
                        <Filter className={`h-4 w-4 ${showFilters ? 'text-blue-700' : 'text-gray-500'} mr-2`} />
                        Filters
                    </button>

                    <button
                        type="button"
                        onClick={handleSearch}
                        className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-blue-700 border border-blue-700 rounded-lg hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                        data-testid="search-button"
                    >
                        <Search className="h-4 w-4 mr-2" />
                        Search
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchBar; 