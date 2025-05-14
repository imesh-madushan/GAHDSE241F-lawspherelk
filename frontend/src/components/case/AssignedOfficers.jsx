import React from 'react';
import { Person } from '@mui/icons-material';
import SidebarCard from '../cards/SidebarCard';
import OfficerCard from '../cards/OfficerCard';

const AssignedOfficers = ({
    assignedOfficers
}) => {
    return (
        <SidebarCard
            title="Case Officers"
            icon={<Person />}
        >
            <div className="space-y-3">
                {assignedOfficers && assignedOfficers.length > 0 ? (
                    assignedOfficers.map((officer, index) => (
                        <OfficerCard
                            key={officer.id || index}
                            officer={officer}
                        />
                    ))
                ) : (
                    <p className="text-gray-500 text-sm text-center py-2">No officers involved in this case</p>
                )}
            </div>
        </SidebarCard>
    );
};

export default AssignedOfficers;
