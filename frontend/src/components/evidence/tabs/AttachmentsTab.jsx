import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { AttachFile, GetApp, Visibility, InsertDriveFile, Image, VideoLibrary, AudioFile, PictureAsPdf } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';

const AttachmentsTab = ({ evidence, formatDateTime }) => {
    const [attachmentPreview, setAttachmentPreview] = useState({
        open: false,
        file: null,
        fileType: '',
        fileName: ''
    });

    const getFileIcon = (fileType) => {
        if (fileType.startsWith('image/')) {
            return <Image className="text-blue-500" fontSize="large" />;
        } else if (fileType.startsWith('video/')) {
            return <VideoLibrary className="text-purple-500" fontSize="large" />;
        } else if (fileType.startsWith('audio/')) {
            return <AudioFile className="text-green-500" fontSize="large" />;
        } else if (fileType === 'application/pdf') {
            return <PictureAsPdf className="text-red-500" fontSize="large" />;
        } else {
            return <InsertDriveFile className="text-gray-500" fontSize="large" />;
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleAttachmentClick = (attachment) => {
        setAttachmentPreview({
            open: true,
            file: attachment,
            fileType: attachment.file_type,
            fileName: attachment.file_name
        });
    };

    const handleAttachmentPreviewClose = () => {
        setAttachmentPreview({ open: false, file: null, fileType: '', fileName: '' });
    };

    return (
        <div className="space-y-6">
            {evidence.attachments && evidence.attachments.length > 0 ? (
                <>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <AttachFile className="mr-2 text-blue-600" />
                            Evidence Attachments
                        </h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {evidence.attachments.length} file{evidence.attachments.length > 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {evidence.attachments.map((attachment) => (
                            <div
                                key={attachment.attachment_id}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="flex flex-col h-full">
                                    {/* File Icon and Type */}
                                    <div className="flex items-center justify-center h-16 mb-3">
                                        {getFileIcon(attachment.file_type)}
                                    </div>

                                    {/* File Details */}
                                    <div className="flex-1 space-y-2 mb-4">
                                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 min-h-[2.5rem]" title={attachment.file_name}>
                                            {attachment.file_name}
                                        </h4>

                                        <div className="space-y-1">
                                            <div className="text-xs text-gray-500 flex items-center justify-between">
                                                <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                                                    {attachment.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                                                </span>
                                                <span className="font-medium">
                                                    {formatFileSize(attachment.file_size)}
                                                </span>
                                            </div>

                                            <div className="text-xs text-gray-400">
                                                Uploaded: {formatDateTime(attachment.uploaded_dt)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleAttachmentClick(attachment)}
                                            className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
                                        >
                                            <Visibility fontSize="small" className="mr-1" />
                                            Preview
                                        </button>

                                        <a
                                            href={attachment.file_path} // Use direct URL
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-600 text-white text-xs font-medium rounded-md hover:bg-gray-700 transition-colors duration-200 no-underline"
                                        >
                                            <GetApp fontSize="small" className="mr-1" />
                                            Download
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center py-12">
                    <AttachFile className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No attachments found</h3>
                    <p className="text-gray-500">This evidence doesn't have any attached files.</p>
                </div>
            )}

            {/* Preview Modal */}
            <Dialog
                open={attachmentPreview.open}
                onClose={handleAttachmentPreviewClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    className: "rounded-lg"
                }}
            >
                <DialogTitle className="bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {attachmentPreview.file && getFileIcon(attachmentPreview.fileType)}
                            <div>
                                <h3 className="font-semibold text-gray-900">{attachmentPreview.fileName}</h3>
                                <p className="text-sm text-gray-500">{attachmentPreview.fileType}</p>
                            </div>
                        </div>
                        <IconButton
                            onClick={handleAttachmentPreviewClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <CloseIcon />
                        </IconButton>
                    </div>
                </DialogTitle>

                <DialogContent className="p-0">
                    {attachmentPreview.file && (
                        <div className="bg-gray-50 min-h-[400px] flex items-center justify-center">
                            {attachmentPreview.fileType.startsWith('image/') ? (
                                <img
                                    src={attachmentPreview.file.file_path} // Use direct URL
                                    alt={attachmentPreview.fileName}
                                    className="max-w-full max-h-[70vh] object-contain rounded"
                                />
                            ) : attachmentPreview.fileType === 'application/pdf' ? (
                                <iframe
                                    src={attachmentPreview.file.file_path} // Use direct URL
                                    title={attachmentPreview.fileName}
                                    width="100%"
                                    height="600px"
                                    className="border-0"
                                />
                            ) : (
                                <div className="text-center py-12">
                                    {getFileIcon(attachmentPreview.fileType)}
                                    <h4 className="mt-4 text-lg font-medium text-gray-900">{attachmentPreview.fileName}</h4>
                                    <p className="mt-2 text-gray-500 mb-4">Preview not available for this file type</p>
                                    <a
                                        href={attachmentPreview.file.file_path} // Use direct URL
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 no-underline"
                                    >
                                        <GetApp className="mr-2" fontSize="small" />
                                        Download File
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AttachmentsTab;
