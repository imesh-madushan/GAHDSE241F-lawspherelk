import React, { useState, useEffect, useCallback } from 'react';
import {
    Close,
    Person,
    Description,
    Send,
    StickyNote2
} from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import { useAuth } from '../../contexts/AuthContext';
import StatusPopup from '../common/StatusPopup';
import CustomOfficerDropdown from '../dropdowns/CustomOfficerDropdown';
import OutlinedButton from '../buttons/OutlinedButton';

const CreateNoteModal = ({
    open,
    onClose,
    canCreate = false,
    context = 'case', // 'case', 'investigation', 'offence', 'evidence'
    contextId = null,
    contextData = null,
    dropOfficerRoles = [], // Roles to exclude from receiver dropdown
    dropOfficerIds = [], // Specific officer IDs to exclude from receiver dropdown
    allowedOfficerIds = [] // Specific officer IDs allowed to receive the note (overrides drop lists)
}) => {
    const { user } = useAuth(); const [creatingNote, setCreatingNote] = useState(false);
    const [newNote, setNewNote] = useState({
        description: '',
        receiver_id: ''
    });
    const [selectedReceiver, setSelectedReceiver] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [popup, setPopup] = useState({
        open: false,
        status: "success",
        message: "",
        description: "",
        referenceLink: null
    });

    // Context type mapping for database reference tables
    const contextTypeMap = {
        'case': 'cases',
        'investigation': 'investigations',
        'offence': 'crime_offences',
        'evidence': 'evidences'
    };
    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            resetForm();
        }
    }, [open, contextId, context]);
    const resetForm = () => {
        setNewNote({
            description: '',
            receiver_id: ''
        });
        setSelectedReceiver(null);
        setFieldErrors({});
        setCreatingNote(false);
    };

    const handleClose = () => {
        if (!creatingNote) {
            resetForm();
            onClose();
        }
    };
    const handleNoteChange = (e) => {
        const { name, value } = e.target;
        setNewNote(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleReceiverSelect = (officer) => {
        setSelectedReceiver(officer);
        setNewNote(prev => ({
            ...prev,
            receiver_id: officer ? officer.id : ''
        }));

        // Clear receiver error when user selects
        if (fieldErrors.receiver_id) {
            setFieldErrors(prev => ({
                ...prev,
                receiver_id: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!newNote.description.trim()) {
            errors.description = 'Note description is required';
        } else if (newNote.description.trim().length < 10) {
            errors.description = 'Note description must be at least 10 characters';
        } if (!newNote.receiver_id) {
            errors.receiver_id = 'Please select a receiver for this note';
        }

        if (!contextId) {
            errors.context = 'Context ID is required';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitNote = async () => {
        if (!validateForm()) {
            return;
        }

        setCreatingNote(true);

        try {
            const noteData = {
                reference_table: contextTypeMap[context],
                reference_id: contextId,
                description: newNote.description.trim(),
                receiver_id: newNote.receiver_id
            };

            const response = await apiClient.post('/notes/create', noteData);

            if (response.data.success) {
                setPopup({
                    open: true,
                    status: "success",
                    message: "Note created successfully!",
                    description: "The note has been sent to the selected officer.",
                    referenceLink: null
                });
                resetForm();
            } else {
                throw new Error(response.data.message || 'Failed to create note');
            }
        } catch (error) {
            console.error('Error creating note:', error);
            setPopup({
                open: true,
                status: "error",
                message: "Failed to create note",
                description: error.response?.data?.message || error.message || "An unexpected error occurred. Please try again.",
                referenceLink: null
            });
        } finally {
            setCreatingNote(false);
        }
    };

    const handlePopupClose = useCallback(() => {
        setPopup(prev => ({ ...prev, open: false }));
        if (popup.status === 'success') {
            onClose(); // Close modal on success
        }
    }, [popup.status, onClose]);

    const getContextDisplayName = () => {
        const names = {
            'case': 'Case',
            'investigation': 'Investigation',
            'offence': 'Crime Offence',
            'evidence': 'Evidence'
        };
        return names[context] || 'Item';
    };

    const getContextDisplayId = () => {
        if (contextData) {
            switch (context) {
                case 'case':
                    return contextData.case_id || contextId;
                case 'investigation':
                    return contextData.investigation_id || contextId;
                case 'offence':
                    return contextData.offence_id || contextId;
                case 'evidence':
                    return contextData.evidence_id || contextId;
                default:
                    return contextId;
            }
        }
        return contextId;
    };
    if (!open) return null;

    if (!canCreate) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center py-4 px-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
                <div className="relative bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="mb-4">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <Close className="text-red-600 text-2xl" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Access Denied</h3>
                        <p className="text-gray-600 mt-2">You don't have permission to create notes for this {getContextDisplayName().toLowerCase()}.</p>
                    </div>
                    <OutlinedButton
                        action={{
                            label: 'Close',
                            onClick: handleClose,
                            styles: 'bg-gray-100 text-gray-700 hover:bg-gray-200 w-full'
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center py-4 px-4 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            <StatusPopup
                open={popup.open}
                status={popup.status}
                message={popup.message}
                description={popup.description}
                referenceLink={popup.referenceLink}
                onClose={handlePopupClose}
                okLabel={popup.status === 'success' ? 'OK' : 'Close'}
            />

            {/* Modal */}
            {!popup.open && (
                <div className="relative bg-white rounded-2xl shadow-xl w-full h-fit max-w-3xl max-h-[95vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-800 text-white px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-700 p-2 rounded-lg">
                                <StickyNote2 className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Create Note</h2>
                                <p className="text-gray-100 text-sm">Send a note about this {getContextDisplayName().toLowerCase()}</p>
                            </div>
                        </div>
                        <button
                            className="hover:bg-gray-700 rounded-full p-2 transition-colors"
                            onClick={handleClose}
                        >
                            <Close />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[calc(95vh-140px)] overflow-y-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Context Information */}
                            <div className="space-y-6">
                                <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Description className="mr-2 text-gray-700" />
                                        Note Context
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                                                <span className="text-sm font-medium text-gray-700">Creating note for:</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                                                    {getContextDisplayName()}
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    {getContextDisplayId()}
                                                </span>
                                            </div>
                                            {contextData?.topic && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    {contextData.topic}
                                                </p>
                                            )}
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <h4 className="text-sm font-semibold text-gray-800 mb-2">What happens next?</h4>
                                            <div className="space-y-1 text-xs text-gray-700">
                                                <div className="flex items-start">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-700 mr-2 mt-1.5"></div>
                                                    <span>The selected officer will receive your note</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-700 mr-2 mt-1.5"></div>
                                                    <span>They can view it in their notes dashboard</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-700 mr-2 mt-1.5"></div>
                                                    <span>Note will be linked to this {getContextDisplayName().toLowerCase()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Note Details */}
                            <div className="space-y-6">
                                <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Person className="mr-2 text-gray-700" />
                                        Note Details
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Person className="w-4 h-4 inline mr-1" />
                                                Send Note To <span className="text-red-500">*</span>
                                            </label>
                                            <CustomOfficerDropdown
                                                filters={{
                                                    dropRoles: dropOfficerRoles,
                                                    dropIds: dropOfficerIds,
                                                    extraIds: allowedOfficerIds
                                                }}
                                                selectedOfficerId={selectedReceiver?.id}
                                                onOfficerSelect={handleReceiverSelect}
                                                className="w-full"
                                            />
                                            {fieldErrors.receiver_id && (
                                                <p className="text-red-500 text-xs mt-1">{fieldErrors.receiver_id}</p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                {selectedReceiver
                                                    ? `Note will be sent to ${selectedReceiver.name} (${selectedReceiver.role})`
                                                    : "Select an officer to receive this note"
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Description className="w-4 h-4 inline mr-1" />
                                                Note Description <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                name="description"
                                                value={newNote.description}
                                                onChange={handleNoteChange}
                                                placeholder="Enter your note here... (minimum 10 characters)"
                                                rows={6}
                                                maxLength={500}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-gray-700 focus:border-gray-700 transition-colors resize-none ${fieldErrors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                    }`}
                                            />
                                            {fieldErrors.description && (
                                                <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                {newNote.description.length}/500 characters
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                            <OutlinedButton
                                action={{
                                    icon: <Close fontSize="small" />,
                                    label: "Cancel",
                                    onClick: handleClose,
                                    styles: "border-gray-300 text-gray-700 hover:bg-gray-100 h-11 px-6",
                                    disabled: creatingNote
                                }}
                            />
                            <OutlinedButton
                                action={{
                                    icon: <Send fontSize="small" />,
                                    label: creatingNote ? "Sending..." : "Send Note",
                                    onClick: handleSubmitNote,
                                    styles: "bg-gray-800 text-white hover:bg-black h-11 px-6 shadow-lg",
                                    disabled: creatingNote || !newNote.description.trim() || !newNote.receiver_id
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateNoteModal;
