import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
 import Dashboard from './pages/Dashboard';
 import Students from './pages/Students';
 import AddStudent from './pages/AddStudent';
 import Departments from './pages/Departments';
// import Upload from './pages/Upload';
// import Placement from './pages/Placement';
// import Results from './pages/Results';

function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated() ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/students" element={<Students />} />
                <Route path="/students/add" element={<AddStudent />} />
                <Route path="/departments" element={<Departments />} />
                {/* <Route path="/upload" element={<Upload />} />
                <Route path="/placement" element={<Placement />} />
                <Route path="/results" element={<Results />} />  */}
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;