import React, { useState, useEffect, useCallback } from 'react';
import { Close, BusinessCenter, Assignment, Person, Gavel, Topic, PeopleAlt } from '@mui/icons-material';
import OutlinedButton from '../buttons/OutlinedButton';
import CustomOfficerDropdown from '../dropdowns/CustomOfficerDropdown';
import StatusPopup from '../common/StatusPopup';
import { apiClient } from '../../config/apiConfig';

const CreateCaseModal = ({ open, onClose, complaintId, caseId }) => {
    const [caseTopicInput, setCaseTopicInput] = useState('');
    const [selectedLeader, setSelectedLeader] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [popup, setPopup] = useState({ open: false, status: "success", message: "", description: "", referenceLink: null });

    // Reset form when modal opens
    useEffect(() => {
        if (open) resetForm();
    }, [open]);

    const resetForm = () => {
        setCaseTopicInput('');
        setSelectedLeader(null);
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const validateForm = () => {
        if (!caseTopicInput.trim()) {
            setError("Please enter a case topic");
            return false;
        }
        if (caseTopicInput.trim().length < 5) {
            setError("Case topic must be at least 5 characters long");
            return false;
        }
        if (!selectedLeader || !selectedLeader.id) {
            setError("Please select a case leader");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await apiClient.post('/cases/create', {
                complaintId,
                topic: caseTopicInput.trim(),
                caseId: caseId,
                leaderId: selectedLeader.id
            });

            if (response.data.success) {
                setPopup({
                    open: true,
                    status: "success",
                    message: "Case Created Successfully",
                    description: `Case #${caseId} has been created and assigned to ${selectedLeader.name}.`,
                    referenceLink: caseId ? `/cases/${caseId}` : null
                });
            } else {
                setPopup({
                    open: true,
                    status: "error",
                    message: "Case Creation Failed",
                    description: response.data.message || "Failed to create case. Please try again."
                });
            }
        } catch (err) {
            setPopup({
                open: true,
                status: "error",
                message: "Case Creation Failed",
                description: err.response?.data?.message || "An error occurred while creating the case"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePopupClose = useCallback(() => {
        setPopup({ ...popup, open: false });
        if (popup.status === "success") {
            handleClose();
        }
    }, [popup, handleClose]);

    if (!open) return null;

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
                okLabel={popup.status === "success" ? "OK" : "Close"}
            />
            {/* Modal */}
            {!popup.open && (
                <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl w-full h-fit max-w-3xl max-h-[95vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <BusinessCenter className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Start New Case</h2>
                                <p className="text-white/80 text-sm">Create a formal investigation from this complaint</p>
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
                    <div className="p-6 max-h-[calc(95vh-140px)] overflow-y-auto">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-6 rounded-lg flex items-center">
                                <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center mr-3">
                                    <span className="text-red-600 text-xs font-bold">!</span>
                                </div>
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Case Details */}
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <Gavel className="mr-2 text-blue-600" />
                                        Case Information
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Topic className="w-4 h-4 inline mr-1" />
                                                Case Topic <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={caseTopicInput}
                                                onChange={(e) => setCaseTopicInput(e.target.value)}
                                                placeholder="Enter a descriptive case title..."
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                This will be the main title for the investigation case
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Case ID
                                            </label>
                                            <input
                                                type="text"
                                                value={caseId || "Auto-generated"}
                                                disabled
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Unique identifier for this case
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Assignment */}
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <PeopleAlt className="mr-2 text-blue-600" />
                                        Case Assignment
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Person className="w-4 h-4 inline mr-1" />
                                                Case Leader <span className="text-red-500">*</span>
                                            </label>
                                            <CustomOfficerDropdown
                                                selectedOfficerId={selectedLeader?.id}
                                                onOfficerSelect={(officer) => setSelectedLeader(officer)}
                                                setError={setError}
                                                className="w-full"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                {selectedLeader
                                                    ? `${selectedLeader.name} (${selectedLeader.role}) will lead this investigation`
                                                    : "Select an officer to take responsibility for this case"
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Card */}
                                <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-4 border border-blue-200">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                                        <Assignment className="mr-2 text-blue-600" />
                                        What happens next?
                                    </h3>
                                    <div className="space-y-2 text-sm text-blue-800">
                                        <div className="flex items-start">
                                            <div className="w-2 h-2 rounded-full bg-blue-600 mr-2 mt-1.5"></div>
                                            <span>A formal case will be created and assigned to the selected officer</span>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="w-2 h-2 rounded-full bg-blue-600 mr-2 mt-1.5"></div>
                                            <span>The case leader will receive notification about the assignment</span>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="w-2 h-2 rounded-full bg-blue-600 mr-2 mt-1.5"></div>
                                            <span>Investigation can begin immediately after case creation</span>
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
                                    styles: "border-gray-300 text-gray-700 hover:bg-gray-100 h-11 px-6"
                                }}
                            />
                            <OutlinedButton
                                action={{
                                    icon: <BusinessCenter fontSize="small" />,
                                    label: isLoading ? "Creating..." : "Create Case",
                                    onClick: handleSubmit,
                                    styles: "bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 h-11 px-6 shadow-lg",
                                    disabled: isLoading
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateCaseModal;
