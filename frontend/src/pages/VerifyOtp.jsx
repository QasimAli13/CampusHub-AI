import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import API from "../api/axios";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await API.post("/auth/verify-otp", {
        email: email.toLowerCase().trim(),
        otp: otp.trim(),
      });

      if (res.data && res.data.success) {
        setSuccessMsg("Account verified successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccessMsg("");
    setResending(true);

    try {
      const res = await API.post("/auth/resend-otp", {
        email: email.toLowerCase().trim(),
      });
      if (res.data && res.data.success) {
        setSuccessMsg("A new 6-digit OTP code has been sent to your email.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        {/* Uniform Brand Header */}
        <div className="auth-brand-center">
          <div className="auth-brand-badge">
            <GraduationCap size={28} />
          </div>
          <h2 className="auth-brand-title">
            Campus<span className="cyan-glow">Hub</span>
          </h2>
          <p className="auth-brand-subtitle">Email Verification</p>
        </div>

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

        <p className="otp-info-text">
          We have sent a 6-digit verification code to: <br />
          <strong>{email || "your registered email"}</strong>
        </p>

        <form onSubmit={handleVerify} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              maxLength="6"
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="input-field otp-input-box"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="btn-primary btn-full"
          >
            {loading ? "Verifying..." : "Verify & Activate Account"}
          </button>
        </form>

        <div className="otp-resend-row">
          <span>Didn't receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="btn-link-action"
          >
            {resending ? "Sending..." : "Resend Code"}
          </button>
        </div>

        <div className="auth-back-box">
          <Link to="/login" className="auth-back-link">
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
