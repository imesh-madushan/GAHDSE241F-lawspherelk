import './App.css'
import Dashboard from './pages/homepages/Dashboard'
import Layout from './pages/Layout';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/settings/SettingsPage';
import Login from './pages/login';
import SingleCaseView from './pages/cases/SingleCaseView';
import SingleComplainView from './pages/complaints/SingleComplainView';
import OnlineComplaintsPage from './pages/onlinecomplaints/OnlineComplaintsPage';
import SingleOnlineComplaintView from './pages/onlinecomplaints/SingleOnlineComplaintView';
import CasesPage from './pages/cases/CasesPage';
import ComplaintsPage from './pages/complaints/ComplaintsPage';
import CriminalRecord from './pages/criminalrecord/CriminalRecord';
import CriminalsPage from './pages/criminalrecord/CriminalsPage';
import CrimeOffencesPage from './pages/crimeoffences/CrimeOffencesPage';
import SingleOffenceView from './pages/crimeoffences/SingleOffenceView';
import InvestigationsPage from './pages/investigations/InvestigationsPage';
import Test from './pages/Test';
import OfficerProfile from './pages/officers/OfficerProfile';
import AllOfficersPage from './pages/officers/AllOfficersPage';
import SingleInvestigationView from './pages/investigations/SingleInvestigationView';
import EvidencesPage from './pages/evidences/EvidencesPage';
import SingleEvidenceView from './pages/evidences/SingleEvidenceView';
import NotesPage from './pages/notes/NotesPage';
import AuditPage from './pages/audit/AuditPage';
import SingleAuditView from './pages/audit/SingleAuditView';
import { useAuth } from './contexts/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (for login page)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  // If user is logged in and tries to access login page, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="cases" element={<CasesPage />} />
        <Route path="cases/:caseId" element={<SingleCaseView />} />
        <Route path="complaints" element={<ComplaintsPage />} />
        <Route path="complaints/:complaintId" element={<SingleComplainView />} />        <Route path="onlinecomplaints" element={<OnlineComplaintsPage />} />
        <Route path="onlinecomplaints/:complaintId" element={<SingleOnlineComplaintView />} />
        <Route path="criminals" element={<CriminalsPage />} />
        <Route path="criminals/:criminalId" element={<CriminalRecord />} />
        <Route path="crimeoffences" element={<CrimeOffencesPage />} />
        <Route path="crimeoffences/:offenceId" element={<SingleOffenceView />} />
        <Route path="investigations" element={<InvestigationsPage />} />
        <Route path="investigations/:investigationId" element={<SingleInvestigationView />} />
        <Route path="evidences" element={<EvidencesPage />} />
        <Route path="evidences/:evidenceId" element={<SingleEvidenceView />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="officers" element={<AllOfficersPage />} />
        <Route path="officers/:officerId" element={<OfficerProfile />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="audit/:batchId" element={<SingleAuditView />} />
        <Route path="test" element={<Test />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* 404 Not Found */}
      <Route path="*" element={
        <>
          <h1>404 Not Found</h1>
          <p>The page you are looking for does not exist.</p>
        </>
      } />
    </Routes>
  )
}

export default App