import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import AddStudent from './pages/AddStudent';
import Departments from './pages/Departments';
import Upload from './pages/Upload';
import Placement from './pages/Placement';
import Results from './pages/Results';
import HomePage from './pages/homepage'
import Signup from './pages/Signup'
import CreateStudent from './components/createStudents'
import StudentDashboard from './pages/studentDashboard'
import AdminDashboard from './pages/adminDashboard'
import PrivateRoute from './components/privateRoute'
import Unauthorized from './pages/unauthorized'
import Logout from './pages/logout'
import DepartmentPreferencePage from './pages/departmentPreferences'
import RankingPage from './pages/viewRanking'
import ViewStudents from './pages/viewStudents'
import FirstSemPlacement from './components/NatFirstSem'
import AdminPreferencesPage from './pages/adminViewPreferences'
function App() {
  return (



    <Router>
        <Routes>
      {/* public routes */}
      <Route path="/login" element={<Login/>}/>
      <Route path="/logout" element={<Logout/>}/>
      <Route path="/" element={<HomePage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Student Protected Routes */}
      <Route element={<PrivateRoute allowedRoles={["student"]} />}>
          {/* <Route element={<StudentLayout />}> */}
              <Route path="/student/dashboard" element={<StudentDashboard/>}/>
              <Route path="/student/departmentPreferences" element={<DepartmentPreferencePage/>}/>
              <Route path="/ranking/:departmentName" element={<RankingPage />} />
          {/* </Route> */}
      </Route>
      
      {/* Admin Protected Routes */}
      <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          {/* <Route element={<Layout />}> */}
                <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
                <Route path="/admin/create-students" element={<CreateStudent/>}/>
                <Route path="/admin/viewStudents" element={<ViewStudents/>}/>
                <Route path="/admin/runFistSemPlacement" element={<FirstSemPlacement/>}/>
                <Route path="/admin/view/preferences" element={<AdminPreferencesPage/>}/>
                {/* <Route path="/admin/dashboard" element={<Dashboard />} /> */}
                {/* <Route path="/students" element={<Students />} /> */}
                {/* <Route path="/students/add" element={<AddStudent />} /> */}
                {/* <Route path="/departments" element={<Departments />} /> */}
                {/* <Route path="/upload" element={<Upload />} /> */}
                {/* <Route path="/placement" element={<Placement />} /> */}
                {/* <Route path="/results" element={<Results />} />  */}
                {/* AdminReportsPage */}
          {/* </Route> */}
      </Route>
    </Routes>
    </Router>

  );
}

export default App;