import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import API from "../api/axios";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match!");
    }

    setLoading(true);

    try {
      const res = await API.post(`/auth/reset-password/${token}`, { password });

      if (res.data && res.data.success) {
        setSuccessMsg("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError("Failed to reset password. Link may be expired.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        <h2 className="auth-title">Create New Password</h2>
        <p className="auth-subtitle">Enter your new secure password below</p>

        {error && <div className="alert-error">{error}</div>}
        {successMsg && <div className="alert-success">{successMsg}</div>}

        <form onSubmit={handleResetSubmit} className="auth-form">
          <div className="input-password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary btn-full"
          >
            {loading ? "Updating Password..." : "Update Password"}
          </button>
        </form>

        <p className="auth-footer-text">
          <Link to="/login" className="link-primary">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
