// backend/routes/examRoutes.js
const express = require("express");
const router = express.Router();

const {
  createExam,
  getAllExams,
  submitExamMarks,
  getExamDetails,
} = require("../controllers/examController");

router.post("/", createExam);
router.get("/", getAllExams);
router.get("/:id", getExamDetails);
router.post("/:id/marks", submitExamMarks);

module.exports = router;
