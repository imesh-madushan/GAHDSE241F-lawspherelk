import React, { useState, useRef, useEffect } from 'react';
import { KeyboardArrowDown } from '@mui/icons-material';

const StatusBadge = ({ status, statusList, isEditing, handleInputChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleStatusChange = (value) => {
        handleInputChange({
            target: {
                name: 'status',
                value: value
            }
        });
        setIsOpen(false);
    };

    const getSelectedLabel = () => {
        const option = statusList.find(opt => opt.value === status);
        return option ? option.label : 'Select Status';
    };

    return isEditing ? (
        <div className="relative" ref={dropdownRef}>
            {/* Custom dropdown button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white border border-gray-300 rounded-xl px-4 py-2 w-40 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
                <div className="flex items-center">
                    <span
                        className={`w-3 h-3 rounded-full mr-2 ${statusList.find(opt => opt.value === status)?.styles || 'bg-gray-200'}`}
                    ></span>
                    <span>{getSelectedLabel()}</span>
                </div>
                <KeyboardArrowDown className={`transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {/* Dropdown options */}
            {isOpen && (
                <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-auto">
                    {statusList.map(option => (
                        <div
                            key={option.value}
                            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${status === option.value ? 'bg-blue-50' : ''}`}
                            onClick={() => handleStatusChange(option.value)}
                        >
                            <span
                                className={`w-3 h-3 rounded-full mr-2 ${option.styles || 'bg-gray-200'}`}
                            ></span>
                            {option.label}
                        </div>
                    ))}
                </div>
            )}

            {/* Hidden native select for form submission if needed */}
            <select
                name="status"
                value={status}
                onChange={handleInputChange}
                className="sr-only"
                aria-hidden="true"
            >
                {statusList.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    ) : (
        <span className={`px-2.5 py-1 rounded-full text-sm font-medium  ${statusList.find(opt => opt.value === status)?.styles || 'bg-gray-100 text-gray-800'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

export default StatusBadge;
