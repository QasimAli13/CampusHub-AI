import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import API from "../api/axios";

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("lab_equipment");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/complaints");
      setComplaints(res.data.data);
    } catch {
      setComplaints([
        {
          _id: "c1",
          title: "Lab 3 Projector not working properly",
          category: "lab_equipment",
          status: "in_progress",
        },
        {
          _id: "c2",
          title: "Library Wi-Fi disconnects frequently on 2nd Floor",
          category: "it_network",
          status: "pending",
        },
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/complaints", { title, category, description, severity });
      alert("Ticket submitted successfully!");
      setShowForm(false);
      setTitle("");
      setDescription("");
      fetchComplaints();
    } catch {
      alert("Error submitting ticket.");
    }
  };

  return (
    <div className="main-content">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">Campus Issue Tickets</h1>
          <p className="page-subtitle">
            Submit and track facility, IT, or administrative complaints.
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <PlusCircle size={16} />
          <span>{showForm ? "Close Form" : "New Ticket"}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card card-form">
          <h3 className="assignment-title">Raise a Support Ticket</h3>
          <input
            type="text"
            placeholder="Issue Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            required
          />
          <div className="form-grid-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
            >
              <option value="lab_equipment">Lab Equipment</option>
              <option value="classroom">Classroom</option>
              <option value="hostel">Hostel</option>
              <option value="it_network">IT / Wi-Fi Network</option>
              <option value="administration">Administration</option>
            </select>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="input-field"
            >
              <option value="low">Low Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <textarea
            placeholder="Describe the issue in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
            rows="3"
            required
          />
          <button type="submit" className="btn-primary">
            Submit Ticket
          </button>
        </form>
      )}

      <div className="list-stack">
        {complaints.map((c) => (
          <div key={c._id} className="card card-compact stat-card-header">
            <div>
              <span className="text-subtle">
                {c.category.replace("_", " ")}
              </span>
              <h4 className="assignment-title">{c.title}</h4>
            </div>
            <div>
              <span
                className={`badge ${c.status === "resolved" ? "badge-resolved" : "badge-pending"}`}
              >
                {c.status.replace("_", " ")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
