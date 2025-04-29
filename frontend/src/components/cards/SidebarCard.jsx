import React from 'react';

const SidebarCard = ({ title, icon, children, action }) => {
  return (
    <div className="rounded-xl bg-white shadow-md p-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          {icon && <span className="mr-2 text-blue-600">{icon}</span>}
          {title}
        </h3>
        {action && action}
      </div>
      {children}
    </div>
  );
};

export default SidebarCard;
