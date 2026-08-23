import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import API from "../api/axios";

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL Query Params Check: /forgot-password?token=XYZ&email=ABC
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  // Form States
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Show/Hide Password States
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Mode 2 Check: Agar URL mein token aur email dono mojood hon
  const isResetMode = Boolean(token && emailParam);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // Handler 1: Request Reset Link
  const handleRequestLink = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await API.post("/auth/forgot-password", {
        email: email.toLowerCase().trim(),
      });

      if (res.data && res.data.success) {
        setSuccessMsg(
          res.data.message || "Password reset link sent to your email!",
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send reset email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handler 2: Submit New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/reset-password", {
        token,
        email: emailParam || email,
        newPassword,
      });

      if (res.data && res.data.success) {
        setSuccessMsg("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid or expired reset link. Please request a new one.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        {/* Brand Header */}
        <div className="auth-brand-center">
          <div className="brand-badge">
            <GraduationCap size={24} />
          </div>
          <h2 className="auth-title">
            Campus<span className="cyan-glow">Hub</span>
          </h2>
          <p className="auth-subtitle">
            {isResetMode
              ? "Set a new password for your account"
              : "Reset your academic account password"}
          </p>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert-success">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* =========================================================
            MODE 2: RESET PASSWORD FORM (Link Click Mode)
           ========================================================= */}
        {isResetMode ? (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label className="input-label">Account Email</label>
              <input
                type="email"
                value={emailParam}
                disabled
                className="input-field input-disabled"
              />
            </div>

            {/* New Password with Show/Hide */}
            <div className="form-group">
              <label className="input-label">New Password</label>
              <div className="input-password-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password with Show/Hide */}
            <div className="form-group">
              <label className="input-label">Confirm New Password</label>
              <div className="input-password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn-full"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        ) : (
          /* =========================================================
             MODE 1: REQUEST RESET LINK (Default View)
             ========================================================= */
          <form onSubmit={handleRequestLink} className="auth-form">
            <div className="form-group">
              <label className="input-label">Registered University Email</label>
              <input
                type="email"
                placeholder="e.g. student@pucit.edu.pk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn-full"
            >
              {loading ? "Sending Link..." : "Send Reset Link"}
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="auth-back-box">
          <Link to="/login" className="auth-back-link">
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
