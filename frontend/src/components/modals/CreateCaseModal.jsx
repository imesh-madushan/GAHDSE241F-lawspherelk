import React, { useState, useEffect, useCallback } from 'react';
import { Close, BusinessCenter, Assignment } from '@mui/icons-material';
import OutlinedButton from '../buttons/OutlinedButton';
import CustomOfficerDropdown from '../dropdowns/CustomOfficerDropdown';
import StatusPopup from '../common/StatusPopup';
import { apiClient } from '../../config/apiConfig';
import { caseTypes } from '../../../data';

const CreateCaseModal = ({ open, onClose, complaintId, caseId }) => {
    const [caseTopicInput, setCaseTopicInput] = useState('');
    const [selectedLeader, setSelectedLeader] = useState(null);
    const [availableOfficers, setAvailableOfficers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [popup, setPopup] = useState({ open: false, status: "success", message: "", description: "", caseId: null });

    useEffect(() => {
        if (open) {
            fetchAvailableOfficers();
        } else {
            resetForm();
        }
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

    const fetchAvailableOfficers = async () => {
        try {
            const response = await apiClient.post('/officers/getAll');
            if (response.data && Array.isArray(response.data)) {
                const formattedOfficers = response.data.map(officer => ({
                    id: officer.user_id || officer.id,
                    name: officer.name,
                    role: officer.role,
                    image: officer.profile_pic || officer.image
                }));
                setAvailableOfficers(formattedOfficers);
            }
        } catch (err) {
            console.error("Error fetching officers:", err);
            setError("Failed to load available officers");
        }
    };

    const handleSubmit = async () => {
        if (!caseTopicInput.trim()) {
            setError("Please enter a case topic");
            return;
        }

        if (!selectedLeader || !selectedLeader.id) {
            setError("Please select a case leader");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await apiClient.post('/cases/create', {
                complaintId,
                topic: caseTopicInput.trim(),
                caseId: caseId,
                leaderId: selectedLeader.id
            });

            if (response.data.success == true) {
                setPopup({
                    open: true,
                    status: "success",
                    message: "Case Created Successfully",
                    description: `Case #${caseId} has been created and assigned to ${selectedLeader.name}.`,
                    referenceLink: caseId
                        ? `/cases/${caseId}`
                        : null
                });
            } else {
                setPopup({
                    open: true,
                    status: "error",
                    message: "Case Creation Failed",
                    description: "Failed to create case. Please try again.",
                    referenceLink: null
                });
            }
        } catch (err) {
            setPopup({
                open: true,
                status: "error",
                message: "Case Creation Failed",
                description: err.response?.data?.message || "An error occurred while creating the case",
                referenceLink: null
            });
            console.error("Error creating case:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePopupClose = useCallback(() => {
        setPopup({ ...popup, open: false });
        if (popup.status === "success") {
            handleClose(popup.caseId);
        }
        handleClose();
    }, [popup, handleClose]);

    // Close success popup on Enter key
    useEffect(() => {
        if (!popup.open) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                handlePopupClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [popup, handlePopupClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center py-4 px-12 overflow-hidden">
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
                okLabel={popup.status === "success" ? "Ok" : "Close"}
            />
            {/* Modal */}
            {!popup.open && (
                <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl w-full max-w-2xl h-fit max-h-[95vh] ">
                    {/* Header */}
                    <div className="bg-blue-800 text-white px-6 py-4 flex rounded-tl-2xl rounded-tr-2xl items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BusinessCenter className="bg-white text-blue-800 rounded-full p-1" />
                            <h2 className="text-xl font-bold">Start New Case</h2>
                        </div>
                        <div
                            className="cursor-pointer flex hover:bg-blue-700 rounded-full p-1 transition-colors"
                            onClick={handleClose}
                        >
                            <Close />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="py-6 px-8 max-h-[calc(90vh-25px)]">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-5 rounded">
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Case Topic */}
                            <div>
                                <label htmlFor="caseTopic" className="block text-sm font-medium text-gray-700 mb-1">
                                    Case Topic <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="caseTopic"
                                    type="text"
                                    value={caseTopicInput}
                                    onChange={(e) => setCaseTopicInput(e.target.value)}
                                    placeholder="Enter case topic or title"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            {/* Officer Selection */}
                            <div>
                                <label htmlFor="caseLeader" className="block text-sm font-medium text-gray-700 mb-1">
                                    Case Leader <span className="text-red-500">*</span>
                                </label>

                                <div className="mt-1 z-[400]">
                                    <CustomOfficerDropdown
                                        officers={availableOfficers}
                                        selectedOfficerId={selectedLeader?.id}
                                        onOfficerSelect={(officer) => setSelectedLeader(officer)}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        {selectedLeader ?
                                            `${selectedLeader.name} will be assigned as the case leader.` :
                                            "Please select an officer to lead this case."
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-4">
                                <div className="flex items-start">
                                    <Assignment className="text-blue-700 mt-0.5 mr-2" fontSize="small" />
                                    <div>
                                        <p className="text-sm text-gray-700 font-medium">About this action</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Starting a case will create a formal investigation based on this complaint.
                                            A case leader must be assigned to take responsibility for the investigation.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
                            <OutlinedButton
                                action={{
                                    icon: <Close fontSize="small" />,
                                    label: "Cancel",
                                    onClick: handleClose,
                                    styles: "border-gray-300 text-gray-700 hover:bg-gray-100 h-10"
                                }}
                            />
                            <OutlinedButton
                                action={{
                                    icon: <BusinessCenter fontSize="small" />,
                                    label: isLoading ? "Creating..." : "Create Case",
                                    onClick: handleSubmit,
                                    styles: "bg-blue-800 text-white hover:bg-blue-700 border-blue-800 h-10",
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
