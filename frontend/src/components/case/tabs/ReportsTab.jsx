import React from 'react';
import { Add, Person, CalendarToday, Visibility } from '@mui/icons-material';
import OutlinedButton from '../../buttons/OutlinedButton';

const ReportsTab = ({ caseData, canEdit, formatDate }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Reports</h3>
            </div>

            <div className="space-y-4">
                {caseData.reports.map((report, index) => (
                    <div key={index} className="rounded-lg bg-white p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-800">{report.type}</h4>
                            <span className="px-2 py-1 text-xs rounded-md bg-gray-200 text-gray-800 font-medium">
                                {report.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <p className="flex items-center">
                                <Person fontSize="small" className="mr-1 text-gray-700" />
                                Officer: {report.officer}
                            </p>
                            <p className="flex items-center">
                                <CalendarToday fontSize="small" className="mr-1 text-gray-700" />
                                Created: {formatDate(report.created_dt)}
                            </p>
                        </div>
                        <div className="flex justify-end mt-2">
                            <button className="bg-gray-800 text-white text-sm flex items-center px-3 py-1 rounded transition-colors">
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
