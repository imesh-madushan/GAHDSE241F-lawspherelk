import React, { useState, useCallback } from 'react';
import { Link as LinkIcon, Close, Save, Add } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import OutlinedButton from '../buttons/OutlinedButton';
import StatusPopup from '../common/StatusPopup';
import CreateEvidenceModal from './CreateEvidenceModal';
import CustomEvidenceDropdown from '../dropdowns/CustomEvidenceDropdown';

const LinkEvidenceModal = ({
    open,
    onClose,
    offenceId,
    caseId
}) => {
    const [linking, setLinking] = useState(false);
    const [selectedEvidence, setSelectedEvidence] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [popup, setPopup] = useState({
        open: false,
        status: "success",
        message: "",
        description: ""
    });
    const [showCreateEvidenceModal, setShowCreateEvidenceModal] = useState(false);

    const resetForm = () => {
        setSelectedEvidence(null);
        setFieldErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleEvidenceSelect = (evidence) => {
        setSelectedEvidence(evidence);
        if (fieldErrors.evidence) {
            setFieldErrors(prev => ({ ...prev, evidence: null }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!selectedEvidence) {
            errors.evidence = 'Please select evidence to link';
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLinking(true);
        try {
            const payload = {
                offence_id: offenceId,
                evidence_id: selectedEvidence.evidence_id
            };

            const response = await apiClient.post('/crimeoffences/linkEvidence', payload);

            if (response.data.success) {
                setPopup({
                    open: true,
                    status: "success",
                    message: "Evidence Linked Successfully",
                    description: `Evidence ${selectedEvidence.evidence_id} has been linked to this offence.`
                });
                resetForm();
            } else {
                throw new Error(response.data.message || 'Failed to link evidence');
            }
        } catch (error) {
            setPopup({
                open: true,
                status: "error",
                message: "Failed to Link Evidence",
                description: error.response?.data?.message || error.message || "An error occurred while linking the evidence"
            });
        }
        setLinking(false);
    };

    const handleCreateNewEvidence = () => {
        setShowCreateEvidenceModal(true);
    };

    const handleCreateEvidenceClose = () => {
        setShowCreateEvidenceModal(false);
        // Reset the evidence dropdown to refresh available options
        resetForm();
    };

    const handlePopupClose = useCallback(() => {
        setPopup({ ...popup, open: false });
        if (popup.status === "success") {
            handleClose();
            // Refresh parent component
            window.location.reload();
        }
    }, [popup]);

    if (!open) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center py-4 px-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

                <StatusPopup
                    open={popup.open}
                    status={popup.status}
                    message={popup.message}
                    description={popup.description}
                    onClose={handlePopupClose}
                    okLabel={popup.status === "success" ? "OK" : "Close"}
                />

                {!popup.open && !showCreateEvidenceModal && (
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <LinkIcon className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Link Evidence</h2>
                                    <p className="text-white/80 text-sm">Link existing evidence to this offence</p>
                                </div>
                            </div>
                            <button
                                className="hover:bg-white/10 rounded-full p-2 transition-colors"
                                onClick={handleClose}
                            >
                                <Close />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Evidence Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Evidence to Link
                                </label>
                                <CustomEvidenceDropdown
                                    filters={{
                                        case_id: caseId,
                                        exclude_offence: offenceId
                                    }}
                                    selectedEvidenceId={selectedEvidence?.evidence_id}
                                    onEvidenceSelect={handleEvidenceSelect}
                                    placeholder="Search and select evidence from this case..."
                                    className={fieldErrors.evidence ? 'border-red-500' : ''}
                                />
                                {fieldErrors.evidence && (
                                    <p className="text-red-500 text-sm mt-1">{fieldErrors.evidence}</p>
                                )}
                            </div>

                            {/* Create New Evidence Option */}
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-blue-900">Don't see the evidence you need?</h4>
                                        <p className="text-sm text-blue-700 mt-1">Create new evidence and it will be automatically linked to this offence.</p>
                                    </div>
                                    <OutlinedButton
                                        action={{
                                            icon: <Add fontSize="small" />,
                                            label: 'Create New Evidence',
                                            onClick: handleCreateNewEvidence,
                                            styles: 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Selected Evidence Display */}
                            {selectedEvidence && (
                                <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                    <h4 className="font-medium text-indigo-900 mb-2">Selected Evidence:</h4>
                                    <div className="text-sm text-indigo-700">
                                        <div className="font-medium">{selectedEvidence.type}</div>
                                        <div className="text-xs text-indigo-600 mt-1">
                                            ID: {selectedEvidence.evidence_id}
                                        </div>
                                        {selectedEvidence.details && (
                                            <div className="text-xs text-indigo-600 mt-1">
                                                {selectedEvidence.details.length > 100
                                                    ? selectedEvidence.details.substring(0, 100) + '...'
                                                    : selectedEvidence.details
                                                }
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <OutlinedButton
                                    action={{
                                        icon: <Close fontSize="small" />,
                                        label: 'Cancel',
                                        onClick: handleClose,
                                        styles: 'border-gray-300 text-gray-700 hover:bg-gray-100 h-11 px-6'
                                    }}
                                />
                                <OutlinedButton
                                    action={{
                                        icon: <Save fontSize="small" />,
                                        label: linking ? 'Linking...' : 'Link Evidence',
                                        onClick: handleSubmit,
                                        styles: 'bg-gradient-to-r from-indigo-600 to-indigo-800 text-white hover:from-indigo-700 hover:to-indigo-900 h-11 px-6 shadow-lg',
                                        disabled: linking
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Evidence Modal */}
            <CreateEvidenceModal
                open={showCreateEvidenceModal}
                onClose={handleCreateEvidenceClose}
                canCreate={true}
                context="offence"
                contextId={offenceId}
            />
        </>
    );
};

export default LinkEvidenceModal;
