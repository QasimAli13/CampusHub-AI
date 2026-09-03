// src/pages/ChatRoom.jsx
import { useEffect, useState, useContext, useRef } from "react";
import { io } from "socket.io-client";
import { Send } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";

export default function ChatRoom() {
  const { user } = useContext(AuthContext);
  const [room, setRoom] = useState("general");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const userId = user?._id || user?.id;

  useEffect(() => {
    socketRef.current = io("https://campushub-ai-i7y8.onrender.com");
    socketRef.current.emit("join_chat_room", room);

    API.get(`/chat/${room}`)
      .then((res) => {
        if (res.data && res.data.data) setMessages(res.data.data);
      })
      .catch((err) => {
        console.error("Failed to load chat history:", err);
        setMessages([]);
      });

    const handleReceiveMessage = (newMsg) => {
      if (newMsg.room === room) {
        setMessages((prev) => [...prev, newMsg]);
      }
    };

    socketRef.current.on("receive_message", handleReceiveMessage);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("receive_message", handleReceiveMessage);
        socketRef.current.disconnect();
      }
    };
  }, [room]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socketRef.current || !userId) return;

    socketRef.current.emit("send_message", {
      senderId: userId,
      room: room,
      text: inputMessage.trim(),
    });

    setInputMessage("");
  };

  return (
    <div className="chat-room-page">
      {/* Header */}
      <div className="chat-room-header-flex">
        <div>
          <h1 className="page-title">Campus Chat</h1>
          <p className="page-subtitle">Live discussion room</p>
        </div>
        <select
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="chat-room-select"
        >
          <option value="general">General Campus</option>
          <option value="cs-dept">CS Department</option>
          <option value="exam-prep">Exam Preparation</option>
        </select>
      </div>

      {/* Chat Box */}
      <div className="chat-box">
        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <p className="chat-empty">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((m, idx) => {
              const msgSenderId = m.sender?._id || m.sender;
              const isMe = msgSenderId === userId;
              const senderName = m.sender?.name || (isMe ? "You" : "Student");
              const senderRole = m.sender?.role || "user";

              return (
                <div
                  key={m._id || idx}
                  className={`chat-message ${isMe ? "sent" : "received"}`}
                >
                  <span className="chat-sender">
                    {isMe ? "You" : senderName} ({senderRole})
                  </span>
                  <div className={`chat-bubble ${isMe ? "sent" : "received"}`}>
                    {m.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="chat-form">
          <input
            type="text"
            placeholder={`Message #${room}...`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="chat-input"
          />
          <button type="submit" className="btn-send">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}