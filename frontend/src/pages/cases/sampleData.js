export const sampleCase = {
  case_id: "c7e8a5b2-d4f3-9e1c-a8b7-c6d5e4f3a2b1",
  topic: "Robbery at Main Street Jewelry Store",
  case_type: "Robbery",
  status: "inprogress",
  started_dt: "2025-03-15T08:30:00",
  end_dt: null,
  leader_id: "U002",
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
  ],
  offences: [
    { 
      id: "off1", 
      type: "Armed Robbery", 
      section: "Penal Code Section 380",
      act: "Robbery Act",
      punishment: "5-10 years imprisonment", 
      description: "Forceful seizure of property while armed with a deadly weapon",
      status: "Confirmed", 
      registered_dt: "2025-03-18T14:30:00",
      registered_by: "Inspector Silva",
      suspect: "Unknown Suspect (At Large)"
    },
    { 
      id: "off2", 
      type: "Assault", 
      section: "Penal Code Section 315",
      act: "Criminal Act",
      punishment: "2-5 years imprisonment", 
      description: "Physical assault on store clerk during robbery",
      status: "Pending Confirmation", 
      registered_dt: "2025-03-18T14:45:00",
      registered_by: "Sergeant Perera",
      suspect: "Unknown Suspect (At Large)"
    }
  ]
};

export const sampleComplaint = {
  complain_id: "comp123456",
  description: "Two men entered my jewelry store with weapons and stole multiple items from display cases.",
  complain_dt: "2025-03-15T11:20:00",
  complaint_status: "Assigned",
  witness_name: "Mr. Ranjith Silva",
  officer_name: "Constable Perera"
};

export const officersList = [
    {
        id: "u5e6f7g8-h9i0-j1k2-l3m4-n5o6p7q8r9s0",
        name: "Inspector Silva",
        role: "Crime Investigation Department",
        image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
        id: "u1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6",
        name: "Inspector Perera",
        role: "Narcotics Bureau",
        image: "https://randomuser.me/api/portraits/men/43.jpg"
    },
    {
        id: "u7x8y9z0-a1b2-c3d4-e5f6-g7h8i9j0k1l2",
        name: "Inspector Fernando",
        role: "Special Task Force",
        image: "https://randomuser.me/api/portraits/men/57.jpg"
    },
    {
        id: "u3p4q5r6-s7t8-u9v0-w1x2-y3z4a5b6c7d8",
        name: "Sub Inspector Gunawardena",
        role: "Criminal Records Division",
        image: "https://randomuser.me/api/portraits/men/21.jpg"
    },
    {
        id: "u9m8n7o6-p5q4-r3s2-t1u0-v9w8x7y6z5a4",
        name: "Sub Inspector Jayasinghe",
        role: "Fraud Investigation Unit",
        image: "https://randomuser.me/api/portraits/men/67.jpg"
    }
];
