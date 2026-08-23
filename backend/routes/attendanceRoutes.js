// backend/routes/attendanceRoutes.js
const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

const {
  markBulkAttendance,
  getAttendanceSheet,
  getAttendanceStats,
} = require("../controllers/attendanceController");


router.post(
  "/bulk",
  protect,
  authorizeRoles("admin", "faculty", "teacher"),
  markBulkAttendance,
);


router.get(
  "/sheet",
  protect,
  authorizeRoles("admin", "faculty", "teacher", "student"),
  getAttendanceSheet,
);


router.get(
  "/stats",
  protect,
  authorizeRoles("admin", "faculty", "teacher", "student"),
  getAttendanceStats,
);

module.exports = router;
