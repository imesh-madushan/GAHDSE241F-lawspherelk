import './App.css'
import Dashboard from './pages/homepages/Dashboard'
import Layout from './pages/Layout';
import { Route, Router, Routes } from 'react-router-dom';
import ProtectedRoutes from './utils/ProtectedRoutes';
import { apiClient } from './config/apiConfig';
import Login from './pages/login';

function App() {
  // temp login
  const login = async () => await apiClient.post('/auth/login',
    {
      username: 'user1',
      password: 'abcd1234'
    },
    {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  )
    .then(res => console.log(res.data))
    .catch(err => console.log(err.response.data));

   //login();

  return (
    <Routes>
      {/* public welcome page */}
      <Route path="/" element={
        <>
          <h1>Welcome to the Application</h1>
          <p>Please log in to access your dashboard.</p>
        </>
      } />
      <Route path="login" element={<Login />} />

      {/* protected routes */}
      <Route element={<ProtectedRoutes />}>
        <Route element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="complaints" element={<div>complaints</div>} />
          <Route path="cases" element={<div>cases</div>} />
          <Route path="cases/:caseId" element={<div>single case page</div>} />
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