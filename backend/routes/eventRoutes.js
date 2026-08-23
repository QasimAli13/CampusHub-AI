const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const {
  createEvent,
  getEvents,
  registerForEvent,
} = require("../controllers/eventController");

router.use(protect);

router.get("/", getEvents);
router.post(
  "/",
  authorizeRoles("society_admin", "admin"),
  upload.single("poster"),
  createEvent,
);
router.post("/:id/register", authorizeRoles("student"), registerForEvent);

module.exports = router;
