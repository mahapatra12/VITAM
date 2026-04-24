const path = require('path');
const { spawn } = require('child_process');
const { TOTP } = require('otpauth');

const ROOT = path.resolve(__dirname, '..');
const SERVER_CWD = path.join(ROOT, 'server');
const SERVER_URL = process.env.QA_SERVER_URL || 'http://localhost:5101';
const NPM_CMD = 'npm';
const MAX_LOGIN_RESPONSE_MS = Number(process.env.QA_MAX_LOGIN_MS || 2500);
const MAX_AUTH_STEP_RESPONSE_MS = Number(process.env.QA_MAX_AUTH_STEP_MS || 3000);
const QA_EXPECT_WEBAUTHN = String(process.env.QA_EXPECT_WEBAUTHN || '').trim().toLowerCase() === 'true';
const QA_EXPECT_FACE_AUTH = String(process.env.QA_EXPECT_FACE_AUTH || 'true').trim().toLowerCase() === 'true';
const QA_FORCE_EPHEMERAL = String(process.env.QA_FORCE_EPHEMERAL || '').trim().toLowerCase() === 'true';
const QA_EXPECT_RP_ID = String(process.env.QA_EXPECT_RP_ID || '').trim().toLowerCase();
const QA_EXPECT_ORIGIN = String(process.env.QA_EXPECT_ORIGIN || '').trim().replace(/\/+$/, '').toLowerCase();
const QA_EXPECT_DEVICE_CAP = Number(process.env.QA_EXPECT_DEVICE_CAP || 2);

const ROLE_MATRIX = [
  { name: 'admin', email: 'admin@vitam.edu', password: 'admin123' },
  { name: 'chairman', email: 'chairman@vitam.edu.in', password: 'admin123' },
  { name: 'director', email: 'director@vitam.edu.in', password: 'admin123' },
  { name: 'principal', email: 'principal@vitam.edu.in', password: 'admin123' },
  { name: 'viceprincipal', email: 'viceprincipal@vitam.edu.in', password: 'admin123' },
  { name: 'finance', email: 'finance@vitam.edu.in', password: 'admin123' },
  { name: 'hod', email: 'hod@vitam.edu', password: 'admin123' },
  { name: 'faculty', email: 'faculty@vitam.edu', password: 'admin123' },
  { name: 'student', email: 'student@vitam.edu', password: 'admin123' }
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runCommand = (command, args, cwd) =>
  new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const proc = spawn(
      isWindows ? (process.env.ComSpec || 'cmd.exe') : command,
      isWindows ? ['/d', '/s', '/c', command, ...args] : args,
      {
      cwd,
      env: {
        ...process.env,
        FORCE_COLOR: '0'
      }
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(text);
    });

    proc.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });

    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(new Error(`Command failed (${command} ${args.join(' ')}) with exit code ${code}`));
    });
  });

const fetchJson = async (url, options = {}, timeoutMs = 20000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      signal: controller.signal
    });

    const text = await response.text();
    let body = null;

    if (text) {
      try {
        body = JSON.parse(text);
      } catch (_) {
        body = { raw: text };
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      body,
      durationMs: Date.now() - startedAt
    };
  } finally {
    clearTimeout(timer);
  }
};

const normalizeDescriptor = (values = []) => {
  const magnitude = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  if (!Number.isFinite(magnitude) || magnitude <= 0.000001) {
    throw new Error('Descriptor magnitude invalid');
  }
  return values.map((value) => Number((value / magnitude).toFixed(8)));
};

const createSyntheticDescriptor = (seed = 1) => {
  const values = Array.from({ length: 64 }, (_, index) => {
    const angle = (index + 1) * (0.17 + seed * 0.01);
    return Math.sin(angle) + Math.cos(angle * 0.43);
  });
  return normalizeDescriptor(values);
};

const createDescriptorVariant = (descriptor, factor = 0.001) =>
  normalizeDescriptor(descriptor.map((value, index) => value + Math.sin(index + 1) * factor));

const isServerHealthy = async () => {
  try {
    const response = await fetchJson(`${SERVER_URL}/api/health`, {}, 3000);
    return response.ok;
  } catch (_) {
    return false;
  }
};

