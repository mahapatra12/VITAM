const mongoose = require("mongoose");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load env
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");

const DEFAULT_EMAILS = [
    "admin@vitam.edu",
    "chairman@vitam.edu.in",
    "director@vitam.edu.in",
    "principal@vitam.edu.in",
    "viceprincipal@vitam.edu.in",
    "finance@vitam.edu.in",
    "hod@vitam.edu",
    "faculty@vitam.edu",
    "student@vitam.edu"
];

const MONGO_URI = process.env.MONGO_DIRECT_URI || process.env.MONGO_URI;

// CLI argument parsing
const args = process.argv.slice(2);
const options = {
    all: args.includes("--all"),
    email: null,
    role: null
};

args.forEach((arg, index) => {
    if (arg === "--email" && args[index + 1]) options.email = args[index + 1].toLowerCase();
    if (arg === "--role" && args[index + 1]) options.role = args[index + 1].toLowerCase();
});

// ANSI Theme Colors for Advanced CLI
const theme = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    magenta: "\x1b[35m"
};

const drawProgressBar = (current, total, label = "Processing") => {
    const width = 30;
    const progress = Math.round((current / total) * width);
    const bar = '█'.repeat(progress) + '░'.repeat(width - progress);
    const percentage = Math.round((current / total) * 100);
    process.stdout.write(`\r${theme.cyan}    ${label} [${bar}] ${percentage}% (${current}/${total})${theme.reset}`);
};

