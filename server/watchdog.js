const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5101/api/health';
const CHECK_INTERVAL = 30000; // 30 seconds
const MAX_RETRIES = 5;

let failureCount = 0;
let serverProcess = null;

const startServer = () => {
    console.log('[Institutional Watchdog] Starting VITAM Sovereign Server...');
    
    serverProcess = spawn('node', ['server.js'], {
        cwd: __dirname,
        stdio: 'inherit',
        env: { ...process.env, WATCHDOG_ACTIVE: 'true' }
    });

    serverProcess.on('exit', (code) => {
        console.error(`[Institutional Watchdog] Server process exited with code ${code}`);
        if (code !== 0) {
            console.log('[Institutional Watchdog] Abnormal exit. Initiating recovery...');
            setTimeout(startServer, 5000);
        }
    });
};

const monitorHealth = async () => {
    try {
        const res = await axios.get(SERVER_URL, { timeout: 10000 });
        if (res.status === 200) {
            if (failureCount > 0) {
                console.log('[Institutional Watchdog] System Integrity Restored.');
            }
            failureCount = 0;
        } else {
            throw new Error(`Degraded Status: ${res.status}`);
        }
    } catch (err) {
        failureCount++;
        console.warn(`[Institutional Watchdog] Health Check Failed (${failureCount}/${MAX_RETRIES}): ${err.message}`);
        
        if (failureCount >= MAX_RETRIES) {
            console.error('[Institutional Watchdog] Terminal Failure Detected. Force Restarting Cluster...');
            // In a real production env, we might send an alert (Slack/Email) here
            if (serverProcess) {
                serverProcess.kill('SIGKILL');
            } else {
                startServer();
            }
            failureCount = 0;
        }
    }
};

console.log('[Institutional Watchdog] Initializing Sovereign Guard...');
startServer();
setInterval(monitorHealth, CHECK_INTERVAL);
