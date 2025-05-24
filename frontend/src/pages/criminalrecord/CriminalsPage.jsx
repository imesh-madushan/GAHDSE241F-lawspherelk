import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../config/apiConfig';
import PageHeader from '../../components/common/PageHeader';
import SearchInterface from '../../components/searchsection/SearchInterface';

const CriminalsPage = () => {
    const [criminals, setCriminals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search/filter config
    const searchOptions = [
        { value: 'name', label: 'Name' },
        { value: 'nic', label: 'NIC' },
        { value: 'fingerprint', label: 'Fingerprint' }
    ];

    // No risk filter, only search options
    useEffect(() => {
        fetchCriminals();
    }, []);

    const fetchCriminals = async () => {
        try {
            const response = await apiClient.get('/criminals/getAllCriminals');
            setCriminals(response.data.criminals);
            console.log(response.data.criminals);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch criminals data');
            setLoading(false);
        }
    };

    const handleSearch = async (searchParams) => {
        try {
            setLoading(true);
            let endpoint = '/criminals/search';
            let params = {};

            if (searchParams.searchTerm && searchParams.searchTerm.trim() !== '') {
                if (searchParams.searchType === 'name') params.name = searchParams.searchTerm.trim();
                if (searchParams.searchType === 'nic') params.nic = searchParams.searchTerm.trim();
                if (searchParams.searchType === 'fingerprint') params.fingerprint = searchParams.searchTerm.trim();
            }

            const response = await apiClient.get(endpoint, { params });
            setCriminals(response.data.criminals);
            setError(null);
        } catch (err) {
            setError('Search failed');
            setCriminals([]);
        }
        setLoading(false);
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
                {/* Search Section */}
                <div className="mb-6">
                    <SearchInterface
                        searchOptions={searchOptions}
                        filters={null}
                        onSearch={handleSearch}
                    />
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIC</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOB</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Crimes</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Risk</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {criminals.map((criminal) => (
                                    <tr key={criminal.criminal_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link to={`/criminals/${criminal.criminal_id}`}>
                                                {criminal.photo ? (
                                                    <img
                                                        src={criminal.photo}
                                                        alt={criminal.name}
                                                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ring-2 ring-gray-100">
                                                        <span className="text-md text-gray-500">
                                                            {criminal.name?.charAt(0)}
                                                        </span>
                                                    </div>
                                                )}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Link to={`/criminals/${criminal.criminal_id}`} className="text-blue-700 hover:underline">
                                                {criminal.name}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap">{criminal.nic}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{criminal.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{criminal.address}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{criminal.dob ? new Date(criminal.dob).toLocaleDateString() : ''}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{criminal.total_crimes}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{criminal.total_risk}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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