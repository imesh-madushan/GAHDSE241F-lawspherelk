import React, { useState, useEffect, useCallback } from 'react';
import { Add, Close, Send, Assignment, FolderOpen, Search, LocationOn, CalendarToday, AccessTime, CloudUpload, AttachFile, Delete } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import OutlinedButton from '../buttons/OutlinedButton';
import StatusPopup from '../common/StatusPopup';
import CustomCaseDropdown from '../dropdowns/CustomCaseDropdown';
import CustomInvestigationDropdown from '../dropdowns/CustomInvestigationDropdown';
import CustomOffenceDropdown from '../dropdowns/CustomOffenceDropdown';
import { evidenceTypes, caseStatusList, investigationStatusList } from '../../../data'

const CreateEvidenceModal = ({
    open,
    onClose,
    canCreate = false,
    context = 'general',
    contextId = null
}) => {
    const [creatingEvidence, setCreatingEvidence] = useState(false);
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
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [fileError, setFileError] = useState('');
    const [isCaseAutoSelected, setIsCaseAutoSelected] = useState(false);
    const [isInvestigationAutoSelected, setIsInvestigationAutoSelected] = useState(false);
    const [isOffenceAutoSelected, setIsOffenceAutoSelected] = useState(false);
    const [dropdownLocked, setDropdownLocked] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            resetForm();
            if (context === 'case' && contextId) {
                setNewEvidence(prev => ({ ...prev, case_id: contextId }));
                setIsCaseAutoSelected(true);
                setDropdownLocked(true);
            } else if (context === 'investigation' && contextId) {
                // Fetch investigation details to get related case
                apiClient.get(`/investigations/${contextId}`).then(res => {
                    const inv = res.data?.investigationData || res.data?.investigation;
                    if (inv && inv.case_id) {
                        setNewEvidence(prev => ({
                            ...prev,
                            case_id: inv.case_id,
                            investigation_id: contextId
                        }));
                        setIsCaseAutoSelected(true);
                        setDropdownLocked(true);
                        setIsInvestigationAutoSelected(true);
                    }
                });
            } else if (context === 'offence' && contextId) {
                // Fetch offence details to get related case
                apiClient.get(`/crimeoffences/${contextId}`).then(res => {
                    const off = res.data?.offence;
                    if (off && off.case_id) {
                        setNewEvidence(prev => ({
                            ...prev,
                            case_id: off.case_id,
                            offence_id: contextId
                        }));
                        setIsCaseAutoSelected(true);
                        setDropdownLocked(true);
                        setIsOffenceAutoSelected(true);
                    }
                });
            } else {
                // General context: enable case dropdown, others disabled until case selected
                setDropdownLocked(false); // <-- ensure not locked in general mode
            }
        }
        // eslint-disable-next-line
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
        setFieldErrors({});
        setSelectedFiles([]);
        setFileError('');
        setIsCaseAutoSelected(false);
        setIsInvestigationAutoSelected(false);
        setIsOffenceAutoSelected(false);
        setDropdownLocked(false);
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

    // When a case is selected, fetch related investigations/offences and enable their dropdowns
    const handleCaseSelect = (caseObj) => {
        setNewEvidence(prev => ({
            ...prev,
            case_id: caseObj.case_id,
            investigation_id: '',
            offence_id: ''
        }));

        setIsCaseAutoSelected(false);
        setIsInvestigationAutoSelected(false);
        setIsOffenceAutoSelected(false);
        if (fieldErrors.case_id) {
            setFieldErrors(prev => ({ ...prev, case_id: null }));
        }
    };

    // When an investigation is selected, update state
    const handleInvestigationSelect = (investigationObj) => {
        setNewEvidence(prev => ({
            ...prev,
            investigation_id: investigationObj.investigation_id
        }));
        setIsInvestigationAutoSelected(false);
        if (fieldErrors.investigation_id) {
            setFieldErrors(prev => ({ ...prev, investigation_id: null }));
        }
    };

    // When an offence is selected, update state
    const handleOffenceSelect = (offenceObj) => {
        setNewEvidence(prev => ({
            ...prev,
            offence_id: offenceObj.offence_id
        }));
        setIsOffenceAutoSelected(false);
        if (fieldErrors.offence_id) {
            setFieldErrors(prev => ({ ...prev, offence_id: null }));
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

    // Helper to combine date and time to MySQL DATETIME (YYYY-MM-DD HH:MM:SS)
    const getMySQLDateTime = (date, time) => {
        if (!date || !time) return '';
        return `${date} ${time}:00`;
    };

    const handleSubmitEvidence = async () => {
        if (!validateForm()) return;

        setCreatingEvidence(true);
        try {
            const formData = new FormData();
            formData.append('type', newEvidence.type);
            formData.append('location', newEvidence.location);
            formData.append('details', newEvidence.details);

            // Merge collected_date and collected_time into collected_dt (MySQL DATETIME)
            const collected_dt = getMySQLDateTime(newEvidence.collected_date, newEvidence.collected_time);
            if (collected_dt) {
                formData.append('collected_dt', collected_dt);
            }

            // Determine linking type and append appropriate fields
            if (newEvidence.investigation_id) {
                formData.append('investigation_id', newEvidence.investigation_id);
            }
            if (newEvidence.case_id) {
                formData.append('case_id', newEvidence.case_id);
            }
            if (newEvidence.offence_id) {
                formData.append('offence_id', newEvidence.offence_id);
            }

            // Add witnesses - send complete witness data as JSON string
            if (witnesses && witnesses.length > 0) {
                formData.append('witnesses', JSON.stringify(witnesses));
            }

            // Add files
            selectedFiles.forEach((file) => {
                formData.append('attachments', file);
            });

            console.log('Submitting evidence with data:', {
                type: newEvidence.type,
                location: newEvidence.location,
                details: newEvidence.details,
                case_id: newEvidence.case_id,
                investigation_id: newEvidence.investigation_id,
                offence_id: newEvidence.offence_id,
                witnesses: witnesses,
                files: selectedFiles.map(file => file.name)
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
                <div className="relative bg-white rounded-2xl shadow-xl w-full h-fit max-w-6xl max-h-[95vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-800 text-white px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-700 p-2 rounded-lg">
                                <Assignment className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Create New Evidence</h2>
                                <p className="text-gray-100 text-sm">Record and link evidence to case or investigation</p>
                            </div>
                        </div>
                        <button
                            className="flex hover:bg-gray-700 rounded-full p-2 transition-colors"
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
                                <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Assignment className="mr-2 text-gray-700" />
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
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-gray-700 focus:border-gray-700 transition-colors ${fieldErrors.type ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
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
                                                    className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-gray-700 focus:border-gray-700 transition-colors ${fieldErrors.collected_date ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
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
                                                    className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-gray-700 focus:border-gray-700 transition-colors ${fieldErrors.collected_time ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
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
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-gray-700 focus:border-gray-700 transition-colors"
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
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-gray-700 focus:border-gray-700 transition-colors resize-none ${fieldErrors.details ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.details && <p className="text-red-500 text-xs mt-1">{fieldErrors.details}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Linking Section */}
                                <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <FolderOpen className="mr-2 text-gray-700" />
                                        Link Evidence To
                                    </h3>

                                    {/* Case Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Case <span className="text-red-500">*</span>
                                        </label>
                                        <CustomCaseDropdown
                                            filters={{ status: 'inprogress' }}
                                            selectedCaseId={newEvidence.case_id}
                                            onCaseSelect={handleCaseSelect}
                                            className={fieldErrors.case_id ? 'border-red-500' : ''}
                                            isAutoSelected={isCaseAutoSelected}
                                            dropdownLocked={dropdownLocked}
                                        />
                                        {fieldErrors.case_id && <p className="text-red-500 text-xs mt-1">{fieldErrors.case_id}</p>}
                                    </div>

                                    {/* Investigation Selection (only show if case is selected) */}
                                    {newEvidence.case_id && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Investigation (Optional)
                                            </label>
                                            <CustomInvestigationDropdown
                                                filters={{ case_id: newEvidence.case_id, status: 'inprogress' }}
                                                selectedInvestigationId={newEvidence.investigation_id}
                                                onInvestigationSelect={handleInvestigationSelect}
                                                className={fieldErrors.investigation_id ? 'border-red-500' : ''}
                                                isAutoSelected={isInvestigationAutoSelected}
                                                dropdownLocked={context === 'investigation' && contextId === newEvidence.investigation_id}
                                            />
                                            {fieldErrors.investigation_id && <p className="text-red-500 text-xs mt-1">{fieldErrors.investigation_id}</p>}
                                        </div>
                                    )}

                                    {/* Offence Selection (only show if case is selected) */}
                                    {newEvidence.case_id && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Link to Crime Offence (Optional)
                                            </label>
                                            <CustomOffenceDropdown
                                                filters={{ case_id: newEvidence.case_id }}
                                                selectedOffenceId={newEvidence.offence_id}
                                                onOffenceSelect={handleOffenceSelect}
                                                isAutoSelected={isOffenceAutoSelected}
                                                dropdownLocked={context === 'offence' && contextId === newEvidence.offence_id}
                                                className="mb-3"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* File Attachments Section */}
                                <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <AttachFile className="mr-2 text-gray-700" />
                                        File Attachments
                                    </h3>

                                    <div className="space-y-4">
                                        {/* File Upload Area */}
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white">
                                            <CloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <label htmlFor="file-upload" className="cursor-pointer">
                                                <span className="text-sm font-medium text-gray-700 hover:text-gray-900">
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
                                <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                            <Assignment className="mr-2 text-gray-700" />
                                            Witnesses (Optional)
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={addWitness}
                                            className="flex bg-gray-800 text-white p-1 rounded-full hover:bg-black transition-colors"
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
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-700 focus:border-gray-700"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Full Name *"
                                                        value={witness.name}
                                                        onChange={(e) => handleWitnessChange(index, 'name', e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-700 focus:border-gray-700"
                                                    />
                                                    <input
                                                        type="tel"
                                                        placeholder="Phone"
                                                        value={witness.phone}
                                                        onChange={(e) => handleWitnessChange(index, 'phone', e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-700 focus:border-gray-700"
                                                    />
                                                    <input
                                                        type="email"
                                                        placeholder="Email"
                                                        value={witness.email}
                                                        onChange={(e) => handleWitnessChange(index, 'email', e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-700 focus:border-gray-700"
                                                    />
                                                    <input
                                                        type="date"
                                                        placeholder="Date of Birth"
                                                        value={witness.dob}
                                                        onChange={(e) => handleWitnessChange(index, 'dob', e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-700 focus:border-gray-700"
                                                    />
                                                    <textarea
                                                        placeholder="Address"
                                                        value={witness.address}
                                                        onChange={(e) => handleWitnessChange(index, 'address', e.target.value)}
                                                        rows={2}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-700 focus:border-gray-700 resize-none"
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
                                    styles: 'bg-gray-800 text-white hover:bg-black h-11 px-6 shadow-lg',
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
