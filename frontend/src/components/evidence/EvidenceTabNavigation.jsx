import React from 'react';
import { Search, FolderOpen, Assignment, People } from '@mui/icons-material';

const EvidenceTabNavigation = ({ activeTab, setActiveTab, tabCounts = {} }) => {
    const tabs = [
        { id: 'witnesses', icon: <People fontSize="small" />, label: 'Witnesses' },
        { id: 'investigation', icon: <Search fontSize="small" />, label: 'Investigation' },
        { id: 'cases', icon: <FolderOpen fontSize="small" />, label: 'Linked Cases' },
        { id: 'related', icon: <Assignment fontSize="small" />, label: 'Related Evidence' }
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
                        {tabCounts[tab.id] > 0 && (
                            <span className={`ml-2 px-2.5 py-1 text-xs font-semibold rounded-full min-w-[22px] h-6 flex items-center justify-center
                                ${activeTab === tab.id
                                    ? 'bg-blue-200 text-blue-700'
                                    : 'bg-gray-200 text-gray-600'}`}>
                                {tabCounts[tab.id]}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default EvidenceTabNavigation;
