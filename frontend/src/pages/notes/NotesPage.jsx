import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    CalendarMonth,
    AccessTime,
    StickyNote2,
    Person,
    NavigateNext,
    NavigateBefore,
    KeyboardArrowDown,
    Assignment,
    Send,
    Inbox
} from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import Spinner from '../../components/Spinner';
import PageHeader from '../../components/common/PageHeader';
import SearchInterface from '../../components/searchsection/SearchInterface';
import { useAuth } from '../../contexts/AuthContext';
import OfficerCard from '../../components/cards/OfficerCard';

const NotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState('received'); // 'received' or 'sent'
    const [currentPage, setCurrentPage] = useState(1);
    const [notesPerPage, setNotesPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [sortField, setSortField] = useState('created_dt');
    const [sortOrder, setSortOrder] = useState('desc'); const navigate = useNavigate();
    useAuth(); // Keep hook for potential future use

    const breadcrumbItems = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Notes' }
    ];

    const searchOptions = [
        { value: 'description', label: 'Description' },
        { value: 'receiver_id', label: 'Receiver ID' },
        { value: 'reference_id', label: 'Reference ID' },
        { value: 'reference_table', label: 'Reference Type' }
    ];

    const filterConfig = [
        {
            id: 'note_type',
            label: 'Note Type',
            options: [
                { value: 'received', label: 'Received Notes', colorVariant: 'blue' },
                { value: 'sent', label: 'Sent Notes', colorVariant: 'green' }
            ]
        },
        {
            id: 'read_status',
            label: 'Read Status',
            options: [
                { value: 'all', label: 'All' },
                { value: 'unread', label: 'Unread', colorVariant: 'red' },
                { value: 'read', label: 'Read', colorVariant: 'gray' }
            ]
        },
        {
            id: 'reference_table',
            label: 'Reference Type',
            options: [
                { value: 'all', label: 'All Types' },
                { value: 'cases', label: 'Cases' },
                { value: 'investigations', label: 'Investigations' },
                { value: 'crime_offences', label: 'Crime Offences' },
                { value: 'evidences', label: 'Evidences' }
            ]
        }];

    useEffect(() => {
        setTotalPages(Math.ceil(notes.length / notesPerPage));
        setCurrentPage(1);
    }, [notes, notesPerPage]);

    const fetchNotes = useCallback(async () => {
        setLoading(true);
        try {
            let endpoint = '';

            if (selectedType === 'received') {
                endpoint = '/notes/received';
            } else {
                endpoint = '/notes/sent';
            }

            const { data } = await apiClient.get(endpoint);
            if (data.notes) {
                setNotes(data.notes);
            } else {
                setNotes([]);
            }
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setNotes([]);
            } else {
                setError('Failed to fetch notes. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [selectedType]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleSearch = async (searchParams) => {
        setLoading(true);
        try {
            let endpoint = '/notes/search';
            let params = {};

            // Handle search term and type
            if (searchParams.searchTerm && searchParams.searchTerm.trim() !== '') {
                switch (searchParams.searchType) {
                    case 'description':
                        params.description = searchParams.searchTerm.trim();
                        break;
                    case 'receiver_id':
                        params.receiver_id = searchParams.searchTerm.trim();
                        break;
                    case 'reference_id':
                        params.reference_id = searchParams.searchTerm.trim();
                        break;
                    case 'reference_table':
                        params.reference_table = searchParams.searchTerm.trim();
                        break;
                    default:
                        break;
                }
            }

            // Handle filters
            if (searchParams.note_type && searchParams.note_type !== 'all') {
                params.note_type = searchParams.note_type;
                setSelectedType(searchParams.note_type);
            }
            if (searchParams.read_status && searchParams.read_status !== 'all') {
                params.read_status = searchParams.read_status;
            }
            if (searchParams.reference_table && searchParams.reference_table !== 'all') {
                params.reference_table = searchParams.reference_table;
            }

            const response = await apiClient.get(endpoint, { params });
            if (response.data.notes) {
                setNotes(response.data.notes);
            } else {
                setNotes([]);
            }
            setError(null);
        } catch {
            setNotes([]);
            setError('Failed to fetch notes. Please try again.');
        }
        setLoading(false);
    };

    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder(field === 'created_dt' ? 'desc' : 'asc');
        }
    };

    // Sort notes function
    const sortNotes = (notesToSort) => {
        if (!notesToSort || notesToSort.length === 0) return [];

        return [...notesToSort].sort((a, b) => {
            let aValue, bValue;

            switch (sortField) {
                case 'created_dt':
                    aValue = new Date(a.created_dt || 0);
                    bValue = new Date(b.created_dt || 0);
                    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;

                case 'note_id':
                    aValue = a.note_id || '';
                    bValue = b.note_id || '';
                    break;

                case 'reference_table':
                    aValue = a.reference_table || '';
                    bValue = b.reference_table || '';
                    break;

                default:
                    aValue = a[sortField] || '';
                    bValue = b[sortField] || '';
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    };

    // Get current notes with sorting
    const getCurrentNotes = () => {
        const sortedNotes = sortNotes(notes);
        const indexOfLastNote = currentPage * notesPerPage;
        const indexOfFirstNote = indexOfLastNote - notesPerPage;
        return sortedNotes.slice(indexOfFirstNote, indexOfLastNote);
    };

    // Get sort icon based on current sort state
    const getSortIcon = (field) => {
        if (sortField !== field) {
            return <KeyboardArrowDown fontSize="small" className="ml-1 text-gray-400" />;
        }

        return (
            <KeyboardArrowDown
                fontSize="small"
                className={`ml-1 text-black transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
            />
        );
    };

    const currentNotes = getCurrentNotes();

    const getReadStatusDotColor = (readStatus) => {
        return readStatus ? 'bg-gray-500' : 'bg-blue-500';
    };

    const getReadStatusLabel = (readStatus) => {
        return readStatus ? 'Read' : 'Unread';
    };

    const getReferenceTypeLabel = (referenceTable) => {
        switch (referenceTable) {
            case 'cases':
                return 'Case';
            case 'investigations':
                return 'Investigation';
            case 'crime_offences':
                return 'Crime Offence';
            case 'evidences':
                return 'Evidence';
            default:
                return referenceTable;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleNoteClick = async (note) => {
        // Mark as read if it's a received note and unread
        if (selectedType === 'received' && !note.read_status) {
            try {
                await apiClient.put(`/notes/read/${note.note_id}`);
                // Update local state
                setNotes(prevNotes =>
                    prevNotes.map(n =>
                        n.note_id === note.note_id
                            ? { ...n, read_status: true }
                            : n
                    )
                );
            } catch (err) {
                console.error('Failed to mark note as read:', err);
            }
        }

        // Navigate to the reference item
        const referenceRoutes = {
            'cases': `/cases/${note.reference_id}`,
            'investigations': `/investigations/${note.reference_id}`,
            'crime_offences': `/crimeoffences/${note.reference_id}`,
            'evidences': `/evidences/${note.reference_id}`
        };

        if (referenceRoutes[note.reference_table]) {
            navigate(referenceRoutes[note.reference_table]);
        }
    };

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-red-500 text-xl mb-4">{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-black text-yellow-300 rounded hover:bg-gray-900"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <PageHeader
                title="Notes"
                breadcrumbItems={breadcrumbItems}
                showBackButton={true}
                onBack={() => navigate(-1)}
                actions={[]}
            />
            <div className="container mx-auto px-4 py-4">
                {/* Search Section */}
                <div className="mb-6">
                    <SearchInterface
                        searchOptions={searchOptions}
                        filters={filterConfig}
                        onSearch={handleSearch}
                    />
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Table Header with count and pagination controls */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-700">
                                {selectedType === 'received' ? 'Received Notes' : 'Sent Notes'}
                            </h3>
                            <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">
                                {notes.length}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>Show</span>
                                <select
                                    className="border border-gray-300 rounded px-2 py-1 bg-white"
                                    value={notesPerPage}
                                    onChange={(e) => setNotesPerPage(Number(e.target.value))}
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span>per page</span>
                            </div>
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                        <div
                                            className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                            onClick={() => handleSort('note_id')}
                                        >
                                            <span>Note ID</span>
                                            {getSortIcon('note_id')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                                        <span>Description</span>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                        <div
                                            className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                            onClick={() => handleSort('reference_table')}
                                        >
                                            <span>Reference</span>
                                            {getSortIcon('reference_table')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                        <span>{selectedType === 'received' ? 'From' : 'To'}</span>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                        <span>Status</span>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                        <div
                                            className="flex items-center cursor-pointer hover:text-gray-700 transition-colors"
                                            onClick={() => handleSort('created_dt')}
                                        >
                                            <span>Created Date</span>
                                            {getSortIcon('created_dt')}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentNotes.length > 0 ? (
                                    currentNotes.map((note) => (
                                        <tr
                                            key={note.note_id}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => handleNoteClick(note)}
                                        >
                                            <td className="px-6 py-6 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <div className="flex items-center">
                                                    <div className="bg-gray-100 p-2 rounded-lg mr-3 text-gray-900 flex-shrink-0">
                                                        <StickyNote2 fontSize="small" />
                                                    </div>
                                                    <span className="font-semibold">{note.note_id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="max-w-md">
                                                    <span className="text-sm text-gray-900 leading-relaxed">
                                                        {
                                                            (() => {
                                                                const desc = note.description || 'No description available';
                                                                const words = desc.split(' ');
                                                                return words.length > 20
                                                                    ? words.slice(0, 20).join(' ') + '...'
                                                                    : desc;
                                                            })()
                                                        }
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap text-sm">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">
                                                        {getReferenceTypeLabel(note.reference_table)}
                                                    </span>
                                                    <span className="text-xs text-gray-500 mt-1">
                                                        ID: {note.reference_id}
                                                    </span>
                                                </div>
                                            </td>                                            <td className="px-6 py-6 whitespace-nowrap">
                                                {selectedType === 'received' ? (
                                                    // Show sender information using OfficerCard
                                                    <OfficerCard
                                                        officer={{
                                                            id: note.created_by_id || note.created_by,
                                                            name: note.created_by_name,
                                                            role: note.created_by_role,
                                                            profilePic: note.created_by_profile
                                                        }}
                                                        size="small"
                                                        className="border-0 p-0 hover:bg-transparent"
                                                    />
                                                ) : (
                                                    // Show receiver information using OfficerCard
                                                    <OfficerCard
                                                        officer={{
                                                            id: note.receiver_id,
                                                            name: note.receiver_name,
                                                            role: note.receiver_role,
                                                            profilePic: note.receiver_profile
                                                        }}
                                                        size="small"
                                                        className="border-0 p-0 hover:bg-transparent"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className="inline-flex items-center text-sm font-medium text-gray-900">
                                                        <span className={`h-2.5 w-2.5 rounded-full mr-3 flex-shrink-0 ${getReadStatusDotColor(note.read_status)}`}></span>
                                                        {getReadStatusLabel(note.read_status)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <div className="flex bg-gray-100 p-2 rounded-lg mr-3 flex-shrink-0">
                                                        <CalendarMonth className="text-gray-600" style={{ fontSize: '1rem' }} />
                                                    </div>
                                                    <div className="flex flex-col space-y-1">
                                                        <span>{formatDate(note.created_dt)}</span>
                                                        {note.created_dt && (
                                                            <span className="text-xs text-gray-500 flex items-center">
                                                                <AccessTime className="mr-1.5" style={{ fontSize: '0.75rem' }} />
                                                                {formatTime(note.created_dt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="rounded-full bg-gray-100 p-4 mb-4">
                                                    <StickyNote2 className="text-gray-400" style={{ fontSize: '2.5rem' }} />
                                                </div>
                                                <p className="text-gray-500 text-lg font-medium">No notes found</p>
                                                <p className="text-sm text-gray-400 mt-2">Try adjusting your search criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {notes.length > 0 && (
                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages}
                                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{((currentPage - 1) * notesPerPage) + 1}</span> to <span className="font-medium">
                                            {Math.min(currentPage * notesPerPage, notes.length)}
                                        </span> of{' '}
                                        <span className="font-medium">{notes.length}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={prevPage}
                                            disabled={currentPage === 1}
                                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            <span className="sr-only">Previous</span>
                                            <NavigateBefore fontSize="small" />
                                        </button>

                                        {[...Array(totalPages).keys()].map(number => (
                                            <button
                                                key={number + 1}
                                                onClick={() => paginate(number + 1)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                                    ${currentPage === number + 1
                                                        ? 'z-10 bg-gray-700 border-gray-700 text-white'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`
                                                }
                                            >
                                                {number + 1}
                                            </button>
                                        ))}

                                        <button
                                            onClick={nextPage}
                                            disabled={currentPage === totalPages}
                                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            <span className="sr-only">Next</span>
                                            <NavigateNext fontSize="small" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotesPage;
