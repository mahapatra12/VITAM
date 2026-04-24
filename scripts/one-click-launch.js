const fs = require('fs');
const path = require('path');
const net = require('net');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SERVER_DIR = path.join(ROOT, 'server');
const CLIENT_DIR = path.join(ROOT, 'client');
const LOCAL_DEV_HOST = String(process.env.DEV_LOCAL_HOST || 'localhost').trim() || 'localhost';
const PORT_PROBE_HOST = String(process.env.DEV_PORT_PROBE_HOST || '127.0.0.1').trim() || '127.0.0.1';
const DEFAULT_SERVER_PORT = Number(process.env.PORT || process.env.DEV_SERVER_PORT || 5101);
const DEFAULT_CLIENT_PORT = Number(process.env.DEV_CLIENT_PORT || 5173);
const READY_TIMEOUT_MS = Number(process.env.DEV_READY_TIMEOUT_MS || 180000);
const OPEN_BROWSER = String(process.env.OPEN_BROWSER || 'true').trim().toLowerCase() === 'true';
const IS_WINDOWS = process.platform === 'win32';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const npmCommand = () => (IS_WINDOWS ? 'npm.cmd' : 'npm');
const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');
const buildServerHealthUrl = (port) =>
  trimTrailingSlash(process.env.DEV_SERVER_HEALTH_URL || `http://${LOCAL_DEV_HOST}:${port}/api/health`);
const buildClientUrl = (port) =>
  trimTrailingSlash(process.env.DEV_CLIENT_URL || `http://${LOCAL_DEV_HOST}:${port}`);

const runCommand = (command, args, cwd, label) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit', shell: IS_WINDOWS });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${label} failed with exit code ${code}`));
    });
  });

const pathExists = (target) => {
  try {
    return fs.existsSync(target);
  } catch (_) {
    return false;
  }
};

const ensureDependencies = async () => {
  const tasks = [
    { dir: SERVER_DIR, label: 'server', marker: path.join(SERVER_DIR, 'node_modules') },
    { dir: CLIENT_DIR, label: 'client', marker: path.join(CLIENT_DIR, 'node_modules') }
  ];

  for (const task of tasks) {
    if (pathExists(task.marker)) {
      continue;
    }
    console.log(`[launch] Installing ${task.label} dependencies...`);
    await runCommand(npmCommand(), ['install'], task.dir, `${task.label} dependency install`);
  }
};

const canBindPort = (port) =>
  new Promise((resolve) => {
    const probe = net.createServer();
    probe.unref();
    probe.once('error', () => resolve(false));
    probe.listen(port, PORT_PROBE_HOST, () => {
      probe.close(() => resolve(true));
    });
  });

const findAvailablePort = async (preferredPort, maxOffset = 40) => {
  for (let offset = 0; offset <= maxOffset; offset += 1) {
    const candidate = preferredPort + offset;
    // eslint-disable-next-line no-await-in-loop
    if (await canBindPort(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Unable to find an open port near ${preferredPort}`);
};

const fetchWithTimeout = async (url, timeoutMs = 3000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { method: 'GET', signal: controller.signal });
    // Accept any valid HTTP response (including 503 if degraded due to missing environment variables)
    return response.status > 0;
  } catch (_) {
    return false;
  } finally {
    clearTimeout(timer);
  }
};

const waitForReadiness = async (serverProc, clientProc, urls) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < READY_TIMEOUT_MS) {
    if (serverProc.exitCode != null) {
      throw new Error(`Server process exited early with code ${serverProc.exitCode}`);
    }
    if (clientProc.exitCode != null) {
      throw new Error(`Client process exited early with code ${clientProc.exitCode}`);
    }

    const [serverReady, clientReady] = await Promise.all([
      fetchWithTimeout(urls.serverHealthUrl, 3500),
      fetchWithTimeout(urls.clientUrl, 3500)
    ]);

    if (serverReady && clientReady) {
      return true;
    }

    await sleep(1200);
  }

  throw new Error('Timed out waiting for server/client readiness');
};

const openBrowser = (url) => {
  if (!OPEN_BROWSER) {
    return;
  }

  try {
    if (IS_WINDOWS) {
      spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref();
    } else if (process.platform === 'darwin') {
      spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
    } else {
      spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
    }
  } catch (_) {
    // Non-fatal: URL is still printed below.
  }
};

const stopChild = (child, name) => {
  if (!child || child.exitCode != null) {
    return;
  }
  try {
    child.kill('SIGTERM');
  } catch (_) {
    console.warn(`[launch] Unable to stop ${name} cleanly.`);
  }
};

const main = async () => {
  await ensureDependencies();
  const serverPort = await findAvailablePort(DEFAULT_SERVER_PORT);
  const clientPort = await findAvailablePort(DEFAULT_CLIENT_PORT);
  const serverHealthUrl = buildServerHealthUrl(serverPort);
  const clientUrl = buildClientUrl(clientPort);
  const clientApiUrl = `http://${LOCAL_DEV_HOST}:${serverPort}/api`;

  console.log('[launch] Starting server and client...');
  console.log(`[launch] Server port: ${serverPort}`);
  console.log(`[launch] Client port: ${clientPort}`);
  const serverProc = spawn(npmCommand(), ['run', 'dev', '--prefix', 'server'], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(serverPort)
    },
    stdio: 'inherit',
    shell: IS_WINDOWS
  });

  const clientProc = spawn(npmCommand(), ['run', 'dev', '--prefix', 'client', '--', '--host', LOCAL_DEV_HOST, '--port', String(clientPort)], {
    cwd: ROOT,
    env: {
      ...process.env,
      VITE_API_URL: clientApiUrl
    },
    stdio: 'inherit',
    shell: IS_WINDOWS
  });

  const shutdown = () => {
    stopChild(serverProc, 'server');
    stopChild(clientProc, 'client');
  };

  process.on('SIGINT', () => {
    shutdown();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    shutdown();
    process.exit(0);
  });

  try {
    await waitForReadiness(serverProc, clientProc, { serverHealthUrl, clientUrl });
    console.log('\n[launch] VITAM is ready.');
    console.log(`[launch] Client: ${clientUrl}`);
    console.log(`[launch] API: ${clientApiUrl}`);
    openBrowser(clientUrl);
  } catch (error) {
    shutdown();
    throw error;
  }
};

main().catch((error) => {
  console.error(`\n[launch] FAIL: ${error.message}`);
  process.exit(1);
});
