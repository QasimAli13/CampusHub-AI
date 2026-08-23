// backend/models/Exam.js
const mongoose = require("mongoose");

const examResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  obtainedMarks: {
    type: Number,
    required: true,
    min: 0,
  },
  grade: {
    type: String,
    enum: ["A+", "A", "B+", "B", "C", "D", "F"],
    default: "F",
  },
  status: {
    type: String,
    enum: ["Pass", "Fail"],
    default: "Pass",
  },
});

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    examType: {
      type: String,
      enum: ["Midterm", "Final", "Quiz", "Assignment", "Assessment"],
      default: "Midterm",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    examDate: {
      type: Date,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    passingMarks: {
      type: Number,
      required: true,
      default: 50,
    },
    results: [examResultSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Exam", examSchema);