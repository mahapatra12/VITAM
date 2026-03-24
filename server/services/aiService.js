const axios = require("axios");

const GROQ_MODEL = "llama-3.3-70b-versatile"; // Updated from deprecated llama3-70b-8192

exports.askAI = async (prompt, systemRole = "You are VITAM AI, a smart college assistant for Vignan's Institute of Technology and Management, Berhampur, Odisha.") => {
    if (!process.env.GROQ_API_KEY) {
        return `VITAM AI: Please configure GROQ_API_KEY in .env to enable full AI capabilities.`;
    }

    try {
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: GROQ_MODEL,
                messages: [
                    { role: "system", content: systemRole },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1024
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 15000
            }
        );

        return response.data.choices[0].message.content;
    } catch (err) {
        const status = err.response?.status;
        const msg = err.response?.data?.error?.message || err.message;
        console.warn(`Groq AI Error [${status}]: ${msg}. Using rule-based fallback.`);
        return `VITAM AI Core: I am currently in low-power mode due to neural hub congestion. How can I assist you with standard institutional queries?`;
    }
};

exports.predictPerformance = (attendance, marks) => {
    if (attendance < 50 || marks < 40) {
        return "⚠️ High Risk - Needs Attention (AI Predictor)";
    } else if (marks > 80) {
        return "🌟 Excellent Performance Trajectory";
    } else {
        return "👍 Nominal Standing";
    }
};
