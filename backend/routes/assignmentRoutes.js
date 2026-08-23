const express = require("express");
const router = express.Router();
const {
  createAssignment,
  getAssignments,
  submitAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
} = require("../controllers/assignmentController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Teacher can upload assignment problem sheet file
router.post("/", protect, upload.single("assignmentFile"), createAssignment);
router.get("/", protect, getAssignments);

// Student submits solution file
router.post(
  "/:id/submit",
  protect,
  upload.single("solutionFile"),
  submitAssignment,
);

router.get("/:id/submissions", protect, getAssignmentSubmissions);
router.put("/submissions/:submissionId/grade", protect, gradeSubmission);

module.exports = router;
