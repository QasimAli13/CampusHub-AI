import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", {
        email: email.toLowerCase().trim(),
        password,
      });

      if (res.data && res.data.token) {
        loginUser(res.data);
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      if (err.response?.data?.notVerified) {
        navigate("/verify-otp", { state: { email } });
      } else {
        setError(err.response?.data?.message || "Invalid credentials.");
      }
    } finally {
      setLoading(false);
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
          <p className="auth-brand-subtitle">AI Academic Suite Portal</p>
        </div>

        {error && (
          <div className="alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label className="input-label">University Email</label>
            <div className="input-icon-wrapper">
              <Mail size={18} className="field-leading-icon" />
              <input
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field with-leading-icon"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-with-link">
              <label className="input-label">Password</label>
              <Link to="/forgot-password" className="auth-forgot-link">
                Forgot password?
              </Link>
            </div>
            <div className="input-icon-wrapper">
              <Lock size={18} className="field-leading-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field with-leading-icon with-trailing-icon"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary btn-full"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="auth-footer-text">
          Don't have an account?{" "}
          <Link to="/register" className="link-primary">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
