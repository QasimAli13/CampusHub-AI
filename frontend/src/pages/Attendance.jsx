// src/pages/Attendance.jsx
import React, { useState, useEffect } from "react";
import { Save, Search, UserCheck, CheckCircle2, XCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5000/api";

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [search, setSearch] = useState("");
  const [sheet, setSheet] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch data
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      let q = `date=${selectedDate}`;
      if (department) q += `&department=${department}`;
      if (semester) q += `&semester=${semester}`;

      const [sRes, stRes] = await Promise.all([
        fetch(`${API_BASE}/attendance/sheet?${q}`),
        fetch(`${API_BASE}/attendance/stats?date=${selectedDate}`),
      ]);

      const sData = await sRes.json();
      const stData = await stRes.json();

      if (sData.success) setSheet(sData.data || []);
      if (stData.success) setStats(stData.data || null);
    } catch (error) {
      toast.error("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, department, semester]);

  // Update status
  const updateStatus = (id, status) => {
    setSheet(prev => prev.map(item =>
      item.studentId === id ? { ...item, status } : item
    ));
  };

  // Mark all
  const markAll = (status) => {
    setSheet(prev => prev.map(item => ({ ...item, status })));
  };

  // Save
  const saveAttendance = async () => {
    if (!sheet.length) return toast.error("No records to save");

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/attendance/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          attendanceList: sheet.map(item => ({
            studentId: item.studentId,
            status: item.status,
            remarks: item.remarks || "",
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Attendance saved!");
        fetchAttendance();
      } else {
        toast.error(data.message || "Failed to save");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setSaving(false);
    }
  };

  const filtered = sheet.filter(item =>
    item.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    item.admissionNo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="attendance-container">
      {/* Header */}
      <div className="attendance-header">
        <div>
          <h1 className="attendance-title">Attendance</h1>
          <p className="attendance-subtitle">Daily attendance management</p>
        </div>
        <button className="btn-save-attendance" onClick={saveAttendance} disabled={saving || loading}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="attendance-stats-grid">
          <div className="attendance-stat-card">
            <div className="stat-icon-box total"><UserCheck size={20} /></div>
            <div>
              <span className="stat-card-label">Total</span>
              <h3 className="stat-card-value">{stats.totalStudents}</h3>
            </div>
          </div>
          <div className="attendance-stat-card">
            <div className="stat-icon-box present"><CheckCircle2 size={20} /></div>
            <div>
              <span className="stat-card-label">Present</span>
              <h3 className="stat-card-value">{stats.present}</h3>
            </div>
          </div>
          <div className="attendance-stat-card">
            <div className="stat-icon-box absent"><XCircle size={20} /></div>
            <div>
              <span className="stat-card-label">Absent</span>
              <h3 className="stat-card-value">{stats.absent}</h3>
            </div>
          </div>
          <div className="attendance-stat-card">
            <div className="stat-icon-box rate"><Clock size={20} /></div>
            <div>
              <span className="stat-card-label">Rate</span>
              <h3 className="stat-card-value">{stats.attendancePercentage}%</h3>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="attendance-filter-card">
        <div className="filter-item">
          <label>Date</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>
        <div className="filter-item">
          <label>Department</label>
          <select value={department} onChange={e => setDepartment(e.target.value)}>
            <option value="">All</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">IT</option>
            <option value="Data Science">Data Science</option>
          </select>
        </div>
        <div className="filter-item small">
          <label>Semester</label>
          <select value={semester} onChange={e => setSemester(e.target.value)}>
            <option value="">All</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
          </select>
        </div>
        <div className="bulk-actions-group">
          <label>Quick Action</label>
          <div className="bulk-buttons">
            <button className="btn-bulk-present" onClick={() => markAll("Present")}>All Present</button>
            <button className="btn-bulk-absent" onClick={() => markAll("Absent")}>All Absent</button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="attendance-search-row">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="count-tag">{filtered.length} Students</span>
      </div>

      {/* Table */}
      <div className="attendance-table-card">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Department</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="table-status-msg">Loading...</td></tr>
            ) : !filtered.length ? (
              <tr><td colSpan="4" className="table-status-msg">No students found</td></tr>
            ) : (
              filtered.map(item => (
                <tr key={item.studentId}>
                  <td className="cell-adm-number">{item.admissionNo}</td>
                  <td className="cell-student-name">{item.fullName}</td>
                  <td>
                    <span className="dept-tag">{item.department}</span>
                    <span className="sem-tag">Sem {item.semester}</span>
                  </td>
                  <td className="text-center">
                    <div className="status-pill-toggle">
                      {["Present", "Absent", "Late", "Leave"].map(st => (
                        <button
                          key={st}
                          className={`pill-option ${st.toLowerCase()} ${item.status === st ? "active" : ""}`}
                          onClick={() => updateStatus(item.studentId, st)}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}