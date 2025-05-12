import React from 'react';
import { ArrowBack } from '@mui/icons-material';
import Breadcrumb from '../navigation/Breadcrumb';
import OutlinedButton from '../buttons/OutlinedButton';

const PageHeader = ({
    title,
    breadcrumbItems,
    onBack,
    actions = [],
    isEditing = false,
    canEdit = false
}) => {
    return (
        <div className="sticky top-0 z-10 backdrop-blur-md bg-white bg-opacity-90 shadow-sm">
            <div className="container mx-auto px-4 py-3">
                {/* Breadcrumb */}
                <Breadcrumb items={breadcrumbItems} />

                {/* Title section */}
                <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center">
                        <button
                            className="flex mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            onClick={onBack}
                        >
                            <ArrowBack />
                        </button>
                        <h1 className="text-xl font-bold text-gray-800">
                            {title}
                        </h1>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                        {actions.map((action, index) => (
                            <OutlinedButton
                                key={index}
                                action={{
                                    ...action,
                                    styles: action.styles || 'text-blue-700' // Default style if none provided
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageHeader; 