// backend/routes/admissionRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllAdmissions,
  createAdmission,
  updateAdmission,
  deleteAdmission,
} = require("../controllers/admissionController");

router.get("/", getAllAdmissions);
router.post("/", createAdmission);
router.put("/:id", updateAdmission);
router.delete("/:id", deleteAdmission);

module.exports = router;
