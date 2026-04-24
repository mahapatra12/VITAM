const { defineConfig } = require('@playwright/test');
const path = require('path');

const DEFAULT_BASE_URL = 'http://127.0.0.1:5173';
const baseURL = process.env.E2E_BASE_URL || DEFAULT_BASE_URL;
const apiPort = process.env.PORT || '5101';
const repoRoot = path.resolve(__dirname, '..');

let rpId = '127.0.0.1';
try {
  rpId = new URL(baseURL).hostname;
} catch (_) {
  rpId = '127.0.0.1';
}

module.exports = defineConfig({
  testDir: path.join(repoRoot, 'tests'),
  timeout: 90_000,
  expect: {
    timeout: 20_000
  },
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: [
    {
      cwd: repoRoot,
      command: 'npm run dev --prefix server',
      url: `http://127.0.0.1:${apiPort}/api/health`,
      timeout: 180_000,
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: apiPort,
        ALLOW_IN_MEMORY_FALLBACK: process.env.ALLOW_IN_MEMORY_FALLBACK || 'true',
        JWT_SECRET: process.env.JWT_SECRET || 'vitam_local_e2e_secret',
        ORIGIN: process.env.ORIGIN || baseURL,
        RP_ID: process.env.RP_ID || rpId
      }
    },
    {
      cwd: repoRoot,
      command: 'npm run dev --prefix client -- --host 127.0.0.1 --port 5173',
      url: `${baseURL}/login`,
      timeout: 180_000,
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        VITE_API_URL: process.env.VITE_API_URL || `http://127.0.0.1:${apiPort}/api`
      }
    }
  ]
});
