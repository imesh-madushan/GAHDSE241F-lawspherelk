import './App.css'
import Dashboard from './pages/homepages/Dashboard'
import Layout from './pages/Layout';
import { Route, Router, Routes } from 'react-router-dom';
import ProtectedRoutes from './utils/ProtectedRoutes';
import { apiClient } from './config/apiConfig';
import SingleCaseView from './pages/cases/SingleCaseView';
import SingleComplainView from './pages/complaints/SingleComplainView';
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

function App() {
  // temp login
  const login = async () => await apiClient.post('/auth/login',
    {
      username: 'user1',
      password: 'abcd1234'
    }
  )

  login();

  return (
    <Routes>
      {/* public welcome page */}
      <Route path="/" element={
        <>
          <h1>Welcome to the Application</h1>
          <p>Please log in to access your dashboard.</p>
        </>
      } />

      {/* protected routes */}
      <Route element={<ProtectedRoutes />}>
        <Route element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="cases" element={<CasesPage />} />
          <Route path="cases/:caseId" element={<SingleCaseView />} />
          <Route path="complaints" element={<ComplaintsPage />} />
          <Route path="complaints/:complaintId" element={<SingleComplainView />} />
          <Route path="criminals" element={<CriminalsPage />} />
          <Route path="criminals/:criminalId" element={<CriminalRecord />} />
          <Route path="crimeoffences" element={<CrimeOffencesPage />} />
          <Route path="crimeoffences/:offenceId" element={<SingleOffenceView />} />
          <Route path="investigations" element={<InvestigationsPage />} />
          <Route path="investigations/:investigationId" element={<SingleInvestigationView />} />
          <Route path="evidences" element={<EvidencesPage />} />
          <Route path="evidences/:evidenceId" element={<SingleEvidenceView />} />
          <Route path="officers" element={<AllOfficersPage />} />
          <Route path="officers/:officerId" element={<OfficerProfile />} />
          <Route path="recordhistory" element={<div>Record History</div>} />
          <Route path="recordhistory/:table/:id" element={<div>Record History table and id</div>} />
          <Route path="test" element={<Test />} />
        </Route>
      </Route>

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