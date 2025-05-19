import React from 'react';
import FilterOption from './FilterOption';

const FilterPanel = ({
    show,
    filters,
    filterValues,
    onFilterChange
}) => {
    if (!show) return null;

    return (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filters.map((filter) => (
                    <div key={filter.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {filter.label}
                        </label>
                        <div className="space-y-2">
                            {filter.options.map((option) => (
                                <FilterOption
                                    key={option.value}
                                    label={option.label}
                                    value={option.value}
                                    selected={filterValues[filter.id] === option.value}
                                    onClick={() => onFilterChange(filter.id, option.value)}
                                    colorVariant={option.colorVariant}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FilterPanel; 