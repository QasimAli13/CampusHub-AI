// backend/routes/aiRoutes.js
const express = require("express");
const router = express.Router();
const {
  copilotChat,
  generateQuizQuestions,
  generateStudyPack,
} = require("../controllers/aiController");

router.post("/copilot", copilotChat);
router.post("/generate-quiz", generateQuizQuestions);
router.post("/study-pack", generateStudyPack);

module.exports = router;
