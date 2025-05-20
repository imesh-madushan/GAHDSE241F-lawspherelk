import React, { useState } from 'react';
import { apiClient } from '../config/apiConfig';

const ChangePasswordModal = ({ onClose }) => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess('Password updated successfully');
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4 text-center">Change Password</h2>
        <input className="w-full mb-3 p-2 border rounded" name="currentPassword" value={form.currentPassword} onChange={handleChange} placeholder="Current Password" type="password" required />
        <input className="w-full mb-3 p-2 border rounded" name="newPassword" value={form.newPassword} onChange={handleChange} placeholder="New Password" type="password" required />
        <input className="w-full mb-3 p-2 border rounded" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm New Password" type="password" required />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <div className="flex gap-2 mt-4">
          <button type="button" className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400" onClick={onClose}>Cancel</button>
          <button type="submit" className="flex-1 bg-blue-700 text-white py-2 rounded hover:bg-blue-800" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordModal;
