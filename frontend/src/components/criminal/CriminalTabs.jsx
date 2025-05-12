import React from 'react';
import { Gavel, Attachment, EmojiEvents } from '@mui/icons-material';

const CriminalTabs = ({ activeTab, setActiveTab }) => {
    return (
        <div className="bg-white rounded-t-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
                <nav className="flex">
                    <button
                        className={`px-6 py-4 text-sm font-medium ${activeTab === 'offences'
                            ? 'border-b-2 border-blue-800 text-blue-800'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('offences')}
                    >
                        <Gavel className="mr-1 text-lg" style={{ fontSize: '1.1rem', verticalAlign: 'text-top' }} />
                        Offences
                    </button>
                    <button
                        className={`px-6 py-4 text-sm font-medium ${activeTab === 'evidence'
                            ? 'border-b-2 border-blue-800 text-blue-800'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('evidence')}
                    >
                        <Attachment className="mr-1 text-lg" style={{ fontSize: '1.1rem', verticalAlign: 'text-top' }} />
                        Evidence
                    </button>
                    <button
                        className={`px-6 py-4 text-sm font-medium ${activeTab === 'forensic'
                            ? 'border-b-2 border-blue-800 text-blue-800'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('forensic')}
                    >
                        <EmojiEvents className="mr-1 text-lg" style={{ fontSize: '1.1rem', verticalAlign: 'text-top' }} />
                        Forensic Reports
                    </button>
                </nav>
            </div>
        </div>
    );
};

export default CriminalTabs; 