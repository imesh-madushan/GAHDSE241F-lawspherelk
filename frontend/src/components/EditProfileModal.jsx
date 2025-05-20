import React, { useState } from 'react';
import { apiClient } from '../config/apiConfig';

const EditProfileModal = ({ user, onClose, onSave, onChangePassword }) => {
  const [form, setForm] = useState({
    name: user.name,
    role: user.role,
    email: user.email,
    phone: user.phone,
    address: user.address,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.put('/auth/profile', form);
      onSave(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form className="bg-white rounded-2xl shadow-lg p-0 w-full max-w-2xl" onSubmit={handleSubmit}>
        {/* Profile Picture and Name */}
        <div className="flex flex-col items-center pt-8 pb-2">
          <img src={user.photo || '/default-profile.png'} alt="Profile" className="w-32 h-32 rounded-full border-4 border-blue-200 object-cover mb-2" />
          <input className="text-3xl font-bold text-center mb-2 outline-none border-b-2 border-transparent focus:border-blue-400 w-2/3" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required />
          <select className="text-lg font-medium text-center mb-2 outline-none border-b-2 border-transparent focus:border-blue-400 w-2/3" name="role" value={form.role} onChange={handleChange} required>
            <option value="OIC">OIC</option>
            <option value="Crime OIC">Crime OIC</option>
            <option value="Sub Inspector">Sub Inspector</option>
            <option value="Sergeant">Sergeant</option>
            <option value="Police Constable">Police Constable</option>
            <option value="Forensic Leader">Forensic Leader</option>
          </select>
          <div className="flex gap-2 mb-2">
            <span className="bg-blue-700 text-white rounded-full px-3 py-1 text-xs font-semibold">Badge #7845</span>
            <span className="bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-xs font-semibold">ID: {user.user_id}</span>
          </div>
        </div>
        {/* Contact and Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-8 pb-4">
          {/* Contact Info */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h3 className="font-semibold mb-2">Contact Information</h3>
            <div className="flex items-center gap-2 text-gray-700 mb-2"><span className="material-icons">email</span><input className="w-full p-1 border rounded" name="email" value={form.email} onChange={handleChange} placeholder="Email" required type="email" /></div>
            <div className="flex items-center gap-2 text-gray-700 mb-2"><span className="material-icons">phone</span><input className="w-full p-1 border rounded" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required /></div>
            <div className="flex items-center gap-2 text-gray-700"><span className="material-icons">location_on</span><input className="w-full p-1 border rounded" name="address" value={form.address} onChange={handleChange} placeholder="Address" required /></div>
          </div>
          {/* Security Info */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold mb-2">Security</h3>
              <div className="flex items-center gap-2 mb-2">Failed Login Attempts <span className="ml-auto text-green-600 font-bold">0</span></div>
            </div>
            <button type="button" className="w-full bg-blue-900 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-800 mt-2" onClick={e => {e.preventDefault(); onChangePassword && onChangePassword();}}>
              <span className="material-icons"></span> Change Password
            </button>
          </div>
        </div>
        {error && <div className="text-red-600 mb-2 text-center">{error}</div>}
        <div className="flex gap-2 justify-center p-6 pt-0">
          <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          <button type="button" className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileModal;
