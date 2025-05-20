import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import FilterBadge from './FilterBadge';

const SearchInterface = ({
  searchOptions = [], // Array of search options
  filters = [], // Array of filter configurations
  onSearch
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState(searchOptions[0]?.value || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState({});
  const [activeFilters, setActiveFilters] = useState([]);

  // Initialize filter values
  useEffect(() => {
    const initialValues = {};
    filters.forEach(filter => {
      initialValues[filter.id] = 'all';
    });
    setFilterValues(initialValues);
  }, [filters]);

  // Update active filters whenever search type or filter values change
  useEffect(() => {
    updateActiveFilters();
  }, [searchType, filterValues]);

  const handleSearch = () => {
    const searchParams = {
      searchTerm,
      searchType
    };

    // Only add filters if they're not 'all'
    if (filterValues.status && filterValues.status !== 'all') {
      searchParams.status = filterValues.status;
    }
    if (filterValues.risk && filterValues.risk !== 'all') {
      searchParams.risk = filterValues.risk;
    }

    onSearch(searchParams);
  };

  const updateActiveFilters = () => {
    const newActiveFilters = [];

    // Do NOT add search type to active filters
    // Add active filters
    filters.forEach(filter => {
      const value = filterValues[filter.id];
      if (value && value !== 'all') {
        const option = filter.options.find(opt => opt.value === value);
        if (option) {
          newActiveFilters.push(`${filter.label}: ${option.label}`);
        }
      }
    });

    setActiveFilters(newActiveFilters);
  };

  const clearFilter = (filter) => {
    const [filterType, filterLabel] = filter.split(': ');

    // Remove search type clearing logic since it's not in active filters
    const filterConfig = filters.find(f => f.label === filterType);
    if (filterConfig) {
      setFilterValues(prev => ({
        ...prev,
        [filterConfig.id]: 'all'
      }));
    }
  };

  const clearAllFilters = () => {
    setSearchType(searchOptions[0]?.value || '');
    const resetValues = {};
    filters.forEach(filter => {
      resetValues[filter.id] = 'all';
    });
    setFilterValues(resetValues);
  };

  const handleFilterChange = (filterId, value) => {
    setFilterValues(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300">
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchType={searchType}
        setSearchType={setSearchType}
        searchOptions={searchOptions}
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
            className="ml-auto hover:cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      <FilterPanel
        show={showFilters}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default SearchInterface;