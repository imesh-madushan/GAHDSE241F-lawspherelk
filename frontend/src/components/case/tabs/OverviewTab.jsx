import React from 'react';
import { Add } from '@mui/icons-material';
import OutlinedButton from '../../buttons/OutlinedButton';

const OverviewTab = ({ caseData, canUpdateTimeLine, formatDate }) => {
    const actions = {
        Add: { icon: <Add fontSize='small' />, label: 'Add Update', onClick: () => { }, styles: 'text-blue-800 bg-blue-50' },
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Case Timeline</h3>
                {canUpdateTimeLine && (
                    <OutlinedButton action={actions.Add}/> 
                )}
            </div>

            <div className="space-y-4">
                {caseData.updates.map((update, index) => (
                    <div key={index} className="relative pl-6 border-l-2 border-blue-500 pb-6">
                        <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                        <p className="text-xs text-gray-500">{formatDate(update.date)}</p>
                        <p className="text-sm font-medium text-gray-800">{update.officer}</p>
                        <p className="text-sm text-gray-600 mt-1">{update.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OverviewTab;
