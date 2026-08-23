// backend/models/Transaction.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Income", "Expense"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Fee Collection",
        "Staff Salary",
        "Utility Bills",
        "Lab & Equipment",
        "Campus Maintenance",
        "Events & Sports",
        "Other",
      ],
      default: "Other",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["Bank Transfer", "Cash", "Online Gateway", "Cheque"],
      default: "Bank Transfer",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    referenceNo: {
      type: String,
      default: "",
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Transaction", transactionSchema);