const waitForServerReady = (proc, timeoutMs = 120000) =>
  new Promise((resolve, reject) => {
    let logs = '';
    let done = false;
    let timer = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      proc.stdout?.off('data', onData);
      proc.stderr?.off('data', onData);
      proc.off('exit', onExit);
    };

    const finish = (err) => {
      if (done) return;
      done = true;
      cleanup();
      if (err) reject(err);
      else resolve();
    };

    const onData = (chunk) => {
      const text = chunk.toString();
      logs += text;

      if (
        /VITAM Server Active/i.test(text) ||
        /VITAM Server running on port/i.test(text) ||
        /HTTP server closed/i.test(text)
      ) {
        finish();
      }
    };

    const onExit = (code) => {
      finish(new Error(`Server process exited early with code ${code}. Logs:\n${logs}`));
    };

    proc.stdout?.on('data', onData);
    proc.stderr?.on('data', onData);
    proc.on('exit', onExit);

    timer = setTimeout(() => {
      finish(new Error(`Timed out waiting for server readiness. Logs:\n${logs}`));
    }, timeoutMs);
  });

const waitForHealth = async (timeoutMs = 45000) => {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await isServerHealthy()) {
      return;
    }
    await sleep(1000);
  }
  throw new Error('Server did not become healthy in time.');
};

const startServerIfNeeded = async () => {
  if (!QA_FORCE_EPHEMERAL && await isServerHealthy()) {
    return { proc: null, external: true };
  }

  const proc = spawn('node', ['server.js'], {
    cwd: SERVER_CWD,
    env: {
      ...process.env,
      FORCE_COLOR: '0'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  proc.stdout.on('data', (chunk) => process.stdout.write(chunk.toString()));
  proc.stderr.on('data', (chunk) => process.stderr.write(chunk.toString()));

  await waitForServerReady(proc);
  await waitForHealth();

  return { proc, external: false };
};

const stopServer = async (proc) => {
  if (!proc) return;
  if (proc.exitCode != null) return;

  await new Promise((resolve) => {
    const timer = setTimeout(() => {
      if (proc.exitCode == null) {
        proc.kill('SIGKILL');
      }
      resolve();
    }, 8000);

    proc.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });

    proc.kill('SIGTERM');
  });
};

const validateRoleLogins = async () => {
  const results = [];

  for (const role of ROLE_MATRIX) {
    const response = await fetchJson(`${SERVER_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: role.email,
        password: role.password
      })
    });

    if (!response.ok) {
      throw new Error(`Login failed for ${role.email}: ${response.status} ${JSON.stringify(response.body)}`);
    }
    if (response.durationMs > MAX_LOGIN_RESPONSE_MS) {
      throw new Error(`Login latency too high for ${role.email}: ${response.durationMs}ms (max ${MAX_LOGIN_RESPONSE_MS}ms)`);
    }

    const hasSession = Boolean(response.body?.token);
    const hasPendingFlow = Boolean(response.body?.pendingAuthToken);
    if (!hasSession && !hasPendingFlow) {
      throw new Error(`Unexpected login payload for ${role.email}: ${JSON.stringify(response.body)}`);
    }

    results.push({
      role: role.name,
      mode: hasSession ? 'session-issued' : 'pending-auth',
      isFirstLogin: Boolean(response.body?.isFirstLogin),
      latencyMs: response.durationMs
    });
  }

  return results;
};

const verifyAdminSetupFlow = async () => {
  const login = await fetchJson(`${SERVER_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@vitam.edu',
      password: 'admin123'
    })
  });

  if (!login.ok) {
    throw new Error(`Admin login failed during setup verification: ${login.status}`);
  }
  if (login.durationMs > MAX_LOGIN_RESPONSE_MS) {
    throw new Error(`Admin login latency too high: ${login.durationMs}ms (max ${MAX_LOGIN_RESPONSE_MS}ms)`);
  }

  if (!login.body?.pendingAuthToken || !login.body?.totpSecret) {
    throw new Error('Admin setup flow is missing pendingAuthToken or totpSecret.');
  }

  const otp = String(new TOTP({ secret: login.body.totpSecret }).generate()).padStart(6, '0');

  const verify2FA = await fetchJson(`${SERVER_URL}/api/auth/verify-2fa`, {
    method: 'POST',
    body: JSON.stringify({
      userId: login.body.userId,
      pendingAuthToken: login.body.pendingAuthToken,
      token: otp
    })
  });

  if (!verify2FA.ok) {
    throw new Error(`Admin 2FA verification failed: ${verify2FA.status} ${JSON.stringify(verify2FA.body)}`);
  }
  if (verify2FA.durationMs > MAX_AUTH_STEP_RESPONSE_MS) {
    throw new Error(`Admin 2FA latency too high: ${verify2FA.durationMs}ms (max ${MAX_AUTH_STEP_RESPONSE_MS}ms)`);
  }

  if (!verify2FA.body?.pendingAuthToken) {
    throw new Error('Admin 2FA response missing pendingAuthToken for setup continuation.');
  }

  const registerOptions = await fetchJson(`${SERVER_URL}/api/auth/register-options`, {
    method: 'POST',
    body: JSON.stringify({
      userId: login.body.userId,
      pendingAuthToken: verify2FA.body.pendingAuthToken
    })
  });

  if (!registerOptions.ok) {
    throw new Error(`Admin WebAuthn register-options failed: ${registerOptions.status} ${JSON.stringify(registerOptions.body)}`);
  }
  if (registerOptions.durationMs > MAX_AUTH_STEP_RESPONSE_MS) {
    throw new Error(`WebAuthn register-options latency too high: ${registerOptions.durationMs}ms (max ${MAX_AUTH_STEP_RESPONSE_MS}ms)`);
  }

  if (!registerOptions.body?.challenge) {
    throw new Error('Admin WebAuthn register-options missing challenge.');
  }
};

