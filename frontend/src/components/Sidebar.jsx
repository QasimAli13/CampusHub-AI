// src/components/Sidebar.jsx
import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardCheck,
  FileSpreadsheet,
  Receipt,
  DollarSign,
  CreditCard,
  BookOpen,
  Calendar,
  MessageSquare,
  AlertCircle,
  BarChart2,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const rawRole = (user?.role || "admin").toLowerCase().trim();
  const normalizedRole = rawRole === "teacher" ? "faculty" : rawRole;

  const handleLogout = () => {
    if (logout) logout();
    navigate("/login");
  };

  const navSections = [
    {
      title: "ACADEMICS",
      items: [
        {
          path: "/admissions",
          label: "Student Directory",
          icon: Users,
          roles: ["admin", "faculty"]
        },
        {
          path: "/staff",
          label: "Faculty & Staff",
          icon: GraduationCap,
          roles: ["admin"]
        },
        {
          path: "/attendance",
          label: "Attendance Hub",
          icon: ClipboardCheck,
          roles: ["admin", "faculty", "student"]
        },
        {
          path: "/exams",
          label: "Examinations & Grades",
          icon: FileSpreadsheet,
          roles: ["admin", "faculty", "student"]
        },
      ],
    },
    {
      title: "FINANCE & ADMIN",
      items: [
        {
          path: "/fee-management",
          label: "Tuition & Challans",
          icon: Receipt,
          roles: ["admin", "student"]
        },
        {
          path: "/accounting",
          label: "Accounts Ledger",
          icon: DollarSign,
          roles: ["admin"]
        },
        {
          path: "/id-cards",
          label: "Campus Card Studio",
          icon: CreditCard,
          roles: ["admin"]
        },
      ],
    },
    {
      title: "CAMPUS LIFE & LMS",
      items: [
        {
          path: "/assignments",
          label: "Assignments & Coursework",
          icon: BookOpen,
          roles: ["admin", "faculty", "student"]
        },
        {
          path: "/events",
          label: "Campus Events",
          icon: Calendar,
          roles: ["admin", "faculty", "student"]
        },
        {
          path: "/chat",
          label: "Campus Chat",
          icon: MessageSquare,
          roles: ["admin", "faculty", "student"]
        },
        {
          path: "/complaints",
          label: "Helpdesk & Inquiries",
          icon: AlertCircle,
          roles: ["admin", "faculty", "student"]
        },
        {
          path: "/analytics",
          label: "Campus Analytics",
          icon: BarChart2,
          roles: ["admin", "faculty", "student"]
        },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        {
          path: "/settings",
          label: "System Settings",
          icon: Settings,
          roles: ["admin"]
        },
      ],
    },
  ];

  return (
    <aside className={`sidebar-container ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="brand-box">
          <div className="brand-logo-badge">CH</div>
          <div className="brand-text-col">
            <span className="brand-name">
              Campus<span className="accent-text">Hub</span>
            </span>
            <span className="erp-tag">{normalizedRole.toUpperCase()} PORTAL</span>
          </div>
        </div>
        <button
          type="button"
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close Sidebar"
        >
          <X size={18} />
        </button>
      </div>

      <div className="sidebar-scroll-area">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `sidebar-link dashboard-link ${isActive ? "active" : ""}`}
          onClick={onClose}
        >
          <LayoutDashboard size={18} />
          <span>Executive Dashboard</span>
        </NavLink>

        {navSections.map((section, idx) => {
          const visibleItems = section.items.filter((item) =>
            item.roles.map((r) => r.toLowerCase()).includes(normalizedRole)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="nav-section-group">
              <span className="section-header-title">{section.title}</span>
              <div className="section-links-list">
                {visibleItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                      onClick={onClose}
                    >
                      <IconComponent size={17} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile-card">
          <div className="user-avatar-circle">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="user-meta-info">
            <span className="user-name">{user?.name || "Campus User"}</span>
            <span className="user-email">{user?.email || "user@campushub.edu"}</span>
          </div>
          <button
            type="button"
            className="btn-logout"
            onClick={handleLogout}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}