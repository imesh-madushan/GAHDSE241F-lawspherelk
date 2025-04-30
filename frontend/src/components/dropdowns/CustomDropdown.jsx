import React, { useState, useRef, useEffect } from 'react';
import { KeyboardArrowDown } from '@mui/icons-material';

const CustomDropdown = ({
    options,
    value,
    onChange,
    name,
    icon: Icon = null,
    className = ""
}) => {
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

    const handleSelect = (value) => {
        onChange({
            target: {
                name: name,
                value: value
            }
        });
        setIsOpen(false);
    };

    const getSelectedLabel = () => {
        const option = options.find(opt => opt.value === value);
        return option ? option.label : 'Select';
    };

    // Handle keyboard accessibility
    const handleKeyDown = (e, value) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect(value);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Custom dropdown button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <div className="flex items-center">
                    {Icon && <Icon className="text-blue-600 mr-2" fontSize="small" />}
                    <span>{getSelectedLabel()}</span>
                </div>
                <KeyboardArrowDown
                    className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown options */}
            {isOpen && (
                <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-auto">
                    {options.map(option => (
                        <div
                            key={option.value}
                            className={`px-4 py-2 hover:bg-blue-50 cursor-pointer ${value === option.value ? 'bg-blue-100 text-blue-800' : 'text-gray-800'}`}
                            onClick={() => handleSelect(option.value)}
                            onKeyDown={(e) => handleKeyDown(e, option.value)}
                            tabIndex="0"
                            role="option"
                            aria-selected={value === option.value}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}

            {/* Hidden native select for form submission if needed */}
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="sr-only"
                aria-hidden="true"
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CustomDropdown;
