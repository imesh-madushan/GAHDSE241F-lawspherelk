import React, { useState, useEffect } from 'react';
import { 
  ArrowBack, Edit, Save, Close, Folder, Assignment, 
  Person, CalendarToday, Security, FormatListBulleted, 
  Gavel, Attachment, Visibility, VisibilityOff, Add,
  Description, Timeline, DeviceHub, BarChart
} from '@mui/icons-material';
import { format } from 'date-fns';

// Sample data - in a real app, fetch this from your API
const sampleCase = {
  case_id: "c7e8a5b2-d4f3-9e1c-a8b7-c6d5e4f3a2b1",
  topic: "Robbery at Main Street Jewelry Store",
  case_type: "Robbery",
  status: "In Progress",
  started_dt: "2025-03-15T08:30:00",
  end_dt: null,
  priority: "High",
  leader_id: "u5e6f7g8-h9i0-j1k2-l3m4-n5o6p7q8r9s0",
  leader_name: "Inspector Silva",
  complain_id: "comp123456",
  description: "Armed robbery occurred at Silva Jewelry Store on Main Street. Two masked individuals entered the premises at approximately 10:45 AM and took jewelry worth approximately Rs. 450,000. Surveillance footage available.",
  assignedOfficers: [
    { id: "off1", name: "Sergeant Perera", role: "Lead Investigator" },
    { id: "off2", name: "Constable Fernando", role: "Evidence Collection" }
  ],
  evidence: [
    { id: "ev1", type: "Video", description: "CCTV Footage", location: "Digital Evidence Storage", officer: "Constable Fernando", status: "Analyzing" },
    { id: "ev2", type: "Physical", description: "Footprint Cast", location: "Evidence Room B, Shelf 3", officer: "Sergeant Perera", status: "Collected" }
  ],
  investigations: [
    { id: "inv1", topic: "Witness Interviews", start_dt: "2025-03-15T10:00:00", status: "Completed", location: "Station Interview Room" },
    { id: "inv2", topic: "Store Surveillance Analysis", start_dt: "2025-03-16T09:00:00", status: "In Progress", location: "Digital Forensics Lab" }
  ],
  reports: [
    { id: "rep1", type: "Initial Assessment", created_dt: "2025-03-15T16:30:00", officer: "Inspector Silva", status: "Completed" }
  ],
  updates: [
    { date: "2025-03-17T14:20:00", officer: "Inspector Silva", content: "Identified potential suspect from CCTV footage. Running facial recognition." },
    { date: "2025-03-16T09:45:00", officer: "Sergeant Perera", content: "Completed interviews with store employees. Gathered descriptions of suspects." }
  ]
};

// Sample complaint associated with the case
const sampleComplaint = {
  complain_id: "comp123456",
  description: "Two men entered my jewelry store with weapons and stole multiple items from display cases.",
  complain_dt: "2025-03-15T11:20:00",
  complaint_status: "Assigned",
  witness_name: "Mr. Ranjith Silva",
  officer_name: "Constable Perera"
};

