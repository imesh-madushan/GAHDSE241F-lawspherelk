import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchInterface from '../../components/searchsection/SearchInterface';
import OfficerCard from '../../components/officers/OfficerCard';
import { apiClient } from '../../config/apiConfig';
import PageHeader from '../../components/common/PageHeader';

const OfficersPage = () => {
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    // Use a searchConfig object like in CrimeOffencesPage
    const searchConfig = {
        searchOptions: [
            { value: 'name', label: 'Name' },
        ],
        roleOptions: [
            { value: 'all', label: 'All' },
            { value: 'OIC', label: 'OIC' },
            { value: 'Crime OIC', label: 'Crime OIC' },
            { value: 'Sub Inspector', label: 'Sub Inspector' },
            { value: 'Inspector', label: 'Inspector' },
            { value: 'Sergeant', label: 'Sergeant' },
            { value: 'Police Constable', label: 'Police Constable' },
            { value: 'Forensic Leader', label: 'Forensic Leader' },
        ]
    };

    // Prepare filters array for SearchInterface
    const filters = [
        {
            id: 'role',
            label: 'Role',
            options: searchConfig.roleOptions
        }
    ];

    useEffect(() => {
        fetchOfficers();
    }, [page]);

    const fetchOfficers = async () => {
        setLoading(true);
        try {
            const res = await apiClient.post('/officers/getAll');
            setOfficers(res.data);
            setTotalPages(1);
        } catch (err) {
            setOfficers([]);
        }
        setLoading(false);
    };

    const handleSearch = async (searchParams) => {
        let params = {};
        if (searchParams.searchTerm && searchParams.searchTerm.trim() !== '') {
            if (searchParams.searchType === 'name') {
                params.name = searchParams.searchTerm.trim();
            }
        }
        if (searchParams.role && searchParams.role !== 'all') {
            params.role = searchParams.role;
        }

        setLoading(true);
        try {
            const res = await apiClient.post('/officers/search', params);
            setOfficers(res.data);
            setTotalPages(1); // Update if backend supports pagination
        } catch (err) {
            setOfficers([]);
        }
        setLoading(false);
        setPage(1);
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <PageHeader
                title="Police Officers"
                breadcrumbItems={[
                    { label: 'Dashboard', link: '/dashboard' },
                    { label: 'Police Officers' }
                ]}
                showBackButton={true}
                onBack={() => navigate(-1)}
            />
            <div className="container mx-auto p-4">
                <div className="mb-6">
                    <SearchInterface
                        searchOptions={searchConfig.searchOptions}
                        filters={filters}
                        onSearch={handleSearch}
                    />
                </div>
                <div className="my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {loading ? (
                        <div>Loading...</div>
                    ) : officers.length === 0 ? (
                        <div>No officers found.</div>
                    ) : (
                        officers.map((officer) => (
                            <OfficerCard key={officer.id} officer={officer} />
                        ))
                    )}
                </div>
                {/* Pagination Controls */}
                <div className="flex justify-center items-center gap-2 mt-4">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 rounded border bg-gray-100 disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 rounded border bg-gray-100 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OfficersPage; 