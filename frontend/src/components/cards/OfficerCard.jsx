import React from 'react';
import { Person, Visibility } from '@mui/icons-material';

const OfficerCard = ({
    officer,
    size = "medium",
    showViewButton = false,
    className = "",
    onClick = null
}) => {
    // Get initials from name for avatar fallback
    const getInitials = (name) => {
        if (!name) return "??";
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Set sizes based on the size prop
    const sizeClasses = {
        small: "h-8 w-8 text-xs",
        medium: "h-10 w-10 text-sm",
        large: "h-12 w-12 text-base"
    };

    const containerClasses = {
        small: "p-1.5",
        medium: "p-2",
        large: "p-3"
    };

    return (
        <div
            className={`flex items-center justify-between ${containerClasses[size]} border border-blue-100 rounded-lg bg-blue-50 ${className} ${onClick ? 'cursor-pointer hover:bg-blue-100 transition-colors' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center">
                {/* Officer Avatar */}
                <div className={`flex-shrink-0 ${sizeClasses[size]} rounded-full overflow-hidden border-2 border-white shadow-sm`}>
                    {officer.profilePic || officer.profile_pic || officer.image ? (
                        <img
                            src={officer.profilePic || officer.profile_pic || officer.image}
                            alt={`${officer.name}`}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-blue-600 flex items-center justify-center text-white font-medium">
                            {getInitials(officer.name)}
                        </div>
                    )}
                </div>

                {/* Officer Info */}
                <div className="ml-3">
                    <div className="font-medium text-gray-900">{officer.name}</div>
                    <div className="flex items-center">
                        <div className="text-xs text-gray-500">{officer.role || "Officer"}</div>
                        {officer.type && (
                            <div className="ml-2 px-1.5 py-0.5 bg-blue-100 text-xs rounded-full text-blue-700">
                                {officer.type}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showViewButton && (
                <button className="text-blue-600 hover:text-blue-800 transition-colors">
                    <Visibility fontSize="small" />
                </button>
            )}
        </div>
    );
};

export default OfficerCard;
