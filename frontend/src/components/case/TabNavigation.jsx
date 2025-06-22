import React from 'react';

const tabList = [
    { key: 'evidence', label: 'Evidence' },
    { key: 'investigations', label: 'Investigations' },
    { key: 'offences', label: 'Offences' },
    { key: 'reports', label: 'Reports' }
];

const TabNavigation = ({ activeTab, setActiveTab, tabCounts, neutralMode }) => {
    return (
        <div className="w-full border-b border-gray-300 bg-gray-50 mb-4">
            <nav className="flex space-x-2 px-4 pt-2">
                {tabList.map(tab => {
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={
                                isActive
                                    ? 'px-4 py-2 rounded-t bg-gray-800 text-white font-semibold shadow-sm'
                                    : 'px-4 py-2 rounded-t bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium'
                            }
                            style={{ outline: 'none', border: 'none' }}
                        >
                            {tab.label}
                            {tabCounts && tabCounts[tab.key] > 0 && (
                                <span className={
                                    isActive
                                        ? 'ml-2 inline-block text-xs bg-black text-white rounded-full px-2 py-0.5'
                                        : 'ml-2 inline-block text-xs bg-gray-400 text-gray-100 rounded-full px-2 py-0.5'
                                }>
                                    {tabCounts[tab.key]}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default TabNavigation;
