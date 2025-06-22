import React from 'react';
import { DeviceHub, Attachment, FormatListBulleted, Assignment, Gavel } from '@mui/icons-material';

const TabNavigation = ({ activeTab, setActiveTab, tabCounts = {} }) => {
    const tabs = [
        { id: 'evidence', icon: <Attachment fontSize="small" />, label: 'Evidence' },
        { id: 'investigations', icon: <FormatListBulleted fontSize="small" />, label: 'Investigations' },
        { id: 'offences', icon: <Gavel fontSize="small" />, label: 'Offences' },
        { id: 'reports', icon: <Assignment fontSize="small" />, label: 'Reports' }
    ];

    return (
        <div className="mb-6 flex overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex w-full">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`flex-1 px-6 py-4 flex items-center justify-center border-b-2 whitespace-nowrap transition-all duration-200 hover:bg-gray-50
                        ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600 font-medium bg-blue-50'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="mr-2 flex items-center justify-center">{tab.icon}</span>
                        <span className="font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TabNavigation;
