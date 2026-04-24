const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const IGNORE_DIRS = new Set(["node_modules", "uploads", "tmp"]);
const TARGET_EXTENSIONS = new Set([".js", ".cjs", ".mjs"]);

const collectFiles = (directory, collected = []) => {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name.startsWith(".")) {
            continue;
        }

        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            if (IGNORE_DIRS.has(entry.name)) {
                continue;
            }
            collectFiles(fullPath, collected);
            continue;
        }

        if (TARGET_EXTENSIONS.has(path.extname(entry.name))) {
            collected.push(fullPath);
        }
    }

    return collected;
};

const runCheck = (filePath) => spawnSync(
    process.execPath,
    ["--check", filePath],
    { encoding: "utf8" }
);

const files = collectFiles(ROOT);
if (files.length === 0) {
    console.log("No server files found for syntax check.");
    process.exit(0);
}

const failures = [];
for (const file of files) {
    const result = runCheck(file);
    if (result.status !== 0) {
        failures.push({
            file,
            stderr: result.stderr || result.stdout || "Unknown syntax error"
        });
    }
}

if (failures.length > 0) {
    console.error(`Syntax check failed for ${failures.length} file(s):`);
    failures.forEach((failure) => {
        console.error(`\n${failure.file}\n${failure.stderr}`);
    });
    process.exit(1);
}

console.log(`Syntax check passed for ${files.length} server files.`);
