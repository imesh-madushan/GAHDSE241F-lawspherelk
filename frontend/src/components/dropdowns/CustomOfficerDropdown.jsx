import React, { useState, useRef, useEffect } from 'react';
import { KeyboardArrowDown, Search, Person, Clear } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';

const CustomOfficerDropdown = ({
    filters = {},
    selectedOfficerId,
    onOfficerSelect,
    setError,
    className = "",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const [officers, setAvailableOfficers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Find the selected officer
    const selectedOfficer = officers.find(officer => officer.id === selectedOfficerId);

    // Filter officers based on search term (for local fallback)
    const filteredOfficers = officers;

    // Debounced search from backend
    useEffect(() => {
        if (!isOpen) return;
        setIsLoading(true);
        const delayDebounce = setTimeout(async () => {
            try {
                const reqFilters = { ...filters };
                if (searchTerm && searchTerm.trim().length > 0) {
                    reqFilters.name = searchTerm.trim();
                }
                const response = await apiClient.post('/officers/search', reqFilters);
                if (response.data && Array.isArray(response.data)) {
                    const formattedOfficers = response.data.map(officer => ({
                        id: officer.user_id || officer.id,
                        name: officer.name,
                        role: officer.role,
                        image: officer.profile_pic || officer.image
                    }));
                    setAvailableOfficers(formattedOfficers);
                } else {
                    setAvailableOfficers([]);
                }
            } catch (err) {
                setAvailableOfficers([]);
                if (setError) setError("Failed to load available officers");
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, isOpen, filters, setError]);

    // Initial fetch when dropdown opens
    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
        }
    }, [isOpen]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Generate initials from name for fallback avatar
    const getInitials = (name) => {
        if (!name) return "??";
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Handle officer selection
    const handleSelect = (officer) => {
        onOfficerSelect(officer);
        setIsOpen(false);
        setSearchTerm('');
    };

    // Reset selection
    const handleClearSelection = (e) => {
        e.stopPropagation();
        onOfficerSelect({ id: null, name: null });
    };

    // Render avatar - uses image if available, falls back to initials
    const renderAvatar = (officer, size = 'regular') => {
        const sizeClasses = size === 'small' ? 'h-8 w-8' : 'h-10 w-10';

        if (officer?.image) {
            return (
                <div className={`${sizeClasses} rounded-full overflow-hidden flex-shrink-0 border-2 border-white shadow-sm`}>
                    <img
                        src={officer.image}
                        alt={officer.name}
                        className="h-full w-full object-cover"
                    />
                </div>
            );
        }

        return (
            <div className={`flex-shrink-0 ${sizeClasses} rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-medium shadow-sm`}>
                {getInitials(officer?.name || "??")}
            </div>
        );
    };

    return (
        <div className={`relative ${className} z-1`} ref={dropdownRef}>
            {/* Selected officer display */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full border rounded-lg p-2 flex items-center justify-between cursor-pointer transition-all 
                    ${isOpen ? 'border-blue-400 ring-2 ring-blue-100 shadow-md' : 'border-gray-200 hover:border-blue-300'}`}
            >
                <div className="flex items-center flex-1 min-w-0">
                    {selectedOfficer ? (
                        <>
                            {renderAvatar(selectedOfficer, 'small')}
                            <div className="ml-3 truncate">
                                <div className="text-gray-900 font-medium truncate">{selectedOfficer.name}</div>
                                {selectedOfficer.role && (
                                    <div className="text-xs text-gray-500 truncate">{selectedOfficer.role}</div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-gray-500 flex items-center">
                            <Person className="mr-2 text-gray-400" />
                            <span>Select officer</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center ml-2">
                    {selectedOfficer && (
                        <button
                            onClick={handleClearSelection}
                            className="mr-1 flex p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                        >
                            <Clear fontSize="small" />
                        </button>
                    )}
                    <div className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}>
                        <KeyboardArrowDown />
                    </div>
                </div>
            </div>

            {/* Dropdown panel */}
            {isOpen && (
                <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg z-20 border border-gray-200 overflow-hidden">
                    {/* Search box */}
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="text-gray-400" fontSize="small" />
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search officers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Officers list */}
                    <div className="max-h-60 overflow-y-auto py-1">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-4">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            </div>
                        ) : filteredOfficers.length > 0 ? (
                            filteredOfficers.map(officer => (
                                <div
                                    key={officer.id}
                                    className={`px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center transition-colors ${selectedOfficerId === officer.id ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => handleSelect(officer)}
                                >
                                    {renderAvatar(officer, 'small')}
                                    <div className="ml-3 min-w-0">
                                        <div className="text-gray-900 font-medium truncate">{officer.name}</div>
                                        <div className="flex items-center">
                                            <div className="text-xs text-gray-500 truncate">{officer.role || "Officer"}</div>
                                            {officer.id === selectedOfficerId && (
                                                <div className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                    Selected
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                                <div className="flex bg-gray-100 rounded-full p-2 mb-2">
                                    <Person className="text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-sm">No officers found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Hidden input for form handling */}
            <input
                type="hidden"
                name="leader_id"
                value={selectedOfficerId || ''}
            />
        </div>
    );
};

export default CustomOfficerDropdown;
