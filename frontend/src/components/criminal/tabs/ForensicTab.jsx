import React from 'react';
import { Description } from '@mui/icons-material';

const ForensicTab = () => {
    return (
        <div className="text-center py-8 text-gray-500">
            <Description style={{ fontSize: 48 }} className="text-gray-300 mb-2 mx-auto" />
            <h4 className="text-lg font-medium text-gray-700 mb-2">No Forensic Reports Available</h4>
            <p>There are no forensic reports linked to this criminal record.</p>
        </div>
    );
};

export default ForensicTab; 