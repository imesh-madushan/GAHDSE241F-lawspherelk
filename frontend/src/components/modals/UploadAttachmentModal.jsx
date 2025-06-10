import React, { useState, useCallback } from 'react';
import { Close, CloudUpload, CheckCircleOutline, ErrorOutline, AttachFile, Description } from '@mui/icons-material';
import OutlinedButton from '../buttons/OutlinedButton';
import StatusPopup from '../common/StatusPopup';
import { apiClient } from '../../config/apiConfig';

const UploadAttachmentModal = ({ open, onClose, evidenceId, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [popup, setPopup] = useState({ open: false, status: "success", message: "", description: "" });

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // Validate file size (50MB limit)
            if (selectedFile.size > 50 * 1024 * 1024) {
                setError('File size must be less than 50MB');
                return;
            }

            setFile(selectedFile);
            setError(null);
        }
    };

    const handleClose = () => {
        setFile(null);
        setError(null);
        onClose();
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const validateForm = () => {
        if (!file) {
            setError("Please select a file to upload");
            return false;
        }
        return true;
    };

    const handleUpload = async () => {
        if (!validateForm()) return;

        setIsUploading(true);
        setError(null);

        // Create form data for upload (same pattern as CreateEvidenceModal)
        const formData = new FormData();
        formData.append('file', file);
        formData.append('evidence_id', evidenceId);

        try {
            const response = await apiClient.post('/evidences/attachments/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setPopup({
                    open: true,
                    status: "success",
                    message: "File Uploaded Successfully",
                    description: `${file.name} has been attached to evidence #${evidenceId}.`
                });
            } else {
                setPopup({
                    open: true,
                    status: "error",
                    message: "Upload Failed",
                    description: response.data.message || "Failed to upload file. Please try again."
                });
            }
        } catch (error) {
            console.error('Upload failed:', error);
            setPopup({
                open: true,
                status: "error",
                message: "Upload Failed",
                description: error.response?.data?.message || "An error occurred while uploading the file"
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handlePopupClose = useCallback(() => {
        setPopup({ ...popup, open: false });
        if (popup.status === "success") {
            onSuccess && onSuccess();
            handleClose();
        }
    }, [popup, onSuccess, handleClose]);

    const resetFile = () => {
        setFile(null);
        setError(null);
    };

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
                onClose={handlePopupClose}
                okLabel={popup.status === "success" ? "OK" : "Close"}
            />

            {/* Modal */}
            {!popup.open && (
                <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl w-full h-fit max-w-2xl max-h-[95vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <AttachFile className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Upload Attachment</h2>
                                <p className="text-white/80 text-sm">Add a file attachment to evidence #{evidenceId}</p>
                            </div>
                        </div>
                        <button
                            className="hover:bg-white/10 rounded-full p-2 transition-colors"
                            onClick={handleClose}
                            disabled={isUploading}
                        >
                            <Close />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-6 rounded-lg flex items-center">
                                <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center mr-3">
                                    <span className="text-red-600 text-xs font-bold">!</span>
                                </div>
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* File Upload Section */}
                            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                    <CloudUpload className="mr-2 text-blue-600" />
                                    Select File
                                </h3>

                                <div
                                    className={`border-2 border-dashed rounded-xl p-8 transition-all ${file
                                        ? 'border-blue-400 bg-blue-50'
                                        : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        id="attachment-file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.xlsx,.ppt,.pptx"
                                    />

                                    {file ? (
                                        <div className="text-center">
                                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mx-auto mb-4">
                                                <Description className="text-blue-600 text-2xl" />
                                            </div>
                                            <h4 className="font-semibold text-gray-800 mb-2">{file.name}</h4>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Size: {formatFileSize(file.size)}
                                            </p>

                                            <button
                                                type="button"
                                                onClick={resetFile}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                                disabled={isUploading}
                                            >
                                                Choose a different file
                                            </button>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="attachment-file"
                                            className="cursor-pointer flex flex-col items-center"
                                        >
                                            <CloudUpload className="text-gray-400 text-5xl mb-4" />
                                            <h4 className="font-semibold text-gray-700 mb-2">
                                                Drop files here or click to browse
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                Maximum file size: 50MB
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                Supported formats: Images, Videos, Audio, Documents
                                            </p>
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* File Info */}
                            {file && (
                                <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-4 border border-green-200">
                                    <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                                        <CheckCircleOutline className="mr-2 text-green-600" />
                                        Ready to Upload
                                    </h3>
                                    <div className="text-sm text-green-800">
                                        <div className="flex items-start">
                                            <div className="w-2 h-2 rounded-full bg-green-600 mr-2 mt-1.5"></div>
                                            <span>File will be securely attached to evidence #{evidenceId}</span>
                                        </div>
                                        <div className="flex items-start mt-1">
                                            <div className="w-2 h-2 rounded-full bg-green-600 mr-2 mt-1.5"></div>
                                            <span>You can view and download this file later from the attachments tab</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                            <OutlinedButton
                                action={{
                                    icon: <Close fontSize="small" />,
                                    label: "Cancel",
                                    onClick: handleClose,
                                    styles: "border-gray-300 text-gray-700 hover:bg-gray-100 h-11 px-6",
                                    disabled: isUploading
                                }}
                            />
                            <OutlinedButton
                                action={{
                                    icon: <CloudUpload fontSize="small" />,
                                    label: isUploading ? "Uploading..." : "Upload File",
                                    onClick: handleUpload,
                                    styles: "bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 h-11 px-6 shadow-lg",
                                    disabled: !file || isUploading
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadAttachmentModal;
