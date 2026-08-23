// src/pages/Settings.jsx
import React, { useState, useContext } from "react";
import { Settings as SettingsIcon, Building, Calendar, Lock, Save } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Settings() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("campus");
  const [loading, setLoading] = useState(false);

  const [campusConfig, setCampusConfig] = useState({
    instituteName: "CampusHub University of Technology",
    instituteCode: "CH-PUCIT",
    campusLocation: "Lahore, Pakistan",
    supportEmail: "support@campushub.edu",
    currencySymbol: "PKR",
    timezone: "UTC+5 (PKT)",
  });

  const [academicConfig, setAcademicConfig] = useState({
    activeSession: "Fall 2026",
    termStartDate: "2026-08-15",
    termEndDate: "2026-12-30",
    attendanceThreshold: 75,
    examPassingPct: 50,
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveCampus = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Campus settings updated!");
    }, 600);
  };

  const handleSaveAcademic = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Academic settings saved!");
    }, 600);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (securityForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated!");
    }, 700);
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage campus, academic and security settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        <button
          className={`tab-btn ${activeTab === "campus" ? "active" : ""}`}
          onClick={() => setActiveTab("campus")}
        >
          <Building size={16} />
          Campus
        </button>
        <button
          className={`tab-btn ${activeTab === "academic" ? "active" : ""}`}
          onClick={() => setActiveTab("academic")}
        >
          <Calendar size={16} />
          Academic
        </button>
        <button
          className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          <Lock size={16} />
          Security
        </button>
      </div>

      {/* Campus Tab */}
      {activeTab === "campus" && (
        <div className="settings-card">
          <h3 className="card-title">Campus Details</h3>
          <form onSubmit={handleSaveCampus} className="settings-form">
            <div className="form-group">
              <label>Institute Name</label>
              <input
                type="text"
                required
                value={campusConfig.instituteName}
                onChange={(e) => setCampusConfig({ ...campusConfig, instituteName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Institute Code</label>
              <input
                type="text"
                required
                value={campusConfig.instituteCode}
                onChange={(e) => setCampusConfig({ ...campusConfig, instituteCode: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={campusConfig.campusLocation}
                onChange={(e) => setCampusConfig({ ...campusConfig, campusLocation: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Support Email</label>
              <input
                type="email"
                required
                value={campusConfig.supportEmail}
                onChange={(e) => setCampusConfig({ ...campusConfig, supportEmail: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Currency</label>
              <select
                value={campusConfig.currencySymbol}
                onChange={(e) => setCampusConfig({ ...campusConfig, currencySymbol: e.target.value })}
              >
                <option value="PKR">PKR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div className="form-group">
              <label>Timezone</label>
              <input
                type="text"
                value={campusConfig.timezone}
                onChange={(e) => setCampusConfig({ ...campusConfig, timezone: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-save" disabled={loading}>
              <Save size={16} />
              {loading ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      )}

      {/* Academic Tab */}
      {activeTab === "academic" && (
        <div className="settings-card">
          <h3 className="card-title">Academic Settings</h3>
          <form onSubmit={handleSaveAcademic} className="settings-form">
            <div className="form-group">
              <label>Active Session</label>
              <input
                type="text"
                required
                value={academicConfig.activeSession}
                onChange={(e) => setAcademicConfig({ ...academicConfig, activeSession: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Attendance Threshold (%)</label>
              <input
                type="number"
                min="50"
                max="100"
                value={academicConfig.attendanceThreshold}
                onChange={(e) => setAcademicConfig({ ...academicConfig, attendanceThreshold: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Semester Start</label>
              <input
                type="date"
                value={academicConfig.termStartDate}
                onChange={(e) => setAcademicConfig({ ...academicConfig, termStartDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Semester End</label>
              <input
                type="date"
                value={academicConfig.termEndDate}
                onChange={(e) => setAcademicConfig({ ...academicConfig, termEndDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Passing Percentage (%)</label>
              <input
                type="number"
                min="33"
                max="100"
                value={academicConfig.examPassingPct}
                onChange={(e) => setAcademicConfig({ ...academicConfig, examPassingPct: Number(e.target.value) })}
              />
            </div>
            <button type="submit" className="btn-save" disabled={loading}>
              <Save size={16} />
              {loading ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="settings-card">
          <h3 className="card-title">Security</h3>

          <div className="user-info">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div>
              <h4>{user?.name || "Admin"}</h4>
              <p>{user?.email || "admin@campushub.edu"}</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="settings-form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                required
                placeholder="Enter current password"
                value={securityForm.currentPassword}
                onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={securityForm.newPassword}
                onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                required
                placeholder="Confirm new password"
                value={securityForm.confirmPassword}
                onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-save" disabled={loading}>
              <Lock size={16} />
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}