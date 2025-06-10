import React, { useState, useCallback, useRef } from 'react';
import { Add, Close, Send, Person, Badge, Phone, LocationOn, CalendarToday, Fingerprint, CameraAlt, CloudUpload } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import OutlinedButton from '../buttons/OutlinedButton';
import StatusPopup from '../common/StatusPopup';

const CreateCriminalModal = ({ open, onClose, onCriminalCreated }) => {
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        name: '',
        nic: '',
        phone: '',
        address: '',
        dob: '',
        fingerprint_hash: ''
    });
    const [profileImage, setProfileImage] = useState(null);
    const [profilePreview, setProfilePreview] = useState('');
    const fileInputRef = useRef(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [popup, setPopup] = useState({ open: false, status: "success", message: "", description: "", referenceLink: null });

    // Reset form when modal opens
    React.useEffect(() => {
        if (open) resetForm();
    }, [open]);

    const resetForm = () => {
        setForm({
            name: '',
            nic: '',
            phone: '',
            address: '',
            dob: '',
            fingerprint_hash: ''
        });
        setProfileImage(null);
        setProfilePreview('');
        setFieldErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Only accept images
            if (!file.type.startsWith('image/')) {
                setFieldErrors(prev => ({
                    ...prev,
                    profileImage: 'Please select an image file (JPEG, PNG, etc.)'
                }));
                return;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setFieldErrors(prev => ({
                    ...prev,
                    profileImage: 'Image size must be less than 5MB'
                }));
                return;
            }

            setProfileImage(file);
            setProfilePreview(URL.createObjectURL(file));
            setFieldErrors(prev => ({ ...prev, profileImage: null }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!form.name || !form.name.trim()) errors.name = 'Name is required';
        if (!form.nic || !form.nic.trim()) errors.nic = 'NIC is required';
        if (!form.phone || !form.phone.trim()) errors.phone = 'Phone is required';
        if (!form.address || !form.address.trim()) errors.address = 'Address is required';
        if (!form.dob) errors.dob = 'Date of birth is required';

        // Validate NIC format
        if (form.nic && form.nic.trim()) {
            const nicPattern = /^(\d{9}[vVxX]|\d{12})$/;
            if (!nicPattern.test(form.nic.trim())) {
                errors.nic = 'Invalid NIC format';
            }
        }

        // Validate phone format
        if (form.phone && form.phone.trim()) {
            const phonePattern = /^0\d{9}$/;
            if (!phonePattern.test(form.phone.trim())) {
                errors.phone = 'Invalid phone number format (must be 10 digits starting with 0)';
            }
        }

        // Validate date of birth
        if (form.dob) {
            const dobDate = new Date(form.dob);
            const today = new Date();
            const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
            const minAge = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());

            if (dobDate > today) {
                errors.dob = 'Date of birth cannot be in the future';
            } else if (dobDate < minDate) {
                errors.dob = 'Date of birth cannot be more than 120 years ago';
            } else if (dobDate > minAge) {
                errors.dob = 'Person must be at least 12 years old';
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setCreating(true);
        try {
            // Create FormData object for file upload - same as CreateEvidenceModal
            const formData = new FormData();

            // Add all form fields - same pattern as evidence
            Object.keys(form).forEach(key => {
                formData.append(key, form[key]);
            });

            // Add profile image if exists - same field name pattern as evidence files
            if (profileImage) {
                formData.append('profileImage', profileImage);
            }

            const { data } = await apiClient.post('/criminals/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (data.criminal) {
                setPopup({
                    open: true,
                    status: "success",
                    message: "Criminal Record Created Successfully",
                    description: `New criminal record for ${data.criminal.name} has been created.`,
                    referenceLink: `/criminals/${data.criminal.criminal_id}`
                });
                if (onCriminalCreated) {
                    onCriminalCreated(data.criminal);
                }
            } else {
                setPopup({
                    open: true,
                    status: "error",
                    message: "Creation Failed",
                    description: data.message || "Failed to create criminal record"
                });
            }
        } catch (error) {
            setPopup({
                open: true,
                status: "error",
                message: "Creation Failed",
                description: error.response?.data?.message || "Failed to create criminal record"
            });
        }
        setCreating(false);
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
                                <Person className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Create Criminal Record</h2>
                                <p className="text-white/80 text-sm">Add a new criminal to the database</p>
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
                            {/* Left Column - Personal Information */}
                            <div className="space-y-6">
                                {/* Profile Image Upload */}
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <CameraAlt className="mr-2 text-blue-600" />
                                        Profile Image
                                    </h3>

                                    <div className="flex flex-col items-center">
                                        <div
                                            className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-white overflow-hidden mb-4 relative hover:border-blue-500 transition-colors cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {profilePreview ? (
                                                <img
                                                    src={profilePreview}
                                                    alt="Profile preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-center p-4">
                                                    <CloudUpload className="text-gray-400 text-3xl mb-2" />
                                                    <p className="text-xs text-gray-500">Click to upload</p>
                                                </div>
                                            )}

                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </div>

                                        {profilePreview && (
                                            <button
                                                onClick={() => {
                                                    setProfileImage(null);
                                                    setProfilePreview('');
                                                }}
                                                className="text-xs text-red-500 hover:text-red-700 mb-2"
                                            >
                                                Remove image
                                            </button>
                                        )}

                                        <p className="text-xs text-gray-500 text-center">
                                            Upload a clear photo. JPG or PNG format, max 5MB.
                                        </p>

                                        {fieldErrors.profileImage && (
                                            <p className="text-red-500 text-xs mt-1">{fieldErrors.profileImage}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <Person className="mr-2 text-blue-600" />
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
                                                value={form.name}
                                                onChange={handleChange}
                                                placeholder="Enter full name"
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
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
                                                value={form.nic}
                                                onChange={handleChange}
                                                placeholder="123456789V or 199812345678"
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.nic ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.nic && <p className="text-red-500 text-xs mt-1">{fieldErrors.nic}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <CalendarToday className="w-4 h-4 inline mr-1" />
                                                Date of Birth <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                name="dob"
                                                value={form.dob}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.dob ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.dob && <p className="text-red-500 text-xs mt-1">{fieldErrors.dob}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Contact & Additional Information */}
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <Phone className="mr-2 text-blue-600" />
                                        Contact Information
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={form.phone}
                                                onChange={handleChange}
                                                placeholder="0771234567"
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <LocationOn className="w-4 h-4 inline mr-1" />
                                                Address <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                name="address"
                                                value={form.address}
                                                onChange={handleChange}
                                                placeholder="Enter full address"
                                                rows={3}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${fieldErrors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.address && <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <Fingerprint className="mr-2 text-blue-600" />
                                        Biometric Data
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Fingerprint Hash
                                            </label>
                                            <input
                                                type="text"
                                                name="fingerprint_hash"
                                                value={form.fingerprint_hash}
                                                onChange={handleChange}
                                                placeholder="Optional fingerprint hash"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            />
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
                                    label: creating ? 'Creating...' : 'Create Criminal Record',
                                    ariaLabel: 'Create Criminal Record',
                                    onClick: handleSubmit,
                                    styles: 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 h-11 px-6 shadow-lg',
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

export default CreateCriminalModal;
