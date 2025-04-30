import React, { useState } from 'react';
import { Person, Add, Close } from '@mui/icons-material';
import SidebarCard from '../cards/SidebarCard';
import OfficerCard from '../cards/OfficerCard';
import CustomOfficerDropdown from '../dropdowns/CustomOfficerDropdown';

const AssignedOfficers = ({
    assignedOfficers,
    allOfficers,
    canAssign = false,
    onAssignOfficer = () => { }
}) => {
    const [isAdding, setIsAdding] = useState(false);

    const handleAddClick = () => {
        setIsAdding(true);
    };

    const handleCancelAdd = () => {
        setIsAdding(false);
    };

    const handleOfficerSelect = (officer) => {
        onAssignOfficer(officer);
        setIsAdding(false);
    };

    // Filter out already assigned officers from dropdown options
    const availableOfficers = allOfficers.filter(
        officer => !assignedOfficers.some(assigned => assigned.id === officer.id)
    );

    return (
        <SidebarCard
            title="Assigned Officers"
            icon={<Person />}
            action={canAssign && !isAdding ? (
                <button
                    className="flex text-sm p-1 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors text-white"
                    onClick={handleAddClick}
                >
                    <Add fontSize="small" />
                </button>
            ) : null}
        >
            <div className="space-y-3">
                {isAdding ? (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium text-blue-600">Assign New Officer</h4>
                            <button
                                onClick={handleCancelAdd}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <Close fontSize="small" />
                            </button>
                        </div>
                        <CustomOfficerDropdown
                            officers={availableOfficers}
                            selectedOfficerId=""
                            onOfficerSelect={handleOfficerSelect}
                        />
                    </div>
                ) : null}

                {assignedOfficers.map((officer, index) => (
                    <OfficerCard
                        key={officer.id || index}
                        officer={officer}
                        showViewButton={true}
                    />
                ))}

                {assignedOfficers.length === 0 && !isAdding && (
                    <p className="text-gray-500 text-sm text-center py-2">No officers assigned</p>
                )}
            </div>
        </SidebarCard>
    );
};

export default AssignedOfficers;
