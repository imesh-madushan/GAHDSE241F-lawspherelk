import React from 'react';
import { Add, Security, Folder } from '@mui/icons-material';
import OutlinedButton from '../../buttons/OutlinedButton';

const EvidenceTab = ({ caseData, canAddEvidence }) => {
    const actions = {
        Add: { icon: <Add fontSize='small' />, label: 'Add Evidance', onClick: () => { }, styles: 'text-blue-600 bg-blue-50' },
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Evidence</h3>
                {canAddEvidence && (
                    <OutlinedButton
                        action={actions.Add} 
                    />
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseData.evidence.map((item, index) => (
                    <div key={index} className="rounded-lg bg-white p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <span className="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-800 font-medium">{item.type}</span>
                            <span className={`px-2 py-1 text-xs rounded-md ${item.status === 'Analyzing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                                } font-medium`}>
                                {item.status}
                            </span>
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-2">{item.description}</h4>
                        <div className="text-sm text-gray-600">
                            <p className="flex items-center mb-1">
                                <Security fontSize="small" className="mr-1 text-blue-600" />
                                Officer: {item.officer}
                            </p>
                            <p className="flex items-center">
                                <Folder fontSize="small" className="mr-1 text-blue-600" />
                                Location: {item.location}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EvidenceTab;
