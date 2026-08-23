require("dotenv").config();
const path = require("path");
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const Message = require("./models/Message");
const admissionRoutes = require("./routes/admissionRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const examRoutes = require("./routes/examRoutes");
const feeRoutes = require("./routes/feeRoutes");
const staffRoutes = require("./routes/staffRoutes");
const accountingRoutes = require("./routes/accountingRoutes");

const app = express();
const server = http.createServer(app);

// Connect MongoDB
connectDB();

// Setup WebSockets
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Attach socketio instance to express app (accessible in controllers via req.app.get("socketio"))
app.set("socketio", io);

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount REST Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));
app.use("/api/admissions", admissionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/fees", feeRoutes);

app.use("/api/accounting", accountingRoutes);

app.use("/api/staff", staffRoutes);
app.get("/api/chat/:room", async (req, res) => {
  try {
    const { room } = req.params;
    const messages = await Message.find({ room })
      .populate("sender", "name role")
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({ success: true, data: messages });
  } catch (err) {
    console.error("Fetch Chat Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Socket.io Real-Time Room & Chat Engine
io.on("connection", (socket) => {
  console.log(`Connected Client: ${socket.id}`);

  // User joins personal notification room
  socket.on("join_user_room", (userId) => {
    socket.join(userId);
    console.log(`User joined private room: ${userId}`);
  });

  // User joins course/department group chat
  socket.on("join_chat_room", (roomName) => {
    socket.join(roomName);
    console.log(`Client joined chat room: ${roomName}`);
  });

  // Handle incoming live chat message
  socket.on("send_message", async (data) => {
    try {
      const { senderId, room, text } = data;

      const savedMessage = await Message.create({
        sender: senderId,
        room,
        text,
      });

      const populated = await Message.findById(savedMessage._id).populate(
        "sender",
        "name role",
      );

      // Broadcast message to everyone inside the room
      io.to(room).emit("receive_message", populated);
    } catch (err) {
      console.error("Socket Chat Error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`CampusFlow AI Server active on port ${PORT}`);
});
