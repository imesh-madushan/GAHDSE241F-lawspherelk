import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, FilterList, KeyboardArrowDown, CalendarMonth, AccessTime } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import PageHeader from '../../components/common/PageHeader';
import OutlinedButton from '../../components/buttons/OutlinedButton';

const CrimeOffencesPage = () => {
    const [offences, setOffences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('crime_type');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [statusFilter, setStatusFilter] = useState('all');
    const [riskLevelFilter, setRiskLevelFilter] = useState('all');

    const searchOptions = [
        { value: 'crime_type', label: 'Search by Crime Type' },
        { value: 'criminal_name', label: 'Search by Criminal Name' },
        { value: 'criminal_id', label: 'Search by Criminal ID' },
        { value: 'fingerprint', label: 'Search by Fingerprint' },
        { value: 'case_id', label: 'Search by Case ID' }
    ];

    const statusOptions = [
        { value: 'all', label: 'All Statuses' },
        { value: 'Under Investigation', label: 'Under Investigation' },
        { value: 'Convicted', label: 'Convicted' },
        { value: 'Alleged', label: 'Alleged' }
    ];

    const riskLevelOptions = [
        { value: 'all', label: 'All Risk Levels' },
        { value: 'high', label: 'High Risk' },
        { value: 'medium', label: 'Medium Risk' },
        { value: 'low', label: 'Low Risk' }
    ];

    useEffect(() => {
        fetchOffences();
    }, []);

    const fetchOffences = async () => {
        try {
            const response = await apiClient.get('/crimeoffences/getAllOffences');
            setOffences(response.data.offences);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch offences data');
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim() && statusFilter === 'all' && riskLevelFilter === 'all' && !dateRange.start && !dateRange.end) {
            fetchOffences();
            return;
        }

        try {
            setLoading(true);
            let endpoint = '/crimeoffences/search';
            let params = {};

            // Add search parameters based on search type
            switch (searchType) {
                case 'crime_type':
                    params.crime_type = searchTerm;
                    break;
                case 'criminal_name':
                    params.criminal_name = searchTerm;
                    break;
                case 'criminal_id':
                    params.criminal_id = searchTerm;
                    break;
                case 'fingerprint':
                    params.fingerprint = searchTerm;
                    break;
                case 'case_id':
                    params.case_id = searchTerm;
                    break;
                default:
                    params.crime_type = searchTerm;
            }

            // Add filters
            if (statusFilter !== 'all') params.status = statusFilter;
            if (riskLevelFilter !== 'all') params.risk_level = riskLevelFilter;
            if (dateRange.start) params.start_date = dateRange.start;
            if (dateRange.end) params.end_date = dateRange.end;

            const response = await apiClient.get(endpoint, { params });
            setOffences(response.data.offences);
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
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
                title="Crime Offences"
                breadcrumbItems={[
                    { label: 'Dashboard', link: '/dashboard' },
                    { label: 'Crime Offences' }
                ]}
            />

            <div className="container mx-auto p-4">
                {/* Search and Filter Section */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                    <div className="flex flex-col gap-4">
                        {/* Search Bar */}
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="flex-1 w-full">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search offences..."
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
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
                                        {searchOptions.find(option => option.value === searchType)?.label || 'Search by Crime Type'}
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
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${searchType === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
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

                        {/* Additional Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Risk Level Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                                <select
                                    value={riskLevelFilter}
                                    onChange={(e) => setRiskLevelFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {riskLevelOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Range Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offence ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crime Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criminal</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {offences.map((offence) => (
                                    <tr key={offence.offence_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{offence.offence_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{offence.crime_type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${offence.status === "Under Investigation"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : offence.status === "Convicted"
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-green-100 text-green-800"
                                                }`}>
                                                {offence.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <CalendarMonth className="mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                                <span>{formatDate(offence.reported_dt)}</span>
                                                <AccessTime className="ml-2 mr-1 text-gray-400" style={{ fontSize: '0.9rem' }} />
                                                <span>{formatTime(offence.reported_dt)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Link to={`/criminals/${offence.criminal_id}`} className="hover:underline text-blue-600">
                                                {offence.criminal_name}
                                            </Link>
                                            <div className="text-gray-500 text-xs mt-1">ID: {offence.criminal_id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Link to={`/cases/${offence.case_id}`} className="hover:underline text-blue-600">
                                                {offence.case_topic || 'Untitled Case'}
                                            </Link>
                                            <div className="text-gray-500 text-xs mt-1">ID: {offence.case_id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-20 bg-gray-200 rounded-full h-1.5 mr-2">
                                                    <div
                                                        className={`h-1.5 rounded-full ${getRiskLevel(offence.risk_score).color}`}
                                                        style={{ width: `${Math.min(offence.risk_score, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm">{offence.risk_score}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {offences.length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-2xl shadow-sm">
                        No offences found matching your search criteria
                    </div>
                )}
            </div>
        </div>
    );
};

export default CrimeOffencesPage; 