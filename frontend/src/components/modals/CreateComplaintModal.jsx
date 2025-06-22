import React, { useState, useEffect, useCallback } from 'react';
import { Add, Close, Send, Person, Badge, Phone, LocationOn, CalendarToday, Description, Report, RecordVoiceOver } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import OutlinedButton from '../buttons/OutlinedButton';
import StatusPopup from '../common/StatusPopup';
import { caseTypes } from '../../../data';

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
    const [popup, setPopup] = useState({ open: false, status: "success", message: "", description: "", referenceLink: null });
    const [complaintType, setComplaintType] = useState('');

    // Reset form when modal opens
    useEffect(() => {
        if (open) resetForm();
    }, [open]);

    const resetForm = () => {
        setNewComplaint({
            description: '',
            evidence_details: '',
            evidence_type: 'Voice Statement',
        });
        setComplainerDetails({
            nic: '',
            name: '',
            phone: '',
            email: '',
            address: '',
            dob: '',
        });
        setComplaintType('');
        setFieldErrors({});
        setSubmissionError(null);
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
        if (fieldErrors[`complainer_${name}`]) {
            setFieldErrors(prev => ({ ...prev, [`complainer_${name}`]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};

        // Complaint validation
        if (!newComplaint.description.trim()) {
            errors.description = 'Complaint description is required';
        }
        if (!newComplaint.evidence_details.trim()) {
            errors.evidence_details = 'Voice statement details are required';
        }
        if (!complaintType) {
            errors.complaintType = 'Complaint type is required';
        }

        // Complainer validation
        if (!complainerDetails.name.trim()) {
            errors.complainer_name = 'Name is required';
        }
        if (!complainerDetails.nic.trim()) {
            errors.complainer_nic = 'NIC is required';
        } else if (!/^(\d{9}[vVxX]|\d{12})$/.test(complainerDetails.nic.trim())) {
            errors.complainer_nic = 'Invalid NIC format';
        }
        if (!complainerDetails.phone.trim()) {
            errors.complainer_phone = 'Phone is required';
        } else if (!/^0\d{9}$/.test(complainerDetails.phone.trim())) {
            errors.complainer_phone = 'Invalid phone format (must be 10 digits starting with 0)';
        }
        if (!complainerDetails.email.trim()) {
            errors.complainer_email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(complainerDetails.email.trim())) {
            errors.complainer_email = 'Invalid email format';
        }
        if (!complainerDetails.address.trim()) {
            errors.complainer_address = 'Address is required';
        }
        if (!complainerDetails.dob) {
            errors.complainer_dob = 'Date of birth is required';
        } else {
            const dobDate = new Date(complainerDetails.dob);
            const today = new Date();
            const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
            const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

            if (dobDate > today) {
                errors.complainer_dob = 'Date of birth cannot be in the future';
            } else if (dobDate < minDate) {
                errors.complainer_dob = 'Date of birth cannot be more than 120 years ago';
            } else if (dobDate > oneYearAgo) {
                errors.complainer_dob = 'Complainer must be at least 1 year old';
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitComplaint = async () => {
        if (!validateForm()) return;

        setCreatingComplaint(true);
        try {
            const complaintData = {
                description: newComplaint.description,
                evidence_details: newComplaint.evidence_details,
                complain_type: complaintType,
                complainer: complainerDetails
            };

            const { data } = await apiClient.post('/complaints/create', complaintData);

            if (data.success) {
                setPopup({
                    open: true,
                    status: "success",
                    message: "Complaint Created Successfully",
                    description: `New complaint #${data.complaint.complain_id} has been recorded.`,
                    referenceLink: `/complaints/${data.complaint.complain_id}`
                });
            } else {
                setPopup({
                    open: true,
                    status: "error",
                    message: "Creation Failed",
                    description: data.message || "Failed to create complaint"
                });
            }
        } catch (error) {
            setPopup({
                open: true,
                status: "error",
                message: "Creation Failed",
                description: error.response?.data?.message || "Failed to create complaint"
            });
        }
        setCreatingComplaint(false);
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
                <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl w-full h-fit max-w-4xl max-h-[95vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Report className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Create New Complaint</h2>
                                <p className="text-white/80 text-sm">File a new complaint with voice statement</p>
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
                            {/* Left Column - Complaint Information */}
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <Description className="mr-2 text-blue-600" />
                                        Complaint Information
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Complaint Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name='complaintType'
                                                value={complaintType}
                                                onChange={(e) => {
                                                    setComplaintType(e.target.value);
                                                    if (fieldErrors.complaintType) {
                                                        setFieldErrors(prev => ({ ...prev, complaintType: null }));
                                                    }
                                                }}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.complaintType ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            >
                                                <option value="">Select complaint type</option>
                                                {caseTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                            {fieldErrors.complaintType && <p className="text-red-500 text-xs mt-1">{fieldErrors.complaintType}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Complaint Description <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                name="description"
                                                value={newComplaint.description}
                                                onChange={handleComplaintChange}
                                                placeholder="Describe the incident or issue in detail..."
                                                rows={4}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${fieldErrors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.description && <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <RecordVoiceOver className="mr-2 text-blue-600" />
                                        Voice Statement
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Statement Details <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                name="evidence_details"
                                                value={newComplaint.evidence_details}
                                                onChange={handleComplaintChange}
                                                placeholder="Record the complainant's statement in detail..."
                                                rows={5}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${fieldErrors.evidence_details ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.evidence_details && <p className="text-red-500 text-xs mt-1">{fieldErrors.evidence_details}</p>}
                                            <p className="text-xs text-gray-500 mt-1">This will be recorded as voice statement evidence</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Complainant Information */}
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <Person className="mr-2 text-blue-600" />
                                        Complainant Details
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={complainerDetails.name}
                                                onChange={handleComplainerChange}
                                                placeholder="Enter full name"
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.complainer_name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.complainer_name && <p className="text-red-500 text-xs mt-1">{fieldErrors.complainer_name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Badge className="w-4 h-4 inline mr-1" />
                                                NIC Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="nic"
                                                value={complainerDetails.nic}
                                                onChange={handleComplainerChange}
                                                placeholder="123456789V or 199812345678"
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.complainer_nic ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.complainer_nic && <p className="text-red-500 text-xs mt-1">{fieldErrors.complainer_nic}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <CalendarToday className="w-4 h-4 inline mr-1" />
                                                Date of Birth <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                name="dob"
                                                value={complainerDetails.dob}
                                                onChange={handleComplainerChange}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.complainer_dob ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.complainer_dob && <p className="text-red-500 text-xs mt-1">{fieldErrors.complainer_dob}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Phone className="w-4 h-4 inline mr-1" />
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={complainerDetails.phone}
                                                onChange={handleComplainerChange}
                                                placeholder="0771234567"
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.complainer_phone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.complainer_phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.complainer_phone}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={complainerDetails.email}
                                                onChange={handleComplainerChange}
                                                placeholder="example@email.com"
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.complainer_email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.complainer_email && <p className="text-red-500 text-xs mt-1">{fieldErrors.complainer_email}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <LocationOn className="w-4 h-4 inline mr-1" />
                                                Address <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                name="address"
                                                value={complainerDetails.address}
                                                onChange={handleComplainerChange}
                                                placeholder="Enter full address"
                                                rows={3}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${fieldErrors.complainer_address ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.complainer_address && <p className="text-red-500 text-xs mt-1">{fieldErrors.complainer_address}</p>}
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
                                    label: creatingComplaint ? 'Creating...' : 'Submit Complaint',
                                    ariaLabel: 'Submit Complaint',
                                    onClick: handleSubmitComplaint,
                                    styles: 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 h-11 px-6 shadow-lg',
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
