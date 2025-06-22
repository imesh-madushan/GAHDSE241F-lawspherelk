import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import FilterBadge from './FilterBadge';

const SearchInterface = ({ searchOptions = [], filters = [], onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState(searchOptions[0]?.value || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState({});
  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    const initialValues = {};
    (filters || []).forEach(filter => {
      initialValues[filter.id] = 'all';
    });
    setFilterValues(initialValues);
  }, [filters]);

  useEffect(() => {
    updateActiveFilters();
  }, [searchType, filterValues]);

  const handleSearch = () => {
    const searchParams = {
      searchTerm,
      searchType,
    };

    //structuring searchParams with filter values
    (filters || []).forEach(filter => {
      if (filterValues[filter.id] && filterValues[filter.id] !== 'all') {
        searchParams[filter.id] = filterValues[filter.id];
      }
    });

    onSearch(searchParams);
  };

  const updateActiveFilters = () => {
    const newActiveFilters = [];
    (filters || []).forEach(filter => {
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
    const filterConfig = (filters || []).find(f => f.label === filterType);
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
    (filters || []).forEach(filter => {
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
        showFilters={filters && filters.length > 0 ? showFilters : false}
        setShowFilters={filters && filters.length > 0 ? setShowFilters : () => { }}
        handleSearch={handleSearch}
        showFilterButton={filters && filters.length > 0}
      />

      {filters && filters.length > 0 && activeFilters.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Active filters:</span>
          {activeFilters.map((filter) => (
            <FilterBadge key={filter} label={filter} onRemove={() => clearFilter(filter)} />
          ))}
          <button
            onClick={clearAllFilters}
            className="ml-auto hover:cursor-pointer text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {filters && filters.length > 0 && (
        <FilterPanel
          show={showFilters}
          filters={filters}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
        />
      )}
    </div>
  );
};

export default SearchInterface;