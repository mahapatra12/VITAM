const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const SERVER_ENV_PATH = path.join(ROOT, "server", ".env");
if (fs.existsSync(SERVER_ENV_PATH)) {
  const lines = fs.readFileSync(SERVER_ENV_PATH, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const idx = trimmed.indexOf("=");
    if (idx <= 0) {
      continue;
    }
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
const isWindows = process.platform === "win32";
const NPM_CMD = isWindows ? "npm.cmd" : "npm";

const run = (args, env = process.env) =>
  new Promise((resolve, reject) => {
    const proc = spawn(
      isWindows ? (process.env.ComSpec || "cmd.exe") : NPM_CMD,
      isWindows ? ["/d", "/s", "/c", NPM_CMD, ...args] : args,
      {
      cwd: ROOT,
      env,
      stdio: "inherit"
    });

    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Command failed: ${NPM_CMD} ${args.join(" ")} (exit ${code})`));
    });
  });

const required = [
  "MONGO_URI",
  "JWT_SECRET"
];

const splitCsv = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const isLocalHost = (value) =>
  /(^|:\/\/)(localhost|127\.0\.0\.1)(:|$)/i.test(String(value || ""));

const pickSecureOrigin = (value) => {
  const candidate = splitCsv(value).find(
    (origin) => /^https:\/\//i.test(origin) && !isLocalHost(origin)
  );
  return candidate || "https://vitam-ai.vercel.app";
};

const pickRpId = (value) => {
  const candidate = splitCsv(value).find((entry) => {
    const normalized = entry.replace(/^https?:\/\//i, "").split("/")[0].split(":")[0];
    return normalized && !isLocalHost(normalized);
  });
  if (!candidate) {
    return "vitam-ai.vercel.app";
  }
  return candidate.replace(/^https?:\/\//i, "").split("/")[0].split(":")[0];
};

const buildStrictCorsOrigins = (secureOrigin) => {
  const defaults = [
    secureOrigin,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:4173",
    "http://127.0.0.1:4173"
  ];
  return Array.from(new Set(defaults.filter(Boolean))).join(",");
};

const ensureRequiredEnv = (env) => {
  const missing = required.filter((key) => !String(env[key] || "").trim());
  if (missing.length > 0) {
    throw new Error(`Missing required production env variables: ${missing.join(", ")}`);
  }
};

const main = async () => {
  const secureOrigin = pickSecureOrigin(process.env.ORIGIN || process.env.FRONTEND_URL);
  const secureRpId = pickRpId(process.env.RP_ID || process.env.ORIGIN);
  const qaPort = String(5300 + Math.floor(Math.random() * 400));
  const qaServerUrl = `http://127.0.0.1:${qaPort}`;
  const strictCorsOrigins = buildStrictCorsOrigins(secureOrigin);

  const strictEnv = {
    ...process.env,
    PORT: qaPort,
    QA_SERVER_URL: qaServerUrl,
    VITE_API_URL: `${qaServerUrl}/api`,
    QA_FORCE_EPHEMERAL: "true",
    NODE_ENV: "production",
    PREFLIGHT_STRICT: "true",
    ALLOW_IN_MEMORY_FALLBACK: "false",
    SEED_ON_EMPTY: "false",
    ALLOW_PROD_SEED: "false",
    ORIGIN: secureOrigin,
    RP_ID: secureRpId,
    FRONTEND_URL: secureOrigin,
    CORS_ORIGINS: strictCorsOrigins,
    BOOTSTRAP_ADMIN_EMAIL: process.env.BOOTSTRAP_ADMIN_EMAIL || "admin@vitam.edu",
    BOOTSTRAP_ADMIN_PASSWORD: process.env.BOOTSTRAP_ADMIN_PASSWORD || "VitamProdBootstrap!2026",
    BOOTSTRAP_ADMIN_NAME: process.env.BOOTSTRAP_ADMIN_NAME || "System Admin",
    QA_EXPECT_WEBAUTHN: "true",
    QA_EXPECT_FACE_AUTH: "true",
    QA_EXPECT_RP_ID: process.env.QA_EXPECT_RP_ID || secureRpId,
    QA_EXPECT_ORIGIN: process.env.QA_EXPECT_ORIGIN || secureOrigin,
    LOGIN_RATE_LIMIT_MAX: process.env.LOGIN_RATE_LIMIT_MAX || "500",
    MFA_RATE_LIMIT_MAX: process.env.MFA_RATE_LIMIT_MAX || "500",
    TENANT_RATE_LIMIT_MAX: process.env.TENANT_RATE_LIMIT_MAX || "10000",
    DEBUG_AI_LOGS: "false",
    DEBUG_AUTH_LOGS: "false"
  };

  ensureRequiredEnv(strictEnv);

  console.log("\n[Zero-Defect Gate] Step 1/2: strict preflight");
  await run(["run", "preflight", "--prefix", "server"], strictEnv);

  console.log("\n[Zero-Defect Gate] Step 2/2: full release gate");
  await run(["run", "qa:release"], strictEnv);

  console.log("\n[Zero-Defect Gate] PASS: production lock checks succeeded.");
};

main().catch((error) => {
  console.error("\n[Zero-Defect Gate] FAIL:", error.message);
  process.exit(1);
});
