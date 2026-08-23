// backend/routes/staffRoutes.js
const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

const {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} = require("../controllers/staffController");

router.get("/", protect, authorizeRoles("admin"), getAllStaff);
router.post("/", protect, authorizeRoles("admin"), createStaff);
router.put("/:id", protect, authorizeRoles("admin"), updateStaff);
router.delete("/:id", protect, authorizeRoles("admin"), deleteStaff);

module.exports = router;
