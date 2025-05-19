import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, FilterList, KeyboardArrowDown } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import PageHeader from '../../components/common/PageHeader';
import OutlinedButton from '../../components/buttons/OutlinedButton';
import CustomDropdown from '../../components/dropdowns/CustomDropdown';

//TESTCOMMIT CHANGES

const CriminalsPage = () => {
    const [criminals, setCriminals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('name');
    const [error, setError] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const searchOptions = [
        { value: 'name', label: 'Search by Name' },
        { value: 'nic', label: 'Search by NIC' },
        { value: 'fingerprint', label: 'Search by Fingerprint' }
    ];

    useEffect(() => {
        fetchCriminals();
    }, []);

    const fetchCriminals = async () => {
        try {
            const response = await apiClient.get('/criminals/getAllCriminals');
            setCriminals(response.data.criminals);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch criminals data');
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchCriminals();
            return;
        }

        try {
            setLoading(true);
            let endpoint = '/criminals/search';
            let params = {};

            switch (searchType) {
                case 'name':
                    params = { name: searchTerm };
                    break;
                case 'nic':
                    params = { nic: searchTerm };
                    break;
                case 'fingerprint':
                    params = { fingerprint: searchTerm };
                    break;
                default:
                    params = { name: searchTerm };
            }

            const response = await apiClient.get(endpoint, { params });
            setCriminals(response.data.criminals);
            setLoading(false);
        } catch (err) {
            setError('Search failed');
            setLoading(false);
        }
    };

    const getRiskLevel = (score) => {
        if (score >= 70) return { level: 'High', color: 'bg-red-500' };
        if (score >= 40) return { level: 'Medium', color: 'bg-yellow-500' };
        return { level: 'Low', color: 'bg-green-500' };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <PageHeader
                title="Criminal Records"
                breadcrumbItems={[
                    { label: 'Dashboard', link: '/dashboard' },
                    { label: 'Criminal Records' }
                ]}
            />

            <div className="container mx-auto p-4">
                {/* Search and Filter Section */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 w-full">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search criminals..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                                <Search className="absolute left-3 top-3 text-gray-400" />
                            </div>
                        </div>
                        <div className="flex gap-3 items-center">
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <FilterList className="text-gray-500" />
                                    {searchOptions.find(option => option.value === searchType)?.label || 'Search by Name'}
                                    <KeyboardArrowDown className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                        {searchOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setSearchType(option.value);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${searchType === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <OutlinedButton
                                action={{
                                    icon: <Search className="text-sm" />,
                                    label: 'Search',
                                    onClick: handleSearch,
                                    styles: 'text-blue-700 bg-blue-800 text-white hover:bg-blue-700 hover:text-white h-10.5 w-32'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Criminals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {criminals.map((criminal) => (
                        <Link
                            key={criminal.criminal_id}
                            to={`/criminals/${criminal.criminal_id}`}
                            className="block"
                        >
                            <div className="bg-white rounded-2xl shadow hover:shadow-md transition-all duration-200 p-3 hover:scale-[1.02]">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                        {criminal.photo ? (
                                            <img
                                                src={criminal.photo}
                                                alt={criminal.name}
                                                className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center ring-2 ring-gray-100">
                                                <span className="text-lg text-gray-500">
                                                    {criminal.name.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-gray-800 truncate">
                                            {criminal.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 truncate">NIC: {criminal.nic}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getRiskLevel(criminal.total_risk).color} text-white font-medium`}>
                                                {getRiskLevel(criminal.total_risk).level}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {criminal.total_crimes} crimes
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {criminals.length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-2xl shadow-sm">
                        No criminals found matching your search criteria
                    </div>
                )}
            </div>
        </div>
    );
};

export default CriminalsPage; 