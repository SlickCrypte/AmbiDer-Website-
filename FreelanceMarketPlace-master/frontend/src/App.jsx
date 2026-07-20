import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import HomePage from './features/services/HomePage';
import FreelancerDetailPage from './features/services/FreelancerDetailPage';
import ProductListingPage from './features/products/ProductListingPage';
import ProductDetailPage from './features/products/ProductDetailPage';
import PostProductPage from './features/services/PostProductPage';
import DashboardPage from './features/services/DashboardPage';
import ClientDashboardPage from './features/services/ClientDashboardPage';
import PostJobPage from './features/services/PostJobPage';
import JobsPage from './features/services/JobsPage';
import AuthPage from './features/auth/AuthPage';
import ProfileSetupPage from './features/auth/ProfileSetupPage';
import RatingPage from './features/services/RatingPage';

import LinkedInCallbackPage from './features/linkedin/LinkedInCallbackPage';
import GitHubCallbackPage from './features/github/GitHubCallbackPage';
import GoogleCallbackPage from './features/google/GoogleCallbackPage';

function DashboardWrapper() {
  const session = localStorage.getItem('currentUser');
  const user = session ? JSON.parse(session) : null;
  const activeRole = user?.active_role || (user?.role === 'Client' ? 'client' : 'freelancer_seller');
  
  if (activeRole === 'client') {
    return <ClientDashboardPage />;
  }
  return <DashboardPage />;
}

// Protected Route Guard (blocks unauthenticated users and enforces profile setup for new users)
function ProtectedRoute({ children }) {
  const session = localStorage.getItem('currentUser');
  const user = session ? JSON.parse(session) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the profile setup is not complete, force redirect to /profile-setup
  if (user.is_profile_setup === false) {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication Pages */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        
        {/* Profile Setup Wizard */}
        <Route path="/profile-setup" element={<ProfileSetupPage />} />

        {/* Protected Application Routes */}
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        
        {/* Detailed profile view */}
        <Route path="/freelancer/:id" element={<ProtectedRoute><FreelancerDetailPage /></ProtectedRoute>} />
        
        {/* Digital Products Listing */}
        <Route path="/products" element={<ProtectedRoute><ProductListingPage /></ProtectedRoute>} />
        
        {/* Digital Product Detail Page */}
        <Route path="/product/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
        
        {/* Post a Product wizard */}
        <Route path="/post-product" element={<ProtectedRoute><PostProductPage /></ProtectedRoute>} />
        
        {/* Post a Job wizard */}
        <Route path="/post-job" element={<ProtectedRoute><PostJobPage /></ProtectedRoute>} />
        
        {/* Browse Jobs page */}
        <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
        
        {/* Dashboards */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardWrapper /></ProtectedRoute>} />

        {/* Secure job contract rating page */}
        <Route path="/dashboard/orders/:orderId/rate" element={<ProtectedRoute><RatingPage /></ProtectedRoute>} />
        
        {/* LinkedIn OAuth callback redirect */}
        <Route path="/linkedin-callback" element={<LinkedInCallbackPage />} />

        {/* GitHub OAuth callback redirect */}
        <Route path="/github-callback" element={<GitHubCallbackPage />} />

        {/* Google OAuth callback redirect */}
        <Route path="/google-callback" element={<GoogleCallbackPage />} />
        
        {/* Fallback route - redirects to home page or login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
