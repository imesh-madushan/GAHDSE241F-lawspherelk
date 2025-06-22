import React, { useEffect, useCallback } from "react";
import { Warning, Close, Error, Info, CheckCircle } from "@mui/icons-material";

const ConfirmationPopup = ({
    open,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    variant = "warning" // "warning" | "danger" | "info" | "success"
}) => {
    const handleCancel = useCallback(() => {
        if (onCancel) onCancel();
    }, [onCancel]);

    const handleConfirm = useCallback(() => {
        if (onConfirm) onConfirm();
    }, [onConfirm]);

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") handleCancel();
            if (e.key === "Enter") handleConfirm();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, handleCancel, handleConfirm]);

    const getVariantConfig = () => {
        switch (variant) {
            case "danger":
                return {
                    icon: <Error className="text-red-500" style={{ fontSize: 48 }} />,
                    iconBg: "bg-red-100",
                    confirmButton: "bg-red-700 text-white hover:bg-red-800",
                    titleColor: "text-red-900",
                    backdrop: "bg-red-50/80"
                };
            case "success":
                return {
                    icon: <CheckCircle className="text-gray-700" style={{ fontSize: 48 }} />,
                    iconBg: "bg-gray-100",
                    confirmButton: "bg-gray-800 text-white hover:bg-black",
                    titleColor: "text-gray-800",
                    backdrop: "bg-gray-50/80"
                };
            case "info":
                return {
                    icon: <Info className="text-gray-700" style={{ fontSize: 48 }} />,
                    iconBg: "bg-gray-100",
                    confirmButton: "bg-gray-800 text-white hover:bg-black",
                    titleColor: "text-gray-800",
                    backdrop: "bg-gray-50/80"
                };
            default: // warning
                return {
                    icon: <Warning className="text-amber-500" style={{ fontSize: 48 }} />,
                    iconBg: "bg-amber-100",
                    confirmButton: "bg-gray-700 text-white hover:bg-black",
                    titleColor: "text-gray-800",
                    backdrop: "bg-amber-50/80"
                };
        }
    };

    if (!open) return null;

    const config = getVariantConfig();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
            {/* Enhanced Backdrop */}
            <div
                className={`absolute inset-0 ${config.backdrop} backdrop-blur-sm transition-opacity duration-300`}
                onClick={handleCancel}
            />

            {/* Modal Container */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full mx-4 overflow-hidden transform transition-all duration-300 scale-100">
                {/* Close Button */}
                <button
                    onClick={handleCancel}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 z-10"
                >
                    <Close className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>

                {/* Content */}
                <div className="p-8 text-center">
                    {/* Icon */}
                    <div className={`w-20 h-20 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                        {config.icon}
                    </div>

                    {/* Title */}
                    <h2 className={`text-2xl font-bold ${config.titleColor} mb-4`}>
                        {title}
                    </h2>

                    {/* Message */}
                    <p className="text-gray-600 text-base leading-relaxed mb-8">
                        {message}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleCancel}
                            className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                        >
                            {cancelLabel}
                        </button>

                        <button
                            onClick={handleConfirm}
                            className={`flex-1 px-6 py-3 rounded-xl font-semibold ${config.confirmButton} shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2`}
                            autoFocus
                        >
                            {confirmLabel}
                        </button>
                    </div>

                    {/* Keyboard Shortcuts Hint */}
                    <div className="mt-6 text-xs text-gray-400 flex items-center justify-center gap-4">
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">Esc</span>
                        <span>to cancel</span>
                        <span>•</span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">Enter</span>
                        <span>to confirm</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPopup;
