import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';

import Home from './pages/Home';
import JobSearch from './pages/JobSearch';
import Login from './pages/Login';
import Register from './pages/Register';
import OTPVerify from './pages/OTPVerify';
import StudentDashboard from './pages/StudentDashboard';
import MyApplications from './pages/MyApplications';
import SavedJobs from './pages/SavedJobs';
import StudentProfile from './pages/StudentProfile';

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminJobs from './pages/AdminJobs';
import AdminStudents from './pages/AdminStudents';
import AdminApplications from './pages/AdminApplications';

// Protected Route Wrapper for Students
const StudentRoute = ({ children }) => {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Protected Route Wrapper for Admins
const AdminRoute = ({ children }) => {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (!isAuthenticated || role !== 'admin') return <Navigate to="/admin/login" replace />;
  return children;
};

function AppContent() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      
      <main className="flex-grow-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home addToast={addToast} />} />
          <Route path="/jobs" element={<JobSearch addToast={addToast} />} />
          <Route path="/login" element={<Login addToast={addToast} />} />
          <Route path="/register" element={<Register addToast={addToast} />} />
          <Route path="/verify-otp" element={<OTPVerify addToast={addToast} />} />
          <Route path="/admin/login" element={<AdminLogin addToast={addToast} />} />

          {/* Protected Student Routes */}
          <Route path="/student/dashboard" element={
            <StudentRoute><StudentDashboard addToast={addToast} /></StudentRoute>
          } />
          <Route path="/student/applications" element={
            <StudentRoute><MyApplications addToast={addToast} /></StudentRoute>
          } />
          <Route path="/student/saved-jobs" element={
            <StudentRoute><SavedJobs addToast={addToast} /></StudentRoute>
          } />
          <Route path="/student/profile" element={
            <StudentRoute><StudentProfile addToast={addToast} /></StudentRoute>
          } />

          {/* Protected Admin Routes */}
          <Route path="/admin/dashboard" element={
            <AdminRoute><AdminDashboard addToast={addToast} /></AdminRoute>
          } />
          <Route path="/admin/jobs" element={
            <AdminRoute><AdminJobs addToast={addToast} /></AdminRoute>
          } />
          <Route path="/admin/students" element={
            <AdminRoute><AdminStudents addToast={addToast} /></AdminRoute>
          } />
          <Route path="/admin/applications" element={
            <AdminRoute><AdminApplications addToast={addToast} /></AdminRoute>
          } />

          {/* Fallback Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
