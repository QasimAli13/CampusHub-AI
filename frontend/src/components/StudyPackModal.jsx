import { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  BookOpen,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import API from "../api/axios";

export default function StudyPackModal({ assignment, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState({});

  useEffect(() => {
    if (assignment) {
      fetchStudyPack();
    }
  }, [assignment]);

  const fetchStudyPack = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/ai/study-pack", {
        content: `${assignment.title}\n\n${assignment.description}`,
        courseCode: assignment.courseCode || "General",
      });

      if (res.data && res.data.success) {
        setData(res.data.data);
      } else {
        setError("Failed to generate AI study pack. Please try again.");
      }
    } catch (err) {
      console.error("Study Pack Error:", err);
      setError(
        err.response?.data?.message ||
          "AI service is currently busy. Please try in a few seconds.",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (idx) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="card modal-container">
        <div className="modal-header-row">
          <div className="modal-header-brand">
            <div className="modal-icon-badge">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="assignment-title">
                AI Study Pack • {assignment.courseCode}
              </h2>
              <p className="text-subtle">{assignment.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        {loading && (
          <div className="modal-state-box">
            <Sparkles size={32} className="spin-slow" color="#48CAE4" />
            <h4 className="modal-state-title">Analyzing Assignment...</h4>
            <p className="text-subtle">
              CampusFlow AI is generating high-yield notes and viva defense
              questions.
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="modal-state-box">
            <AlertTriangle size={32} color="#f87171" />
            <p className="alert-error">{error}</p>
            <button onClick={fetchStudyPack} className="btn-primary">
              Retry
            </button>
          </div>
        )}

        {!loading && data && (
          <div className="study-pack-stack">
            <div>
              <h4 className="study-section-title accent">
                <BookOpen size={16} /> Core Concept Summary
              </h4>
              <div className="study-summary-card">{data.summary}</div>
            </div>

            {data.keyTakeaways && data.keyTakeaways.length > 0 && (
              <div>
                <h4 className="study-section-title success">
                  <CheckCircle size={16} /> High-Yield Takeaways
                </h4>
                <div className="takeaway-list">
                  {data.keyTakeaways.map((point, i) => (
                    <div key={i} className="takeaway-item">
                      <span>•</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.vivaQuestions && data.vivaQuestions.length > 0 && (
              <div>
                <h4 className="study-section-title warning">
                  <HelpCircle size={16} /> Expected Viva & Defense Questions
                </h4>
                <div className="viva-list">
                  {data.vivaQuestions.map((qObj, idx) => (
                    <div key={idx} className="viva-card">
                      <p className="viva-question">
                        Q{idx + 1}: {qObj.question}
                      </p>

                      {revealedAnswers[idx] ? (
                        <div className="viva-answer-box">
                          <strong>Answer: </strong>
                          {qObj.answer}
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleAnswer(idx)}
                          className="viva-toggle-btn"
                        >
                          Reveal Answer ↓
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
