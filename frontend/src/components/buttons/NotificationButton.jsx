import React, { useState } from 'react';
import { Notifications } from '@mui/icons-material';

const NotificationButton = ({ count = 0, notifications = [] }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  
  return (
    <>
      <button 
        className="px-3 py-2 flex items-center transition-colors duration-200 relative"
        onClick={toggleNotifications}
      >
        <Notifications sx={{fontSize: 28}} className="hover:cursor-pointer"/>
        {count > 0 && (
          <span className="absolute top-[4px] right-[4px] bg-red-500 text-white text-xs rounded-full w-4.5 h-4.5 flex items-center justify-center hover:cursor-pointer">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
      
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">Notifications</h3>
              {count > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {count} new
                </span>
              )}
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <div 
                  key={index} 
                  className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer ${
                    notification.unread ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`w-2 h-2 rounded-full mt-2 mr-2 ${
                      notification.unread ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-gray-500 text-sm">No notifications</p>
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200">
              <button 
                className="text-blue-600 hover:text-blue-800 text-xs font-medium w-full text-center"
                onClick={() => setShowNotifications(false)}
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default NotificationButton;