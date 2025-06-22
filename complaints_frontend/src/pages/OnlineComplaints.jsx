import React, { useState, useEffect } from 'react';
import { 
  Send, 
  User, 
  FileText, 
  AlertTriangle,
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Shield,
  Phone
} from 'lucide-react';
import govLogo from '../assets/Sri Lanka Government.jpg';
import { apiClient } from '../config/apiConfig';
import { caseTypes } from '../../data';

const OnlineComplaintForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successComplaintId, setSuccessComplaintId] = useState(null);
  
  const [complaintData, setComplaintData] = useState({
    description: '',
    complaintType: ''
  });
  
  const [complainantData, setComplainantData] = useState({
    nic: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    dob: ''
  });
  
  const [fieldErrors, setFieldErrors] = useState({});
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [evidenceError, setEvidenceError] = useState(null);


  
  const validateStep1 = () => {
    const errors = {};
    if (!complaintData.complaintType) {
      errors.complaintType = 'Please select a complaint type';
    }
    if (!complaintData.description.trim()) {
      errors.description = 'Please provide a detailed description';
    } else if (complaintData.description.trim().length < 20) {
      errors.description = 'Description must be at least 20 characters long';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    
    if (!complainantData.name.trim()) {
      errors.name = 'Full name is required';
    }
    
    if (!complainantData.nic.trim()) {
      errors.nic = 'NIC number is required';
    } else if (!/^(\d{9}[vVxX]|\d{12})$/.test(complainantData.nic.trim())) {
      errors.nic = 'Invalid NIC format (e.g., 123456789V or 199812345678)';
    }
    
    if (!complainantData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^0\d{9}$/.test(complainantData.phone.trim())) {
      errors.phone = 'Invalid phone format (10 digits starting with 0)';
    }
    
    if (!complainantData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(complainantData.email.trim())) {
      errors.email = 'Invalid email format';
    }
    
    if (!complainantData.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!complainantData.dob) {
      errors.dob = 'Date of birth is required';
    } else {
      const dobDate = new Date(complainantData.dob);
      const today = new Date();
      const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
      const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());

      if (dobDate > today) {
        errors.dob = 'Date of birth cannot be in the future';
      } else if (dobDate < minDate) {
        errors.dob = 'Date of birth cannot be more than 120 years ago';
      } else if (dobDate > fiveYearsAgo) {
        errors.dob = 'You must be at least 5 years old to file a complaint';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleComplaintChange = (e) => {
    const { name, value } = e.target;
    setComplaintData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleComplainantChange = (e) => {
    const { name, value } = e.target;
    setComplainantData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleEvidenceChange = (e) => {
    const files = Array.from(e.target.files);
    // Validate file types and sizes
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/mpeg',
      'audio/wav',
      'video/mp4',
      'video/x-msvideo',
      'video/quicktime',
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed'
    ];
    let error = null;
    // Combine new files with existing ones, but avoid duplicates by name+size
    let combined = [...evidenceFiles];
    files.forEach(f => {
      if (!combined.some(existing => existing.name === f.name && existing.size === f.size)) {
        combined.push(f);
      }
    });
    if (combined.length > 10) {
      error = 'You can upload up to 10 files only.';
      combined = combined.slice(0, 10);
    } else if (combined.some(f => !allowedTypes.includes(f.type))) {
      error = 'Only images, audio, video, and document files are allowed.';
      combined = combined.filter(f => allowedTypes.includes(f.type));
    } else if (combined.some(f => f.size > 50 * 1024 * 1024)) {
      error = 'Each file must be less than 50MB.';
      combined = combined.filter(f => f.size <= 50 * 1024 * 1024);
    }
    setEvidenceError(error);
    setEvidenceFiles(combined);
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setEvidenceError(null);
    try {
      // Prepare data for API
      const onlineComplaintData = {
        complaint_type: complaintData.complaintType,
        description: complaintData.description,
        complainant_full_name: complainantData.name,
        nic_no: complainantData.nic,
        dob: complainantData.dob,
        phone_no: complainantData.phone,
        email: complainantData.email,
        address: complainantData.address,
        // evidence: evidenceFiles 
      };
      console.log('[DEBUG] Submitting complaint payload:', onlineComplaintData);
      // If you want to send files later, use FormData and append fields/files
      // const formData = new FormData();
      // Object.entries(onlineComplaintData).forEach(([key, value]) => formData.append(key, value));
      // evidenceFiles.forEach((file) => formData.append('evidence', file));
      // Send to backend
      const response = await apiClient.post('/complaints/online/create', onlineComplaintData);
      console.log('[DEBUG] API response:', response.data);
      setSuccessComplaintId(response.data.complaint_id);
      setShowSuccess(true);
      
    } catch (err) {
      console.error('[ERROR] Failed to submit complaint:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setFieldErrors({ general: err.response.data.message });
      } else {
        setFieldErrors({ general: 'Failed to submit complaint.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setComplaintData({ description: '', complaintType: '' });
    setComplainantData({ nic: '', name: '', phone: '', email: '', address: '', dob: '' });
    setFieldErrors({});
    setCurrentStep(1);
    setShowSuccess(false);
  };

  { /* Success message  */ }
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 text-center transform animate-in fade-in duration-700">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Complaint Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your complaint has been received and assigned reference number <span className="font-mono font-semibold text-blue-600">{successComplaintId ? `#${successComplaintId}` : ''}</span>.
            You will receive updates via email.
          </p>
          <button
            onClick={resetForm}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            Submit Another Complaint
          </button>
        </div>
      </div>
    );
  }
  
  {/* Main Form Container */}
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a3261] to-[#19387a] shadow-md border-b border-[#14244a] rounded-tr-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center space-x-5">
              <img
                src={govLogo}
                alt="Sri Lanka Government"
                className="w-20 h-20 rounded-l-3xl object-contain bg-white p-2"
                style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}
              />
              <div>
                <h1 className="text-3xl font-bold text-white leading-tight">CitizenCare Portal - Sri Lanka Police</h1>
                <p className="text-lg font-semibold text-yellow-300 tracking-wide mt-1">Online Complaint System</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm text-blue-100 font-medium">
              <span>24/7 Support Available</span>
              <span className="h-4 w-px bg-blue-200"></span>
              <span>Secure & Confidential</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Progress Bar */}
        <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Submit Your Complaint</h2>
            <span className="text-sm text-gray-500">Step {currentStep} of 2</span>
          </div>
          <div className="flex items-center justify-between mb-2 px-2">
            {/* Step 1 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300
                ${currentStep >= 1 ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-gray-200 border-gray-300 text-gray-400'}`}>
                1
              </div>
              <span className={`mt-2 text-xs font-semibold ${currentStep >= 1 ? 'text-blue-700' : 'text-gray-400'}`}>Complaint Details</span>
            </div>
            {/* Connector */}
            <div className="flex-1 h-1 mx-2 bg-gradient-to-r from-blue-600 via-purple-500 to-purple-400 rounded-full relative">
              <div
                className="absolute top-0 left-0 h-1 bg-blue-600 rounded-full transition-all duration-500"
                style={{
                  width: currentStep === 1 ? '0%' : '100%',
                  zIndex: 1
                }}
              />
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300
                ${currentStep === 2 ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-gray-200 border-gray-300 text-gray-400'}`}>
                2
              </div>
              <span className={`mt-2 text-xs font-semibold ${currentStep === 2 ? 'text-blue-700' : 'text-gray-400'}`}>Personal Information</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {currentStep === 1 && (
            <div className="p-8 space-y-8 animate-in slide-in-from-right duration-500">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Tell Us What Happened</h3>
                <p className="text-gray-600">Provide details about your complaint so we can help you better</p>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    <FileText className="w-4 h-4 inline mr-2" />
                    What type of complaint is this? <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="complaintType"
                    value={complaintData.complaintType}
                    onChange={handleComplaintChange}
                    className={`w-full px-4 py-4 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 ${
                      fieldErrors.complaintType ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <option value="">Choose a category that best describes your complaint</option>
                    {caseTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {fieldErrors.complaintType && (
                    <div className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {fieldErrors.complaintType}
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Describe your complaint in detail <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={complaintData.description}
                    onChange={handleComplaintChange}
                    placeholder="Please provide a clear and detailed description of your complaint. Include relevant dates, locations, and any other important information that will help us understand your situation better..."
                    rows={6}
                    className={`w-full px-4 py-4 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-none text-gray-900 ${
                      fieldErrors.description ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                  <div className="flex justify-between items-center mt-2">
                    {fieldErrors.description ? (
                      <div className="flex items-center text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {fieldErrors.description}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Minimum 20 characters required</p>
                    )}
                    <span className="text-sm text-gray-400">{complaintData.description.length}/1000</span>
                  </div>
                </div>

                {/* Evidence Upload Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <label className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                    Attach Evidences
                    <span className="ml-2 text-xs text-gray-400 font-normal">(optional, max 10 files, 50MB each)</span>
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${evidenceError ? 'border-red-400 bg-red-50' : 'border-blue-200 bg-blue-50 hover:bg-blue-100'}`}
                    onClick={() => document.getElementById('evidence-upload-input').click()}
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEvidenceChange({ target: { files: e.dataTransfer.files } });
                    }}
                    style={{ minHeight: '120px' }}
                  >
                    <svg className="w-10 h-10 text-blue-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 16V4m0 0l-4 4m4-4l4 4"/><rect x="4" y="16" width="16" height="4" rx="2"/></svg>
                    <span className="text-blue-700 font-semibold">Click or drag files here to upload</span>
                    <span className="text-xs text-gray-500 mt-1">Images, audio, video, documents. Max 10 files, 50MB each.</span>
                    <input
                      id="evidence-upload-input"
                      type="file"
                      multiple
                      accept="image/*,audio/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z,.mp3,.wav,.mp4,.avi,.mov,.wmv,.mkv"
                      onChange={handleEvidenceChange}
                      className="hidden"
                    />
                  </div>
                  {evidenceFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {evidenceFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center bg-white rounded-lg border border-gray-200 px-3 py-2 shadow-sm relative">
                          {file.type.startsWith('image/') ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-10 h-10 object-cover rounded border border-gray-200 mr-3"
                              onLoad={e => URL.revokeObjectURL(e.target.src)}
                            />
                          ) : file.type.startsWith('audio/') ? (
                            <span className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center border border-blue-100 mr-3">
                              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 19V6l12-2v13"/><circle cx="6" cy="18" r="3"/></svg>
                            </span>
                          ) : file.type.startsWith('video/') ? (
                            <span className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center border border-blue-100 mr-3">
                              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            </span>
                          ) : (
                            <span className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center border border-blue-100 mr-3">
                              <FileText className="w-5 h-5 text-blue-500" />
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="block truncate text-sm font-medium text-gray-800">{file.name}</span>
                            <span className="block text-xs text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                          </div>
                          <button
                            type="button"
                            className="ml-2 text-red-500 hover:text-red-700 text-lg font-bold px-2"
                            onClick={e => {
                              e.stopPropagation();
                              setEvidenceFiles(prev => prev.filter((_, i) => i !== idx));
                            }}
                            aria-label="Remove file"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <div className="text-xs text-gray-500 mt-1">{evidenceFiles.length} file(s) attached</div>
                    </div>
                  )}
                  {evidenceError && (
                    <div className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {evidenceError}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                >
                  <span>Continue</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="p-8 space-y-8 animate-in slide-in-from-right duration-500">
              <div className="max-w-xl mx-auto bg-blue-50 rounded-2xl p-8 border border-blue-100 shadow-md">
                <div className="flex items-center mb-6">
                  <User className="w-6 h-6 text-blue-700 mr-2" />
                  <h3 className="text-xl font-bold text-blue-900">Complainant Details</h3>
                </div>
                <div className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={complainantData.name}
                      onChange={handleComplainantChange}
                      placeholder="Enter full name"
                      className={`w-full px-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 text-gray-900 ${
                        fieldErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    {fieldErrors.name && (
                      <div className="flex items-center mt-1 text-red-600 text-xs">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {fieldErrors.name}
                      </div>
                    )}
                  </div>
                  {/* NIC Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      NIC Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                      </span>
                      <input
                        type="text"
                        name="nic"
                        value={complainantData.nic}
                        onChange={handleComplainantChange}
                        placeholder="123456789V or 199812345678"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 text-gray-900 ${
                          fieldErrors.nic ? 'border-red-500 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {fieldErrors.nic && (
                      <div className="flex items-center mt-1 text-red-600 text-xs">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {fieldErrors.nic}
                      </div>
                    )}
                  </div>
                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">
                        {/* Calendar icon */}
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                      </span>
                      <input
                        type="date"
                        name="dob"
                        value={complainantData.dob}
                        onChange={handleComplainantChange}
                        placeholder="mm/dd/yyyy"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 text-gray-900 ${
                          fieldErrors.dob ? 'border-red-500 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {fieldErrors.dob && (
                      <div className="flex items-center mt-1 text-red-600 text-xs">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {fieldErrors.dob}
                      </div>
                    )}
                  </div>
                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        value={complainantData.phone}
                        onChange={handleComplainantChange}
                        placeholder="0771234567"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 text-gray-900 ${
                          fieldErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {fieldErrors.phone && (
                      <div className="flex items-center mt-1 text-red-600 text-xs">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {fieldErrors.phone}
                      </div>
                    )}
                  </div>
                  {/* Email Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={complainantData.email}
                      onChange={handleComplainantChange}
                      placeholder="example@email.com"
                      className={`w-full px-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 text-gray-900 ${
                        fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    {fieldErrors.email && (
                      <div className="flex items-center mt-1 text-red-600 text-xs">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {fieldErrors.email}
                      </div>
                    )}
                  </div>
                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">
                        {/* MapPin icon */}
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21c-4.418 0-8-4.03-8-9a8 8 0 1 1 16 0c0 4.97-3.582 9-8 9z"/><circle cx="12" cy="12" r="3"/></svg>
                      </span>
                      <textarea
                        name="address"
                        value={complainantData.address}
                        onChange={handleComplainantChange}
                        placeholder="Enter full address"
                        rows={2}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 resize-none text-gray-900 ${
                          fieldErrors.address ? 'border-red-500 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {fieldErrors.address && (
                      <div className="flex items-center mt-1 text-red-600 text-xs">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {fieldErrors.address}
                      </div>
                    )}
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-8">
                  <button
                    onClick={handleBack}
                    className="flex items-center px-6 py-3 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-all duration-200"
                  >
                    <span className="mr-2">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
                    </span>
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 disabled:opacity-60"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Create Complaint'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Your complaint will be processed within 2-3 days. You will receive email updates about the status.</p>
          <p className="mt-2">For urgent matters, please call our 24/7 hotline: <span className="font-semibold text-blue-600">119</span></p>
        </div>
      </div>
    </div>
  );
};

export default OnlineComplaintForm;