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
            <div className={`flex-shrink-0 ${sizeClasses} rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-medium shadow-sm`}>
                {getInitials(officer?.name || "??")}
            </div>
        );
    };

    return (
        <div className={`relative w-full ${className}`} ref={dropdownRef}>
            <button
                type="button"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-gray-700"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center">
                    {selectedOfficer ? (
                        <>
                            <span className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-300 bg-gray-100 flex items-center justify-center mr-2">
                                {selectedOfficer.image ? (
                                    <img src={selectedOfficer.image} alt={selectedOfficer.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Person className="text-gray-700" />
                                )}
                            </span>
                            <span className="text-gray-800 font-medium">{selectedOfficer.name}</span>
                        </>
                    ) : (
                        <span className="text-gray-700">Select Officer</span>
                    )}
                </div>
                <KeyboardArrowDown className={`transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''} text-gray-700`} />
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-auto">
                    <div className="p-2 flex items-center border-b border-gray-200 bg-gray-50">
                        <Search className="text-gray-700 mr-2" />
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
                            placeholder="Search officers..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <Clear className="text-gray-400 cursor-pointer ml-2" onClick={() => setSearchTerm('')} />
                        )}
                    </div>
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : (
                        filteredOfficers.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No officers found</div>
                        ) : (
                            filteredOfficers.map(officer => (
                                <div
                                    key={officer.id}
                                    className={`flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer ${selectedOfficerId === officer.id ? 'bg-gray-100' : ''}`}
                                    onClick={() => handleSelect(officer)}
                                >
                                    <span className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-300 bg-gray-100 flex items-center justify-center mr-2">
                                        {officer.image ? (
                                            <img src={officer.image} alt={officer.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Person className="text-gray-700" />
                                        )}
                                    </span>
                                    <span className="text-gray-800 font-medium">{officer.name}</span>
                                    <span className="ml-2 text-gray-500 text-xs">{officer.role}</span>
                                </div>
                            ))
                        )
                    )}
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
