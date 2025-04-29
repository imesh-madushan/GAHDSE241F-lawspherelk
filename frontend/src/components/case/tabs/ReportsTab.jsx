import React from 'react';
import { Add, Person, CalendarToday, Visibility } from '@mui/icons-material';
import OutlinedButton from '../../buttons/OutlinedButton';

const ReportsTab = ({ caseData, canEdit, formatDate }) => {
    const actions = {
        Add: { icon: <Add fontSize='small' />, label: 'Create Report', onClick: () => { }, styles: 'text-blue-600 bg-blue-50' },
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Reports</h3>
                {canEdit && (
                    <OutlinedButton
                        action={actions.Add}
                    />
                )}
            </div>

            <div className="space-y-4">
                {caseData.reports.map((report, index) => (
                    <div key={index} className="rounded-lg bg-white p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-800">{report.type}</h4>
                            <span className="px-2 py-1 text-xs rounded-md bg-green-100 text-green-800 font-medium">
                                {report.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <p className="flex items-center">
                                <Person fontSize="small" className="mr-1 text-blue-600" />
                                Officer: {report.officer}
                            </p>
                            <p className="flex items-center">
                                <CalendarToday fontSize="small" className="mr-1 text-blue-600" />
                                Created: {formatDate(report.created_dt)}
                            </p>
                        </div>
                        <div className="flex justify-end mt-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center transition-colors">
                                <Visibility fontSize="small" className="mr-1" />
                                View Report
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReportsTab;
