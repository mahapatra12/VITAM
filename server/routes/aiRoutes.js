const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const validator = require("../middleware/validator");
const { chat, generateReport, predictFailure, careerGuide } = require("../controllers/aiController");

router.use(authMiddleware);

router.post("/chat", validator({
    prompt: { required: true, type: "string", min: 1, max: 2000 }
}), chat);

router.post("/generate-report", validator({
    type: { required: true, type: "string" },
    data: { required: true, type: "object" }
}), generateReport);

router.post("/predict-failure", validator({
    attendance: { type: "number", min: 0, max: 100 },
    marks: { type: "number", min: 0, max: 100 }
}), predictFailure);

router.post("/career-guide", validator({
    studentData: { required: true, type: "object" }
}), careerGuide);

module.exports = router;