const SingleCaseView = ({ userRole = "CaseLeader" , case_id}) => {
  const [caseData, setCaseData] = useState(sampleCase);
  const [complaint, setComplaint] = useState(sampleComplaint);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCase, setEditedCase] = useState(sampleCase);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Check if user is the case leader and can edit
  const canEdit = userRole === "CaseLeader" || userRole === "OIC" || userRole === "CrimeOIC";
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
    } catch (e) {
      return 'N/A';
    }
  };
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setCaseData(editedCase);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };
  
  const handleCancelEdit = () => {
    setEditedCase(caseData);
    setIsEditing(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedCase(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-white pb-12">
      {/* Header with glassmorphism */}
      <div className="sticky top-0 z-10 backdrop-filter bg-white bg-opacity-70 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          {/* Breadcrumb */}
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <a href="/dashboard" className="hover:text-gray-950">Dashboard</a>
            <span className="mx-2">›</span>
            <a href="/cases" className="hover:text-gray-950">Cases</a>
            <span className="mx-2">›</span>
            <span className="text-white">{caseData.case_id.substring(0, 8)}</span>
          </div>
          
          {/* Title section */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button 
                className="flex mr-3 p-2 rounded-full hover:bg-gray-200 transition-colors"
                onClick={() => window.history.back()}
              >
                <ArrowBack />
              </button>
              <h1 className="text-xl text-center flex justify-center font-bold">{isEditing ? 'Edit Case' : 'Case Details'}</h1>
            </div>
            
            {canEdit && (
              <div>
                {isEditing ? (
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleCancelEdit}
                      className="px-3 py-1 rounded-md bg-blue-800 hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Close className="mr-1" fontSize="small" />
                      Cancel
                    </button>
                    <button 
                      onClick={handleEditToggle}
                      className="px-3 py-1 rounded-md bg-green-600 hover:bg-green-500 transition-colors flex items-center"
                    >
                      <Save className="mr-1" fontSize="small" />
                      Save
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleEditToggle}
                    className="px-3 py-1 rounded-md bg-blue-700 hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <Edit className="mr-1" fontSize="small" />
                    Edit Case
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Case ID and Status */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Folder className="text-yellow-400 mr-2" />
            <div>
              <p className="text-sm text-gray-900">Case Reference</p>
              <p className="font-mono text-gray-400">{caseData.case_id}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            {isEditing ? (
              <select 
                name="status"
                value={editedCase.status}
                onChange={handleInputChange}
                className="bg-blue-800 bg-opacity-50 border border-blue-600 rounded-md px-3 py-1 text-white"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Closed">Closed</option>
                <option value="Critical">Critical</option>
              </select>
            ) : (
              <span className={`px-3 py-1 rounded-full text-sm font-medium
                ${caseData.status === 'Open' ? 'bg-green-900 bg-opacity-70 text-green-300' : 
                caseData.status === 'In Progress' ? 'bg-blue-900 bg-opacity-70 text-blue-300' :
                caseData.status === 'Pending' ? 'bg-yellow-900 bg-opacity-70 text-yellow-300' :
                caseData.status === 'Closed' ? 'bg-gray-900 bg-opacity-70 text-gray-300' :
                'bg-red-900 bg-opacity-70 text-red-300'}`}
              >
                {caseData.status}
              </span>
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Case info */}
          <div className="lg:col-span-2">
            {/* Case details card with glassmorphism */}
            <div className="rounded-xl backdrop-filter backdrop-blur-lg bg-opacity-10 shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
                <Description className="mr-2" />
                Case Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-900 text-sm mb-1">Case Topic</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="topic"
                      value={editedCase.topic}
                      onChange={handleInputChange}
                      className="w-full bg-blue-900 bg-opacity-50 border border-blue-700 rounded-md px-3 py-2 text-white placeholder-blue-300"
                    />
                  ) : (
                    <p className="text-gray-400">{caseData.topic}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-900 text-sm mb-1">Case Type</label>
                  {isEditing ? (
                    <select
                      name="case_type"
                      value={editedCase.case_type}
                      onChange={handleInputChange}
                      className="w-full bg-blue-900 bg-opacity-50 border border-blue-700 rounded-md px-3 py-2 text-white"
                    >
                      <option value="Theft">Theft</option>
                      <option value="Robbery">Robbery</option>
                      <option value="Assault">Assault</option>
                      <option value="Fraud">Fraud</option>
                      <option value="Homicide">Homicide</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-400">{caseData.case_type}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-900 text-sm mb-1">Priority</label>
                  {isEditing ? (
                    <select
                      name="priority"
                      value={editedCase.priority}
                      onChange={handleInputChange}
                      className="w-full bg-blue-900 bg-opacity-50 border border-blue-700 rounded-md px-3 py-2 text-gray-400"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  ) : (
                    <p className="text-gray-400">{caseData.priority}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-900 text-sm mb-1">Case Leader</label>
                  <p className="text-gray-400 flex items-center">
                    <Person className="mr-1 text-gray-400" fontSize="small" />
                    {caseData.leader_name}
                  </p>
                </div>
                
                <div>
                  <label className="block text-gray-900 text-sm mb-1">Start Date</label>
                  <p className="text-gray-400 flex items-center">
                    <CalendarToday className="mr-1 text-gray-400" fontSize="small" />
                    {formatDate(caseData.started_dt)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-gray-900 text-sm mb-1">End Date</label>
                  <p className="text-gray-400 flex items-center">
                    <CalendarToday className="mr-1 text-gray-400" fontSize="small" />
                    {caseData.end_dt ? formatDate(caseData.end_dt) : 'Not completed'}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-gray-900 text-sm mb-1">Description</label>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={editedCase.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full bg-blue-900 bg-opacity-50 border border-blue-700 rounded-md px-3 py-2 text-white placeholder-blue-300"
                  />
                ) : (
                  <p className="text-gray-400">{caseData.description}</p>
                )}
              </div>
            </div>
            
            {/* ..................................................... */}

            {/* Tabs navigation */}
            <div className="mb-6 flex overflow-x-auto">
              <button 
                className={`px-4 py-2 flex items-center mr-4 border-b-2 whitespace-nowrap 
                  ${activeTab === 'overview' ? 'border-blue-400 text-blue-300' : 'border-transparent text-blue-100 hover:text-white'}`}
                onClick={() => setActiveTab('overview')}
              >
                <DeviceHub className="mr-1" fontSize="small" />
                Overview
              </button>
              <button 
                className={`px-4 py-2 flex items-center mr-4 border-b-2 whitespace-nowrap 
                  ${activeTab === 'evidence' ? 'border-blue-400 text-blue-300' : 'border-transparent text-blue-100 hover:text-white'}`}
                onClick={() => setActiveTab('evidence')}
              >
                <Attachment className="mr-1" fontSize="small" />
                Evidence
              </button>
              <button 
                className={`px-4 py-2 flex items-center mr-4 border-b-2 whitespace-nowrap
                  ${activeTab === 'investigations' ? 'border-blue-400 text-blue-300' : 'border-transparent text-blue-100 hover:text-white'}`}
                onClick={() => setActiveTab('investigations')}
              >
                <FormatListBulleted className="mr-1" fontSize="small" />
                Investigations
              </button>
              <button 
                className={`px-4 py-2 flex items-center mr-4 border-b-2 whitespace-nowrap 
                  ${activeTab === 'reports' ? 'border-blue-400 text-blue-300' : 'border-transparent text-blue-100 hover:text-white'}`}
                onClick={() => setActiveTab('reports')}
              >
                <Assignment className="mr-1" fontSize="small" />
                Reports
              </button>
            </div>
            
            {/* Tab content */}
            <div className="rounded-xl backdrop-filter backdrop-blur-lg bg-white bg-opacity-10 shadow-lg p-6">
              {activeTab === 'overview' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Case Timeline</h3>
                    {canEdit && (
                      <button className="text-sm flex items-center px-3 py-1 rounded bg-blue-700 hover:bg-blue-600 transition-colors">
                        <Add fontSize="small" className="mr-1" />
                        Add Update
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {caseData.updates.map((update, index) => (
                      <div key={index} className="relative pl-6 border-l-2 border-blue-500 pb-6">
                        <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                        <p className="text-xs text-blue-300">{formatDate(update.date)}</p>
                        <p className="text-sm font-medium text-white">{update.officer}</p>
                        <p className="text-sm text-blue-100 mt-1">{update.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'evidence' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Evidence</h3>
                    {canEdit && (
                      <button className="text-sm flex items-center px-3 py-1 rounded bg-blue-700 hover:bg-blue-600 transition-colors">
                        <Add fontSize="small" className="mr-1" />
                        Add Evidence
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {caseData.evidence.map((item, index) => (
                      <div key={index} className="rounded-lg bg-blue-900 bg-opacity-40 p-4 border border-blue-800">
                        <div className="flex justify-between items-start mb-2">
                          <span className="px-2 py-1 text-xs rounded-md bg-blue-800">{item.type}</span>
                          <span className="px-2 py-1 text-xs rounded-md bg-yellow-900 text-yellow-300">{item.status}</span>
                        </div>
                        <h4 className="font-semibold text-white mb-2">{item.description}</h4>
                        <div className="text-sm text-blue-200">
                          <p className="flex items-center mb-1">
                            <Security fontSize="small" className="mr-1" />
                            Officer: {item.officer}
                          </p>
                          <p className="flex items-center">
                            <Folder fontSize="small" className="mr-1" />
                            Location: {item.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'investigations' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Investigations</h3>
                    {canEdit && (
                      <button className="text-sm flex items-center px-3 py-1 rounded bg-blue-700 hover:bg-blue-600 transition-colors">
                        <Add fontSize="small" className="mr-1" />
                        New Investigation
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {caseData.investigations.map((investigation, index) => (
                      <div key={index} className="rounded-lg bg-blue-900 bg-opacity-40 p-4 border border-blue-800">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white">{investigation.topic}</h4>
                          <span className={`px-2 py-1 text-xs rounded-md ${
                            investigation.status === 'Completed' ? 'bg-green-900 text-green-300' : 
                            'bg-blue-800 text-blue-300'
                          }`}>{investigation.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-blue-200">
                          <p className="flex items-center">
                            <CalendarToday fontSize="small" className="mr-1" />
                            Start: {formatDate(investigation.start_dt)}
                          </p>
                          <p className="flex items-center">
                            <Folder fontSize="small" className="mr-1" />
                            Location: {investigation.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'reports' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Reports</h3>
                    {canEdit && (
                      <button className="text-sm flex items-center px-3 py-1 rounded bg-blue-700 hover:bg-blue-600 transition-colors">
                        <Add fontSize="small" className="mr-1" />
                        Create Report
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {caseData.reports.map((report, index) => (
                      <div key={index} className="rounded-lg bg-blue-900 bg-opacity-40 p-4 border border-blue-800">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white">{report.type}</h4>
                          <span className="px-2 py-1 text-xs rounded-md bg-green-900 text-green-300">{report.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-blue-200">
                          <p className="flex items-center">
                            <Person fontSize="small" className="mr-1" />
                            Officer: {report.officer}
                          </p>
                          <p className="flex items-center">
                            <CalendarToday fontSize="small" className="mr-1" />
                            Created: {formatDate(report.created_dt)}
                          </p>
                        </div>
                        <div className="flex justify-end mt-2">
                          <button className="text-blue-300 hover:text-blue-200 text-sm flex items-center">
                            <Visibility fontSize="small" className="mr-1" />
                            View Report
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right sidebar - Related info */}
          <div className="space-y-6">
            {/* Complaint card */}
            <div className="rounded-xl backdrop-filter backdrop-blur-lg bg-white bg-opacity-10 shadow-lg p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Assignment className="mr-2" />
                Related Complaint
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-blue-300">Complaint ID</p>
                  <p className="text-white font-mono">{complaint.complain_id}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-300">Filed On</p>
                  <p className="text-white">{formatDate(complaint.complain_dt)}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-300">Complainer</p>
                  <p className="text-white">{complaint.witness_name}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-300">Description</p>
                  <p className="text-white text-sm">{complaint.description}</p>
                </div>
                <div className="pt-2">
                  <button className="w-full text-blue-300 hover:text-blue-200 text-sm py-1 border border-blue-500 rounded-md flex items-center justify-center">
                    <Visibility fontSize="small" className="mr-1" />
                    View Full Complaint
                  </button>
                </div>
              </div>
            </div>
            
            {/* Assigned officers */}
            <div className="rounded-xl backdrop-filter backdrop-blur-lg bg-white bg-opacity-10 shadow-lg p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Person className="mr-2" />
                  Assigned Officers
                </h3>
                {canEdit && (
                  <button className="text-sm p-1 rounded-full bg-blue-700 hover:bg-blue-600 transition-colors">
                    <Add fontSize="small" />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {caseData.assignedOfficers.map((officer, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-blue-900 bg-opacity-40">
                    <div>
                      <p className="text-white font-medium">{officer.name}</p>
                      <p className="text-xs text-blue-300">{officer.role}</p>
                    </div>
                    <button className="text-blue-300 hover:text-blue-200">
                      <Visibility fontSize="small" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Statistics card */}
            <div className="rounded-xl backdrop-filter backdrop-blur-lg bg-white bg-opacity-10 shadow-lg p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <BarChart className="mr-2" />
                Case Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-blue-200">Evidence Items</p>
                  <p className="text-white font-bold">{caseData.evidence.length}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-blue-200">Investigations</p>
                  <p className="text-white font-bold">{caseData.investigations.length}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-blue-200">Reports Generated</p>
                  <p className="text-white font-bold">{caseData.reports.length}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-blue-200">Days Active</p>
                  <p className="text-white font-bold">43</p>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="rounded-xl backdrop-filter backdrop-blur-lg bg-white bg-opacity-10 shadow-lg p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full py-2 text-sm bg-blue-700 hover:bg-blue-600 transition-colors rounded-md text-white flex items-center justify-center">
                  <Assignment className="mr-2" fontSize="small" />
                  Create New Report
                </button>
                <button className="w-full py-2 text-sm bg-indigo-700 hover:bg-indigo-600 transition-colors rounded-md text-white flex items-center justify-center">
                  <FormatListBulleted className="mr-2" fontSize="small" />
                  Add Investigation Task
                </button>
                {canEdit && (
                  <button className="w-full py-2 text-sm bg-green-700 hover:bg-green-600 transition-colors rounded-md text-white flex items-center justify-center">
                    <Gavel className="mr-2" fontSize="small" />
                    Register Offence
                  </button>
                )}
                {(userRole === "OIC" || userRole === "CrimeOIC") && (
                  <button className="w-full py-2 text-sm bg-red-700 hover:bg-red-600 transition-colors rounded-md text-white flex items-center justify-center">
                    <Close className="mr-2" fontSize="small" />
                    Close Case
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleCaseView;