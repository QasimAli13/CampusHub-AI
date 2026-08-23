// src/pages/Staff.jsx
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5000/api";

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    employeeId: "",
    email: "",
    phone: "",
    department: "Computer Science",
    designation: "Lecturer",
    monthlySalary: "",
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/staff`);
      const data = await res.json();
      if (data.success) setStaffList(data.data || []);
    } catch (err) {
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Staff registered!");
        setShowModal(false);
        setFormData({
          fullName: "",
          employeeId: "",
          email: "",
          phone: "",
          department: "Computer Science",
          designation: "Lecturer",
          monthlySalary: "",
        });
        fetchStaff();
      } else {
        toast.error(data.message || "Failed to register");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  const filteredStaff = staffList.filter(
    (s) =>
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
      s.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="staff-page">
      {/* Header */}
      <div className="staff-header">
        <div>
          <h1 className="staff-title">Staff Management</h1>
          <p className="staff-subtitle">Manage campus teachers and staff</p>
        </div>
        <button className="btn-add-staff" onClick={() => setShowModal(true)}>
          Add Staff
        </button>
      </div>

      {/* Search */}
      <div className="staff-search-wrapper">
        <input
          type="text"
          placeholder="Search by name, ID, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="staff-table-card">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Salary</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="table-msg">Loading...</td>
              </tr>
            ) : filteredStaff.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-msg">No staff found</td>
              </tr>
            ) : (
              filteredStaff.map((s) => (
                <tr key={s._id}>
                  <td className="cell-id">{s.employeeId}</td>
                  <td className="cell-name">{s.fullName}</td>
                  <td>
                    <div>{s.email}</div>
                    <div className="cell-sub">{s.phone}</div>
                  </td>
                  <td>{s.department}</td>
                  <td>{s.designation}</td>
                  <td className="cell-salary">${s.monthlySalary || 0}</td>
                  <td>
                    <span className="status-badge">{s.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Add Staff</h3>

            <form onSubmit={handleSubmit} className="staff-form">
              <div className="form-row">
                <div className="form-item">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div className="form-item">
                  <label>Employee ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="EMP-2026-01"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-item">
                  <label>Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="staff@campus.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-item">
                  <label>Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-item">
                  <label>Department *</label>
                  <input
                    type="text"
                    required
                    placeholder="Computer Science"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
                <div className="form-item">
                  <label>Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="Lecturer"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-item">
                <label>Monthly Salary ($)</label>
                <input
                  type="number"
                  placeholder="1200"
                  value={formData.monthlySalary}
                  onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}