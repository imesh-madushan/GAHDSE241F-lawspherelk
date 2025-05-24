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
        small: "p-1.5 text-xs",
        medium: "p-2 text-sm",
        large: "p-3 text-base"
    };

    return (
        <div
            className={`flex items-center justify-between hover:cursor-pointer hover:rounded-xl transition-colors hover:[box-shadow:2px_2px_8px_1px_rgba(0,0,0,0.1)] hover:border-white ${containerClasses[size]} border border-gray-200 rounded-lg bg-yellow-50/20 ${className} `}
            onClick={() => {
                if (officer && officer.id) {
                    navigate(`/officers/${officer.id}`);
                }
            }}
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
                    <div className="font-medium text-gray-900 flex items-center gap-1">
                        {officer.name}
                        {user && officer.id === user.user_id && (
                            <span className="ml-0 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                (you)
                            </span>
                        )}
                    </div>
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
        </div>
    );
};

export default OfficerCard;