const verifyAuthRuntimeReadiness = async () => {
  const statusProbe = await fetchJson(`${SERVER_URL}/api/auth/status`, {}, 15000);
  if (!statusProbe.ok) {
    throw new Error(`Auth status probe failed: ${statusProbe.status} ${JSON.stringify(statusProbe.body)}`);
  }

  const healthProbe = await fetchJson(`${SERVER_URL}/api/auth/health`, {}, 15000);
  if (!healthProbe.ok) {
    throw new Error(`Auth health probe failed: ${healthProbe.status} ${JSON.stringify(healthProbe.body)}`);
  }

  const status = statusProbe.body || {};
  const health = healthProbe.body || {};
  const expectedCap = Number.isFinite(QA_EXPECT_DEVICE_CAP) ? QA_EXPECT_DEVICE_CAP : 2;

  if (!status.signInAvailable || !health.signInAvailable) {
    throw new Error(`Auth runtime is not sign-in ready: status=${JSON.stringify(status)} health=${JSON.stringify(health)}`);
  }

  if (Number(status.deviceCap) !== expectedCap) {
    throw new Error(`Unexpected device cap: got ${status.deviceCap}, expected ${expectedCap}`);
  }

  if (QA_EXPECT_WEBAUTHN) {
    if (!status.webAuthn) {
      throw new Error('WebAuthn expected but reported unavailable by /api/auth/status');
    }
    if (QA_EXPECT_RP_ID && String(status.rpId || '').toLowerCase() !== QA_EXPECT_RP_ID) {
      throw new Error(`WebAuthn RP_ID mismatch: got "${status.rpId}", expected "${QA_EXPECT_RP_ID}"`);
    }
    if (QA_EXPECT_ORIGIN && String(status.origin || '').replace(/\/+$/, '').toLowerCase() !== QA_EXPECT_ORIGIN) {
      throw new Error(`WebAuthn ORIGIN mismatch: got "${status.origin}", expected "${QA_EXPECT_ORIGIN}"`);
    }
  }

  if (QA_EXPECT_FACE_AUTH && !status.faceAuth) {
    throw new Error('Face auth expected but reported unavailable by /api/auth/status');
  }
};

