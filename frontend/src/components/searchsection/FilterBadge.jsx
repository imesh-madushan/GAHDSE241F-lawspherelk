import React from 'react';
import { X } from 'lucide-react';

const FilterBadge = ({ label, onRemove }) => {
    // Determine color based on filter type
    const getColorClass = () => {
        if (label.startsWith('Status: open')) return 'bg-green-100 text-green-800 border-green-200';
        if (label.startsWith('Status: closed')) return 'bg-gray-100 text-gray-800 border-gray-200';
        if (label.startsWith('Status: pending')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        if (label.startsWith('Status: investigation')) return 'bg-blue-100 text-blue-800 border-blue-200';

        if (label.startsWith('Risk: low')) return 'bg-green-100 text-green-800 border-green-200';
        if (label.startsWith('Risk: medium')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        if (label.startsWith('Risk: high')) return 'bg-orange-100 text-orange-800 border-orange-200';
        if (label.startsWith('Risk: extreme')) return 'bg-red-100 text-red-800 border-red-200';

        if (label === 'Date range') return 'bg-blue-100 text-blue-800 border-blue-200';

        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColorClass()}`}
        >
            {label}
            <button
                type="button"
                onClick={onRemove}
                className="ml-1.5 inline-flex hover:cursor-pointer items-center justify-center w-3.5 h-3.5 rounded-full bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-colors"
            >
                <X className="w-3 h-3" />
                <span className="sr-only">Remove filter {label}</span>
            </button>
        </span>
    );
};

export default FilterBadge; 