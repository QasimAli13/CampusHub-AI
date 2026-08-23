// backend/models/Student.js
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    admissionNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },
    department: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      default: 1,
    },
    section: {
      type: String,
      default: "A",
    },
    guardianName: {
      type: String,
      required: true,
    },
    guardianPhone: {
      type: String,
      required: true,
    },
    guardianEmail: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    monthlyFee: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Enrolled", "Pending", "Suspended", "Graduated"],
      default: "Enrolled",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);