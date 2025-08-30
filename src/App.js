import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import CreatePost from "./pages/CreatePost";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MemberDashboard from "./pages/Member.Dashboard";
import ExpertDashboard from "./pages/Expert.Dashboard";
import Communities from "./pages/Member.Communities";
import ExpertCommunities from "./pages/Expert.Communities";
import FindExperts from "./pages/FindExperts";
import MemberRequests from "./pages/MemberRequests";
import ExpertSession from "./components/Expert.Session";
import ExpertMyDashboard from "./components/Expert.MyDashboard";
import ExpertSessionEdit from "./components/Expert.SessionEdit";
import SessionsUpcoming from "./pages/SessionsUpcoming";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected member routes */}

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="member">
              <MemberDashboard />
            </ProtectedRoute>
          }
        />

        {/* Communities routes for members */}
        <Route
          path="/communities"
          element={
            <ProtectedRoute requiredRole="member">
              <Communities />
            </ProtectedRoute>
          }
        />
        {/* Create Post route for members */}
        <Route
          path="/create-post"
          element={
            <ProtectedRoute requiredRole="member">
              <CreatePost />
            </ProtectedRoute>
          }
        />

        {/* Protected expert routes */}
        <Route
          path="/expert-dashboard"
          element={
            <ProtectedRoute requiredRole="expert">
              <ExpertDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expert/dashboard"
          element={
            <ProtectedRoute requiredRole="expert">
              <ExpertMyDashboard />
            </ProtectedRoute>
          }
        />

        {/* Communities routes for experts */}
        <Route
          path="/expert/communities"
          element={
            <ProtectedRoute requiredRole="expert">
              <ExpertCommunities />
            </ProtectedRoute>
          }
        />

        {/* Member requests routes for experts */}
        <Route
          path="/expert/member-requests/:tab"
          element={
            <ProtectedRoute requiredRole="expert">
              <MemberRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expert/member-requests"
          element={
            <ProtectedRoute requiredRole="expert">
              <MemberRequests />
            </ProtectedRoute>
          }
        />
        <Route path="/find-experts" element={<FindExperts />} />
        <Route
          path="/experts"
          element={<Navigate to="/find-experts" replace />}
        />
        <Route path="/expert/create-session" element={<ExpertSession />} />
        <Route
          path="/expert/session/edit/:id"
          element={
            <ProtectedRoute requiredRole="expert">
              <ExpertSessionEdit />
            </ProtectedRoute>
          }
        />
        <Route path="/sessions/upcoming" element={<SessionsUpcoming />} />
      </Routes>
    </Router>
  );
}

export default App;
