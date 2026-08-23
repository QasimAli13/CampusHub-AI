import { useState, useRef, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { X, Send, Sparkles, Bot, Trash2 } from "lucide-react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Copilot() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: `Hi ${user?.name ? user.name.split(" ")[0] : "there"}! 👋 I'm your CampusFlow Copilot. How can I help you today?`,
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const newChatHistory = [...messages, { sender: "user", text: userText }];

    setMessages(newChatHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await API.post("/ai/copilot", {
        message: userText,
        context: `Current Route: ${location.pathname}`,
        chatHistory: messages.slice(-6),
      });

      if (res.data && res.data.success) {
        setMessages((prev) => [
          ...prev,
          { sender: "assistant", text: res.data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "assistant",
            text: "Sorry, I couldn't process that request right now.",
          },
        ]);
      }
    } catch (err) {
      console.error("Copilot Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text:
            err.response?.data?.message ||
            "AI Copilot is momentarily unavailable.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        sender: "assistant",
        text: "Chat cleared. What else can I assist you with?",
      },
    ]);
  };

  return (
    <div className="copilot-anchor">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn-primary copilot-trigger-btn"
        >
          <Sparkles size={18} />
          <span>AI Copilot</span>
        </button>
      )}

      {isOpen && (
        <div className="card copilot-window">
          <div className="copilot-header">
            <div className="copilot-title-group">
              <Bot size={18} color="#48CAE4" />
              <div>
                <h4 className="copilot-title">Campus Copilot</h4>
                <span className="copilot-subtitle">Powered by Groq</span>
              </div>
            </div>

            <div className="copilot-actions">
              <button
                onClick={clearChat}
                title="Clear Chat"
                className="copilot-action-btn"
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="copilot-action-btn"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="copilot-feed">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`copilot-bubble ${m.sender === "user" ? "user" : "assistant"}`}
              >
                {m.text}
              </div>
            ))}

            {loading && (
              <div className="copilot-typing">
                <Sparkles size={13} className="spin-slow" color="#48CAE4" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="copilot-input-bar">
            <input
              type="text"
              placeholder="Ask anything about courses, labs..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input-field"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
