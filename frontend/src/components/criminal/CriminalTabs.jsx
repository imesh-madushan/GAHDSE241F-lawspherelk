import React from 'react';
import { Gavel, Attachment, EmojiEvents } from '@mui/icons-material';

const CriminalTabs = ({ activeTab, setActiveTab }) => {
    const tabs = [
        {
            id: 'offences',
            label: 'Offences',
            icon: <Gavel fontSize="small" />,
        },
        {
            id: 'evidence',
            label: 'Evidence',
            icon: <Attachment fontSize="small" />,
        },
        {
            id: 'forensic',
            label: 'Forensic Reports',
            icon: <EmojiEvents fontSize="small" />,
        }
    ];

    return (
        <div className="mb-6 flex overflow-x-auto bg-white rounded-t-lg shadow-sm">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                        px-4 py-3 flex items-center mr-4 border-b-2 whitespace-nowrap transition-colors hover:cursor-pointer
                        ${activeTab === tab.id
                            ? 'border-blue-600 text-blue-600 font-medium'
                            : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                        }
                    `}
                >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default CriminalTabs;