import React, { useState } from 'react';
import { Dialog, DialogContent, IconButton, Chip } from '@mui/material';
import {
    AttachFile,
    GetApp,
    Visibility,
    InsertDriveFile,
    Image,
    VideoLibrary,
    AudioFile,
    PictureAsPdf,
    Close,
    Description,
    Movie,
    MusicNote,
    FolderZip,
    Article,
    FilePresent,
    PlayArrow,
    Download,
    ZoomIn,
    Fullscreen,
    FullscreenExit,
    TableChart,
    Slideshow
} from '@mui/icons-material';

const AttachmentsTab = ({ evidence, formatDateTime }) => {
    const [attachmentPreview, setAttachmentPreview] = useState({
        open: false,
        file: null,
        fileType: '',
        fileName: ''
    });
    const [isFullscreen, setIsFullscreen] = useState(false);

    const getFileIcon = (fileType, size = 'default') => {
        const iconSize = size === 'large' ? 'text-2xl' : size === 'small' ? 'text-sm' : 'text-lg';

        if (fileType.startsWith('image/')) {
            return <Image className={`text-gray-600 ${iconSize}`} />;
        } else if (fileType.startsWith('video/')) {
            return <VideoLibrary className={`text-purple-500 ${iconSize}`} />;
        } else if (fileType.startsWith('audio/')) {
            return <AudioFile className={`text-green-500 ${iconSize}`} />;
        } else if (fileType === 'application/pdf') {
            return <PictureAsPdf className={`text-red-500 ${iconSize}`} />;
        } else if (fileType.includes('document') || fileType.includes('word') || fileType.includes('msword') ||
            fileType.includes('wordprocessingml') || fileType.includes('vnd.openxmlformats-officedocument.wordprocessingml')) {
            return <Description className={`text-gray-600 ${iconSize}`} />;
        } else if (fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('spreadsheetml') ||
            fileType.includes('vnd.openxmlformats-officedocument.spreadsheetml')) {
            return <TableChart className={`text-green-600 ${iconSize}`} />;
        } else if (fileType.includes('presentation') || fileType.includes('powerpoint') || fileType.includes('presentationml') ||
            fileType.includes('vnd.openxmlformats-officedocument.presentationml')) {
            return <Slideshow className={`text-orange-600 ${iconSize}`} />;
        } else if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) {
            return <FolderZip className={`text-orange-500 ${iconSize}`} />;
        } else if (fileType.includes('text')) {
            return <Article className={`text-gray-600 ${iconSize}`} />;
        } else {
            return <InsertDriveFile className={`text-gray-500 ${iconSize}`} />;
        }
    };

    const getFileTypeColor = (fileType) => {
        if (fileType.startsWith('image/')) return 'bg-gray-100 text-gray-800';
        if (fileType.startsWith('video/')) return 'bg-purple-100 text-purple-800';
        if (fileType.startsWith('audio/')) return 'bg-green-100 text-green-800';
        if (fileType === 'application/pdf') return 'bg-red-100 text-red-800';
        if (fileType.includes('document') || fileType.includes('word') || fileType.includes('wordprocessingml')) return 'bg-indigo-100 text-indigo-800';
        if (fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('spreadsheetml')) return 'bg-emerald-100 text-emerald-800';
        if (fileType.includes('presentation') || fileType.includes('presentationml')) return 'bg-amber-100 text-amber-800';
        return 'bg-gray-100 text-gray-800';
    };

    // Add function to get user-friendly file type display
    const getDisplayFileType = (fileType) => {
        const lowerType = fileType.toLowerCase();

        if (lowerType.includes('wordprocessingml') || lowerType.includes('msword')) {
            return 'DOCX';
        } else if (lowerType.includes('spreadsheetml') || lowerType.includes('excel')) {
            return 'XLSX';
        } else if (lowerType.includes('presentationml') || lowerType.includes('powerpoint')) {
            return 'PPTX';
        } else if (lowerType === 'application/pdf') {
            return 'PDF';
        } else if (lowerType.startsWith('image/')) {
            return fileType.split('/')[1]?.toUpperCase() || 'IMG';
        } else if (lowerType.startsWith('video/')) {
            return fileType.split('/')[1]?.toUpperCase() || 'VIDEO';
        } else if (lowerType.startsWith('audio/')) {
            return fileType.split('/')[1]?.toUpperCase() || 'AUDIO';
        } else if (lowerType.includes('text')) {
            return 'TXT';
        } else if (lowerType.includes('zip')) {
            return 'ZIP';
        } else {
            // Fallback to last part after slash or first 4 characters
            return fileType.split('/')[1]?.toUpperCase().substring(0, 4) || 'FILE';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
        setIsFullscreen(false);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const canPreview = (fileType) => {
        const lowerType = fileType.toLowerCase();
        return fileType.startsWith('image/') ||
            fileType.startsWith('video/') ||
            fileType.startsWith('audio/') ||
            fileType === 'application/pdf' ||
            lowerType.includes('document') ||
            lowerType.includes('word') ||
            lowerType.includes('wordprocessingml') ||
            lowerType.includes('sheet') ||
            lowerType.includes('excel') ||
            lowerType.includes('spreadsheetml') ||
            lowerType.includes('presentation') ||
            lowerType.includes('powerpoint') ||
            lowerType.includes('presentationml') ||
            lowerType.includes('text');
    };

    const getPreviewUrl = (file) => {
        const { file_path, file_type } = file;
        const lowerType = file_type.toLowerCase();

        // For documents, we can use Google Docs Viewer or Office Online
        if (lowerType.includes('document') || lowerType.includes('word') || lowerType.includes('wordprocessingml') ||
            lowerType.includes('sheet') || lowerType.includes('excel') || lowerType.includes('spreadsheetml') ||
            lowerType.includes('presentation') || lowerType.includes('powerpoint') || lowerType.includes('presentationml')) {
            return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file_path)}`;
        }

        return file_path;
    };

    return (
        <div className="space-y-4">
            {evidence.attachments && evidence.attachments.length > 0 ? (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                            <AttachFile className="mr-2 text-gray-600" fontSize="small" />
                            File Attachments
                        </h3>
                        <Chip
                            label={`${evidence.attachments.length} file${evidence.attachments.length > 1 ? 's' : ''}`}
                            size="small"
                            className="bg-gray-100 text-gray-700 font-medium"
                        />
                    </div>

                    {/* Table View */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            File
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Size
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Uploaded
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {evidence.attachments.map((attachment) => (
                                        <tr key={attachment.attachment_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        {attachment.file_type.startsWith('image/') ? (
                                                            <div className="relative">
                                                                <img
                                                                    src={attachment.file_path}
                                                                    alt={attachment.file_name}
                                                                    className="w-10 h-10 object-cover rounded border"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'flex';
                                                                    }}
                                                                />
                                                                <div style={{ display: 'none' }} className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded border">
                                                                    {getFileIcon(attachment.file_type, 'small')}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded border">
                                                                {getFileIcon(attachment.file_type, 'small')}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate" title={attachment.file_name}>
                                                            {attachment.file_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {attachment.attachment_id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Chip
                                                    label={getDisplayFileType(attachment.file_type)}
                                                    size="small"
                                                    className={`text-xs font-medium ${getFileTypeColor(attachment.file_type)}`}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-gray-900 font-medium">
                                                    {formatFileSize(attachment.file_size)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm text-gray-900">
                                                    {formatDateTime(attachment.uploaded_dt).split(' • ')[0]}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {formatDateTime(attachment.uploaded_dt).split(' • ')[1]}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center space-x-2">
                                                    {canPreview(attachment.file_type) ? (
                                                        <button
                                                            onClick={() => handleAttachmentClick(attachment)}
                                                            className="inline-flex items-center px-2 py-1 bg-gray-700 text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors"
                                                            title="Preview"
                                                        >
                                                            <Visibility fontSize="small" className="mr-1" style={{ fontSize: '14px' }} />
                                                            Preview
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded cursor-not-allowed"
                                                            disabled
                                                            title="Preview not available"
                                                        >
                                                            <Visibility fontSize="small" className="mr-1" style={{ fontSize: '14px' }} />
                                                            Preview
                                                        </button>
                                                    )}

                                                    <a
                                                        href={attachment.file_path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-2 py-1 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700 transition-colors no-underline"
                                                        title="Download"
                                                    >
                                                        <Download fontSize="small" className="mr-1" style={{ fontSize: '14px' }} />
                                                        Download
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-16">
                    <div className="bg-gray-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                        <AttachFile className="text-gray-400 text-3xl" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No attachments found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        This evidence doesn't have any attached files. Files can be uploaded to provide additional documentation and media evidence.
                    </p>
                </div>
            )}

            {/* Enhanced Preview Modal */}
            <Dialog
                open={attachmentPreview.open}
                onClose={handleAttachmentPreviewClose}
                maxWidth={isFullscreen ? false : "lg"}
                fullWidth={!isFullscreen}
                fullScreen={isFullscreen}
                PaperProps={{
                    className: isFullscreen ? "" : "rounded-xl overflow-hidden"
                }}
            >
                {/* Modal Header */}
                <div className="bg-gray-100 border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white p-1.5 rounded-lg shadow-sm">
                                {attachmentPreview.file && getFileIcon(attachmentPreview.fileType, 'small')}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 text-sm">{attachmentPreview.fileName}</h3>
                                <div className="flex items-center space-x-2 mt-0.5">
                                    <Chip
                                        label={attachmentPreview.fileType}
                                        size="small"
                                        className="bg-gray-200 text-gray-700 text-xs h-5"
                                        style={{ fontSize: '10px', height: '20px' }}
                                    />
                                    {attachmentPreview.file && (
                                        <span className="text-xs text-gray-500">
                                            {formatFileSize(attachmentPreview.file.file_size)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1">
                            {canPreview(attachmentPreview.fileType) && (
                                <IconButton
                                    onClick={toggleFullscreen}
                                    className="text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-100"
                                    size="small"
                                >
                                    {isFullscreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
                                </IconButton>
                            )}
                            <IconButton
                                onClick={handleAttachmentPreviewClose}
                                className="text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-100"
                                size="small"
                            >
                                <Close fontSize="small" />
                            </IconButton>
                        </div>
                    </div>
                </div>

                {/* Modal Content */}
                <DialogContent className="p-0 bg-gray-50">
                    {attachmentPreview.file && (
                        <div className={`flex items-center justify-center ${isFullscreen ? 'h-screen' : 'min-h-[500px]'}`}>
                            {attachmentPreview.fileType.startsWith('image/') ? (
                                <div className="w-full h-full flex items-center justify-center p-4">
                                    <img
                                        src={attachmentPreview.file.file_path}
                                        alt={attachmentPreview.fileName}
                                        className={`max-w-full ${isFullscreen ? 'max-h-full' : 'max-h-[70vh]'} object-contain rounded-lg shadow-lg`}
                                    />
                                </div>
                            ) : attachmentPreview.fileType.startsWith('video/') ? (
                                <div className="w-full h-full flex items-center justify-center p-4">
                                    <video
                                        controls
                                        className={`max-w-full ${isFullscreen ? 'max-h-full' : 'max-h-[70vh]'} object-contain rounded-lg shadow-lg`}
                                    >
                                        <source src={attachmentPreview.file.file_path} type={attachmentPreview.fileType} />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            ) : attachmentPreview.fileType.startsWith('audio/') ? (
                                <div className="w-full h-full flex items-center justify-center p-4">
                                    <div className="text-center">
                                        <div className="bg-white rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center shadow-lg">
                                            {getFileIcon(attachmentPreview.fileType, 'large')}
                                        </div>
                                        <audio
                                            controls
                                            className="w-full max-w-md mx-auto"
                                        >
                                            <source src={attachmentPreview.file.file_path} type={attachmentPreview.fileType} />
                                            Your browser does not support the audio tag.
                                        </audio>
                                        <h4 className="text-lg font-semibold text-gray-800 mt-4">{attachmentPreview.fileName}</h4>
                                    </div>
                                </div>
                            ) : attachmentPreview.fileType === 'application/pdf' ? (
                                <iframe
                                    src={attachmentPreview.file.file_path}
                                    title={attachmentPreview.fileName}
                                    width="100%"
                                    height={isFullscreen ? "100%" : "600px"}
                                    className="border-0"
                                />
                            ) : (attachmentPreview.fileType.includes('document') ||
                                attachmentPreview.fileType.includes('word') ||
                                attachmentPreview.fileType.includes('wordprocessingml') ||
                                attachmentPreview.fileType.includes('sheet') ||
                                attachmentPreview.fileType.includes('excel') ||
                                attachmentPreview.fileType.includes('spreadsheetml') ||
                                attachmentPreview.fileType.includes('presentation') ||
                                attachmentPreview.fileType.includes('powerpoint') ||
                                attachmentPreview.fileType.includes('presentationml')) ? (
                                <iframe
                                    src={getPreviewUrl(attachmentPreview.file)}
                                    title={attachmentPreview.fileName}
                                    width="100%"
                                    height={isFullscreen ? "100%" : "600px"}
                                    className="border-0"
                                />
                            ) : attachmentPreview.fileType.includes('text') ? (
                                <div className="w-full h-full p-6">
                                    <iframe
                                        src={attachmentPreview.file.file_path}
                                        title={attachmentPreview.fileName}
                                        width="100%"
                                        height={isFullscreen ? "100%" : "500px"}
                                        className="border border-gray-300 rounded bg-white"
                                    />
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="bg-white rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center shadow-lg">
                                        {getFileIcon(attachmentPreview.fileType, 'large')}
                                    </div>
                                    <h4 className="text-xl font-semibold text-gray-800 mb-3">{attachmentPreview.fileName}</h4>
                                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                        Preview is not available for this file type. You can download the file to view its contents.
                                    </p>
                                    <a
                                        href={attachmentPreview.file.file_path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-6 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200 no-underline shadow-lg hover:shadow-xl"
                                    >
                                        <Download className="mr-2" fontSize="small" />
                                        Download File
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>

                {/* Modal Footer */}
                {canPreview(attachmentPreview.fileType) && (
                    <div className="bg-white border-t border-gray-200 px-4 py-3 flex justify-between items-center">
                        <div className="text-xs text-gray-600">
                            {attachmentPreview.file && formatDateTime(attachmentPreview.file.uploaded_dt)}
                        </div>
                        <a
                            href={attachmentPreview.file?.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 bg-gray-700 text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors duration-200 no-underline"
                        >
                            <Download className="mr-1" style={{ fontSize: '14px' }} />
                            Download
                        </a>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default AttachmentsTab;
