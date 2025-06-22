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
                className="bg-white border border-gray-300 rounded-xl px-4 py-2 w-40 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-gray-700"
            >
                <div className="flex items-center">
                    <span
                        className={`w-3 h-3 rounded-full mr-2 ${statusList.find(opt => opt.value === status)?.styles || 'bg-gray-200'}`}
                    ></span>
                    <span>{getSelectedLabel()}</span>
                </div>
                <KeyboardArrowDown className={`transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''} text-gray-700`} />
            </button>

            {/* Dropdown options */}
            {isOpen && (
                <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-0 max-h-60 overflow-auto">
                    {statusList.map(option => (
                        <div
                            key={option.value}
                            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${status === option.value ? 'bg-gray-100' : ''}`}
                        >
                            <span className={`w-3 h-3 rounded-full mr-2 ${option.styles || 'bg-gray-200'}`}></span>
                            <span>{option.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    ) : (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold border border-gray-300 bg-gray-100 text-gray-800`}
        >
            <span className={`w-3 h-3 rounded-full mr-2 ${statusList.find(opt => opt.value === status)?.styles || 'bg-gray-200'}`}></span>
            {getSelectedLabel()}
        </span>
    );
};

export default StatusBadge;
