import React, { useState, useEffect, useCallback } from 'react';
import { Add, Close, Send, Assignment, FolderOpen, Search, LocationOn, CalendarToday, AccessTime, CloudUpload, AttachFile, Delete } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import OutlinedButton from '../buttons/OutlinedButton';
import StatusPopup from '../common/StatusPopup';
import CustomCaseDropdown from '../dropdowns/CustomCaseDropdown';
import CustomInvestigationDropdown from '../dropdowns/CustomInvestigationDropdown';
import { evidenceTypes, caseStatusList, investigationStatusList } from '../../../data'

const CreateEvidenceModal = ({
    open,
    onClose,
    canCreate = false,
    context = 'general',
    contextId = null
}) => {
    const [creatingEvidence, setCreatingEvidence] = useState(false);
    const [linkingType, setLinkingType] = useState('case'); // 'case' or 'investigation'
    const [newEvidence, setNewEvidence] = useState({
        type: 'Voice Statement',
        location: '',
        details: '',
        collected_date: '',
        collected_time: '',
        case_id: '',
        investigation_id: '',
        witnesses: []
    });
    const [witnesses, setWitnesses] = useState([{
        nic: '',
        name: '',
        phone: '',
        email: '',
        address: '',
        dob: ''
    }]);
    const [fieldErrors, setFieldErrors] = useState({});
    const [popup, setPopup] = useState({
        open: false,
        status: "success",
        message: "",
        description: "",
        referenceLink: null
    });
    const [selectedCase, setSelectedCase] = useState(null);
    const [selectedInvestigation, setSelectedInvestigation] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [fileError, setFileError] = useState('');
    const [selectedWitnesses, setSelectedWitnesses] = useState([]);

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            resetForm();
            // Set default linking type and ID based on context
            if (context === 'case' && contextId) {
                setLinkingType('case');
                setNewEvidence(prev => ({
                    ...prev,
                    case_id: contextId,
                    investigation_id: ''
                }));
                // Fetch case details for display
                fetchCaseDetails(contextId);
            } else if (context === 'investigation' && contextId) {
                setLinkingType('investigation');
                setNewEvidence(prev => ({
                    ...prev,
                    investigation_id: contextId,
                    case_id: ''
                }));
                // Fetch investigation details for display
                fetchInvestigationDetails(contextId);
            } else if (context === 'criminal' && contextId) {
                // For criminal context, we still need to link to a case or investigation
                // But we can add the criminal info to witnesses or details
                setLinkingType('case');
                // Add criminal ID to evidence details or witnesses if needed
            }
        }
    }, [open, context, contextId]);

    const resetForm = () => {
        // Set default date and time to current
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

        setNewEvidence({
            type: 'Voice Statement',
            location: '',
            details: '',
            collected_date: currentDate,
            collected_time: currentTime,
            case_id: '',
            investigation_id: '',
            witnesses: []
        });
        setWitnesses([{
            nic: '',
            name: '',
            phone: '',
            email: '',
            address: '',
            dob: ''
        }]);
        setSelectedCase(null);
        setSelectedInvestigation(null);
        setFieldErrors({});
        setLinkingType('case');
        setSelectedFiles([]);
        setFileError('');
        setSelectedWitnesses([]);
    };

    const fetchCaseDetails = async (caseId) => {
        try {
            const response = await apiClient.get(`/cases/${caseId}`);
            if (response.data?.caseData) {
                setSelectedCase({
                    case_id: response.data.caseData.case_id,
                    topic: response.data.caseData.topic,
                    case_type: response.data.caseData.case_type,
                    status: response.data.caseData.status
                });

            }
        } catch (error) {
            console.error('Error fetching case details:', error);
        }
    };

    const fetchInvestigationDetails = async (investigationId) => {
        try {
            const response = await apiClient.get(`/investigations/${investigationId}`);
            if (response.data?.investigationData) {
                setSelectedInvestigation({
                    investigation_id: response.data.investigationData.investigation_id,
                    topic: response.data.investigationData.topic,
                    status: response.data.investigationData.status,
                    case_id: response.data.investigationData.case_id,
                    case_topic: response.data.investigationData.case_topic
                });
            }
        } catch (error) {
            console.error('Error fetching investigation details:', error);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleEvidenceChange = (e) => {
        const { name, value } = e.target;
        setNewEvidence(prev => ({
            ...prev,
            [name]: value
        }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleLinkingTypeChange = (type) => {
        setLinkingType(type);
        if (type === 'case') {
            setNewEvidence(prev => ({ ...prev, investigation_id: '' }));
            setSelectedInvestigation(null);
        } else {
            setNewEvidence(prev => ({ ...prev, case_id: '' }));
            setSelectedCase(null);
        }
    };

    const handleCaseSelect = (caseObj) => {
        setSelectedCase(caseObj);
        setNewEvidence(prev => ({
            ...prev,
            case_id: caseObj.case_id,
            investigation_id: ''
        }));
        if (fieldErrors.case_id) {
            setFieldErrors(prev => ({ ...prev, case_id: null }));
        }
    };

    const handleInvestigationSelect = (investigationObj) => {
        setSelectedInvestigation(investigationObj);
        setNewEvidence(prev => ({
            ...prev,
            investigation_id: investigationObj.investigation_id,
            case_id: ''
        }));
        if (fieldErrors.investigation_id) {
            setFieldErrors(prev => ({ ...prev, investigation_id: null }));
        }
    };

    const handleWitnessChange = (index, field, value) => {
        const updatedWitnesses = witnesses.map((witness, i) =>
            i === index ? { ...witness, [field]: value } : witness
        );
        setWitnesses(updatedWitnesses);
    };

    const addWitness = () => {
        setWitnesses([...witnesses, {
            nic: '',
            name: '',
            phone: '',
            email: '',
            address: '',
            dob: ''
        }]);
    };

    const removeWitness = (index) => {
        if (witnesses.length > 1) {
            setWitnesses(witnesses.filter((_, i) => i !== index));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!newEvidence.type) {
            errors.type = 'Evidence type is required';
        }
        if (!newEvidence.details.trim()) {
            errors.details = 'Evidence details are required';
        }
        if (!newEvidence.collected_date) {
            errors.collected_date = 'Collection date is required';
        } else {
            const collectedDate = new Date(newEvidence.collected_date);
            const today = new Date();
            today.setHours(23, 59, 59, 999); // End of today

            if (collectedDate > today) {
                errors.collected_date = 'Collection date cannot be in the future';
            }
        }
        if (!newEvidence.collected_time) {
            errors.collected_time = 'Collection time is required';
        }

        if (linkingType === 'case' && !newEvidence.case_id) {
            errors.case_id = 'Case selection is required';
        }
        if (linkingType === 'investigation' && !newEvidence.investigation_id) {
            errors.investigation_id = 'Investigation selection is required';
        }

        // Validate witnesses
        witnesses.forEach((witness, index) => {
            if (witness.nic || witness.name || witness.phone || witness.email || witness.address || witness.dob) {
                if (!witness.nic || !witness.name) {
                    errors[`witness_${index}`] = 'NIC and Name are required for witnesses';
                }
            }
        });

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Helper to combine date and time to MySQL DATETIME (YYYY-MM-DD HH:MM:SS)
    const getMySQLDateTime = (date, time) => {
        if (!date || !time) return '';
        return `${date} ${time}:00`;
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        const maxSize = 50 * 1024 * 1024; // 50MB
        const maxFiles = 10;

        // Validate file count
        if (selectedFiles.length + files.length > maxFiles) {
            setFileError(`Maximum ${maxFiles} files allowed`);
            return;
        }

        // Validate file sizes and types
        const allowedTypes = ['image/', 'video/', 'audio/', 'application/pdf', 'application/msword', 'text/'];
        const validFiles = [];

        for (const file of files) {
            if (file.size > maxSize) {
                setFileError(`File ${file.name} is too large. Maximum size is 50MB.`);
                return;
            }

            const isValidType = allowedTypes.some(type => file.type.startsWith(type));
            if (!isValidType) {
                setFileError(`File ${file.name} is not a supported file type.`);
                return;
            }

            validFiles.push(file);
        }

        setSelectedFiles(prev => [...prev, ...validFiles]);
        setFileError('');
        event.target.value = ''; // Reset input
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType) => {
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType.startsWith('video/')) return '🎥';
        if (fileType.startsWith('audio/')) return '🎵';
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('word')) return '📝';
        return '📄';
    };

    const handleSubmitEvidence = async () => {
        if (!validateForm()) return;

        setCreatingEvidence(true);
        try {
            const formData = new FormData();
            formData.append('type', newEvidence.type);
            formData.append('location', newEvidence.location);
            formData.append('details', newEvidence.details);

            // Only append collected_dt if it's provided and valid
            if (newEvidence.collected_dt && newEvidence.collected_dt.trim() !== '') {
                formData.append('collected_dt', newEvidence.collected_dt);
            }

            // Determine linking type and append appropriate fields
            if (newEvidence.investigation_id) {
                formData.append('linking_type', 'investigation');
                formData.append('investigation_id', newEvidence.investigation_id);
            } else if (newEvidence.case_id) {
                formData.append('linking_type', 'case');
                formData.append('case_id', newEvidence.case_id);
            }

            // Add witnesses - send complete witness data as JSON string
            if (witnesses && witnesses.length > 0) {
                formData.append('witnesses', JSON.stringify(witnesses));
            }

            // Add files
            selectedFiles.forEach((file) => {
                formData.append('attachments', file);
            });

            const response = await apiClient.post('/evidences/create', formData);

            if (response.data.success) {
                setPopup({
                    open: true,
                    status: "success",
                    message: "Evidence Created Successfully",
                    description: `New evidence ${response.data.evidence.evidence_id} has been recorded.`,
                    referenceLink: `/evidences/${response.data.evidence.evidence_id}`
                });
                resetForm();
            } else {
                throw new Error(response.data.message || 'Failed to create evidence');
            }
        } catch (error) {
            setPopup({
                open: true,
                status: "error",
                message: "Creation Failed",
                description: error.response?.data?.message || "Failed to create evidence"
            });
        }
        setCreatingEvidence(false);
    };

    const handlePopupClose = useCallback(() => {
        setPopup({ ...popup, open: false });
        if (popup.status === "success") {
            handleClose();
        }
    }, [popup]);

    // Helper function to get status styles
    const getStatusStyles = (status, statusList) => {
        const statusItem = statusList.find(item => item.value === status);
        return statusItem ? statusItem.styles : 'text-gray-500 bg-gray-100 border-gray-200';
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
                        <p className="text-gray-600 mt-2">You don't have permission to create evidence.</p>
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
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

            <StatusPopup
                open={popup.open}
                status={popup.status}
                message={popup.message}
                description={popup.description}
                referenceLink={popup.referenceLink}
                onClose={handlePopupClose}
                okLabel={popup.status === "success" ? "OK" : "Close"}
            />

            {!popup.open && (
                <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl w-full h-fit max-w-6xl max-h-[95vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Assignment className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Create New Evidence</h2>
                                <p className="text-white/80 text-sm">Record and link evidence to case or investigation</p>
                            </div>
                        </div>
                        <button
                            className="flex hover:bg-white/10 rounded-full p-2 transition-colors"
                            onClick={handleClose}
                        >
                            <Close />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[calc(95vh-140px)] overflow-y-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Evidence Details */}
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <Assignment className="mr-2 text-blue-600" />
                                        Evidence Details
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Evidence Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="type"
                                                value={newEvidence.type}
                                                onChange={handleEvidenceChange}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.type ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            >
                                                {evidenceTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                            {fieldErrors.type && <p className="text-red-500 text-xs mt-1">{fieldErrors.type}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <CalendarToday className="w-4 h-4 inline mr-1" />
                                                    Collection Date <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    name="collected_date"
                                                    value={newEvidence.collected_date}
                                                    onChange={handleEvidenceChange}
                                                    max={new Date().toISOString().split('T')[0]}
                                                    className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.collected_date ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                                />
                                                {fieldErrors.collected_date && <p className="text-red-500 text-xs mt-1">{fieldErrors.collected_date}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <AccessTime className="w-4 h-4 inline mr-1" />
                                                    Collection Time <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="time"
                                                    name="collected_time"
                                                    value={newEvidence.collected_time}
                                                    onChange={handleEvidenceChange}
                                                    className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.collected_time ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                                />
                                                {fieldErrors.collected_time && <p className="text-red-500 text-xs mt-1">{fieldErrors.collected_time}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <LocationOn className="w-4 h-4 inline mr-1" />
                                                Location (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={newEvidence.location}
                                                onChange={handleEvidenceChange}
                                                placeholder="Where was this evidence found/collected?"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Evidence Details <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                name="details"
                                                value={newEvidence.details}
                                                onChange={handleEvidenceChange}
                                                placeholder="Detailed description of the evidence..."
                                                rows={4}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${fieldErrors.details ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.details && <p className="text-red-500 text-xs mt-1">{fieldErrors.details}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Linking Section */}
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <FolderOpen className="mr-2 text-blue-600" />
                                        Link Evidence To
                                    </h3>

                                    {/* Linking Type Selection (only for general context) */}
                                    {context === 'general' && (
                                        <div className="mb-4">
                                            <div className="flex gap-4">
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="linkingType"
                                                        value="case"
                                                        checked={linkingType === 'case'}
                                                        onChange={() => handleLinkingTypeChange('case')}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">Case</span>
                                                </label>
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="linkingType"
                                                        value="investigation"
                                                        checked={linkingType === 'investigation'}
                                                        onChange={() => handleLinkingTypeChange('investigation')}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">Investigation</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {/* Case Selection */}
                                    {linkingType === 'case' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Case <span className="text-red-500">*</span>
                                            </label>
                                            <CustomCaseDropdown
                                                filters={{ status: 'inprogress' }}
                                                selectedCaseId={newEvidence.case_id}
                                                onCaseSelect={handleCaseSelect}
                                                className={fieldErrors.case_id ? 'border-red-500' : ''}
                                                isAutoSelected={context === 'case' && contextId === newEvidence.case_id}
                                                dropdownLocked={context === 'case' && contextId === newEvidence.case_id}
                                            />
                                            {fieldErrors.case_id && <p className="text-red-500 text-xs mt-1">{fieldErrors.case_id}</p>}
                                        </div>
                                    )}

                                    {/* Investigation Selection */}
                                    {linkingType === 'investigation' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Investigation <span className="text-red-500">*</span>
                                            </label>

                                            <CustomInvestigationDropdown
                                                filters={{ status: 'inprogress' }}
                                                selectedInvestigationId={newEvidence.investigation_id}
                                                onInvestigationSelect={handleInvestigationSelect}
                                                className={fieldErrors.investigation_id ? 'border-red-500' : ''}
                                                isAutoSelected={context === 'investigation' && contextId === newEvidence.investigation_id}
                                                dropdownLocked={context === 'investigation' && contextId === newEvidence.investigation_id}
                                            />
                                            {fieldErrors.investigation_id && <p className="text-red-500 text-xs mt-1">{fieldErrors.investigation_id}</p>}
                                        </div>
                                    )}
                                </div>

                                {/* File Attachments Section */}
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <AttachFile className="mr-2 text-blue-600" />
                                        File Attachments
                                    </h3>

                                    <div className="space-y-4">
                                        {/* File Upload Area */}
                                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-white">
                                            <CloudUpload className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                                            <label htmlFor="file-upload" className="cursor-pointer">
                                                <span className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                                    Click to upload files
                                                </span>
                                                <input
                                                    id="file-upload"
                                                    type="file"
                                                    multiple
                                                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                                                    onChange={handleFileSelect}
                                                    className="hidden"
                                                />
                                            </label>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Images, videos, audio, documents (Max 10 files, 50MB each)
                                            </p>
                                        </div>

                                        {/* Error Display */}
                                        {fileError && (
                                            <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                                                {fileError}
                                            </div>
                                        )}

                                        {/* Selected Files List */}
                                        {selectedFiles.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-medium text-gray-700">
                                                    Selected Files ({selectedFiles.length})
                                                </h4>
                                                <div className="max-h-40 overflow-y-auto space-y-2">
                                                    {selectedFiles.map((file, index) => (
                                                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                                            <div className="flex items-center flex-1 min-w-0">
                                                                <span className="text-lg mr-2">{getFileIcon(file.type)}</span>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="text-sm font-medium text-gray-900 truncate">
                                                                        {file.name}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {formatFileSize(file.size)} • {file.type}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFile(index)}
                                                                className="ml-2 text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100"
                                                            >
                                                                <Delete fontSize="small" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Investigation and Witnesses */}
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-blue-900 flex items-center">
                                            <Assignment className="mr-2 text-blue-600" />
                                            Witnesses (Optional)
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={addWitness}
                                            className="flex bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700 transition-colors"
                                        >
                                            <Add fontSize="small" />
                                        </button>
                                    </div>

                                    <div className="space-y-4 max-h-96 overflow-y-auto">
                                        {witnesses.map((witness, index) => (
                                            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h4 className="font-medium text-gray-800">Witness {index + 1}</h4>
                                                    {witnesses.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeWitness(index)}
                                                            className="text-red-600 hover:text-red-800 p-1"
                                                        >
                                                            <Close fontSize="small" />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="NIC *"
                                                        value={witness.nic}
                                                        onChange={(e) => handleWitnessChange(index, 'nic', e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Full Name *"
                                                        value={witness.name}
                                                        onChange={(e) => handleWitnessChange(index, 'name', e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <input
                                                        type="tel"
                                                        placeholder="Phone"
                                                        value={witness.phone}
                                                        onChange={(e) => handleWitnessChange(index, 'phone', e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <input
                                                        type="email"
                                                        placeholder="Email"
                                                        value={witness.email}
                                                        onChange={(e) => handleWitnessChange(index, 'email', e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <input
                                                        type="date"
                                                        placeholder="Date of Birth"
                                                        value={witness.dob}
                                                        onChange={(e) => handleWitnessChange(index, 'dob', e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <textarea
                                                        placeholder="Address"
                                                        value={witness.address}
                                                        onChange={(e) => handleWitnessChange(index, 'address', e.target.value)}
                                                        rows={2}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                    />
                                                </div>
                                                {fieldErrors[`witness_${index}`] && (
                                                    <p className="text-red-500 text-xs mt-2">{fieldErrors[`witness_${index}`]}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                            <OutlinedButton
                                action={{
                                    icon: <Close fontSize="small" />,
                                    label: 'Cancel',
                                    onClick: handleClose,
                                    styles: 'border-gray-300 text-gray-700 hover:bg-gray-100 h-11 px-6',
                                }}
                            />
                            <OutlinedButton
                                action={{
                                    icon: <Send fontSize="small" />,
                                    label: creatingEvidence ? 'Creating...' : 'Create Evidence',
                                    ariaLabel: 'Create Evidence',
                                    onClick: handleSubmitEvidence,
                                    styles: 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 h-11 px-6 shadow-lg',
                                    disabled: creatingEvidence
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateEvidenceModal;
