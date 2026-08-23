// src/pages/Dashboard.jsx
import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  Receipt,
  ClipboardCheck,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5000/api";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalFeeCollected: 0,
    feeRecoveryRate: 0,
    attendanceRate: 0,
    todayPresent: 0,
    todayTotalMarked: 0,
    netBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
  });

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [studentsRes, staffRes, feeRes, attendanceRes, accountsRes] =
        await Promise.allSettled([
          fetch(`${API_BASE}/admissions`),
          fetch(`${API_BASE}/staff`),
          fetch(`${API_BASE}/fees/summary`),
          fetch(`${API_BASE}/attendance/stats`),
          fetch(`${API_BASE}/accounting/summary`),
        ]);

      let studentsCount = 0,
        facultyCount = 0,
        feeCollected = 0,
        feeRecovery = 0;
      let attRate = 0,
        attPresent = 0,
        attMarked = 0;
      let balance = 0,
        income = 0,
        expense = 0;

      if (studentsRes.status === "fulfilled") {
        const data = await studentsRes.value.json();
        if (data.success) studentsCount = data.count || data.data?.length || 0;
      }
      if (staffRes.status === "fulfilled") {
        const data = await staffRes.value.json();
        if (data.success) facultyCount = data.count || data.data?.length || 0;
      }
      if (feeRes.status === "fulfilled") {
        const data = await feeRes.value.json();
        if (data.success && data.data) {
          feeCollected = data.data.totalCollected || 0;
          feeRecovery = data.data.recoveryRate || 0;
        }
      }
      if (attendanceRes.status === "fulfilled") {
        const data = await attendanceRes.value.json();
        if (data.success && data.data) {
          attRate = data.data.attendancePercentage || 0;
          attPresent = data.data.present || 0;
          attMarked = data.data.totalStudents || 0;
        }
      }
      if (accountsRes.status === "fulfilled") {
        const data = await accountsRes.value.json();
        if (data.success && data.data) {
          balance = data.data.netBalance || 0;
          income = data.data.totalIncome || 0;
          expense = data.data.totalExpense || 0;
        }
      }

      setMetrics({
        totalStudents: studentsCount,
        totalFaculty: facultyCount,
        totalFeeCollected: feeCollected,
        feeRecoveryRate: feeRecovery,
        attendanceRate: attRate,
        todayPresent: attPresent,
        todayTotalMarked: attMarked,
        netBalance: balance,
        totalIncome: income,
        totalExpense: expense,
      });
    } catch (err) {
      toast.error("Could not refresh some dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <div className="dashboard-hero-banner">
        <div>
          <div className="welcome-tag">
            <Sparkles size={16} />
            <span>DASHBOARD</span>
          </div>
          <h1 className="hero-title">Welcome, {user?.name || "Admin"}</h1>
          <p className="hero-subtitle">Live institutional overview</p>
        </div>
        <button className="btn-refresh-dashboard" onClick={fetchDashboardStats} disabled={loading}>
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          {loading ? "Syncing..." : "Refresh"}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-cards-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon students"><Users size={22} /></div>
            <Link to="/admissions" className="kpi-link">View <ArrowUpRight size={14} /></Link>
          </div>
          <span className="kpi-label">Students</span>
          <h2 className="kpi-val">{metrics.totalStudents.toLocaleString()}</h2>
          <span className="kpi-sub">Enrolled</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon faculty"><GraduationCap size={22} /></div>
            <Link to="/staff" className="kpi-link">View <ArrowUpRight size={14} /></Link>
          </div>
          <span className="kpi-label">Faculty</span>
          <h2 className="kpi-val">{metrics.totalFaculty.toLocaleString()}</h2>
          <span className="kpi-sub">Active staff</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon fee"><Receipt size={22} /></div>
            <Link to="/fee-management" className="kpi-link">View <ArrowUpRight size={14} /></Link>
          </div>
          <span className="kpi-label">Fee Collected</span>
          <h2 className="kpi-val">${metrics.totalFeeCollected.toLocaleString()}</h2>
          <span className="kpi-sub highlight-green">{metrics.feeRecoveryRate}% recovery</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon attendance"><ClipboardCheck size={22} /></div>
            <Link to="/attendance" className="kpi-link">View <ArrowUpRight size={14} /></Link>
          </div>
          <span className="kpi-label">Attendance</span>
          <h2 className="kpi-val">{metrics.attendanceRate}%</h2>
          <span className="kpi-sub">{metrics.todayPresent} present today</span>
        </div>
      </div>

      {/* Finance Strip */}
      <div className="dashboard-finance-strip">
        <div className="finance-strip-left">
          <div className="finance-icon-box"><DollarSign size={24} /></div>
          <div>
            <h3 className="finance-strip-title">Finance</h3>
            <p className="finance-strip-sub">Income, expenses and balance</p>
          </div>
        </div>
        <div className="finance-figures-row">
          <div className="figure-block">
            <span className="fig-lbl">Income</span>
            <span className="fig-val income">+${metrics.totalIncome.toLocaleString()}</span>
          </div>
          <div className="figure-block">
            <span className="fig-lbl">Expense</span>
            <span className="fig-val expense">-${metrics.totalExpense.toLocaleString()}</span>
          </div>
          <div className="figure-block">
            <span className="fig-lbl">Balance</span>
            <span className={`fig-val ${metrics.netBalance >= 0 ? "income" : "expense"}`}>
              ${metrics.netBalance.toLocaleString()}
            </span>
          </div>
          <Link to="/accounting" className="btn-view-ledger">
            Ledger <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="action-center-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="action-tiles-grid">
          <Link to="/admissions" className="action-tile">
            <div className="action-tile-icon blue"><Users size={20} /></div>
            <div>
              <h4>Add Student</h4>
              <p>Register new admission</p>
            </div>
          </Link>
          <Link to="/attendance" className="action-tile">
            <div className="action-tile-icon green"><ClipboardCheck size={20} /></div>
            <div>
              <h4>Mark Attendance</h4>
              <p>Daily roll-call</p>
            </div>
          </Link>
          <Link to="/exams" className="action-tile">
            <div className="action-tile-icon amber"><TrendingUp size={20} /></div>
            <div>
              <h4>Exams</h4>
              <p>Gradebook & results</p>
            </div>
          </Link>
          <Link to="/fee-management" className="action-tile">
            <div className="action-tile-icon purple"><Receipt size={20} /></div>
            <div>
              <h4>Fee Invoices</h4>
              <p>Generate challans</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}