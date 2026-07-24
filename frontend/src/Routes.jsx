import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import Applicants from "./Applicants";

import CreateJob from "./CreateJob";

import EditJob from "./EditJob";

import Navbar from "./Navbar";
import Footer from "./Footer";

/* Protected Route */
import ProtectedRoute from "./ProtectedRoute";

/* Public */

import Home from "./Home";
import Jobs from "./Jobs";
import JobDetails from "./JobDetails";
import Login from "./Login";
import Register from "./Register";
import NotFound from "./NotFound";


/* Candidate */

import Dashboard from "./Dashboard";
import ResumeUpload from "./ResumeUpload";
import CandidateProfile from "./CandidateProfile";
import MyApplications from "./MyApplications";
import Notifications from "./Notifications";

/* Recruiter */

import RecruiterDashboard from "./RecruiterDashboard";
import JobManagement from "./JobManagement";
import CandidateManagement from "./CandidateManagement";
import InterviewManagement from "./InterviewManagement";
import TalentPool from "./TalentPool";

/* Admin */

import AdminDashboard from "./AdminDashboard";

function AppContent() {

  const location = useLocation();

  const dashboardRoutes = [

    "/dashboard",

    "/resume",

    "/candidate-profile",

    "/my-applications",

    "/notifications",

    "/recruiter",

    "/job-management",

    "/candidate-management",

    "/interview-management",

    "/talent",

    "/admin",

    "/create-job",

    "/edit-job",

    "/applicants",

  ];

  const isDashboardPage = dashboardRoutes.includes(location.pathname);

  return (

    <>

      {!isDashboardPage && <Navbar />}

      <Routes>

        {/* ===========================
            PUBLIC ROUTES
        =========================== */}

        <Route
  path="/"
  element={<Navigate to="/login" replace />}
/>

        <Route path="/jobs" element={<Jobs />} />

        <Route
path="/job-details/:id"
element={<JobDetails />}
/>

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* ===========================
            CANDIDATE ROUTES
        =========================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resume"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <ResumeUpload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate-profile"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <CandidateProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-applications"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <MyApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute
              allowedRoles={[
                "candidate",
                "recruiter",
                "admin"
              ]}
            >
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* ===========================
            RECRUITER ROUTES
        =========================== */}

        <Route
          path="/recruiter"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/job-management"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <JobManagement />
            </ProtectedRoute>
          }
        />

        <Route
  path="/applicants"
  element={
    <ProtectedRoute allowedRoles={["recruiter"]}>
      <Applicants />
    </ProtectedRoute>
  }
/>

        <Route
  path="/create-job"
  element={
    <ProtectedRoute allowedRoles={["recruiter"]}>
      <CreateJob />
    </ProtectedRoute>
  }
/>

<Route
  path="/edit-job"
  element={
    <ProtectedRoute allowedRoles={["recruiter"]}>
      <EditJob />
    </ProtectedRoute>
  }
/>

        <Route
          path="/candidate-management"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <CandidateManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview-management"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <InterviewManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/talent"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <TalentPool />
            </ProtectedRoute>
          }
        />

        {/* ===========================
            ADMIN ROUTES
        =========================== */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ===========================
            404
        =========================== */}

        <Route path="*" element={<NotFound />} />

      </Routes>

      {!isDashboardPage && <Footer />}

    </>

  );

}

function AppRoutes() {

  return (

    <BrowserRouter>

      <AppContent />

    </BrowserRouter>

  );

}

export default AppRoutes;

