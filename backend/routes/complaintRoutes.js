const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const {
  createComplaint,
  getComplaints,
  updateComplaintStatus,
} = require("../controllers/complaintController");

router.use(protect);

router.post("/", upload.single("attachment"), createComplaint);
router.get("/", getComplaints);
router.put("/:id/status", authorizeRoles("admin"), updateComplaintStatus);

module.exports = router;
