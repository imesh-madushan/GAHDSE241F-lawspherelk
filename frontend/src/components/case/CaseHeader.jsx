import React from 'react';
import { ArrowBack } from '@mui/icons-material';
import OutlinedButton from '../buttons/OutlinedButton';

const CaseHeader = ({ caseData, isEditing, actions, canEdit }) => {
  return (
    <div className="sticky top-0 z-10 backdrop-blur-md bg-white bg-opacity-90 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        {/* Breadcrumb */}
        <div className="flex items-center text-gray-600 text-sm mb-2">
          <a href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</a>
          <span className="mx-2">›</span>
          <a href="/cases" className="hover:text-blue-600 transition-colors">Cases</a>
          <span className="mx-2">›</span>
          <span className="text-blue-600">{caseData.case_id.substring(0, 8)}</span>
        </div>

        {/* Title section */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button
              className="flex mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => window.history.back()}
            >
              <ArrowBack />
            </button>
            <h1 className="text-xl text-center flex justify-center font-bold text-gray-800">
              {isEditing ? 'Edit Case' : 'Case Details'}
            </h1>
          </div>

          {canEdit && (
            <div>
              {isEditing ? (
                <div className="flex space-x-2">
                  <OutlinedButton action={actions.Cancel} />
                  <OutlinedButton action={actions.Save} />
                </div>
              ) : (
                <OutlinedButton action={actions.Edit} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseHeader;
