// backend/routes/studentRoutes.js
const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

// Student directory list (Admin, Faculty/Teacher)
router.get("/", protect, authorizeRoles("admin", "faculty", "teacher"), getAllStudents);
router.get("/:id", protect, authorizeRoles("admin", "faculty", "teacher"), getStudentById);

// New Admissions & Record Modification (Strictly Admin)
router.post("/", protect, authorizeRoles("admin"), createStudent);
router.put("/:id", protect, authorizeRoles("admin"), updateStudent);
router.delete("/:id", protect, authorizeRoles("admin"), deleteStudent);

module.exports = router;