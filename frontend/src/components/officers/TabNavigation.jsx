import React from 'react';

const TabNavigation = ({ tabs, activeTab, setActiveTab }) => {
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
                    {typeof tab.count === 'number' && tab.count > 0 && (
                        <span
                            className={`ml-2 text-xs font-semibold rounded-full px-2 py-0.5 ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                }`}
                        >
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
};

export default TabNavigation;