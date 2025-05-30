import React, { useEffect, useCallback } from "react";
import { Warning, Close } from "@mui/icons-material";

const ConfirmationPopup = ({
    open,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    variant = "warning" // "warning" | "danger" | "info"
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

    if (!open) return null;

    const variantStyles = {
        warning: {
            icon: <Warning className="text-yellow-500 mb-2" style={{ fontSize: 48 }} />,
            confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white",
            border: "border-yellow-200"
        },
        danger: {
            icon: <Warning className="text-red-500 mb-2" style={{ fontSize: 48 }} />,
            confirmButton: "bg-red-600 hover:bg-red-700 text-white",
            border: "border-red-200"
        },
        info: {
            icon: <Warning className="text-blue-500 mb-2" style={{ fontSize: 48 }} />,
            confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
            border: "border-blue-200"
        }
    };

    const currentStyle = variantStyles[variant] || variantStyles.warning;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
            <div className={`bg-white rounded-xl shadow-lg px-8 py-6 flex flex-col items-center max-w-sm w-full mx-4 ${currentStyle.border} border`}>
                {currentStyle.icon}

                <div className="text-lg font-semibold mb-2 text-gray-800 text-center">
                    {title}
                </div>

                <div className="mb-6 text-center text-sm text-gray-600">
                    {message}
                </div>

                <div className="flex gap-3 w-full">
                    <button
                        className="flex-1 px-4 py-2 rounded-lg font-medium transition border border-gray-300 text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                        onClick={handleCancel}
                    >
                        {cancelLabel}
                    </button>

                    <button
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${currentStyle.confirmButton} hover:cursor-pointer`}
                        onClick={handleConfirm}
                        autoFocus
                    >
                        {confirmLabel}
                    </button>
                </div>

                <div className="text-xs text-gray-400 mt-2">
                    (Press Enter to confirm, Esc to cancel)
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPopup;
