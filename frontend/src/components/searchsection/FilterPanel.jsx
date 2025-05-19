import React, { useState } from 'react';
import FilterOption from './FilterOption';
import { Calendar, AlertCircle } from 'lucide-react';

const FilterPanel = ({
    show,
    statusFilter,
    setStatusFilter,
    riskLevelFilter,
    setRiskLevelFilter,
    dateRange,
    setDateRange,
    handleSearch,
}) => {
    const [selectedDatePreset, setSelectedDatePreset] = useState('custom');

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'open', label: 'Open' },
        { value: 'closed', label: 'Closed' },
        { value: 'pending', label: 'Pending' },
        { value: 'investigation', label: 'Under Investigation' },
    ];

    const riskLevelOptions = [
        { value: 'all', label: 'All Risks' },
        { value: 'low', label: 'Low Risk' },
        { value: 'medium', label: 'Medium Risk' },
        { value: 'high', label: 'High Risk' },
        { value: 'extreme', label: 'Extreme Risk' },
    ];

    const datePresets = [
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'year', label: 'This Year' },
        { value: 'custom', label: 'Custom Range' }
    ];

    const applyDatePreset = (preset) => {
        const today = new Date();
        let start = new Date();
        const end = today.toISOString().split('T')[0];

        switch (preset) {
            case 'today':
                start = today;
                break;
            case 'week':
                start.setDate(today.getDate() - today.getDay());
                break;
            case 'month':
                start.setDate(1);
                break;
            case 'year':
                start = new Date(today.getFullYear(), 0, 1);
                break;
            case 'custom':
                return;
            default:
                break;
        }

        setDateRange({
            start: start.toISOString().split('T')[0],
            end
        });
        setSelectedDatePreset(preset);
    };

    if (!show) return null;

    return (
        <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Filter */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 flex items-center">
                        Status
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map(option => (
                            <FilterOption
                                key={option.value}
                                label={option.label}
                                selected={statusFilter === option.value}
                                onClick={() => setStatusFilter(option.value)}
                                testId={`status-${option.value}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Risk Level Filter */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 flex items-center">
                        Risk Level
                        <AlertCircle className="ml-1.5 h-4 w-4 text-gray-400" />
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {riskLevelOptions.map(option => (
                            <FilterOption
                                key={option.value}
                                label={option.label}
                                selected={riskLevelFilter === option.value}
                                onClick={() => setRiskLevelFilter(option.value)}
                                testId={`risk-${option.value}`}
                                colorVariant={
                                    option.value === 'low' ? 'green' :
                                        option.value === 'medium' ? 'yellow' :
                                            option.value === 'high' ? 'orange' :
                                                option.value === 'extreme' ? 'red' : 'gray'
                                }
                            />
                        ))}
                    </div>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900 flex items-center">
                        Date Range
                        <Calendar className="ml-1.5 h-4 w-4 text-gray-400" />
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-3">
                        {datePresets.map(preset => (
                            <FilterOption
                                key={preset.value}
                                label={preset.label}
                                selected={selectedDatePreset === preset.value}
                                onClick={() => applyDatePreset(preset.value)}
                                testId={`date-${preset.value}`}
                                colorVariant="blue"
                            />
                        ))}
                    </div>

                    {selectedDatePreset === 'custom' && (
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label htmlFor="start-date" className="sr-only">Start date</label>
                                <input
                                    id="start-date"
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="end-date" className="sr-only">End date</label>
                                <input
                                    id="end-date"
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <button
                    type="button"
                    onClick={handleSearch}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
};

export default FilterPanel; 