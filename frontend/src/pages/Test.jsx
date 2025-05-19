import React from 'react';
import SearchInterface from '../components/searchsection/SearchInterface';

const searchConfig = {
    searchOptions: [
        { value: 'name', label: 'Name' },
        { value: 'id', label: 'ID Number' },
        { value: 'case', label: 'Case Number' },
        { value: 'location', label: 'Location' },
    ],
    statusOptions: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active', colorVariant: 'green' },
        { value: 'detained', label: 'Detained', colorVariant: 'red' },
        { value: 'released', label: 'Released', colorVariant: 'gray' },
        { value: 'wanted', label: 'Wanted', colorVariant: 'orange' },
    ],
    riskOptions: [
        { value: 'all', label: 'All Risks' },
        { value: 'low', label: 'Low Risk', colorVariant: 'green' },
        { value: 'medium', label: 'Medium Risk', colorVariant: 'yellow' },
        { value: 'high', label: 'High Risk', colorVariant: 'orange' },
        { value: 'extreme', label: 'Extreme Risk', colorVariant: 'red' },
    ],
    showRiskLevel: true,
    showDateRange: true,
};

const Test = () => {
    const handleSearch = (searchParams) => {
        console.log('Criminal Record Search:', searchParams);
        // Implement your search logic here
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Criminal Records</h1>
                    <p className="text-gray-600 mt-1">Search and manage criminal records</p>
                </header>

                <SearchInterface config={searchConfig} onSearch={handleSearch} />

                {/* Add your records list/table component here */}
            </div>
        </div>
    );
};

export default Test; 