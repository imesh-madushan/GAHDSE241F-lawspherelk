import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import OnlineComplaints from './pages/OnlineComplaints'

function App() {
  return (
    <Routes>
      <Route path="/complaints/create/online" element={<OnlineComplaints />} />
      <Route path="/" element={<Navigate to="/complaints/create/online" />} />
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
