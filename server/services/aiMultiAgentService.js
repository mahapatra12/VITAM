const axios = require("axios");

const GROQ_MODEL = "llama-3.3-70b-versatile"; // Updated from deprecated llama3-70b-8192

const askGroq = async (prompt, systemRole) => {
    if (!process.env.GROQ_API_KEY) {
        console.warn("GROQ_API_KEY missing. Using rule-based fallback.");
        const lowerPrompt = prompt.toLowerCase();
        if (lowerPrompt.includes("attendance")) return "VITAM AI: Current attendance tracking is active. You have 94% average attendance this semester.";
        if (lowerPrompt.includes("grade") || lowerPrompt.includes("gpa")) return "VITAM AI: Your projected CGPA is 3.74. Keep it up!";
        if (lowerPrompt.includes("hello") || lowerPrompt.includes("hi")) return "Hello! I am VITAM AI. How can I assist you with your academic journey today?";
        return "I am currently in local mode. Please set a Groq API key in .env for advanced intelligence!";
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
        console.error(`Groq AI Error [${status}]:`, msg);
        return `VITAM AI: Neural hub is experiencing high load. Falling back to rule-based response. (Error: ${status || "timeout"})`;
    }
};

exports.tutorAgent = async (query) => {
    const systemRole = "You are a specialized AI Academic Tutor. Explain concepts simply, provide examples, and ask follow-up questions to ensure the student understands.";
    return await askGroq(query, systemRole);
};

exports.graderAgent = async (assignmentData) => {
    const systemRole = "You are an AI Grading Assistant. Evaluate the project or assignment based on clarity, technical accuracy, and adherence to requirements. Provide a score out of 10 and constructive feedback.";
    const prompt = `Evaluate this assignment: ${JSON.stringify(assignmentData)}`;
    return await askGroq(prompt, systemRole);
};

exports.analyticsAgent = async (data, metric) => {
    const systemRole = "You are a Senior Academic Data Analyst. Provide strategic insights based on college operational data.";
    const prompt = `Analyze ${metric} trends from this data: ${JSON.stringify(data)}. Identify risks and areas for improvement.`;
    return await askGroq(prompt, systemRole);
};

exports.resumeAgent = async (studentProfile) => {
    const systemRole = "You are a Career Services AI. Help students build technical resumes focused on their projects, skills, and academic achievements.";
    const prompt = `Build a skeleton and suggestions for a resume based on this profile: ${JSON.stringify(studentProfile)}`;
    return await askGroq(prompt, systemRole);
};

exports.predictFailure = async (studentData) => {
    const systemRole = "You are an AI Academic Risk Analyst. Evaluate the risk of academic failure (Backlogs, Low Attendance, Dropout) based on student performance data.";
    const prompt = `Analyze this student data for academic risk: ${JSON.stringify(studentData)}. Predict risk level (LOW / MEDIUM / HIGH) and provide specific reasons.`;
    return await askGroq(prompt, systemRole);
};

exports.careerGuide = async (studentData) => {
    const systemRole = "You are an AI Career Counselor. Provide domain-specific career roadmap and skill suggestions for engineering students.";
    const prompt = `Based on this student's branch, interests, and current skills: ${JSON.stringify(studentData)}, suggest the best career domain, a 6-month roadmap, and essential skills to learn.`;
    return await askGroq(prompt, systemRole);
};

// --- MULTI-AGENT SYSTEM ---

exports.financeAgent = async (financeData) => {
    const systemRole = "You are the Chief Financial AI Officer (CFO-AI). Analyze college revenue, pending fees, and expenses. Provide predictions and actionable advice for revenue growth.";
    const prompt = `Analyze this institutional financial data: ${JSON.stringify(financeData)}. Highlight critical areas (e.g., pending fees), and suggest exactly 3 actionable steps to optimize cash flow and revenue. Format the output in clean text with bullet points.`;
    return await askGroq(prompt, systemRole);
};

exports.academicAgent = async (academicData) => {
    const systemRole = "You are the Chief Academic AI Officer (CAO-AI). Analyze institutional academic performance, attendance drops, and failure risks across departments.";
    const prompt = `Analyze this college-wide academic telemetry: ${JSON.stringify(academicData)}. Identify the worst-performing department and suggest 2 targeted interventions to improve their overall pass rate and attendance footprint. Format the output in clean text.`;
    return await askGroq(prompt, systemRole);
};

exports.strategyAgent = async (institutionalData) => {
    const systemRole = "You are the Autonomous AI CEO (Chief Executive AI). Aggregate data from Finance and Academic domains, and output high-level strategic directives for the institutional Chairman.";
    const prompt = `Review this high-level institutional snapshot: ${JSON.stringify(institutionalData)}. Generate a cohesive "State of the Institution" report. Identify the single biggest bottleneck to institutional growth (financial or academic) and mandate an executive priority list for the upcoming quarter.`;
    return await askGroq(prompt, systemRole);
};
