const express = require("express");
const router = express.Router();

const {
  generateMonthlyChallans,
  getAllChallans,
  markChallanPaid,
  getFeeSummary,
} = require("../controllers/feeController");

// GET /api/fees
router.get("/", getAllChallans);

// GET /api/fees/summary
router.get("/summary", getFeeSummary);

// POST /api/fees/generate
router.post("/generate", generateMonthlyChallans);

// PUT /api/fees/:id/pay
router.put("/:id/pay", markChallanPaid);

module.exports = router;
