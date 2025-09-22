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

function test() {

}

export default test;