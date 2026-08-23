// backend/models/Staff.js
const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    employeeId: {
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
    phone: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
      default: "Masters",
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    monthlySalary: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Active", "On Leave", "Resigned"],
      default: "Active",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Staff", staffSchema);
