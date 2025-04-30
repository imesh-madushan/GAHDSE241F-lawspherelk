import React, { useState, useRef, useEffect } from 'react';
import { KeyboardArrowDown, Search, Person } from '@mui/icons-material';

const CustomOfficerDropdown = ({
    officers,
    selectedOfficerId,
    onOfficerSelect,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Find the selected officer
    const selectedOfficer = officers.find(officer => officer.id === selectedOfficerId);

    // Filter officers based on search term
    const filteredOfficers = officers.filter(officer =>
        officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (officer.role && officer.role.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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

    // Render avatar - uses image if available, falls back to initials
    const renderAvatar = (officer, size = 'regular') => {
        const sizeClasses = size === 'small' ? 'h-8 w-8' : 'h-10 w-10';

        if (officer.image) {
            return (
                <div className={`${sizeClasses} rounded-full overflow-hidden flex-shrink-0`}>
                    <img
                        src={officer.image}
                        alt={officer.name}
                        className="h-full w-full object-cover"
                    />
                </div>
            );
        }

        return (
            <div className={`flex-shrink-0 ${sizeClasses} rounded-full bg-blue-600 flex items-center justify-center text-white font-medium`}>
                {getInitials(officer.name)}
            </div>
        );
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Selected officer display */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full border border-blue-200 rounded-md px-3 py-2 flex items-center justify-between cursor-pointer"
            >
                <div className="flex items-center">
                    {selectedOfficer ? (
                        <>
                            {renderAvatar(selectedOfficer, 'small')}
                            <div className="ml-2">
                                <div className="text-gray-900 font-medium">{selectedOfficer.name}</div>
                                {selectedOfficer.role && (
                                    <div className="text-xs text-gray-500">{selectedOfficer.role}</div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-gray-600 flex items-center">
                            <Person className="mr-2 text-blue-600" />
                            Select Case Leader
                        </div>
                    )}
                </div>
                <KeyboardArrowDown
                    className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
                />
            </div>

            {/* Dropdown panel */}
            {isOpen && (
                <div className="absolute mt-1 w-full bg-white/20 backdrop-blur-2xl rounded-md shadow-lg z-20 border border-gray-300 overflow-hidden">
                    {/* Search box */}
                    <div className="p-2 border-b border-gray-200 flex items-center bg-gray-50">
                        <Search className="text-gray-400 mr-2" fontSize="small" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search officers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-none focus:outline-none text-sm"
                        />
                    </div>

                    {/* Officers list */}
                    <div className="max-h-60 overflow-y-auto py-1">
                        {filteredOfficers.length > 0 ? (
                            filteredOfficers.map(officer => (
                                <div
                                    key={officer.id}
                                    className={`px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center ${selectedOfficerId === officer.id ? 'bg-blue-100' : ''
                                        }`}
                                    onClick={() => handleSelect(officer)}
                                >
                                    {renderAvatar(officer)}
                                    <div className="ml-3">
                                        <div className="text-gray-900 font-medium">{officer.name}</div>
                                        {officer.role && (
                                            <div className="text-xs text-gray-500">{officer.role}</div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-3 text-gray-500 text-center text-sm">No officers found</div>
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
