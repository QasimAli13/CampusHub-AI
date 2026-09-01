// src/pages/IdCards.js

import React, { useState, useEffect } from "react";
import { Printer, GraduationCap, QrCode } from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = "https://campushub-ai-i7y8.onrender.com/api";

export default function IdCards() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const depts = ["Software Engineering", "Computer Science", "Information Technology", "Data Science"];

  // Fetch students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const url = department
        ? `${API_BASE}/admissions?department=${encodeURIComponent(department)}`
        : `${API_BASE}/admissions`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setStudents(data.data || []);
        if (data.data?.length && !selected) setSelected(data.data[0]);
      }
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [department]);

  // Filter students
  const filtered = students.filter(s =>
    s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    s.admissionNo?.toLowerCase().includes(search.toLowerCase())
  );

  const handlePrint = () => {
    if (!filtered.length) return toast.error("No cards to print");
    window.print();
  };

  // Student Card Component
  const StudentCard = ({ student, isPreview = false }) => (
    <div
      className={`smart-id-card ${isPreview ? "selected-for-preview" : ""}`}
      onClick={() => !isPreview && setSelected(student)}
    >
      <div className="card-top-strip">
        <GraduationCap size={isPreview ? 20 : 16} className="card-brand-icon" />
        <div>
          <h4 className="card-institute-title">CAMPUS HUB UNIVERSITY</h4>
          <span className="card-badge-session">STUDENT IDENTITY CARD</span>
        </div>
      </div>

      <div className="card-body-layout">
        <div className="card-photo-wrapper">
          <div className="card-avatar-box">
            {student.fullName?.charAt(0) || "S"}
          </div>
          <span className="card-session-pill">2026 - 2027</span>
        </div>

        <div className="card-info-fields">
          <h3 className="card-student-name">{student.fullName}</h3>

          <div className="card-field-row">
            <span className="field-lbl">Roll No:</span>
            <span className="field-val highlight">{student.admissionNo}</span>
          </div>

          <div className="card-field-row">
            <span className="field-lbl">Dept:</span>
            <span className="field-val">{student.department}</span>
          </div>

          <div className="card-field-row">
            <span className="field-lbl">Sem:</span>
            <span className="field-val">Sem {student.semester}</span>
          </div>

          <div className="card-field-row">
            <span className="field-lbl">Emergency:</span>
            <span className="field-val">{student.guardianPhone}</span>
          </div>
        </div>
      </div>

      <div className="card-footer-strip">
        <div className="card-barcode-mock">
          <div className="barcode-bars"></div>
          <span className="barcode-number">{student.admissionNo}</span>
        </div>
        <div className="card-qr-box">
          <QrCode size={isPreview ? 30 : 26} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="id-cards-page">
      {/* Header */}
      <div className="id-header no-print">
        <div>
          <h1 className="id-title">ID Card Studio</h1>
          <p className="id-subtitle">Generate and print student identity cards</p>
        </div>
        <button
          className="btn-print-batch"
          onClick={handlePrint}
          disabled={loading || !filtered.length}
        >
          <Printer size={17} />
          Print Cards ({filtered.length})
        </button>
      </div>

      {/* Controls */}
      <div className="studio-control-panel no-print">
        <div className="control-group">
          <label>Department</label>
          <select value={department} onChange={e => setDepartment(e.target.value)}>
            <option value="">All Departments</option>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="control-group">
          <label>Search Student</label>
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main Layout */}
      <div className="studio-layout-grid">
        {/* Preview */}
        <div className="live-preview-box no-print">
          <div className="preview-heading">
            <span>Preview</span>
          </div>
          {selected ? (
            <StudentCard student={selected} isPreview={true} />
          ) : (
            <div className="empty-preview-msg">No student selected</div>
          )}
        </div>

        {/* Cards Grid */}
        <div>
          <div className="batch-header-row no-print">
            <span className="batch-count-text">
              {filtered.length} Students
            </span>
          </div>

          {loading ? (
            <div className="batch-loading-msg">Loading...</div>
          ) : !filtered.length ? (
            <div className="batch-empty-msg">No students found</div>
          ) : (
            <div className="printable-id-grid">
              {filtered.map(student => (
                <StudentCard key={student._id} student={student} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}