const path = require("path");
const { spawn } = require("child_process");

const serverRoot = path.resolve(__dirname, "..");

process.env.DB_FAST_FALLBACK ??= "true";
process.env.ALLOW_IN_MEMORY_FALLBACK ??= "true";
process.env.DB_CONNECT_MAX_RETRIES ??= "1";
process.env.DB_SERVER_SELECTION_TIMEOUT_MS ??= "2500";
process.env.DB_CONNECT_TIMEOUT_MS ??= "5000";

const nodemonBin = require.resolve("nodemon/bin/nodemon.js");
const child = spawn(process.execPath, [nodemonBin, "server.js"], {
  cwd: serverRoot,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

