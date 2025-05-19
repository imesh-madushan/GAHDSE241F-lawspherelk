import React, { useState } from 'react';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import FilterBadge from './FilterBadge';

const SearchInterface = ({ config, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState(config.searchOptions[0].value);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [activeFilters, setActiveFilters] = useState([]);

  const handleSearch = () => {
    onSearch({
      searchTerm,
      searchType,
      statusFilter,
      riskLevelFilter: config.showRiskLevel ? riskLevelFilter : undefined,
      dateRange,
    });

    const newActiveFilters = [];
    if (statusFilter !== 'all') newActiveFilters.push(`Status: ${statusFilter}`);
    if (config.showRiskLevel && riskLevelFilter !== 'all') newActiveFilters.push(`Risk: ${riskLevelFilter}`);
    if (dateRange.start || dateRange.end) newActiveFilters.push('Date range');

    setActiveFilters(newActiveFilters);
  };

  const clearFilter = (filter) => {
    if (filter.startsWith('Status:')) setStatusFilter('all');
    if (filter.startsWith('Risk:')) setRiskLevelFilter('all');
    if (filter === 'Date range') setDateRange({ start: '', end: '' });

    setActiveFilters(prev => prev.filter(f => f !== filter));
  };

  const clearAllFilters = () => {
    setStatusFilter('all');
    setRiskLevelFilter('all');
    setDateRange({ start: '', end: '' });
    setActiveFilters([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchType={searchType}
        setSearchType={setSearchType}
        searchOptions={config.searchOptions}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        handleSearch={handleSearch}
      />

      {activeFilters.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Active filters:</span>
          {activeFilters.map((filter) => (
            <FilterBadge key={filter} label={filter} onRemove={() => clearFilter(filter)} />
          ))}
          <button
            onClick={clearAllFilters}
            className="ml-auto text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      <FilterPanel
        show={showFilters}
        config={config}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        riskLevelFilter={riskLevelFilter}
        setRiskLevelFilter={setRiskLevelFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        handleSearch={handleSearch}
      />
    </div>
  );
};

export default SearchInterface;