const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "lab_equipment",
        "classroom",
        "hostel",
        "it_network",
        "administration",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved"],
      default: "pending",
    },
    adminNotes: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Complaint", complaintSchema);
