import React, { useState, useEffect, useCallback } from 'react';
import { Add, Close, Send, Search, LocationOn, Description, Assignment, Group, FolderOpen, Remove } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import OutlinedButton from '../buttons/OutlinedButton';
import StatusPopup from '../common/StatusPopup';
import CustomCaseDropdown from '../dropdowns/CustomCaseDropdown';
import CustomOfficerDropdown from '../dropdowns/CustomOfficerDropdown';

const dropOfficerRoles = [
    'OIC',
    'Crime OIC',
    'Forensic Officer',
    'Inspector',
    'Sub Inspector',
];

const CreateInvestigationModal = ({ open, onClose, canCreate = false, context = 'general', contextId = null }) => {
    const [creatingInvestigation, setCreatingInvestigation] = useState(false);
    const [newInvestigation, setNewInvestigation] = useState({
        topic: '',
        location: '',
        case_id: '',
        officer_ids: []
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [popup, setPopup] = useState({
        open: false,
        status: "success",
        message: "",
        description: "",
        referenceLink: null
    });
    const [selectedCase, setSelectedCase] = useState(null);
    const [selectedOfficers, setSelectedOfficers] = useState([]);
    const [isCaseAutoSelected, setIsCaseAutoSelected] = useState(false);
    const [dropdownLocked, setDropdownLocked] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            resetForm();
            if (context === 'case' && contextId) {
                // Auto-select the case when creating from SingleCaseView
                apiClient.get(`/cases/${contextId}`).then(res => {
                    const caseData = res.data?.caseData;
                    if (caseData) {
                        const caseObj = {
                            case_id: caseData.case_id,
                            case_topic: caseData.topic,
                            case_type: caseData.case_type,
                            case_status: caseData.status
                        };
                        setSelectedCase(caseObj);
                        setNewInvestigation(prev => ({
                            ...prev,
                            case_id: caseData.case_id
                        }));
                        setIsCaseAutoSelected(true);
                        setDropdownLocked(true);
                    }
                }).catch(error => {
                    console.error('Error fetching case data:', error);
                });
            } else {
                // General context: enable case dropdown
                setDropdownLocked(false);
            }
        }
        // eslint-disable-next-line
    }, [open, context, contextId]);

    const resetForm = () => {
        setNewInvestigation({
            topic: '',
            location: '',
            case_id: '',
            officer_ids: []
        });
        setSelectedCase(null);
        setSelectedOfficers([]);
        setFieldErrors({});
        setOfficerDropdownError(null);
        setIsCaseAutoSelected(false);
        setDropdownLocked(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleInvestigationChange = (e) => {
        const { name, value } = e.target;
        setNewInvestigation(prev => ({
            ...prev,
            [name]: value
        }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleCaseSelect = (caseObj) => {
        setSelectedCase(caseObj);
        setNewInvestigation(prev => ({
            ...prev,
            case_id: caseObj.case_id
        }));
        setIsCaseAutoSelected(false);
        if (fieldErrors.case_id) {
            setFieldErrors(prev => ({ ...prev, case_id: null }));
        }
    };

    // Add error state for officer dropdown
    const [officerDropdownError, setOfficerDropdownError] = useState(null);

    // Handler for multi-select officer dropdown
    const handleOfficerSelect = (officer) => {
        if (!officer || !officer.id) {
            return;
        }

        // Check if officer is already selected
        const isAlreadySelected = selectedOfficers.some(o => o.id === officer.id);

        if (!isAlreadySelected) {
            const newSelectedOfficers = [...selectedOfficers, officer];
            setSelectedOfficers(newSelectedOfficers);
            setNewInvestigation(prev => ({
                ...prev,
                officer_ids: newSelectedOfficers.map(o => o.id)
            }));
        }

        // Clear any previous error
        if (fieldErrors.officers) {
            setFieldErrors(prev => ({ ...prev, officers: null }));
        }
    };

    const removeSelectedOfficer = (officerId) => {
        const newSelectedOfficers = selectedOfficers.filter(o => o.id !== officerId);
        setSelectedOfficers(newSelectedOfficers);
        setNewInvestigation(prev => ({
            ...prev,
            officer_ids: newSelectedOfficers.map(o => o.id)
        }));
    };

    const validateForm = () => {
        const errors = {};

        if (!newInvestigation.topic.trim()) {
            errors.topic = 'Investigation topic is required';
        }
        if (!newInvestigation.location.trim()) {
            errors.location = 'Investigation location is required';
        }
        if (!newInvestigation.case_id) {
            errors.case_id = 'Case selection is required';
        }
        if (newInvestigation.officer_ids.length === 0) {
            errors.officer_ids = 'At least one officer must be assigned';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitInvestigation = async () => {
        if (!validateForm()) return;

        setCreatingInvestigation(true);
        try {
            const investigationData = {
                topic: `${newInvestigation.topic}`,
                location: newInvestigation.location,
                case_id: newInvestigation.case_id,
                officer_ids: newInvestigation.officer_ids
            };

            const { data } = await apiClient.post('/investigations/create', investigationData);

            if (data.success) {
                setPopup({
                    open: true,
                    status: "success",
                    message: "Investigation Created Successfully",
                    description: `New investigation #${data.investigation.investigation_id} has been initiated.`,
                    referenceLink: `/investigations/${data.investigation.investigation_id}`
                });
            } else {
                setPopup({
                    open: true,
                    status: "error",
                    message: "Creation Failed",
                    description: data.message || "Failed to create investigation"
                });
            }
        } catch (error) {
            setPopup({
                open: true,
                status: "error",
                message: "Creation Failed",
                description: error.response?.data?.message || "Failed to create investigation"
            });
        }
        setCreatingInvestigation(false);
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
                        <p className="text-gray-600 mt-2">You don't have permission to create investigations.</p>
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
                <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl w-full h-fit max-w-5xl max-h-[95vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Search className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Create New Investigation</h2>
                                <p className="text-white/80 text-sm">Initiate a new investigation for a case</p>
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
                            {/* Left Column - Investigation Details */}
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <Description className="mr-2 text-blue-600" />
                                        Investigation Details
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Investigation Topic <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="topic"
                                                value={newInvestigation.topic}
                                                onChange={handleInvestigationChange}
                                                placeholder="Brief description of the investigation focus..."
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.topic ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.topic && <p className="text-red-500 text-xs mt-1">{fieldErrors.topic}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <LocationOn className="w-4 h-4 inline mr-1" />
                                                Investigation Location <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                name="location"
                                                value={newInvestigation.location}
                                                onChange={handleInvestigationChange}
                                                placeholder="Specify the location(s) where investigation will be conducted..."
                                                rows={3}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${fieldErrors.location ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.location && <p className="text-red-500 text-xs mt-1">{fieldErrors.location}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <FolderOpen className="mr-2 text-blue-600" />
                                        Related Case
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Case <span className="text-red-500">*</span>
                                            </label>
                                            <CustomCaseDropdown
                                                filters={{ status: 'inprogress' }}
                                                selectedCaseId={newInvestigation.case_id}
                                                onCaseSelect={handleCaseSelect}
                                                className={fieldErrors.case_id ? 'border-red-500' : ''}
                                                isAutoSelected={isCaseAutoSelected}
                                                dropdownLocked={dropdownLocked}
                                            />
                                            {fieldErrors.case_id && <p className="text-red-500 text-xs mt-1">{fieldErrors.case_id}</p>}
                                        </div>


                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Officer Assignment */}
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <Group className="mr-2 text-blue-600" />
                                        Assign Officers
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Officers <span className="text-red-500">*</span>
                                            </label>
                                            <CustomOfficerDropdown
                                                filters={{
                                                    dropRoles: dropOfficerRoles,
                                                    dropIds: selectedOfficers.map(o => o.id)
                                                }}
                                                selectedOfficerId={null}
                                                onOfficerSelect={handleOfficerSelect}
                                                setError={setOfficerDropdownError}
                                                className="mb-3"
                                            />

                                            {/* Selected Officers Display */}
                                            {selectedOfficers.length > 0 && (
                                                <div className="mt-3">
                                                    <div className="text-sm font-medium text-gray-700 mb-2">
                                                        Selected Officers ({selectedOfficers.length})
                                                    </div>
                                                    <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
                                                        {selectedOfficers.map(officer => (
                                                            <div key={officer.id} className="flex items-center justify-between bg-blue-50 rounded-lg p-2 border border-blue-200">
                                                                <div className="flex items-center">
                                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                                                        <span className="text-blue-600 text-xs font-medium">
                                                                            {officer.name?.charAt(0)?.toUpperCase() || '?'}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-medium text-gray-900">{officer.name}</div>
                                                                        <div className="text-xs text-gray-500">{officer.role}</div>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeSelectedOfficer(officer.id)}
                                                                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors"
                                                                >
                                                                    <Remove fontSize="small" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {fieldErrors.officers && (
                                                <p className="text-red-500 text-xs mt-1">{fieldErrors.officers}</p>
                                            )}
                                            {officerDropdownError && (
                                                <p className="text-red-500 text-xs mt-1">{officerDropdownError}</p>
                                            )}
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
                                    label: 'Cancel',
                                    onClick: handleClose,
                                    styles: 'border-gray-300 text-gray-700 hover:bg-gray-100 h-11 px-6',
                                }}
                            />
                            <OutlinedButton
                                action={{
                                    icon: <Send fontSize="small" />,
                                    label: creatingInvestigation ? 'Creating...' : 'Create Investigation',
                                    ariaLabel: 'Create Investigation',
                                    onClick: handleSubmitInvestigation,
                                    styles: 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 h-11 px-6 shadow-lg',
                                    disabled: creatingInvestigation
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateInvestigationModal;
