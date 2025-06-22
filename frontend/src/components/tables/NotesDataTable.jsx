import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    Avatar,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    Pagination,
    Divider
} from '@mui/material';
import {
    Notes,
    Visibility,
    Schedule,
    Send,
    Refresh
} from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import { useAuth } from '../../contexts/AuthContext';

const NotesDataTable = ({
    context,
    contextId,
    refreshTrigger = 0
}) => {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); const [currentPage, setCurrentPage] = useState(1);
    const [notesPerPage] = useState(5);

    const fetchNotes = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Context type mapping for database reference tables
            const contextTypeMap = {
                'case': 'cases',
                'investigation': 'investigations',
                'offence': 'crime_offences',
                'evidence': 'evidences'
            };

            const referenceTable = contextTypeMap[context];
            const response = await apiClient.get(`/notes/reference/${referenceTable}/${contextId}`);

            if (response.data.success) {
                setNotes(response.data.notes || []);
            } else {
                throw new Error(response.data.message || 'Failed to fetch notes');
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            setError(error.response?.data?.message || error.message || 'Failed to load notes');
        } finally {
            setLoading(false);
        }
    }, [context, contextId]);

    useEffect(() => {
        if (contextId && context) {
            fetchNotes();
        }
    }, [contextId, context, refreshTrigger, fetchNotes]);

    const markAsRead = async (noteId) => {
        try {
            const response = await apiClient.put(`/notes/read/${noteId}`);
            if (response.data.success) {
                // Update the note in the local state
                setNotes(prevNotes =>
                    prevNotes.map(note =>
                        note.note_id === noteId
                            ? { ...note, read_status: true }
                            : note
                    )
                );
            }
        } catch (error) {
            console.error('Error marking note as read:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getProfileImage = (profilePic) => {
        if (profilePic) {
            return `${import.meta.env.VITE_API_URL}/uploads/users/${profilePic}`;
        }
        return null;
    };

    // Pagination
    const indexOfLastNote = currentPage * notesPerPage;
    const indexOfFirstNote = indexOfLastNote - notesPerPage;
    const currentNotes = notes.slice(indexOfFirstNote, indexOfLastNote);
    const totalPages = Math.ceil(notes.length / notesPerPage);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 200,
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                    Loading notes...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert
                severity="error"
                action={
                    <IconButton onClick={fetchNotes} size="small">
                        <Refresh />
                    </IconButton>
                }
            >
                {error}
            </Alert>
        );
    }

    if (notes.length === 0) {
        return (
            <Box
                sx={{
                    textAlign: 'center',
                    py: 6,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px dashed #dee2e6'
                }}
            >
                <Notes sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    No notes found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    No notes have been created for this item yet.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Notes color="primary" />
                    <Typography variant="h6">
                        Notes ({notes.length})
                    </Typography>
                </Box>
                <IconButton onClick={fetchNotes} size="small">
                    <Refresh />
                </IconButton>
            </Box>

            {/* Notes List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {currentNotes.map((note) => (
                    <Paper
                        key={note.note_id}
                        sx={{
                            p: 3,
                            border: note.read_status ? '1px solid #e0e0e0' : '2px solid #2196f3',
                            backgroundColor: note.read_status ? 'white' : '#f3f8ff',
                            position: 'relative'
                        }}
                    >
                        {/* Unread indicator */}
                        {!note.read_status && note.receiver_id === user.user_id && (
                            <Chip
                                label="New"
                                color="primary"
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    fontSize: '0.7rem'
                                }}
                            />
                        )}

                        {/* Note Header */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                            {/* Sender Avatar and Info */}
                            <Avatar
                                src={getProfileImage(note.created_by_profile, note.created_by_name)}
                                sx={{ width: 40, height: 40 }}
                            >
                                {note.created_by_name?.charAt(0)}
                            </Avatar>

                            <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        {note.created_by_name}
                                    </Typography>
                                    <Chip
                                        label={note.created_by_role}
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                    />
                                    <Send sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {note.receiver_name}
                                    </Typography>
                                    <Chip
                                        label={note.receiver_role}
                                        size="small"
                                        variant="outlined"
                                        color="secondary"
                                    />
                                </Box>

                                {/* Date and Time */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Schedule sx={{ fontSize: 14, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDate(note.created_dt)} at {formatTime(note.created_dt)}
                                        </Typography>
                                    </Box>
                                    {!note.read_status && (
                                        <Chip
                                            label="Unread"
                                            size="small"
                                            color="warning"
                                            variant="filled"
                                        />
                                    )}
                                </Box>
                            </Box>

                            {/* Mark as read button for receiver */}
                            {!note.read_status && note.receiver_id === user.user_id && (
                                <Tooltip title="Mark as read">
                                    <IconButton
                                        onClick={() => markAsRead(note.note_id)}
                                        size="small"
                                        color="primary"
                                    >
                                        <Visibility />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Note Content */}
                        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                            {note.description}
                        </Typography>
                    </Paper>
                ))}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}
        </Box>
    );
};

export default NotesDataTable;
