import './App.css'
import OICDashboard from './pages/homepages/OICDashboard'
import { Route, Routes } from 'react-router-dom'; 
import ProtectedRoutes from './utils/ProtectedRoutes';
import { apiClient } from './config/apiConfig';

function App() {
  // temp login
  // const login = async () => await apiClient.post('/auth/login', 
  //   {
  //     username: 'user1',
  //     password: 'abcd1234'
  //   }, 
  //   { 
  //     withCredentials: true,
  //     headers: {
  //       'Content-Type': 'application/json',
  //     } 
  //   }
  // )
  // .then(res => console.log(res.data))
  // .catch(err => console.log(err.response.data));

  // login();

  return (
    <Routes>
      <Route exact path="/" element={
        <>
          <h1>Welcome to the Application</h1>
          <p>Please log in to access your dashboard.</p>
        </>} 
      />

      <Route element={<ProtectedRoutes />}>
        <Route path="/home" element={<OICDashboard />} />
      </Route>

      <Route path="*" element={
        <>
          <h1>404 Not Found</h1>
          <p>The page you are looking for does not exist.</p>
        </>}
      />
    </Routes>
  )
}

export default App