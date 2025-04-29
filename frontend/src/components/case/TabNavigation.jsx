import React from 'react';
import { DeviceHub, Attachment, FormatListBulleted, Assignment, Gavel } from '@mui/icons-material';

const TabNavigation = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'overview', icon: <DeviceHub fontSize="small" />, label: 'Overview' },
        { id: 'evidence', icon: <Attachment fontSize="small" />, label: 'Evidence' },
        { id: 'investigations', icon: <FormatListBulleted fontSize="small" />, label: 'Investigations' },
        { id: 'offences', icon: <Gavel fontSize="small" />, label: 'Offences' },
        { id: 'reports', icon: <Assignment fontSize="small" />, label: 'Reports' }
    ];

    return (
        <div className="mb-6 flex overflow-x-auto bg-white rounded-t-lg shadow-sm">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`px-4 py-3 flex items-center mr-4 border-b-2 whitespace-nowrap transition-colors hover:cursor-pointer
                    ${activeTab === tab.id
                            ? 'border-blue-600 text-blue-600 font-medium'
                            : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}`}
                    onClick={() => setActiveTab(tab.id)}
                >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default TabNavigation;
