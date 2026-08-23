// backend/models/Assignment.js
const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    courseCode: {
      type: String,
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: {
      type: String,
    },
    deadline: {
      type: Date,
      required: true,
    },
    aiSummary: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Assignment", assignmentSchema);