const verifyFaceAuthFlow = async () => {
  const login = await fetchJson(`${SERVER_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'chairman@vitam.edu.in',
      password: 'admin123'
    })
  });

  if (!login.ok || !login.body?.token || !login.body?.user?.id) {
    throw new Error(`Face flow prerequisite login failed: ${login.status} ${JSON.stringify(login.body)}`);
  }

  const token = login.body.token;
  const userId = login.body.user.id;
  const headers = { Authorization: `Bearer ${token}` };

  const descriptorA = createSyntheticDescriptor(11);
  const descriptorB = createDescriptorVariant(descriptorA, 0.0012);
  const descriptorC = createDescriptorVariant(descriptorA, -0.0011);

  const challengeForEnroll = await fetchJson(`${SERVER_URL}/api/auth/face/challenge`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId })
  });
  if (!challengeForEnroll.ok || !challengeForEnroll.body?.challenge) {
    throw new Error(`Face challenge for enrollment failed: ${challengeForEnroll.status} ${JSON.stringify(challengeForEnroll.body)}`);
  }

  const enroll = await fetchJson(`${SERVER_URL}/api/auth/face/enroll`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      userId,
      challengeResponse: challengeForEnroll.body.challenge,
      descriptors: [descriptorA, descriptorB, descriptorC],
      captureMeta: {
        model: 'qa-face-v1',
        sampleCount: 3,
        avgBrightness: 0.51,
        avgContrast: 0.23,
        deviceLabel: 'qa-synthetic-device'
      }
    })
  });
  if (!enroll.ok || !enroll.body?.faceAuth?.enrolled) {
    throw new Error(`Face enrollment failed: ${enroll.status} ${JSON.stringify(enroll.body)}`);
  }

  const challengeForVerify = await fetchJson(`${SERVER_URL}/api/auth/face/challenge`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId })
  });
  if (!challengeForVerify.ok || !challengeForVerify.body?.challenge) {
    throw new Error(`Face challenge for verification failed: ${challengeForVerify.status} ${JSON.stringify(challengeForVerify.body)}`);
  }

  const verify = await fetchJson(`${SERVER_URL}/api/auth/face/verify`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      userId,
      challengeResponse: challengeForVerify.body.challenge,
      descriptor: descriptorA
    })
  });
  if (!verify.ok || !verify.body?.verified) {
    throw new Error(`Face verification failed: ${verify.status} ${JSON.stringify(verify.body)}`);
  }

  const disable = await fetchJson(`${SERVER_URL}/api/auth/face/disable`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId })
  });
  if (!disable.ok || disable.body?.faceAuth?.enabled) {
    throw new Error(`Face disable cleanup failed: ${disable.status} ${JSON.stringify(disable.body)}`);
  }
};

const run = async () => {
  let serverProc = null;
  let externalServer = false;

  try {
    console.log('\n[QA] 1/4 Build verification');
    await runCommand(NPM_CMD, ['run', 'build'], ROOT);

    console.log('\n[QA] 2/4 Preflight verification');
    if (String(process.env.ALLOW_IN_MEMORY_FALLBACK || '').trim().toLowerCase() === 'true') {
      process.env.SKIP_DB_PREFLIGHT = 'true';
    }
    await runCommand(NPM_CMD, ['run', 'preflight', '--prefix', 'server'], ROOT);

    console.log('\n[QA] 3/4 Starting API for smoke checks');
    const server = await startServerIfNeeded();
    serverProc = server.proc;
    externalServer = server.external;
    console.log(`[QA] API source: ${externalServer ? 'existing running instance' : 'ephemeral smoke instance'}`);

    console.log('\n[QA] 4/4 Role + security flow smoke checks');
    await verifyAuthRuntimeReadiness();
    const roleResults = await validateRoleLogins();
    await verifyAdminSetupFlow();
    if (QA_EXPECT_FACE_AUTH) {
      await verifyFaceAuthFlow();
    }

    console.log('\n[QA] Role matrix summary');
    for (const row of roleResults) {
      console.log(` - ${row.role.padEnd(13)} : ${row.mode.padEnd(13)} | firstLogin=${row.isFirstLogin} | latency=${String(row.latencyMs).padStart(4)}ms`);
    }

    console.log('\n[QA] PASS: Production gate checks completed successfully.');
  } finally {
    if (!externalServer) {
      await stopServer(serverProc);
    }
  }
};

run().catch((error) => {
  console.error('\n[QA] FAIL:', error.message);
  process.exitCode = 1;
});
