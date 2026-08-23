// src/pages/ExamManagement.jsx
import React, { useState, useEffect } from "react";
import { FileSpreadsheet, Plus, Search, Calendar, X, ArrowRight, BookOpen } from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = "https://campushub-ai-i7y8.onrender.com/api";

export default function ExamManagement() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [examForm, setExamForm] = useState({
    title: "",
    examType: "Midterm",
    subject: "",
    department: "Software Engineering",
    semester: 1,
    examDate: new Date().toISOString().split("T")[0],
    totalMarks: 100,
    passingMarks: 50,
  });

  const [activeExam, setActiveExam] = useState(null);
  const [marksSheet, setMarksSheet] = useState([]);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [savingMarks, setSavingMarks] = useState(false);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/exams`);
      const data = await res.json();
      if (data.success) setExams(data.data || []);
    } catch (err) {
      toast.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/exams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Exam created!");
        setShowCreateModal(false);
        setExamForm({
          title: "",
          examType: "Midterm",
          subject: "",
          department: "Software Engineering",
          semester: 1,
          examDate: new Date().toISOString().split("T")[0],
          totalMarks: 100,
          passingMarks: 50,
        });
        fetchExams();
      } else {
        toast.error(data.message || "Failed to create");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  const handleOpenGradebook = async (exam) => {
    setActiveExam(exam);
    setLoadingSheet(true);
    try {
      const studentsRes = await fetch(
        `${API_BASE}/admissions?department=${encodeURIComponent(exam.department)}&semester=${exam.semester}`
      );
      const studentsData = await studentsRes.json();

      const examDetailsRes = await fetch(`${API_BASE}/exams/${exam._id}`);
      const examDetailsData = await examDetailsRes.json();

      const existingResultsMap = {};
      if (examDetailsData.success && examDetailsData.data.results) {
        examDetailsData.data.results.forEach((r) => {
          const sId = r.student?._id || r.student;
          existingResultsMap[sId] = r.obtainedMarks;
        });
      }

      if (studentsData.success) {
        const preparedSheet = (studentsData.data || []).map((s) => ({
          studentId: s._id,
          admissionNo: s.admissionNo,
          fullName: s.fullName,
          obtainedMarks: existingResultsMap[s._id] !== undefined ? existingResultsMap[s._id] : "",
        }));
        setMarksSheet(preparedSheet);
      }
    } catch (err) {
      toast.error("Failed to load gradebook");
    } finally {
      setLoadingSheet(false);
    }
  };

  const handleMarkChange = (studentId, value) => {
    setMarksSheet((prev) =>
      prev.map((item) =>
        item.studentId === studentId ? { ...item, obtainedMarks: value } : item
      )
    );
  };

  const handleSaveMarks = async () => {
    try {
      setSavingMarks(true);
      const payload = {
        marksList: marksSheet
          .filter((item) => item.obtainedMarks !== "")
          .map((item) => ({
            studentId: item.studentId,
            obtainedMarks: Number(item.obtainedMarks),
          })),
      };

      if (payload.marksList.length === 0) {
        toast.error("Enter marks for at least one student");
        setSavingMarks(false);
        return;
      }

      const res = await fetch(`${API_BASE}/exams/${activeExam._id}/marks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Marks saved!");
        setActiveExam(null);
        fetchExams();
      } else {
        toast.error(data.message || "Failed to save");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setSavingMarks(false);
    }
  };

  const filteredExams = exams.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.subject.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  // Grade calculation
  const getGrade = (marks, total) => {
    if (marks === "" || marks === null || marks === undefined) return "-";
    const pct = (Number(marks) / total) * 100;
    if (pct >= 90) return "A+";
    if (pct >= 80) return "A";
    if (pct >= 70) return "B+";
    if (pct >= 60) return "B";
    if (pct >= 50) return "C";
    if (pct >= 40) return "D";
    return "F";
  };

  const getGradeClass = (grade) => {
    if (grade === "A+" || grade === "A") return "grade-a";
    if (grade === "B+" || grade === "B") return "grade-b";
    if (grade === "C" || grade === "D") return "grade-c";
    if (grade === "F") return "grade-f";
    return "";
  };

  return (
    <div className="exam-container">
      {/* Header */}
      <div className="exam-header">
        <div>
          <h1 className="page-title">Exam Management</h1>
          <p className="page-subtitle">Schedule exams and manage grades</p>
        </div>
        <button className="btn-create-exam" onClick={() => setShowCreateModal(true)}>
          <Plus size={17} />
          Schedule Exam
        </button>
      </div>

      {/* Search */}
      <div className="exam-search-wrapper">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search exams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Exams Grid */}
      {loading ? (
        <div className="exam-loading">Loading...</div>
      ) : filteredExams.length === 0 ? (
        <div className="exam-empty">
          <FileSpreadsheet size={36} />
          <p>No exams scheduled. Click "Schedule Exam" to create one.</p>
        </div>
      ) : (
        <div className="exam-grid">
          {filteredExams.map((exam) => (
            <div key={exam._id} className="exam-card">
              <div className="exam-card-top">
                <span className={`exam-pill ${exam.examType.toLowerCase()}`}>
                  {exam.examType}
                </span>
                <span className="exam-date">
                  <Calendar size={13} />
                  {new Date(exam.examDate).toLocaleDateString()}
                </span>
              </div>

              <h3 className="exam-title-text">{exam.title}</h3>
              <div className="exam-subject">
                <BookOpen size={15} />
                {exam.subject}
              </div>

              <div className="exam-meta">
                <span className="exam-dept">{exam.department}</span>
                <span className="exam-sem">Sem {exam.semester}</span>
              </div>

              <div className="exam-stats">
                <div><span className="label">Total</span><span>{exam.totalMarks}</span></div>
                <div><span className="label">Passing</span><span>{exam.passingMarks}</span></div>
                <div><span className="label">Evaluated</span><span>{exam.results?.length || 0}</span></div>
              </div>

              <button className="btn-gradebook" onClick={() => handleOpenGradebook(exam)}>
                Gradebook <ArrowRight size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Schedule Exam</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="exam-form">
              <div className="form-group">
                <label>Exam Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Spring 2026"
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Exam Type</label>
                  <select
                    value={examForm.examType}
                    onChange={(e) => setExamForm({ ...examForm, examType: e.target.value })}
                  >
                    <option value="Midterm">Midterm</option>
                    <option value="Final">Final</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Assessment">Assessment</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data Structures"
                    value={examForm.subject}
                    onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    required
                    value={examForm.department}
                    onChange={(e) => setExamForm({ ...examForm, department: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={examForm.semester}
                    onChange={(e) => setExamForm({ ...examForm, semester: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Exam Date</label>
                  <input
                    type="date"
                    required
                    value={examForm.examDate}
                    onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Total Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={examForm.totalMarks}
                    onChange={(e) => setExamForm({ ...examForm, totalMarks: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Passing Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={examForm.passingMarks}
                    onChange={(e) => setExamForm({ ...examForm, passingMarks: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gradebook Modal */}
      {activeExam && (
        <div className="modal-overlay" onClick={() => setActiveExam(null)}>
          <div className="gradebook-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gradebook-header">
              <div>
                <span className="gradebook-badge">{activeExam.subject}</span>
                <h2>{activeExam.title}</h2>
                <p>{activeExam.department} • Sem {activeExam.semester} • Total: {activeExam.totalMarks}</p>
              </div>
              <button className="modal-close" onClick={() => setActiveExam(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="gradebook-body">
              {loadingSheet ? (
                <div className="gradebook-msg">Loading...</div>
              ) : marksSheet.length === 0 ? (
                <div className="gradebook-msg">No students found</div>
              ) : (
                <table className="gradebook-table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student</th>
                      <th>Marks / {activeExam.totalMarks}</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marksSheet.map((row) => {
                      const grade = getGrade(row.obtainedMarks, activeExam.totalMarks);
                      return (
                        <tr key={row.studentId}>
                          <td className="cell-roll">{row.admissionNo}</td>
                          <td className="cell-name">{row.fullName}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max={activeExam.totalMarks}
                              className="marks-input"
                              placeholder="0"
                              value={row.obtainedMarks}
                              onChange={(e) => handleMarkChange(row.studentId, e.target.value)}
                            />
                          </td>
                          <td>
                            <span className={`grade-tag ${getGradeClass(grade)}`}>
                              {grade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="gradebook-footer">
              <button className="btn-cancel" onClick={() => setActiveExam(null)}>Close</button>
              <button className="btn-save-marks" disabled={savingMarks} onClick={handleSaveMarks}>
                {savingMarks ? "Saving..." : "Save Marks"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}