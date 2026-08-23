// backend/routes/accountingRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

const {
  getAllTransactions,
  createTransaction,
  getFinancialSummary,
} = require("../controllers/accountingController");

router.get("/summary", protect, authorizeRoles("admin"), getFinancialSummary);
router.get("/", protect, authorizeRoles("admin"), getAllTransactions);
router.post("/", protect, authorizeRoles("admin"), createTransaction);

module.exports = router;
