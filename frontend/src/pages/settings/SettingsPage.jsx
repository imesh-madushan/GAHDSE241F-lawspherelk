import React, { useState } from 'react';
import {
    Shield,
    Bell,
    Eye,
    EyeOff,
    Lock,
    Globe,
    Moon,
    Sun,
    Monitor,
    Save,
    RefreshCw,
    Download,
    Upload,
    Trash2, AlertTriangle
} from 'lucide-react';

const SettingsPage = () => {
    // Security Settings
    const [securitySettings, setSecuritySettings] = useState({
        twoFactorAuth: false,
        sessionTimeout: '30',
        passwordExpiry: '90',
        loginNotifications: true,
        deviceTracking: true
    });

    // Notification Settings
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        caseUpdates: true,
        systemAlerts: true,
        weeklyReports: false,
        emergencyAlerts: true
    });

    // Privacy Settings
    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: 'team',
        activityLogging: true,
        dataSharing: false,
        analyticsOptOut: false
    });

    // Appearance Settings
    const [appearanceSettings, setAppearanceSettings] = useState({
        theme: 'light',
        language: 'en',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        density: 'comfortable'
    });

    // Password Change
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const handleSecurityChange = (key, value) => {
        setSecuritySettings(prev => ({ ...prev, [key]: value }));
    };

    const handleNotificationChange = (key, value) => {
        setNotificationSettings(prev => ({ ...prev, [key]: value }));
    };

    const handlePrivacyChange = (key, value) => {
        setPrivacySettings(prev => ({ ...prev, [key]: value }));
    };

    const handleAppearanceChange = (key, value) => {
        setAppearanceSettings(prev => ({ ...prev, [key]: value }));
    };

    const handlePasswordChange = () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        // Handle password change API call
        console.log('Changing password...');
    };

    const handleExportData = () => {
        // Handle data export
        console.log('Exporting user data...');
    };

    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            console.log('Deleting account...');
        }
    };

    const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
        <button
            onClick={() => !disabled && onChange(!checked)}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-gray-200'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-2">Manage your account preferences and security settings</p>
                </div>

                <div className="space-y-6">
                    {/* Security Settings */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="text-blue-600" size={24} />
                            <h2 className="text-xl font-semibold text-gray-900">Security</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Password Change */}
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.current ? 'text' : 'password'}
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.new ? 'text' : 'password'}
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handlePasswordChange}
                                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Lock size={16} />
                                    Update Password
                                </button>
                            </div>

                            {/* Security Options */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                                    </div>
                                    <ToggleSwitch
                                        checked={securitySettings.twoFactorAuth}
                                        onChange={(value) => handleSecurityChange('twoFactorAuth', value)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Login Notifications</h4>
                                        <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
                                    </div>
                                    <ToggleSwitch
                                        checked={securitySettings.loginNotifications}
                                        onChange={(value) => handleSecurityChange('loginNotifications', value)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Device Tracking</h4>
                                        <p className="text-sm text-gray-600">Track devices that access your account</p>
                                    </div>
                                    <ToggleSwitch
                                        checked={securitySettings.deviceTracking}
                                        onChange={(value) => handleSecurityChange('deviceTracking', value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                                        <select
                                            value={securitySettings.sessionTimeout}
                                            onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="15">15 minutes</option>
                                            <option value="30">30 minutes</option>
                                            <option value="60">1 hour</option>
                                            <option value="120">2 hours</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
                                        <select
                                            value={securitySettings.passwordExpiry}
                                            onChange={(e) => handleSecurityChange('passwordExpiry', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="30">30 days</option>
                                            <option value="60">60 days</option>
                                            <option value="90">90 days</option>
                                            <option value="365">1 year</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Bell className="text-blue-600" size={24} />
                            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                                    <p className="text-sm text-gray-600">Receive important updates via email</p>
                                </div>
                                <ToggleSwitch
                                    checked={notificationSettings.emailNotifications}
                                    onChange={(value) => handleNotificationChange('emailNotifications', value)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                                    <p className="text-sm text-gray-600">Receive critical alerts via SMS</p>
                                </div>
                                <ToggleSwitch
                                    checked={notificationSettings.smsNotifications}
                                    onChange={(value) => handleNotificationChange('smsNotifications', value)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-900">Push Notifications</h4>
                                    <p className="text-sm text-gray-600">Receive notifications in your browser</p>
                                </div>
                                <ToggleSwitch
                                    checked={notificationSettings.pushNotifications}
                                    onChange={(value) => handleNotificationChange('pushNotifications', value)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-900">Case Updates</h4>
                                    <p className="text-sm text-gray-600">Get notified about case status changes</p>
                                </div>
                                <ToggleSwitch
                                    checked={notificationSettings.caseUpdates}
                                    onChange={(value) => handleNotificationChange('caseUpdates', value)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-900">Emergency Alerts</h4>
                                    <p className="text-sm text-gray-600">Critical emergency notifications</p>
                                </div>
                                <ToggleSwitch
                                    checked={notificationSettings.emergencyAlerts}
                                    onChange={(value) => handleNotificationChange('emergencyAlerts', value)}
                                    disabled={true}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Appearance Settings */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Monitor className="text-blue-600" size={24} />
                            <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                                <div className="flex gap-4">
                                    {[
                                        { value: 'light', icon: Sun, label: 'Light' },
                                        { value: 'dark', icon: Moon, label: 'Dark' },
                                        { value: 'system', icon: Monitor, label: 'System' }].map(({ value, icon: Icon, label }) => (
                                            <button
                                                key={value}
                                                onClick={() => handleAppearanceChange('theme', value)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${appearanceSettings.theme === value
                                                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <Icon size={16} />
                                                {label}
                                            </button>
                                        ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                                    <select
                                        value={appearanceSettings.language}
                                        onChange={(e) => handleAppearanceChange('language', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="en">English</option>
                                        <option value="si">Sinhala</option>
                                        <option value="ta">Tamil</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                                    <select
                                        value={appearanceSettings.dateFormat}
                                        onChange={(e) => handleAppearanceChange('dateFormat', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data & Privacy */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Globe className="text-blue-600" size={24} />
                            <h2 className="text-xl font-semibold text-gray-900">Data & Privacy</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Activity Logging</h4>
                                        <p className="text-sm text-gray-600">Log your system activities for audit purposes</p>
                                    </div>
                                    <ToggleSwitch
                                        checked={privacySettings.activityLogging}
                                        onChange={(value) => handlePrivacyChange('activityLogging', value)}
                                        disabled={true}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                                    <select
                                        value={privacySettings.profileVisibility}
                                        onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="public">Everyone</option>
                                        <option value="team">Team Members Only</option>
                                        <option value="department">Department Only</option>
                                        <option value="private">Private</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Data Management</h3>
                                <div className="flex flex-wrap gap-4">
                                    <button
                                        onClick={handleExportData}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Download size={16} />
                                        Export My Data
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <Save size={16} />
                            Save All Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
