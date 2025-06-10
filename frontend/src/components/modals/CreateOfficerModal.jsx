import React, { useState, useCallback } from 'react';
import { Add, Close, Send, Person, AccountCircle, CloudUpload, Delete } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import OutlinedButton from '../buttons/OutlinedButton';
import StatusPopup from '../common/StatusPopup';

const CreateOfficerModal = ({
    open,
    onClose,
    canCreate = false
}) => {
    const [creatingOfficer, setCreatingOfficer] = useState(false);
    const [newOfficer, setNewOfficer] = useState({
        name: '',
        nic: '',
        phone: '',
        email: '',
        address: '',
        role: 'Police Constable',
        username: '',
        password: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [fileError, setFileError] = useState('');
    const [popup, setPopup] = useState({
        open: false,
        status: "success",
        message: "",
        description: "",
        referenceLink: null
    });

    const roleOptions = [
        'Police Constable',
        'Sergeant',
        'Sub Inspector',
        'Inspector',
        'Crime OIC',
        'Forensic Officer',
        'Forensic Leader'
    ];

    const resetForm = () => {
        setNewOfficer({
            name: '',
            nic: '',
            phone: '',
            email: '',
            address: '',
            role: 'Police Constable',
            username: '',
            password: ''
        });
        setSelectedFile(null);
        setFieldErrors({});
        setFileError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleOfficerChange = (e) => {
        const { name, value } = e.target;
        setNewOfficer(prev => ({
            ...prev,
            [name]: value
        }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            setFileError('Only JPEG, JPG, and PNG images are allowed');
            return;
        }

        // Validate file size
        if (file.size > maxSize) {
            setFileError('File size must be less than 10MB');
            return;
        }

        setSelectedFile(file);
        setFileError('');
        event.target.value = ''; // Reset input
    };

    const removeFile = () => {
        setSelectedFile(null);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const validateForm = () => {
        const errors = {};

        if (!newOfficer.name.trim()) {
            errors.name = 'Name is required';
        }
        if (!newOfficer.nic.trim()) {
            errors.nic = 'NIC is required';
        } else if (!/^(?:\d{9}[vVxX]|\d{12})$/.test(newOfficer.nic.trim())) {
            errors.nic = 'Invalid NIC format';
        }
        if (!newOfficer.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(newOfficer.phone.trim())) {
            errors.phone = 'Phone number must be 10 digits';
        }
        if (!newOfficer.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newOfficer.email.trim())) {
            errors.email = 'Invalid email format';
        }
        if (!newOfficer.address.trim()) {
            errors.address = 'Address is required';
        }
        if (!newOfficer.username.trim()) {
            errors.username = 'Username is required';
        } else if (newOfficer.username.trim().length < 3) {
            errors.username = 'Username must be at least 3 characters';
        }
        if (!newOfficer.password.trim()) {
            errors.password = 'Password is required';
        } else if (newOfficer.password.trim().length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitOfficer = async () => {
        if (!validateForm()) return;

        setCreatingOfficer(true);
        try {
            // Use FormData to handle file upload (same pattern as evidence creation)
            const formData = new FormData();
            formData.append('name', newOfficer.name.trim());
            formData.append('nic', newOfficer.nic.trim());
            formData.append('phone', newOfficer.phone.trim());
            formData.append('email', newOfficer.email.trim());
            formData.append('address', newOfficer.address.trim());
            formData.append('role', newOfficer.role);
            formData.append('username', newOfficer.username.trim());
            formData.append('password', newOfficer.password.trim());

            // Add profile picture if selected (same pattern as evidence attachments)
            if (selectedFile) {
                formData.append('profile_pic', selectedFile);
            }

            console.log('Submitting officer with data:', {
                name: newOfficer.name.trim(),
                role: newOfficer.role,
                hasProfilePic: !!selectedFile
            });

            const response = await apiClient.post('/officers/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setPopup({
                    open: true,
                    status: "success",
                    message: "Officer Created Successfully",
                    description: `New officer ${response.data.officer.name} (ID: ${response.data.officer.user_id}) has been created.`,
                    referenceLink: `/officers/${response.data.officer.user_id}`
                });
                resetForm();
            } else {
                throw new Error(response.data.message || 'Failed to create officer');
            }
        } catch (error) {
            console.error('Error creating officer:', error);
            setPopup({
                open: true,
                status: "error",
                message: "Creation Failed",
                description: error.response?.data?.message || "Failed to create officer"
            });
        }
        setCreatingOfficer(false);
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
                        <p className="text-gray-600 mt-2">Only OIC can create new officers.</p>
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
                <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl w-full h-fit max-w-4xl max-h-[95vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Person className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Create New Officer</h2>
                                <p className="text-white/80 text-sm">Add a new police officer to the system</p>
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
                            {/* Left Column - Personal Details */}
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <AccountCircle className="mr-2 text-blue-600" />
                                        Personal Information
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={newOfficer.name}
                                                onChange={handleOfficerChange}
                                                placeholder="Enter full name"
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    NIC <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="nic"
                                                    value={newOfficer.nic}
                                                    onChange={handleOfficerChange}
                                                    placeholder="123456789V or 123456789012"
                                                    className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.nic ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                                />
                                                {fieldErrors.nic && <p className="text-red-500 text-xs mt-1">{fieldErrors.nic}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Phone Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={newOfficer.phone}
                                                    onChange={handleOfficerChange}
                                                    placeholder="0771234567"
                                                    className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                                />
                                                {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={newOfficer.email}
                                                onChange={handleOfficerChange}
                                                placeholder="officer@police.lk"
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Address <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                name="address"
                                                value={newOfficer.address}
                                                onChange={handleOfficerChange}
                                                placeholder="Enter full address"
                                                rows={3}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${fieldErrors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.address && <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Role <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="role"
                                                value={newOfficer.role}
                                                onChange={handleOfficerChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            >
                                                {roleOptions.map(role => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Login Details & Profile Picture */}
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <Person className="mr-2 text-blue-600" />
                                        Login Credentials
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Username <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="username"
                                                value={newOfficer.username}
                                                onChange={handleOfficerChange}
                                                placeholder="Enter username"
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.username && <p className="text-red-500 text-xs mt-1">{fieldErrors.username}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Password <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={newOfficer.password}
                                                onChange={handleOfficerChange}
                                                placeholder="Enter password"
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Picture Section */}
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <CloudUpload className="mr-2 text-blue-600" />
                                        Profile Picture
                                    </h3>

                                    <div className="space-y-4">
                                        {/* File Upload Area */}
                                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-white">
                                            <CloudUpload className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                                            <label htmlFor="profile-upload" className="cursor-pointer">
                                                <span className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                                    Click to upload profile picture
                                                </span>
                                                <input
                                                    id="profile-upload"
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png"
                                                    onChange={handleFileSelect}
                                                    className="hidden"
                                                />
                                            </label>
                                            <p className="text-xs text-gray-500 mt-2">
                                                JPEG, JPG, PNG only (Max 10MB)
                                            </p>
                                        </div>

                                        {/* Error Display */}
                                        {fileError && (
                                            <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                                                {fileError}
                                            </div>
                                        )}

                                        {/* Selected File Display */}
                                        {selectedFile && (
                                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center flex-1 min-w-0">
                                                        <span className="text-lg mr-2">🖼️</span>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                                {selectedFile.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {formatFileSize(selectedFile.size)} • {selectedFile.type}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={removeFile}
                                                        className="ml-2 text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100"
                                                    >
                                                        <Delete fontSize="small" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
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
                                    label: creatingOfficer ? 'Creating...' : 'Create Officer',
                                    ariaLabel: 'Create Officer',
                                    onClick: handleSubmitOfficer,
                                    styles: 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 h-11 px-6 shadow-lg',
                                    disabled: creatingOfficer
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateOfficerModal;
