// src/App.js
import React, { useContext, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { AuthContext } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import Attendance from "./pages/Attendance";
import Staff from "./pages/Staff";
import Accounting from "./pages/Accounting";

import Dashboard from "./pages/Dashboard";
import Assignments from "./pages/assignment";
import Events from "./pages/events";
import Complaints from "./pages/complaint";
import ChatRoom from "./pages/ChatRoom";
import Analytics from "./pages/Analytics";

import Admissions from "./pages/Admissions";
import FeeManagement from "./pages/FeeManagement";
import ExamManagement from "./pages/ExamManagement";
import IdCards from "./pages/IdCards";
import Settings from "./pages/Settings";

import Sidebar from "./components/Sidebar";
import Copilot from "./components/Copilot";

function ProtectedRoute({ children }) {
  const auth = useContext(AuthContext);

  if (auth?.loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#090d16",
          color: "#94a3b8",
          fontFamily: "var(--font-display, 'Chakra Petch', sans-serif)",
        }}
      >
        <span>Authenticating session permissions...</span>
      </div>
    );
  }

  if (!auth?.user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RoleGuard({ allowedRoles, children }) {
  const { user } = useContext(AuthContext);
  const rawRole = (user?.role || "admin").toLowerCase().trim();
  const userRole = rawRole === "teacher" ? "faculty" : rawRole;

  if (allowedRoles) {
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase().trim());
    if (!normalizedAllowed.includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="app-layout">
              <div className="mobile-header-bar">
                <button
                  type="button"
                  className="sidebar-mobile-toggle"
                  onClick={toggleSidebar}
                  aria-label="Toggle Sidebar"
                >
                  <Menu size={22} />
                </button>
                <span className="mobile-brand-name">
                  Campus<span className="accent-text">Hub</span>
                </span>
              </div>

              <div
                className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
                onClick={toggleSidebar}
              />

              <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

              <div className="main-wrapper">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/complaints" element={<Complaints />} />
                  <Route path="/chat" element={<ChatRoom />} />
                  <Route path="/assignments" element={<Assignments />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/exams" element={<ExamManagement />} />

                  <Route
                    path="/admissions"
                    element={
                      <RoleGuard allowedRoles={["admin", "faculty"]}>
                        <Admissions />
                      </RoleGuard>
                    }
                  />

                  <Route
                    path="/fee-management"
                    element={
                      <RoleGuard allowedRoles={["admin", "student"]}>
                        <FeeManagement />
                      </RoleGuard>
                    }
                  />

                  <Route
                    path="/staff"
                    element={
                      <RoleGuard allowedRoles={["admin"]}>
                        <Staff />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/staff-directory"
                    element={
                      <RoleGuard allowedRoles={["admin"]}>
                        <Staff />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/id-cards"
                    element={
                      <RoleGuard allowedRoles={["admin"]}>
                        <IdCards />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/accounting"
                    element={
                      <RoleGuard allowedRoles={["admin"]}>
                        <Accounting />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <RoleGuard allowedRoles={["admin", "faculty", "student"]}>
                        <Analytics />
                      </RoleGuard>
                    }
                  />

                  <Route
                    path="/settings"
                    element={
                      <RoleGuard allowedRoles={["admin"]}>
                        <Settings />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/settings/*"
                    element={
                      <RoleGuard allowedRoles={["admin"]}>
                        <Settings />
                      </RoleGuard>
                    }
                  />

                  <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Routes>
              </div>

              <Copilot />
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}