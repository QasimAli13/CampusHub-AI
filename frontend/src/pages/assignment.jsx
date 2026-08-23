import { useState, useEffect, useContext } from "react";
import {
  Sparkles,
  FileText,
  Upload,
  PlusCircle,
  X,
  Download,
  Paperclip,
  Users,
  CheckCircle,
} from "lucide-react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import StudyPackModal from "../components/StudyPackModal";

export default function Assignments() {
  const { user } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);

  // Student Solution Upload
  const [solutionFile, setSolutionFile] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);

  // Teacher Create Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [semester, setSemester] = useState("1");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  // Teacher Submissions View & Grade Modal State
  const [
    selectedAssignmentForSubmissions,
    setSelectedAssignmentForSubmissions,
  ] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingInputs, setGradingInputs] = useState({});
  const [savingGradeId, setSavingGradeId] = useState(null);

  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin";

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await API.get("/assignments");
      setAssignments(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setFormError("");
    setCreating(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("courseCode", courseCode);
    formData.append("semester", semester);
    formData.append("description", description);
    formData.append("deadline", deadline);
    if (assignmentFile) {
      formData.append("assignmentFile", assignmentFile);
    }

    try {
      const res = await API.post("/assignments", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        alert("Assignment published successfully!");
        setTitle("");
        setCourseCode("");
        setSemester("1");
        setDescription("");
        setDeadline("");
        setAssignmentFile(null);
        setShowCreateForm(false);
        fetchAssignments();
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Failed to create assignment",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleSubmission = async (assignmentId) => {
    if (!solutionFile)
      return alert("Please select your solution file to submit.");
    setUploadingId(assignmentId);

    const formData = new FormData();
    formData.append("solutionFile", solutionFile);

    try {
      await API.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Assignment solution submitted successfully!");
      setSolutionFile(null);
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed.");
    } finally {
      setUploadingId(null);
    }
  };

  // Open Teacher Submissions Modal
  const openSubmissionsModal = async (assignment) => {
    setSelectedAssignmentForSubmissions(assignment);
    setLoadingSubmissions(true);
    try {
      const res = await API.get(`/assignments/${assignment._id}/submissions`);
      const list = res.data.data || res.data || [];
      setSubmissionsList(list);

      // Pre-fill grade inputs
      const initialInputs = {};
      list.forEach((sub) => {
        initialInputs[sub._id] = {
          marks: sub.marks !== undefined ? sub.marks : "",
          feedback: sub.feedback || "",
        };
      });
      setGradingInputs(initialInputs);
    } catch (err) {
      console.error("Failed to load submissions:", err);
      setSubmissionsList([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleGradeChange = (subId, field, value) => {
    setGradingInputs((prev) => ({
      ...prev,
      [subId]: {
        ...prev[subId],
        [field]: value,
      },
    }));
  };

  const handleSaveGrade = async (submissionId) => {
    const gradeData = gradingInputs[submissionId];
    if (!gradeData || gradeData.marks === "") {
      return alert("Please enter marks to grade.");
    }

    setSavingGradeId(submissionId);
    try {
      await API.put(`/assignments/submissions/${submissionId}/grade`, {
        marks: Number(gradeData.marks),
        feedback: gradeData.feedback,
      });

      alert("Marks & feedback saved successfully!");

      // Update local state status
      setSubmissionsList((prev) =>
        prev.map((s) =>
          s._id === submissionId
            ? {
                ...s,
                marks: gradeData.marks,
                feedback: gradeData.feedback,
                status: "graded",
              }
            : s,
        ),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to grade submission.");
    } finally {
      setSavingGradeId(null);
    }
  };

  return (
    <div className="main-content">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">Course Assignments</h1>
          <p className="page-subtitle">
            {user?.role === "student"
              ? `Showing assignments for ${user?.department || "Department"} - Semester ${user?.semester || 1}`
              : "Manage and publish course assignments for students."}
          </p>
        </div>

        {isTeacherOrAdmin && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary"
          >
            {showCreateForm ? <X size={16} /> : <PlusCircle size={16} />}
            <span>{showCreateForm ? "Cancel" : "Create Assignment"}</span>
          </button>
        )}
      </div>

      {/* Teacher Create Assignment Form */}
      {isTeacherOrAdmin && showCreateForm && (
        <form onSubmit={handleCreateAssignment} className="card card-form">
          <h3 className="assignment-title">Post New Assignment</h3>

          {formError && <div className="alert-error">{formError}</div>}

          <div className="form-grid-2">
            <input
              type="text"
              placeholder="Assignment Title (e.g. OS Thread Synchronization)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="text"
              placeholder="Course Code (e.g. CS-301)"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="form-grid-2">
            <div>
              <label className="text-subtle">Target Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="input-field"
                required
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

            <div>
              <label className="text-subtle">Submission Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-subtle">
              Attach Question Paper / Lab PDF (Optional)
            </label>
            <input
              type="file"
              onChange={(e) => setAssignmentFile(e.target.files[0])}
              className="input-file"
            />
          </div>

          <textarea
            placeholder="Assignment instructions and problem statement..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
            rows="4"
            required
          />

          <button type="submit" disabled={creating} className="btn-primary">
            {creating ? "Posting..." : "Publish Assignment"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="card modal-state-box">
          <p className="page-subtitle">Loading assignments...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="card modal-state-box">
          <FileText size={40} color="#48CAE4" />
          <h3 className="assignment-title">No Assignments Yet</h3>
          <p className="page-subtitle">
            {isTeacherOrAdmin
              ? "You haven't posted any assignments yet. Click 'Create Assignment' above to add one."
              : "Your instructors haven't uploaded any assignments for your semester. Check back later!"}
          </p>
        </div>
      ) : (
        <div className="list-stack">
          {assignments.map((item) => (
            <div key={item._id} className="card">
              <div className="assignment-header">
                <div>
                  <span className="course-tag">{item.courseCode}</span>
                  <span className="course-tag">Sem {item.semester}</span>
                  <h3 className="assignment-title">{item.title}</h3>
                </div>
                <span className="sidebar-user-role">
                  Due: {new Date(item.deadline).toLocaleDateString()}
                </span>
              </div>

              <p className="assignment-desc">{item.description}</p>

              {item.fileUrl && (
                <div>
                  <a
                    href={`http://localhost:5000${item.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="download-link"
                  >
                    <Paperclip size={14} />
                    <span>Download Question / Lab PDF</span>
                    <Download size={13} />
                  </a>
                </div>
              )}

              <div className="assignment-footer">
                <button
                  onClick={() => setActiveModal(item)}
                  className="btn-ai-study"
                >
                  <Sparkles size={16} />
                  <span>AI Study Pack</span>
                </button>

                {/* Teacher View Submissions Button */}
                {isTeacherOrAdmin && (
                  <button
                    onClick={() => openSubmissionsModal(item)}
                    className="btn-secondary"
                  >
                    <Users size={15} />
                    <span>View Student Submissions</span>
                  </button>
                )}

                {/* Student Solution Submission */}
                {!isTeacherOrAdmin && (
                  <div className="submit-group">
                    <input
                      type="file"
                      onChange={(e) => setSolutionFile(e.target.files[0])}
                      className="input-file"
                    />
                    <button
                      onClick={() => handleSubmission(item._id)}
                      disabled={uploadingId === item._id}
                      className="btn-primary"
                    >
                      <Upload size={14} />
                      <span>
                        {uploadingId === item._id ? "Submitting..." : "Submit"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Study Pack Modal */}
      {activeModal && (
        <StudyPackModal
          assignment={activeModal}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Teacher View & Grade Submissions Modal */}
      {selectedAssignmentForSubmissions && (
        <div className="modal-overlay">
          <div className="card modal-container submissions-modal-container">
            <div className="modal-header-row">
              <div className="modal-header-brand">
                <div className="modal-icon-badge">
                  <Users size={18} />
                </div>
                <div>
                  <h2 className="assignment-title">
                    Submissions • {selectedAssignmentForSubmissions.courseCode}
                  </h2>
                  <p className="text-subtle">
                    {selectedAssignmentForSubmissions.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAssignmentForSubmissions(null)}
                className="modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            {loadingSubmissions ? (
              <div className="modal-state-box">
                <p className="text-subtle">Loading submissions list...</p>
              </div>
            ) : submissionsList.length === 0 ? (
              <div className="modal-state-box">
                <p className="text-subtle">
                  No students have submitted solutions for this assignment yet.
                </p>
              </div>
            ) : (
              <div className="submissions-table-wrapper">
                <table className="submissions-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Submitted File</th>
                      <th>Status</th>
                      <th>Marks & Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissionsList.map((sub) => (
                      <tr key={sub._id}>
                        <td>
                          <strong>{sub.student?.name || "Student"}</strong>
                          <div className="text-subtle">
                            {sub.student?.department || "CS"} • Sem{" "}
                            {sub.student?.semester || 1}
                          </div>
                        </td>
                        <td>
                          <a
                            href={`http://localhost:5000${sub.fileUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="download-link"
                          >
                            <Download size={13} />
                            <span>Download Solution</span>
                          </a>
                          <div className="text-subtle">
                            {new Date(
                              sub.createdAt || Date.now(),
                            ).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          {sub.status === "graded" ? (
                            <span className="badge badge-success">
                              <CheckCircle size={12} /> Graded
                            </span>
                          ) : (
                            <span className="badge badge-neutral">Pending</span>
                          )}
                        </td>
                        <td>
                          <div className="grade-form-inline">
                            <input
                              type="number"
                              placeholder="Marks"
                              value={gradingInputs[sub._id]?.marks || ""}
                              onChange={(e) =>
                                handleGradeChange(
                                  sub._id,
                                  "marks",
                                  e.target.value,
                                )
                              }
                              className="input-field grade-input"
                              min="0"
                              max="100"
                            />
                            <input
                              type="text"
                              placeholder="Feedback notes"
                              value={gradingInputs[sub._id]?.feedback || ""}
                              onChange={(e) =>
                                handleGradeChange(
                                  sub._id,
                                  "feedback",
                                  e.target.value,
                                )
                              }
                              className="input-field feedback-input"
                            />
                            <button
                              onClick={() => handleSaveGrade(sub._id)}
                              disabled={savingGradeId === sub._id}
                              className="btn-primary btn-grade-save"
                            >
                              {savingGradeId === sub._id ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
