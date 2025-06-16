import React, { useState, useRef } from 'react';
import { Camera, Edit2, Save, X, User, Mail, Phone, MapPin, Calendar, Shield, Clock, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || 'John Doe',
        email: user?.email || 'john.doe@police.gov.lk',
        phone: '+94 77 123 4567',
        address: '123, Main Street, Colombo 07',
        dateOfBirth: '1985-06-15',
        joiningDate: '2015-03-20',
        badgeNumber: 'PL12345',
        department: 'Criminal Investigation Department',
        emergencyContact: '+94 11 234 5678',
        bio: 'Dedicated police officer with over 8 years of experience in criminal investigation and community policing.',
    });
    const [profileImage, setProfileImage] = useState(null);
    const fileInputRef = useRef(null);

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        // Here you would typically send the data to the backend
        console.log('Saving profile data:', profileData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        // Reset any changes
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32 rounded-t-lg relative">
                        <div className="absolute -bottom-16 left-8">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-300 overflow-hidden">
                                    {profileImage || user?.profilePicture ? (
                                        <img
                                            src={profileImage || user?.profilePicture}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                            <User size={40} className="text-gray-600" />
                                        </div>
                                    )}
                                </div>
                                {isEditing && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                                    >
                                        <Camera size={16} />
                                    </button>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>
                        </div>
                        <div className="absolute top-4 right-4">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-white text-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
                                >
                                    <Edit2 size={16} />
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
                                    >
                                        <Save size={16} />
                                        Save
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition-colors"
                                    >
                                        <X size={16} />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="pt-20 pb-6 px-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                                <p className="text-gray-600">{user?.role || 'Police Officer'}</p>
                                <p className="text-gray-500 text-sm">{profileData.department}</p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Shield size={16} />
                                    <span className="text-sm">Badge: {profileData.badgeNumber}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 mt-1">
                                    <Clock size={16} />
                                    <span className="text-sm">Since {new Date(profileData.joiningDate).getFullYear()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Personal Information */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 p-2">
                                            <User size={16} className="text-gray-500" />
                                            <span>{profileData.name}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 p-2">
                                            <Mail size={16} className="text-gray-500" />
                                            <span>{profileData.email}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 p-2">
                                            <Phone size={16} className="text-gray-500" />
                                            <span>{profileData.phone}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={profileData.dateOfBirth}
                                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 p-2">
                                            <Calendar size={16} className="text-gray-500" />
                                            <span>{new Date(profileData.dateOfBirth).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    {isEditing ? (
                                        <textarea
                                            value={profileData.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 p-2">
                                            <MapPin size={16} className="text-gray-500" />
                                            <span>{profileData.address}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                    {isEditing ? (
                                        <textarea
                                            value={profileData.bio}
                                            onChange={(e) => handleInputChange('bio', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Tell us about yourself..."
                                        />
                                    ) : (
                                        <p className="text-gray-700 p-2">{profileData.bio}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Professional Information & Activity */}
                    <div className="space-y-6">
                        {/* Professional Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Badge Number</label>
                                    <div className="flex items-center gap-2 p-2">
                                        <Shield size={16} className="text-gray-500" />
                                        <span>{profileData.badgeNumber}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <div className="p-2">
                                        <span>{profileData.department}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                                    <div className="flex items-center gap-2 p-2">
                                        <Calendar size={16} className="text-gray-500" />
                                        <span>{new Date(profileData.joiningDate).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={profileData.emergencyContact}
                                            onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 p-2">
                                            <Phone size={16} className="text-gray-500" />
                                            <span>{profileData.emergencyContact}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                    <Activity size={16} className="text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium">Case Updated</p>
                                        <p className="text-xs text-gray-500">2 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                    <Activity size={16} className="text-green-600" />
                                    <div>
                                        <p className="text-sm font-medium">Report Submitted</p>
                                        <p className="text-xs text-gray-500">1 day ago</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                    <Activity size={16} className="text-orange-600" />
                                    <div>
                                        <p className="text-sm font-medium">Profile Updated</p>
                                        <p className="text-xs text-gray-500">3 days ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
