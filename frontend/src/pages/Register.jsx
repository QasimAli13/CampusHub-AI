// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Building,
  AlertCircle,
} from "lucide-react";
import API from "../api/axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [department, setDepartment] = useState("Computer Science");
  const [semester, setSemester] = useState("1");
  const [role, setRole] = useState("student");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        name,
        email: email.toLowerCase().trim(),
        password,
        department,
        semester: Number(semester),
        role: role.toLowerCase().trim(),
      };

      const res = await API.post("/auth/register", payload);

      if (res.data && res.data.success) {
        navigate("/verify-otp", { state: { email } });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please check details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        <div className="auth-brand-center">
          <div className="auth-brand-badge">
            <GraduationCap size={28} />
          </div>
          <h2 className="auth-brand-title">
            Campus<span className="cyan-glow">Hub</span>
          </h2>
          <p className="auth-brand-subtitle">Create your academic account</p>
        </div>

        {error && (
          <div className="alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label className="input-label">Full Name</label>
            <div className="input-icon-wrapper">
              <User size={18} className="field-leading-icon" />
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field with-leading-icon"
                required
              />
            </div>
          </div>

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
            <label className="input-label">Password</label>
            <div className="input-icon-wrapper">
              <Lock size={18} className="field-leading-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min 6 characters"
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

          <div className="form-grid-2">
            <div className="form-group">
              <label className="input-label">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher / Faculty</option>
                <option value="admin">System Administrator (Admin)</option>
                <option value="society_admin">Society Head</option>
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">Department</label>
              <input
                type="text"
                placeholder="e.g. CS"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          {role === "student" && (
            <div className="form-group">
              <label className="input-label">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="input-field"
              >
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary btn-full"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{" "}
          <Link to="/login" className="link-primary">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}