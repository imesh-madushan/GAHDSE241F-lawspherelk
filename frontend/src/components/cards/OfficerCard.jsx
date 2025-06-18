import React from 'react';
import { Person, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const OfficerCard = ({ officer, size = "medium", className = "" }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

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
        small: "h-8 w-8",
        medium: "h-10 w-10",
        large: "h-12 w-12"
    };

    const containerClasses = {
        small: "p-1",
        medium: "p-3",
        large: "p-4"
    };

    const textClasses = {
        small: "text-xs",
        medium: "text-sm",
        large: "text-base"
    };

    return (
        <div
            className={`flex items-center rounded-lg transition-all cursor-pointer
                hover:shadow-sm hover:bg-gray-50
                ${containerClasses[size]} 
                ${className}`}
            onClick={() => {
                if (officer && officer.id) {
                    navigate(`/officers/${officer.id}`);
                }
            }}
        >
            <div className="flex items-center w-full space-x-3">
                {/* Officer Avatar */}
                <div className={`relative ${sizeClasses[size]} rounded-full flex-shrink-0 overflow-hidden border-2 border-gray-200 shadow-sm`}>
                    {officer.profilePic || officer.profile_pic || officer.image ? (
                        <img
                            src={officer.profilePic || officer.profile_pic || officer.image}
                            alt={`${officer.name}`}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-white font-medium">
                            {getInitials(officer.name)}
                        </div>
                    )}
                </div>

                {/* Officer Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                        <div className="font-medium text-gray-900 truncate text-sm">
                            {officer.name}
                        </div>

                        {user && officer.id === user.user_id && (
                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium flex-shrink-0">
                                you
                            </span>
                        )}
                    </div>

                    <div className="flex items-center mt-1">
                        <div className={`text-gray-500 truncate ${textClasses[size]}`}>
                            {officer.role || "Officer"}
                        </div>
                        {officer.type && (
                            <div className="ml-2 px-2 py-0.5 bg-blue-100 text-xs rounded-full text-blue-700 whitespace-nowrap flex-shrink-0">
                                {officer.type}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default OfficerCard;
