import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentPortal from './pages/StudentPortal';
import StudentDashboard from './pages/StudentDashboard';

import WardenDash from './pages/WardenDash';
import StaffDash from './pages/StaffDash'; // Added
import PrincipalDash from './pages/PrincipalDash';
import HodDash from './pages/HodDash';
import NotFound from './pages/NotFound';


// Protected Route Component
const PrivateRoute = ({ children, requiredRole }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!currentUser) return <Navigate to="/" />;

  // Basic Role Check (Extend as needed)
  if (requiredRole && userData?.role !== requiredRole && userData?.role !== 'admin') {
    // Allow admin to access everything or handle hierarchy: Principal > HoD > Warden
    // For hackathon, keep it simple or allow fallthrough
    const hierarchy = { 'student': 0, 'warden': 1, 'hod': 2, 'principal': 3, 'admin': 4 };
    const userLevel = hierarchy[userData?.role?.toLowerCase()] || 0;
    const reqLevel = hierarchy[requiredRole.toLowerCase()] || 0;

    if (userLevel < reqLevel) {
      return <div className="p-10 text-center text-red-500 font-bold">Access Denied: You need {requiredRole} access.</div>;
    }
  }

  return children;
};

// Layout separate from Routes to use useAuth if needed, but here simple wrapping is fine
const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/submit" element={
          <PrivateRoute>
            <StudentPortal />
          </PrivateRoute>
        } />
        <Route path="/dashboard/student" element={
          <PrivateRoute>
            <StudentDashboard />
          </PrivateRoute>
        } />
        <Route path="/dashboard/warden" element={
          <PrivateRoute requiredRole="warden">
            <WardenDash />
          </PrivateRoute>
        } />
        <Route path="/dashboard/staff" element={
          <PrivateRoute requiredRole="staff">
            <StaffDash />
          </PrivateRoute>
        } />
        <Route path="/dashboard/hod" element={
          <PrivateRoute requiredRole="hod">
            <HodDash />
          </PrivateRoute>
        } />
        <Route path="/analytics" element={
          <PrivateRoute requiredRole="principal">
            <PrincipalDash />
          </PrivateRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;
