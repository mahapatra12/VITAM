const { tutorAgent, graderAgent, analyticsAgent, resumeAgent } = require("../services/aiMultiAgentService");
const { toAiPayloadSnippet } = require("../utils/aiPayload");
const { isGroqConfigured } = require("../utils/providerReadiness");
const { aiCircuit } = require("../utils/circuitBreaker");

const MAX_PROMPT_LENGTH = 2000;
const MAX_REPORT_TYPE_LENGTH = 64;

const sanitizePrompt = (value) => (
    typeof value === "string"
        ? value.trim().replace(/\s+/g, " ")
        : ""
);

const fallbackAnswer = "VITAM AI is running in guarded mode right now. Please retry in a moment.";

const sendAiError = (req, res, status, code, msg) => res.status(status).json({
    code,
    msg,
    error: msg,
    ...(req?.id ? { requestId: req.id } : {})
});

exports.chat = async (req, res) => {
    try {
        const prompt = sanitizePrompt(req.body?.prompt);

        if (!prompt) {
            return sendAiError(req, res, 400, "INVALID_PROMPT", "Prompt is required.");
        }

        if (prompt.length > MAX_PROMPT_LENGTH) {
            return sendAiError(req, res, 413, "PROMPT_TOO_LARGE", `Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer.`);
        }

        // Basic chat uses the tutor agent
        const answer = await aiCircuit.execute(() => tutorAgent(prompt), fallbackAnswer);
        res.json({
            answer: sanitizePrompt(answer) || fallbackAnswer,
            mode: isGroqConfigured() ? "groq" : "fallback"
        });
    } catch (err) {
        return sendAiError(req, res, 503, "AI_UNAVAILABLE", fallbackAnswer);
    }
};

exports.generateReport = async (req, res) => {
    try {
        const type = sanitizePrompt(req.body?.type).slice(0, MAX_REPORT_TYPE_LENGTH);
        const data = req.body?.data ?? {};
        const { truncated } = toAiPayloadSnippet(data);
        
        const executeTask = async () => {
            if (type === "STUDENT_RISK" || type === "ENROLLMENT_PREDICTION") {
                return await analyticsAgent(data, type);
            } else if (type === "GRADING_INSIGHTS") {
                return await graderAgent(data);
            } else if (type === "RESUME_BUILD") {
                return await resumeAgent(data);
            } else {
                return await tutorAgent(`Explain this data summary: ${toAiPayloadSnippet(data).text}`);
            }
        };

        const report = await aiCircuit.execute(executeTask, fallbackAnswer);

        res.json({
            report: sanitizePrompt(report) || fallbackAnswer,
            mode: isGroqConfigured() ? "groq" : "fallback",
            ...(truncated ? { truncatedInput: true } : {})
        });
    } catch (err) {
        return sendAiError(req, res, 503, "AI_UNAVAILABLE", fallbackAnswer);
    }
};

exports.predictFailure = async (req, res) => {
    try {
        const { attendance, marks } = req.body;
        const { predictPerformance } = require("../services/aiService");
        
        const prediction = await aiCircuit.execute(() => predictPerformance(attendance || 85, marks || 75), "Performance analysis is temporarily on hold.");
        res.json({
            analysis: prediction,
            mode: isGroqConfigured() ? "groq" : "fallback"
        });
    } catch (err) {
        return sendAiError(req, res, 503, "AI_UNAVAILABLE", fallbackAnswer);
    }
};

exports.careerGuide = async (req, res) => {
    try {
        const { studentData } = req.body;
        const roadmap = await aiCircuit.execute(() => require("../services/aiMultiAgentService").careerGuide(studentData), "Career roadmap generation is temporarily delayed.");
        res.json({
            roadmap,
            mode: isGroqConfigured() ? "groq" : "fallback"
        });
    } catch (err) {
        return sendAiError(req, res, 503, "AI_UNAVAILABLE", fallbackAnswer);
    }
};
