// backend/models/FeeChallan.js
const mongoose = require("mongoose");

const feeChallanSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    challanNo: {
      type: String,
      required: true,
      unique: true,
    },

    billingMonth: {
      type: String,
      required: true,
    },

    tuitionFee: {
      type: Number,
      required: true,
    },

    otherCharges: {
      type: Number,
      default: 0,
    },

    lateFine: {
      type: Number,
      default: 0,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Unpaid", "Paid", "Overdue", "Cancelled"],
      default: "Unpaid",
    },

    paidDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("FeeChallan", feeChallanSchema);
