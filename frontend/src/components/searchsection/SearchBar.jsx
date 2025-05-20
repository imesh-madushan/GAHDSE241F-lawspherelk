import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import OutlinedButton from '../buttons/OutlinedButton';

const SearchBar = ({
    searchTerm,
    setSearchTerm,
    searchType,
    setSearchType,
    searchOptions,
    showFilters,
    setShowFilters,
    handleSearch,
}) => {
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

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
                <div className="relative border-b-1 items-center flex flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search criminal records..."
                        className="block w-full pl-8 ml-1 pr-3 py-1 text-gray-900 ring-0  outline-none transition-all duration-200"
                        data-testid="search-input"
                    />
                    <div className="relative flex" ref={dropdownRef} style={{ zIndex: 20 }}>
                        <OutlinedButton
                            action={{
                                onClick: () => setIsTypeDropdownOpen(!isTypeDropdownOpen),
                                icon: <ChevronDown className={`ml-2 w-4 h-4 transition-transform duration-200 ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />,
                                label: searchOptions.find(option => option.value === searchType)?.label || 'Search by',
                                styles: 'flex items-center justify-center text-blue-700 hover:bg-blue-700 hover:text-white h-11 w-50 px-4 py-0.5 text-sm font-medium rounded-sm bg-gray-50 border-0 border-gray-300 outline-none ring-0 hover:cursor-pointer transition-all',
                            }}
                        />

                        {isTypeDropdownOpen && (
                            <div className="absolute left-1/2 top-12 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" style={{ transform: 'translateX(-50%)' }}>
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
                </div>

                <div className="flex gap-2 sm:flex-shrink-0">
                    <OutlinedButton
                        action={{
                            onClick: () => setShowFilters(!showFilters),
                            icon: <Filter fontSize='small' className='mr-2 w-4.5 h-4.5' />,
                            label: 'Filters',
                            styles: 'flex items-center justify-center text-blue-700 hover:bg-blue-700 hover:text-white h-11 w-30',
                        }}
                    />

                    <OutlinedButton
                        action={{
                            onClick: handleSearch,
                            icon: <Search fontSize='small' className='mr-2 w-5 h-5' />,
                            label: 'Search',
                            styles: 'flex items-center justify-center text-blue-700 bg-blue-800 text-white hover:bg-blue-700 hover:text-white h-11 w-30',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default SearchBar; 