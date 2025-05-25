import React, { useEffect, useCallback } from "react";
import { CheckCircle, Error as ErrorIcon } from "@mui/icons-material";

const StatusPopup = ({
    open,
    status = "success", // "success" | "error"
    message = "Operation completed successfully",
    referenceLink = null,
    description = "",
    onClose,
    okLabel = "OK"
}) => {
    const handleClose = useCallback(() => {
        if (onClose) onClose();
    }, [onClose]);

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e) => {
            if (e.key === "Enter") handleClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, handleClose]);

    if (!open) return null;

    const isSuccess = status === "success";
    const icon = isSuccess ? (
        <CheckCircle className="text-green-500 mb-2" style={{ fontSize: 48 }} />
    ) : (
        <ErrorIcon className="text-red-500 mb-2" style={{ fontSize: 48 }} />
    );

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-lg px-8 py-8 flex flex-col items-center max-w-xs w-full">
                {icon}
                <div className={`text-lg font-semibold mb-2 ${isSuccess ? "text-gray-800" : "text-red-700"}`}>
                    {message}
                </div>
                {description && (
                    <div className={`mb-4 text-center text-sm ${isSuccess ? "text-gray-500" : "text-red-500"}`}>
                        {description}
                    </div>
                )}
                {referenceLink && (
                    <a
                        href={referenceLink}
                        className="mb-4 text-blue-700 underline hover:text-blue-900 transition text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View Details
                    </a>
                )}
                <button
                    className={`px-6 py-2 rounded-full font-medium transition hover:cursor-pointer ${isSuccess
                        ? "bg-blue-700 text-white hover:bg-blue-800"
                        : "bg-red-600 text-white hover:bg-red-700"
                        }`}
                    onClick={handleClose}
                    autoFocus
                >
                    {okLabel}
                </button>
                <div className="text-xs text-gray-400 mt-2">(Press Enter to close)</div>
            </div>
        </div>
    );
};

export default StatusPopup;
