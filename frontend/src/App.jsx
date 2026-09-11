import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Navigation components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import JobSearchPage from './pages/JobSearchPage';
import JobDetailPage from './pages/JobDetailPage';
import CompaniesPage from './pages/CompaniesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import MyApplicationsPage from './pages/candidate/MyApplicationsPage';
import CandidateProfilePage from './pages/candidate/CandidateProfilePage';
import SavedJobsPage from './pages/candidate/SavedJobsPage';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import MyJobsPage from './pages/recruiter/MyJobsPage';
import CreateEditJobPage from './pages/recruiter/CreateEditJobPage';
import JobApplicantsPage from './pages/recruiter/JobApplicantsPage';
import CompanyProfilePage from './pages/recruiter/CompanyProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <div className="app-layout">
            <Navbar />
            <div className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/jobs" element={<JobSearchPage />} />
                <Route path="/jobs/:id" element={<JobDetailPage />} />
                <Route path="/companies" element={<CompaniesPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Candidate Protected Routes */}
                <Route
                  path="/candidate/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['CANDIDATE']}>
                      <CandidateDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/applications"
                  element={
                    <ProtectedRoute allowedRoles={['CANDIDATE']}>
                      <MyApplicationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/profile"
                  element={
                    <ProtectedRoute allowedRoles={['CANDIDATE']}>
                      <CandidateProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/saved-jobs"
                  element={
                    <ProtectedRoute allowedRoles={['CANDIDATE']}>
                      <SavedJobsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Recruiter Protected Routes */}
                <Route
                  path="/recruiter/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                      <RecruiterDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/jobs"
                  element={
                    <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                      <MyJobsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/jobs/new"
                  element={
                    <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                      <CreateEditJobPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/jobs/:id/edit"
                  element={
                    <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                      <CreateEditJobPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/jobs/:jobId/applicants"
                  element={
                    <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                      <JobApplicantsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/applicants"
                  element={
                    <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                      <JobApplicantsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/company"
                  element={
                    <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                      <CompanyProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
