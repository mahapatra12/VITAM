# VITAM AI College Portal - Project Documentation

## 🚀 Overview
A state-of-the-art College Management Portal featuring a multi-agent AI system, advanced multi-stage authentication, and a premium macOS-inspired design.

## 🛠 Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide-React.
- **Backend:** Node.js, Express, MongoDB, Mongoose.
- **AI:** Groq LLaMA 3 / Mixtral (via Groq API).
- **Security:** JWT, Speakeasy (2FA), WebAuthn Prototype (Biometrics).
- **Storage:** Multer, Cloudinary.

## 🔐 Authentication Flow
1. **Primary:** Email & Password verification.
2. **MFA:** Google Authenticator OTP verification.
3. **Biometric:** Face/Fingerprint verification (WebAuthn Prototype).
4. **Session:** Secure JWT generation and role detection.

## 🏛 Roles & Dashboards
- **Admin:** System analytics, enrollment trends, and risk forecasting.
- **HOD:** Department performance, faculty oversight, and course difficulty analysis.
- **Faculty:** Teaching tools, assignment management, and AI-driven grading insights.
- **Student:** Personalized learning assistant, GPA prediction, and study strategy planner.

## 🤖 AI Features
- **Global Assistant:** Floating AI chatbot accessible from all pages.
- **Strategic Analytics:** Context-aware report generation for all roles.
- **Predictive Models:** Student risk analysis and enrollment forecasting.

## 📁 Installation
1. Clone the repository.
2. Run `npm install` in both `client` and `server` directories.
3. Configure your `.env` files based on the `env_template.md`.
4. Seed the database: `node seed.js` in `/server`.
5. Start backend: `npm run dev` in `/server`.
6. Start frontend: `npm run dev` in `/client`.
