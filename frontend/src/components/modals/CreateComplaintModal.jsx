import React, { useState, useEffect, useCallback } from 'react';
import { Add, Close, Send, Assignment, Person } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import OutlinedButton from '../buttons/OutlinedButton';
import StatusPopup from '../common/StatusPopup';
import { caseTypes as allCaseTypes } from '../../../data';

const CreateComplaintModal = ({ open, onClose }) => {
    const [creatingComplaint, setCreatingComplaint] = useState(false);
    const [newComplaint, setNewComplaint] = useState({
        description: '',
        evidence_details: '',
        evidence_type: 'Voice Statement',
    });
    const [complainerDetails, setComplainerDetails] = useState({
        nic: '',
        name: '',
        phone: '',
        email: '',
        address: '',
        dob: '',
    });
    const [submissionError, setSubmissionError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [popup, setPopup] = useState({ open: false, status: "success", message: "", description: "" });
    const [complaintType, setComplaintType] = useState('');

    useEffect(() => {
        if (open) {
            resetForm();
        }
    }, [open]);

    const resetForm = () => {
        setNewComplaint({
            description: '',
            evidence_details: '',
            evidence_type: 'Voice Statement'
        });
        setComplainerDetails({
            nic: '',
            name: '',
            phone: '',
            email: '',
            address: '',
            dob: ''
        });
        setSubmissionError(null);
        setFieldErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleComplaintChange = (e) => {
        const { name, value } = e.target;
        setNewComplaint(prev => ({
            ...prev,
            [name]: value
        }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleComplainerChange = (e) => {
        const { name, value } = e.target;
        setComplainerDetails(prev => ({
            ...prev,
            [name]: value
        }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};

        // Validate complaint details
        if (!newComplaint.description.trim()) {
            errors.description = 'Complaint description is required';
        }

        // Validate complainer details
        if (!complainerDetails.nic.trim()) {
            errors.nic = 'NIC is required';
        } else if (!/^(\d{9}[vVxX]|\d{12})$/.test(complainerDetails.nic.trim())) {
            errors.nic = 'Please enter a valid NIC number';
        }

        if (!complainerDetails.name.trim()) {
            errors.name = 'Complainer name is required';
        }

        if (!complainerDetails.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^0\d{9}$/.test(complainerDetails.phone.trim())) {
            errors.phone = 'Please enter a valid phone number (0xxxxxxxxx)';
        }

        if (!complainerDetails.email.trim()) {
            errors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(complainerDetails.email.trim())) {
            errors.email = 'Please enter a valid email address';
        }

        if (!complainerDetails.address.trim()) {
            errors.address = 'Address is required';
        }

        // Enhanced Date of Birth validation - now required
        if (!complainerDetails.dob || !complainerDetails.dob.trim()) {
            errors.dob = 'Date of birth is required';
        } else {
            const dobDate = new Date(complainerDetails.dob);
            const today = new Date();
            const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate()); // Max 120 years old

            if (dobDate > today) {
                errors.dob = 'Date of birth cannot be in the future';
            } else if (dobDate < minDate) {
                errors.dob = 'Date of birth cannot be more than 120 years ago';
            }

            // Check if person is at least 1 year old (for reasonable complaint filing)
            const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
            if (dobDate > oneYearAgo) {
                errors.dob = 'Complainer must be at least 1 year old';
            }
        }

        // Voice Statement Details validation
        if (!newComplaint.evidence_details.trim()) {
            errors.evidence_details = 'Voice statement details are required';
        } else if (newComplaint.evidence_details.trim().length < 10) {
            errors.evidence_details = 'Voice statement details must be at least 10 characters long';
        } else if (newComplaint.evidence_details.trim().length > 1000) {
            errors.evidence_details = 'Voice statement details cannot exceed 1000 characters';
        }

        // Complaint type required
        if (!complaintType || !complaintType.trim()) {
            errors.complaintType = 'Complaint type is required';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitComplaint = async () => {
        if (!validateForm()) {
            setSubmissionError("Please fix the errors below");
            return;
        }
        setCreatingComplaint(true);
        setSubmissionError(null);

        try {
            const complaintData = {
                ...newComplaint,
                complainer: complainerDetails,
                complain_type: complaintType
            };
            const { data } = await apiClient.post('/complaints/create', complaintData);

            if (data.success) {
                if (data.complaint) {
                    setPopup({
                        open: true,
                        status: "success",
                        message: "Complaint Created Successfully",
                        description: `New Complaint #${data.complaint.complain_id} has been created and submitted`,
                        referenceLink: data.complaint.complain_id
                            ? `/complaints/${data.complaint.complain_id}`
                            : null
                    });
                }
            }
        } catch (error) {
            setPopup({
                open: true,
                status: "error",
                message: "Complaint Creation Failed",
                description: error.response?.data?.message || "Failed to create complaint",
                referenceLink: null
            });
        }
        finally {
            setCreatingComplaint(false);
        }
    };

    const handlePopupClose = useCallback(() => {
        setPopup({ ...popup, open: false });
        if (popup.status === "success") {
            handleClose();
        }
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
                okLabel={popup.status === "success" ? "OK" : "Close"}
            />
            {/* Modal */}
            {!popup.open && (

                <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl w-full h-fit max-h-[95vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-blue-800 text-white px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Add className="bg-white text-blue-800 rounded-full p-1" />
                            <h2 className="text-xl font-bold">Create New Complaint</h2>
                        </div>
                        <div
                            className="cursor-pointer flex hover:bg-blue-700 rounded-full p-1 transition-colors"
                            onClick={handleClose}
                        >
                            <Close />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="py-6 px-8 overflow-y-auto max-h-[calc(90vh-25px)]">
                        {submissionError && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-5 rounded">
                                <p>{submissionError}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column - Complainer Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <div className="flex items-center justify-center bg-blue-100 rounded-lg p-1.5">
                                        <Person fontSize="small" className="text-blue-700" />
                                    </div>
                                    Complainer Information
                                </h3>

                                {/* NIC */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        NIC Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nic"
                                        value={complainerDetails.nic}
                                        onChange={handleComplainerChange}
                                        placeholder="Enter NIC number"
                                        className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.nic ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {fieldErrors.nic && <p className="text-red-500 text-xs">{fieldErrors.nic}</p>}
                                </div>

                                {/* Name */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={complainerDetails.name}
                                        onChange={handleComplainerChange}
                                        placeholder="Enter full name"
                                        className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {fieldErrors.name && <p className="text-red-500 text-xs">{fieldErrors.name}</p>}
                                </div>

                                {/* Phone */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={complainerDetails.phone}
                                        onChange={handleComplainerChange}
                                        placeholder="0712345678"
                                        className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {fieldErrors.phone && <p className="text-red-500 text-xs">{fieldErrors.phone}</p>}
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={complainerDetails.email}
                                        onChange={handleComplainerChange}
                                        placeholder="Enter email address"
                                        className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {fieldErrors.email && <p className="text-red-500 text-xs">{fieldErrors.email}</p>}
                                </div>

                                {/* Address */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Address <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="address"
                                        rows={3}
                                        value={complainerDetails.address}
                                        onChange={handleComplainerChange}
                                        placeholder="Enter complete address"
                                        className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${fieldErrors.address ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {fieldErrors.address && <p className="text-red-500 text-xs">{fieldErrors.address}</p>}
                                </div>

                                {/* Date of Birth */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date of Birth <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={complainerDetails.dob}
                                        onChange={handleComplainerChange}
                                        max={new Date().toISOString().split('T')[0]} // Prevent future dates
                                        min={new Date(new Date().getFullYear() - 120, 0, 1).toISOString().split('T')[0]} // Max 120 years old
                                        className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.dob ? 'border-red-500' : 'border-gray-300'}`}
                                        required
                                    />
                                    {fieldErrors.dob && <p className="text-red-500 text-xs">{fieldErrors.dob}</p>}
                                </div>
                            </div>

                            {/* Right Column - Complaint Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <div className="flex items-center justify-center bg-blue-100 rounded-lg p-1.5">
                                        <Assignment fontSize="small" className="text-blue-700" />
                                    </div>
                                    Complaint Details
                                </h3>

                                {/* Complaint Type Combo Box */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Complaint Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="complaintType"
                                        value={complaintType}
                                        onChange={e => setComplaintType(e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.complaintType ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Select complaint type</option>
                                        {allCaseTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    {fieldErrors.complaintType && <p className="text-red-500 text-xs">{fieldErrors.complaintType}</p>}
                                </div>

                                {/* Complaint Description */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Complaint Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        rows={6}
                                        value={newComplaint.description}
                                        onChange={handleComplaintChange}
                                        placeholder="Enter detailed description of the complaint"
                                        className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${fieldErrors.description ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {fieldErrors.description && <p className="text-red-500 text-xs">{fieldErrors.description}</p>}
                                </div>

                                {/* Voice Statement Details */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Voice Statement Details <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="evidence_details"
                                        rows={4}
                                        value={newComplaint.evidence_details}
                                        onChange={handleComplaintChange}
                                        placeholder="Provide detailed information about the voice statement (minimum 10 characters)"
                                        className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${fieldErrors.evidence_details ? 'border-red-500' : 'border-gray-300'}`}
                                        maxLength={1000}
                                    />
                                    <div className="flex justify-between items-center">
                                        {fieldErrors.evidence_details && <p className="text-red-500 text-xs">{fieldErrors.evidence_details}</p>}
                                        <p className="text-xs text-gray-500 ml-auto">
                                            {newComplaint.evidence_details.length}/1000 characters
                                        </p>
                                    </div>
                                </div>

                                {/* Evidence Type Display */}
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        <strong>Evidence Type:</strong> Voice Statement
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        This complaint will be recorded as a voice statement evidence
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
                            <OutlinedButton
                                action={{
                                    icon: <Close fontSize="small" />,
                                    label: 'Cancel',
                                    onClick: handleClose,
                                    styles: 'border-gray-300 text-gray-700 hover:bg-gray-100 h-10 ',
                                }}
                            />
                            <OutlinedButton
                                action={{
                                    icon: <Send fontSize="small" />,
                                    label: creatingComplaint ? 'Submitting...' : 'Submit Complaint',
                                    ariaLabel: 'Submit Complaint',
                                    onClick: handleSubmitComplaint,
                                    styles: 'bg-blue-800 text-white hover:bg-blue-700 h-10',
                                    disabled: creatingComplaint
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateComplaintModal;
