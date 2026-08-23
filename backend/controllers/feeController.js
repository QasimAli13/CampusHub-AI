// backend/controllers/feeController.js
const FeeChallan = require("../models/FeeChallan");
const Student = require("../models/Student");

// 1. Bulk generate challans for all enrolled students
exports.generateMonthlyChallans = async (req, res) => {
  try {
    const { billingMonth, dueDate } = req.body;

    if (!billingMonth || !dueDate) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Billing month and due date are required.",
        });
    }

    const activeStudents = await Student.find({ status: "Enrolled" });
    if (activeStudents.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No enrolled students found." });
    }

    let createdCount = 0;
    const generatedChallans = [];

    for (const student of activeStudents) {
      // Duplicate billing check for the same month
      const exists = await FeeChallan.findOne({
        student: student._id,
        billingMonth,
      });
      if (!exists) {
        const challanNo = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

        const challan = await FeeChallan.create({
          student: student._id,
          challanNo,
          billingMonth,
          tuitionFee: student.monthlyFee || 0,
          otherCharges: 0,
          lateFine: 0,
          dueDate: new Date(dueDate),
          status: "Unpaid",
        });

        generatedChallans.push(challan);
        createdCount++;
      }
    }

    return res.status(201).json({
      success: true,
      message: `Generated ${createdCount} new challans for ${billingMonth}.`,
      count: createdCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Fetch all challans with filters (month, status, search)
exports.getAllChallans = async (req, res) => {
  try {
    const { status, billingMonth } = req.query;
    let query = {};

    if (status) query.status = status;
    if (billingMonth) query.billingMonth = billingMonth;

    const challans = await FeeChallan.find(query)
      .populate(
        "student",
        "fullName admissionNo department semester guardianPhone",
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: challans.length,
      data: challans,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Mark a specific challan as Paid
exports.markChallanPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const challan = await FeeChallan.findByIdAndUpdate(
      id,
      { status: "Paid", paidDate: new Date() },
      { new: true },
    );

    if (!challan) {
      return res
        .status(404)
        .json({ success: false, message: "Challan not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Challan marked as Paid successfully.",
      data: challan,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Financial Summary Metrics
exports.getFeeSummary = async (req, res) => {
  try {
    const allChallans = await FeeChallan.find();

    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalPending = 0;
    let unpaidCount = 0;

    allChallans.forEach((c) => {
      const amount = c.tuitionFee + c.otherCharges + c.lateFine;
      totalInvoiced += amount;

      if (c.status === "Paid") {
        totalCollected += amount;
      } else {
        totalPending += amount;
        unpaidCount++;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        totalInvoiced,
        totalCollected,
        totalPending,
        unpaidCount,
        recoveryRate:
          totalInvoiced > 0
            ? ((totalCollected / totalInvoiced) * 100).toFixed(1)
            : 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
