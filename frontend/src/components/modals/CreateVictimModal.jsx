import React, { useState, useCallback } from 'react';
import { PersonAdd, Close, Save, Person, Badge, Phone, LocationOn, CalendarToday } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import OutlinedButton from '../buttons/OutlinedButton';
import StatusPopup from '../common/StatusPopup';

const CreateVictimModal = ({ open, onClose, offenceId, canCreate = false }) => {
    const [creating, setCreating] = useState(false);
    const [victimData, setVictimData] = useState({
        name: '',
        nic: '',
        phone: '',
        address: '',
        dob: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [popup, setPopup] = useState({ open: false, status: "success", message: "", description: "" });

    const resetForm = () => {
        setVictimData({
            name: '',
            nic: '',
            phone: '',
            address: '',
            dob: ''
        });
        setFieldErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setVictimData(prev => ({
            ...prev,
            [name]: value
        }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!victimData.name.trim()) {
            errors.name = 'Name is required';
        }
        if (!victimData.nic.trim()) {
            errors.nic = 'NIC is required';
        } else if (!/^[0-9]{9}[vVxX]$|^[0-9]{12}$/.test(victimData.nic.trim())) {
            errors.nic = 'Invalid NIC format';
        }

        if (victimData.phone && !/^[0-9+\-\s()]{7,15}$/.test(victimData.phone.trim())) {
            errors.phone = 'Invalid phone number format';
        }

        if (victimData.dob) {
            const birthDate = new Date(victimData.dob);
            const today = new Date();
            if (birthDate > today) {
                errors.dob = 'Date of birth cannot be in the future';
            }
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age > 150) {
                errors.dob = 'Please enter a valid date of birth';
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setCreating(true);
        try {
            const payload = {
                offence_id: offenceId,
                name: victimData.name.trim(),
                nic: victimData.nic.trim(),
                phone: victimData.phone.trim() || null,
                address: victimData.address.trim() || null,
                dob: victimData.dob || null
            };

            const response = await apiClient.post('/crimeoffences/addVictim', payload);

            if (response.data.success) {
                setPopup({
                    open: true,
                    status: "success",
                    message: "Victim Added Successfully",
                    description: `${victimData.name} has been added to this offence.`
                });
                resetForm();
            } else {
                throw new Error(response.data.message || 'Failed to add victim');
            }
        } catch (error) {
            setPopup({
                open: true,
                status: "error",
                message: "Failed to Add Victim",
                description: error.response?.data?.message || error.message || "An error occurred while adding the victim"
            });
        }
        setCreating(false);
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
                        <p className="text-gray-600 mt-2">You don't have permission to add victims.</p>
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

            {!popup.open && (
                <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-5 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <PersonAdd className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Add Victim</h2>
                                <p className="text-white/80 text-sm">Add victim information to this offence</p>
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
                        <div className="space-y-4">
                            {/* Personal Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Person className="w-4 h-4 inline mr-1" />
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={victimData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter full name"
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${fieldErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                    />
                                    {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Badge className="w-4 h-4 inline mr-1" />
                                        NIC Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nic"
                                        value={victimData.nic}
                                        onChange={handleInputChange}
                                        placeholder="000000000V or 000000000000"
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${fieldErrors.nic ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                    />
                                    {fieldErrors.nic && <p className="text-red-500 text-xs mt-1">{fieldErrors.nic}</p>}
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Phone className="w-4 h-4 inline mr-1" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={victimData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+94XXXXXXXXX"
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${fieldErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                    />
                                    {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <CalendarToday className="w-4 h-4 inline mr-1" />
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={victimData.dob}
                                        onChange={handleInputChange}
                                        max={new Date().toISOString().split('T')[0]}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${fieldErrors.dob ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                    />
                                    {fieldErrors.dob && <p className="text-red-500 text-xs mt-1">{fieldErrors.dob}</p>}
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <LocationOn className="w-4 h-4 inline mr-1" />
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    value={victimData.address}
                                    onChange={handleInputChange}
                                    placeholder="Enter full address"
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
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
                                    label: creating ? 'Adding...' : 'Add Victim',
                                    onClick: handleSubmit,
                                    styles: 'bg-gradient-to-r from-red-600 to-red-800 text-white hover:from-red-700 hover:to-red-900 h-11 px-6 shadow-lg',
                                    disabled: creating
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateVictimModal;
