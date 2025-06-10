import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import {
    AttachFile,
    GetApp,
    Visibility,
    InsertDriveFile,
    Image,
    VideoLibrary,
    AudioFile,
    PictureAsPdf,
    Close
} from '@mui/icons-material';

const AttachmentsTab = ({ evidence, formatDateTime }) => {
    const [attachmentPreview, setAttachmentPreview] = useState({
        open: false,
        file: null,
        fileType: '',
        fileName: ''
    });

    const getFileIcon = (fileType) => {
        if (fileType.startsWith('image/')) {
            return <Image className="text-blue-500" />;
        } else if (fileType.startsWith('video/')) {
            return <VideoLibrary className="text-purple-500" />;
        } else if (fileType.startsWith('audio/')) {
            return <AudioFile className="text-green-500" />;
        } else if (fileType === 'application/pdf') {
            return <PictureAsPdf className="text-red-500" />;
        } else {
            return <InsertDriveFile className="text-gray-500" />;
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
        <div className="space-y-4">
            {evidence.attachments && evidence.attachments.length > 0 ? (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                            <AttachFile className="mr-2 text-blue-600" fontSize="small" />
                            Attachments
                        </h3>
                        <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {evidence.attachments.length} file{evidence.attachments.length > 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {evidence.attachments.map((attachment) => (
                            <div
                                key={attachment.attachment_id}
                                className="bg-white border border-gray-200 rounded-md hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
                                onClick={() => handleAttachmentClick(attachment)}
                            >
                                <div className="p-3 flex flex-col items-center justify-center">
                                    <div className="h-10 flex items-center justify-center mb-2">
                                        {getFileIcon(attachment.file_type)}
                                    </div>

                                    <div className="w-full text-center">
                                        <div className="text-xs text-gray-900 font-medium line-clamp-1" title={attachment.file_name}>
                                            {attachment.file_name}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xxs uppercase">
                                                {attachment.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                                            </span>
                                            <span>{formatFileSize(attachment.file_size)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 border-t border-gray-200 grid grid-cols-2 divide-x divide-gray-200">
                                    <button
                                        className="py-1 text-xs text-blue-600 hover:bg-blue-50 flex items-center justify-center"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAttachmentClick(attachment);
                                        }}
                                    >
                                        <Visibility fontSize="small" className="mr-1" style={{ fontSize: '14px' }} />
                                        View
                                    </button>
                                    <a
                                        href={attachment.file_path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="py-1 text-xs text-gray-600 hover:bg-gray-100 flex items-center justify-center no-underline"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <GetApp fontSize="small" className="mr-1" style={{ fontSize: '14px' }} />
                                        Download
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center py-8">
                    <AttachFile className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                    <h3 className="text-md font-medium text-gray-700 mb-1">No attachments found</h3>
                    <p className="text-sm text-gray-500">This evidence doesn't have any attached files.</p>
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
                <DialogTitle className="bg-gray-50 border-b border-gray-200 py-2 px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {attachmentPreview.file && getFileIcon(attachmentPreview.fileType)}
                            <div>
                                <h3 className="font-medium text-gray-800 text-sm">{attachmentPreview.fileName}</h3>
                                <p className="text-xs text-gray-500">{attachmentPreview.fileType}</p>
                            </div>
                        </div>
                        <IconButton
                            onClick={handleAttachmentPreviewClose}
                            className="text-gray-500 hover:text-gray-700"
                            size="small"
                        >
                            <Close />
                        </IconButton>
                    </div>
                </DialogTitle>

                <DialogContent className="p-0">
                    {attachmentPreview.file && (
                        <div className="bg-gray-50 min-h-[400px] flex items-center justify-center">
                            {attachmentPreview.fileType.startsWith('image/') ? (
                                <img
                                    src={attachmentPreview.file.file_path}
                                    alt={attachmentPreview.fileName}
                                    className="max-w-full max-h-[70vh] object-contain rounded"
                                />
                            ) : attachmentPreview.fileType === 'application/pdf' ? (
                                <iframe
                                    src={attachmentPreview.file.file_path}
                                    title={attachmentPreview.fileName}
                                    width="100%"
                                    height="600px"
                                    className="border-0"
                                />
                            ) : (
                                <div className="text-center py-8">
                                    {getFileIcon(attachmentPreview.fileType)}
                                    <h4 className="mt-4 text-md font-medium text-gray-800">{attachmentPreview.fileName}</h4>
                                    <p className="mt-2 text-sm text-gray-500 mb-4">Preview not available for this file type</p>
                                    <a
                                        href={attachmentPreview.file.file_path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-2 bg-blue-600 text-sm text-white rounded-md hover:bg-blue-700 transition-colors duration-200 no-underline"
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
