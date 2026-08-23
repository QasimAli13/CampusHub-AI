// src/pages/Admissions.jsx
import React, { useState, useEffect } from "react";
import { UserPlus, Search, X } from "lucide-react";
import toast from "react-hot-toast";


const API_BASE = "http://localhost:5000/api";

export default function Admissions() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    admissionNo: "",
    email: "",
    gender: "Male",
    department: "Software Engineering",
    semester: 1,
    section: "A",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    monthlyFee: "",
  });

  // 1. Fetch Students from Backend
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admissions`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.data || []);
      }
    } catch (err) {
      console.error("Admissions fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 2. Submit New Student Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Student enrolled successfully!");
        setShowModal(false);
        setFormData({
          fullName: "",
          admissionNo: "",
          email: "",
          gender: "Male",
          department: "Software Engineering",
          semester: 1,
          section: "A",
          guardianName: "",
          guardianPhone: "",
          guardianEmail: "",
          monthlyFee: "",
        });
        fetchStudents();
      } else {
        toast.error(data.message || "Enrollment failed");
      }
    } catch (err) {
      toast.error("Could not reach backend server");
    }
  };

  // Search Filter
  const filteredStudents = students.filter(
    (s) =>
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.admissionNo?.toLowerCase().includes(search.toLowerCase()) ||
      s.department?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="admissions-container">
      {/* Page Header */}
      <div className="admissions-header">
        <div>
          <h1 className="admissions-title">Admissions & Student Records</h1>
          <p className="admissions-subtitle">
            Enroll new students, assign classes, and manage guardian
            information.
          </p>
        </div>
        <button
          className="btn-primary-admit"
          onClick={() => setShowModal(true)}
        >
          <UserPlus size={18} />
          <span>New Admission</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="admissions-search-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search by student name, roll number, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Students Data Table */}
      <div className="admissions-table-card">
        <table className="admissions-table">
          <thead>
            <tr>
              <th>Adm / Roll No</th>
              <th>Student Name</th>
              <th>Department & Sem</th>
              <th>Guardian Info</th>
              <th>Monthly Fee</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="table-empty-state">
                  Loading student records...
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty-state">
                  No student records found. Click{" "}
                  <strong>"New Admission"</strong> to enroll a student.
                </td>
              </tr>
            ) : (
              filteredStudents.map((s) => (
                <tr key={s._id}>
                  <td className="cell-adm-no">{s.admissionNo}</td>
                  <td>
                    <div className="student-name-text">{s.fullName}</div>
                    <div className="student-email-text">{s.email}</div>
                  </td>
                  <td>
                    <span className="dept-badge">{s.department}</span>
                    <span className="sem-text">
                      Sem {s.semester}-{s.section}
                    </span>
                  </td>
                  <td>
                    <div className="guardian-name-text">{s.guardianName}</div>
                    <div className="guardian-phone-text">{s.guardianPhone}</div>
                  </td>
                  <td className="fee-text">${s.monthlyFee}</td>
                  <td>
                    <span className="status-enrolled">{s.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Popup for New Admission */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div
            className="modal-content-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-row">
              <h3>Student Admission Form</h3>
              <button
                className="modal-close-icon-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admission-form">
              <div className="form-row-two-col">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Qasim Ali"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Admission / Roll No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BSE-F26-001"
                    value={formData.admissionNo}
                    onChange={(e) =>
                      setFormData({ ...formData, admissionNo: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-row-two-col">
                <div className="form-group">
                  <label>Student Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="student@campus.edu"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineering"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-row-three-col">
                <div className="form-group">
                  <label>Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({ ...formData, semester: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Section</label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) =>
                      setFormData({ ...formData, section: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Monthly Fee ($)</label>
                  <input
                    type="number"
                    placeholder="250"
                    value={formData.monthlyFee}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyFee: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-row-two-col">
                <div className="form-group">
                  <label>Guardian Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Father / Guardian Name"
                    value={formData.guardianName}
                    onChange={(e) =>
                      setFormData({ ...formData, guardianName: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Guardian Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+92 300 0000000"
                    value={formData.guardianPhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guardianPhone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
