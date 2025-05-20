import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Shield, UserCheck, Lock, BadgeCheck, Briefcase, Unlock } from 'lucide-react';

const OfficerCard = ({ officer = {} }) => {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    const {
        id,
        image = '/default-profile.png',
        name = 'Officer Name',
        role = 'Role Not Specified',
        email,
        phone,
        matchDetail,
        account_locked,
        leading_ongoing_cases
    } = officer;

    const goToProfile = () => {
        if (id) navigate(`/officers/${id}`);
    };

    return (
        <div
            className={`
        bg-white rounded-lg overflow-hidden transition-all duration-300 max-w-xs border border-gray-200
        ${isHovered ? 'shadow-lg' : 'shadow'}
      `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Card Header with Gradient */}
            <div className="h-18 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                {/* Status Badge */}
                {account_locked !== undefined && (
                    <div
                        className={`absolute top-3 right-3 rounded-full px-2.5 py-1 flex items-center gap-1.5 text-xs font-medium transition-colors
                                ${account_locked
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                        {account_locked ? (
                            <><Lock className="w-3 h-3" /> Blocked</>
                        ) : (
                            <><Unlock className="w-3 h-3" /> Active</>
                        )}
                    </div>
                )}
            </div>

            {/* Profile Image Section */}
            <div className="flex flex-col items-center -mt-10 mb-3">
                <div
                    className="rounded-full p-0.5 z-1 bg-white shadow cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
                    onClick={goToProfile}
                    title="View Officer Profile"
                    style={{ cursor: 'pointer' }}
                >
                    <img
                        src={image}
                        alt={name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-white"
                        onError={(e) => {
                            e.target.src = '/default-profile.png';
                        }}
                    />
                </div>
            </div>

            {/* Officer Information */}
            <div className="px-4 pb-4">
                {/* Name and Role */}
                <div className="text-center mb-4">
                    <h3
                        className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-blue-700 transition"
                        onClick={goToProfile}
                        title="View Officer Profile"
                        style={{ cursor: 'pointer' }}
                    >
                        {name}
                    </h3>
                    <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        {role}
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-3"></div>

                {/* Contact Information */}
                <div className="space-y-2.5">
                    {email && (
                        <div className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors group">
                            <div className="bg-blue-50 p-1.5 rounded-md group-hover:bg-blue-100 transition-colors">
                                <Mail className="w-4 h-4" />
                            </div>
                            <span className="text-sm truncate">{email}</span>
                        </div>
                    )}

                    {phone && (
                        <div className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors group">
                            <div className="bg-blue-50 p-1.5 rounded-md group-hover:bg-blue-100 transition-colors">
                                <Phone className="w-4 h-4" />
                            </div>
                            <span className="text-sm">{phone}</span>
                        </div>
                    )}
                </div>

                {/* Ongoing Cases */}
                {leading_ongoing_cases !== undefined && (
                    <div className="mt-4">
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="bg-amber-50 p-1.5 rounded-md">
                                <Briefcase className="w-4 h-4 text-amber-600" />
                            </div>
                            <span className="text-sm font-medium">
                                Leading Cases: <span className="font-semibold text-amber-600">{leading_ongoing_cases}</span>
                            </span>
                        </div>
                    </div>
                )}

                {/* Match Detail */}
                {matchDetail && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-center gap-2 text-blue-700 bg-blue-50 rounded-md py-2 px-3">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-medium">{matchDetail}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfficerCard;