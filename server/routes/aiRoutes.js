const router = require("express").Router();
const { chat, generateReport, predictFailure, careerGuide } = require("../controllers/aiController");

router.post("/chat", chat);
router.post("/generate-report", generateReport);
router.post("/predict-failure", predictFailure);
router.post("/career-guide", careerGuide);
module.exports = router;
