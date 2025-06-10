import React, { useState, useEffect } from 'react';
import { apiClient } from '../config/apiConfig';
import EditProfileModal from '../components/EditProfileModal';
import ChangePasswordModal from '../components/ChangePasswordModal';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notifications] = useState({
    caseUpdates: true,
    emergencyAlerts: true,
    newAssignments: true,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    apiClient.get('/auth/me').then(res => setUser(res.data));
    setRecentActivity([
      { label: 'Last Login', value: 'March 14, 2024 - 09:45 AM' },
      { label: 'Profile Updated', value: 'March 10, 2024 - 14:30 PM' },
      { label: 'Notification Settings Changed', value: 'March 8, 2024 - 11:15 AM' },
    ]);
  }, []);

  if (!user) return <div className="flex justify-center items-center h-full">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main Profile Card */}
        <div className="flex-1 bg-white rounded-2xl shadow p-8 flex flex-col items-center">
          <img src={user.photo || '/default-profile.png'} alt="Profile" className="w-32 h-32 rounded-full border-4 border-blue-200 object-cover mb-3" />
          <h2 className="text-3xl font-bold text-center mb-1">{user.name}</h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            {/* Removed lens icon and name, only show role */}
            <span className="text-gray-600 font-medium">{user.role}</span>
          </div>
          <div className="flex gap-2 mb-4">
            <span className="bg-blue-700 text-white rounded-full px-4 py-1 text-sm font-semibold">Badge #7845</span>
            <span className="bg-gray-200 text-gray-700 rounded-full px-4 py-1 text-sm font-semibold">ID: {user.user_id}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-2">
            {/* Contact Info */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="flex items-center gap-2 text-gray-700 mb-2"><span className="material-icons">email</span>{user.email}</div>
              <div className="flex items-center gap-2 text-gray-700 mb-2"><span className="material-icons">phone</span>{user.phone}</div>
              <div className="flex items-center gap-2 text-gray-700"><span className="material-icons">location_on</span>{user.address}</div>
            </div>
            {/* Security Info */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold mb-3">Security</h3>
                <div className="flex items-center gap-2 mb-2">Failed Login Attempts <span className="ml-auto text-green-600 font-bold">0</span></div>
              </div>
              <button className="w-full bg-blue-900 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-800 mt-2" onClick={() => setShowPassword(true)}>
                <span className="material-icons"></span> Change Password
              </button>
            </div>
          </div>
          <button className="mt-8 bg-blue-700 text-white px-8 py-2 rounded-lg hover:bg-blue-800 flex items-center gap-2 text-lg font-medium" onClick={() => setShowEdit(true)}>
            <span className="material-icons align-middle"></span> Edit Profile
          </button>
        </div>
        {/* Side Panels */}
        <div className="flex flex-col gap-6 w-full md:w-80">
          {/* Notifications */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-semibold mb-3">Notifications</h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2"><input type="checkbox" checked={notifications.caseUpdates} readOnly /> Case Updates</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={notifications.emergencyAlerts} readOnly /> Emergency Alerts</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={notifications.newAssignments} readOnly /> New Assignments</label>
            </div>
          </div>
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-semibold mb-3">Recent Activity</h3>
            <ul className="text-sm text-gray-700 flex flex-col gap-4">
              {recentActivity.map((item, idx) => (
                <li key={idx} className="flex flex-col gap-0.5 mb-2">
                  <div className="font-semibold text-gray-900">{item.label}</div>
                  <div className="text-gray-500 text-sm mt-0.5">{item.value}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Modals */}
      {showEdit && <EditProfileModal user={user} onClose={() => setShowEdit(false)} onSave={setUser} onChangePassword={() => { setShowEdit(false); setShowPassword(true); }} />}
      {showPassword && <ChangePasswordModal onClose={() => setShowPassword(false)} />}
    </div>
  );
};

export default Profile;
