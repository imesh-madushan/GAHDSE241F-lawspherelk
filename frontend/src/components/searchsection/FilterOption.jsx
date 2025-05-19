import React from 'react';

const FilterOption = ({
    label,
    selected,
    onClick,
    testId,
    colorVariant = 'gray',
}) => {
    const baseClasses = "px-3 m-0.5 py-1.5 text-xs font-medium rounded-full transition-all duration-200";

    const variantClasses = {
        gray: selected
            ? "bg-gray-200 text-gray-800"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
        blue: selected
            ? "bg-blue-100 text-blue-800 border border-blue-200"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50",
        green: selected
            ? "bg-green-100 text-green-800 border border-green-200"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-green-50",
        yellow: selected
            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-yellow-50",
        orange: selected
            ? "bg-orange-100 text-orange-800 border border-orange-200"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-orange-50",
        red: selected
            ? "bg-red-100 text-red-800 border border-red-200"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-red-50",
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className={`${baseClasses} ${variantClasses[colorVariant]}`}
            data-testid={testId}
        >
            {label}
        </button>
    );
};

export default FilterOption; 