async function run() {
    console.log(`\n${theme.magenta}${theme.bold}=====================================${theme.reset}`);
    console.log(`${theme.magenta}${theme.bold}     VITAM AI - 2FA VAULT EXPORTER   ${theme.reset}`);
    console.log(`${theme.magenta}${theme.bold}=====================================${theme.reset}\n`);
    try {
        console.log(`${theme.yellow}⏱️  Connecting to MongoDB...${theme.reset}`);
        await mongoose.connect(MONGO_URI);
        console.log(`${theme.green}✅ Connected securely through Vault interceptors.${theme.reset}\n`);

        let targetUsers = [];

        if (options.all) {
            console.log(`${theme.cyan}🔍 Scanning Global User Matrix...${theme.reset}`);
            targetUsers = await User.find({});
        } else if (options.email) {
            console.log(`${theme.cyan}🔍 Locating Identity: ${theme.bold}${options.email}${theme.reset}`);
            targetUsers = await User.find({ email: options.email });
        } else if (options.role) {
            console.log(`${theme.cyan}🔍 Resolving Clearance Level: ${theme.bold}${options.role}${theme.reset}`);
            targetUsers = await User.find({ role: options.role });
        } else {
            console.log(`${theme.yellow}⚠️  No specific target flag provided. Defaulting to Core Administration list.${theme.reset}`);
            targetUsers = await User.find({ email: { $in: DEFAULT_EMAILS } });
        }

        if (targetUsers.length === 0) {
            console.log(`\n${theme.red}❌ No user records matched your forensic criteria.${theme.reset}`);
            return;
        }

        console.log(`\n${theme.green}🎯 Target Locked: ${targetUsers.length} identities resolved.${theme.reset}`);
        console.log(`${theme.yellow}🔄 Executing Cryptographic Generation Sequence...${theme.reset}\n`);

        const results = [];
        let currentIndex = 0;

        for (const user of targetUsers) {
            currentIndex++;
            drawProgressBar(currentIndex, targetUsers.length, "Generating Vectors");

            let secretObj;
            let newlyGenerated = false;

            if (!user.twoFactorSecret) {
                const secret = speakeasy.generateSecret({ name: `VITAM AI (${user.email})`, issuer: "VITAM AI" });
                user.twoFactorSecret = secret.base32;
                user.isTwoFactorEnabled = true;

                // Mongoose hook transparently converts this to AES-256 before disk allocation
                await user.save();

                secretObj = user.twoFactorSecret;
                newlyGenerated = true;
                updatedCount++;
            } else {
                secretObj = user.twoFactorSecret;
            }

            const otpauthUrl = speakeasy.otpauthURL({
                secret: secretObj,
                label: `VITAM AI: ${user.email}`,
                issuer: "VITAM AI",
                encoding: "base32"
            });

            const qrDataUrl = await qrcode.toDataURL(otpauthUrl);
            results.push({ email: user.email, qrDataUrl, secret: secretObj, role: user.role || 'user', isNew: newlyGenerated });
        }

        console.log(`\n\n${theme.green}✅ Sequence Complete! Processed ${results.length} identities. (${updatedCount} new vault secrets generated)${theme.reset}`);
        console.log(`${theme.cyan}🎨 Compiling Interactive Web Dashboard...${theme.reset}`);

        // Generate Advanced HTML report
        let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>VITAM AI - 2FA Security Vault</title>
            <style>
                :root {
                    --bg-color: #0f172a;
                    --card-bg: #1e293b;
                    --text-primary: #f8fafc;
                    --text-secondary: #94a3b8;
                    --accent: #38bdf8;
                    --accent-hover: #0284c7;
                    --border: #334155;
                    --success: #10b981;
                }
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { 
                    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
                    background: var(--bg-color); 
                    color: var(--text-primary); 
                    min-height: 100vh;
                    background-image: radial-gradient(circle at top right, #1e293b, #0f172a);
                }
                .container { max-width: 1200px; margin: 0 auto; padding: 3rem 1.5rem; }
                header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; flex-wrap: wrap; gap: 1rem; }
                .title-wrapper h1 { font-size: 2.5rem; font-weight: 800; background: linear-gradient(to right, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .title-wrapper p { color: var(--text-secondary); margin-top: 0.5rem; }
                .controls { display: flex; gap: 1rem; flex-wrap: wrap; }
                input[type="text"] {
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    border: 1px solid var(--border);
                    background: rgba(30, 41, 59, 0.5);
                    color: white;
                    font-size: 1rem;
                    width: 300px;
                    max-width: 100%;
                    backdrop-filter: blur(4px);
                    transition: border-color 0.2s;
                }
                input[type="text"]:focus { outline: none; border-color: var(--accent); }
                .stats { background: var(--card-bg); padding: 0.5rem 1rem; border-radius: 0.5rem; border: 1px solid var(--border); display: flex; align-items: center; font-weight: 600;}
                .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; }
                .card { 
                    background: rgba(30, 41, 59, 0.7); 
                    padding: 2rem; 
                    border-radius: 1rem; 
                    text-align: center; 
                    border: 1px solid var(--border);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s;
                    backdrop-filter: blur(10px);
                    position: relative;
                    overflow: hidden;
                }
                .card:hover { transform: translateY(-5px); border-color: var(--accent); }
                .card.new-secret::before {
                    content: 'NEW';
                    position: absolute;
                    top: 1rem;
                    right: -2rem;
                    background: var(--success);
                    color: white;
                    font-size: 0.7rem;
                    font-weight: bold;
                    padding: 0.25rem 2.5rem;
                    transform: rotate(45deg);
                }
                .qr-wrapper {
                    background: white; 
                    padding: 15px; 
                    border-radius: 0.75rem; 
                    display: inline-block;
                    margin: 1.5rem 0;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                img { display: block; width: 220px; height: 220px; }
                .email { font-weight: 700; font-size: 1.25rem; color: var(--text-primary); word-break: break-all; margin-bottom: 0.25rem; }
                .role-badge { display: inline-block; background: #334155; color: #cbd5e1; font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; }
                .secret-box { 
                    background: #0f172a; 
                    border: 1px solid var(--border); 
                    padding: 0.75rem; 
                    border-radius: 0.5rem; 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    margin-top: 1rem;
                }
                .secret { font-family: 'Fira Code', monospace; font-size: 0.9rem; color: var(--text-secondary); letter-spacing: 1px; }
                .copy-btn { 
                    background: transparent; 
                    border: 1px solid var(--accent); 
                    color: var(--accent); 
                    padding: 0.4rem 0.75rem; 
                    border-radius: 0.25rem; 
                    cursor: pointer; 
                    font-size: 0.8rem;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .copy-btn:hover { background: var(--accent); color: white; }
                .copy-btn.copied { background: var(--success); border-color: var(--success); color: white; }
                .no-results { display: none; text-align: center; grid-column: 1 / -1; padding: 3rem; color: var(--text-secondary); font-size: 1.2rem; }
                footer { margin-top: 4rem; text-align: center; color: var(--text-secondary); font-size: 0.9rem; border-top: 1px solid var(--border); padding-top: 2rem; }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <div class="title-wrapper">
                        <h1>2FA Security Vault</h1>
                        <p>Securely manage and distribute TOTP credentials for VITAM AI.</p>
                    </div>
                    <div class="controls">
                        <div class="stats">Total: <span id="count">\${results.length}</span></div>
                        <input type="text" id="searchInput" placeholder="Search by email..." onkeyup="filterCards()">
                    </div>
                </header>
                
                <div class="grid" id="cardContainer">
                    <div class="no-results" id="noResults">No users found matching your search.</div>
        `;

        results.forEach(res => {
            html += `
                    <div class="card \${res.isNew ? 'new-secret' : ''}" data-email="\${res.email}">
                        <div class="email">\${res.email}</div>
                        <div class="role-badge">\${res.role || 'user'}</div>
                        <div class="qr-wrapper">
                            <img src="\${res.qrDataUrl}" alt="QR Code for \${res.email}">
                        </div>
                        <div class="secret-box">
                            <span class="secret">\${res.secret}</span>
                            <button class="copy-btn" onclick="copySecret('\${res.secret}', this)">Copy</button>
                        </div>
                    </div>
            `;
        });

        html += `
                </div>
                <footer>
                    &copy; \${new Date().getFullYear()} VITAM AI. Security Report Generated Automatically. Make sure to delete this file after use.
                </footer>
            </div>

            <script>
                function copySecret(secret, btn) {
                    navigator.clipboard.writeText(secret).then(() => {
                        const originalText = btn.innerText;
                        btn.innerText = 'Copied!';
                        btn.classList.add('copied');
                        setTimeout(() => {
                            btn.innerText = originalText;
                            btn.classList.remove('copied');
                        }, 2000);
                    }).catch(err => {
                        console.error('Failed to copy!', err);
                        btn.innerText = 'Error';
                    });
                }

                function filterCards() {
                    const input = document.getElementById('searchInput').value.toLowerCase();
                    const cards = document.querySelectorAll('.card');
                    let visibleCount = 0;
                    
                    cards.forEach(card => {
                        const email = card.getAttribute('data-email').toLowerCase();
                        if (email.includes(input)) {
                            card.style.display = 'block';
                            visibleCount++;
                        } else {
                            card.style.display = 'none';
                        }
                    });

                    document.getElementById('count').innerText = visibleCount;
                    document.getElementById('noResults').style.display = visibleCount === 0 ? 'block' : 'none';
                }
            </script>
        </body>
        </html>
        `;

        const tmpDir = path.join(__dirname, "..", "tmp");
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        const outputPath = path.join(tmpDir, "2fa_report.html");
        fs.writeFileSync(outputPath, html);

        console.log(`\n${theme.magenta}${theme.bold}🎉 Execution Successful! Interactive Dashboard Generated:${theme.reset}`);
        console.log(`${theme.green}   📂 ${outputPath}${theme.reset}`);
        console.log(`\n${theme.red}${theme.bold}⚠️  SECURITY DIRECTIVE: This artifact holds unencrypted keys. Delete immediately after provisioning.${theme.reset}\n`);

    } catch (err) {
        console.error(`\n${theme.red}❌ Segmentation Fault:${theme.reset}`, err);
    } finally {
        await mongoose.connection.close();
        console.log(`${theme.yellow}🔒 Severed Matrix Connection.${theme.reset}`);
    }
}

run();
