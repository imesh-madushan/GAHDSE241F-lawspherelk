import React, { useState, useCallback } from 'react';
import { apiClient } from '../config/apiConfig';
import Cropper from 'react-easy-crop';

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
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  // Helper to get correct photo URL for preview
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const initialPhoto = user.photo?.startsWith('/uploads/')
    ? backendUrl + user.photo
    : (user.photo || '/default-profile.png');
  const [photoPreview, setPhotoPreview] = useState(initialPhoto);
  const [photoFile, setPhotoFile] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = e => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setShowCrop(true);
    }
  };

  const getCroppedImg = async (imageSrc, cropPixels) => {
    // Utility to crop image in browser and return blob
    const createImage = url => new Promise((resolve, reject) => {
      const img = new window.Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', error => reject(error));
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = url;
    });
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height
    );
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleCropSave = async () => {
    const croppedBlob = await getCroppedImg(photoPreview, croppedAreaPixels);
    setPhotoFile(new File([croppedBlob], photoFile.name, { type: 'image/jpeg' }));
    setPhotoPreview(URL.createObjectURL(croppedBlob));
    setShowCrop(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let updatedUser = { ...form };
      // If a new photo is selected, upload it first
      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        const resPhoto = await apiClient.post('/auth/profile/photo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
        updatedUser.photo = resPhoto.data.photo;
      }
      // Update profile info
      const res = await apiClient.put('/auth/profile', updatedUser);
      onSave(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      {showCrop && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
            <div className="relative w-72 h-72">
              <Cropper
                image={photoPreview}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex gap-4 mt-4">
              <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={e => setZoom(Number(e.target.value))} />
              <button type="button" className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleCropSave}>Crop & Set</button>
              <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setShowCrop(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <form className="bg-white rounded-2xl shadow-lg p-0 w-full max-w-2xl" onSubmit={handleSubmit}>
        {/* Profile Picture and Name */}
        <div className="flex flex-col items-center pt-8 pb-2">
          <div className="relative mb-2">
            <img src={photoPreview} alt="Profile" className="w-32 h-32 rounded-full border-4 border-blue-200 object-cover" />
            <button
              type="button"
              className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow hover:bg-gray-200 flex items-center justify-center"
              style={{ width: 40, height: 40 }}
              onClick={() => setShowPhotoMenu(v => !v)}
              aria-label="Edit profile photo"
            >
              {/* Pencil icon SVG from user attachment */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <path d="M16.862 3.487a2.5 2.5 0 0 1 3.535 3.535l-11.01 11.01a2 2 0 0 1-.707.464l-4.243 1.415 1.415-4.243a2 2 0 0 1 .464-.707l11.01-11.01z"/>
                <path d="M15 6l3 3"/>
              </svg>
            </button>
            {showPhotoMenu && (
              <div className="absolute z-10 right-0 bottom-12 bg-white border rounded shadow-lg flex flex-col min-w-[180px] animate-fade-in">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 text-left hover:bg-red-100 border-b text-red-600 transition-colors duration-150 rounded-t"
                  onClick={async () => {
                    setLoading(true);
                    setError('');
                    try {
                      await apiClient.post('/auth/profile/photo', { remove: true }, {
                        headers: { 'Content-Type': 'application/json' },
                        withCredentials: true
                      });
                      setPhotoFile(null);
                      setPhotoPreview('/default-profile.png');
                      setShowPhotoMenu(false);
                    } catch (err) {
                      setError('Failed to remove image');
                    }
                    setLoading(false);
                  }}
                >
                  <span role="img" aria-label="remove">🗑️</span> Remove Image
                </button>
                <label className="flex items-center gap-2 px-4 py-2 text-left hover:bg-blue-100 cursor-pointer transition-colors duration-150 rounded-b">
                  <span role="img" aria-label="upload">📤</span> Upload New Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      handlePhotoChange(e);
                      setShowPhotoMenu(false);
                    }}
                  />
                </label>
              </div>
            )}
          </div>
          <input className="text-3xl font-bold text-center mb-2 outline-none border-b-2 border-transparent focus:border-blue-400 w-2/3" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required />
          {/* Officer role is shown as plain text, not editable */}
          <div className="text-lg font-medium text-center mb-2 text-gray-600">{user.role}</div>
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
            <div className="flex items-center gap-3 text-gray-700 mb-2">
              <img src="/icons/mail.svg" alt="email" className="w-6 h-6" />
              <input className="w-full p-1 border rounded" name="email" value={form.email} onChange={handleChange} placeholder="Email" required type="email" />
            </div>
            <div className="flex items-center gap-3 text-gray-700 mb-2">
              <img src="/icons/phone.svg" alt="phone" className="w-6 h-6" />
              <input className="w-full p-1 border rounded" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required />
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <img src="/icons/location.svg" alt="location" className="w-6 h-6" />
              <input className="w-full p-1 border rounded" name="address" value={form.address} onChange={handleChange} placeholder="Address" required />
            </div>
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
