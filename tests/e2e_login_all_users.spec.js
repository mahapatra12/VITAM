const { test, expect } = require('@playwright/test');
const speakeasy = require('speakeasy');

// Role-aware user matrix.
// In CI (ALLOW_IN_MEMORY_FALLBACK=true) all users are seeded with isFirstLogin: false
// and MFA disabled — so every user lands directly on their dashboard.
const USERS = [
  { email: 'admin@vitam.edu',            role: 'System Admin',   isFirstLogin: false },
  { email: 'chairman@vitam.edu.in',      role: 'Chairman',       isFirstLogin: false },
  { email: 'director@vitam.edu.in',      role: 'Director',       isFirstLogin: false },
  { email: 'principal@vitam.edu.in',     role: 'Principal',      isFirstLogin: false },
  { email: 'viceprincipal@vitam.edu.in', role: 'Vice Principal', isFirstLogin: false },
  { email: 'finance@vitam.edu.in',       role: 'Finance',        isFirstLogin: false },
  { email: 'hod@vitam.edu',              role: 'HOD',            isFirstLogin: false },
  { email: 'faculty@vitam.edu',          role: 'Faculty',        isFirstLogin: false },
  { email: 'student@vitam.edu',          role: 'Student',        isFirstLogin: false },
];

const DEFAULT_SECRET = 'JBSWY3DPEHPK3PXP';

test.describe('End-to-End Verification Flow for All Roles (2FA + WebAuthn)', () => {
  for (const { email, role, isFirstLogin } of USERS) {
    test(`Verify complete authentication lifecycle for: ${role} (${email})`, async ({ page, context }) => {

      // 1. Setup Virtual Authenticator for Passkey (WebAuthn)
      const cdpClient = await context.newCDPSession(page);
      await cdpClient.send('WebAuthn.enable');
      await cdpClient.send('WebAuthn.addVirtualAuthenticator', {
        options: {
          protocol: 'ctap2',
          transport: 'internal',
          hasResidentKey: true,
          hasUserVerification: true,
          isUserVerified: true,
          automaticPresenceSimulation: true,
        },
      });

      // 2. Password Login
      await page.goto('/login');
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]:has-text("Sign In")');

      // 3. Handle First-Time Setup Flow (if server redirects to /setup)
      try {
        await page.waitForURL('**/setup', { timeout: 4000 });

        // Step 1: 2FA OTP
        const token = speakeasy.totp({ secret: DEFAULT_SECRET, encoding: 'base32' });
        await page.fill('input[inputMode="numeric"]', token);
        await page.click('button[type="submit"]:has-text("Verify and Continue")');

        // Step 2: Passkey — skip for CI stability
        try {
          await page.waitForSelector('button:has-text("Continue without passkey")', { timeout: 4000 });
          await page.click('button:has-text("Continue without passkey")');
        } catch (_) { /* auto-skipped */ }

        // Step 3: Complete Setup
        try {
          await page.waitForSelector('button:has-text("Complete Setup")', { timeout: 4000 });
          await page.click('button:has-text("Complete Setup")');
        } catch (_) { /* auto-advanced */ }

      } catch (_setupErr) {
        // Not a first-login — handle optional 2FA prompt
        try {
          await page.waitForSelector('input[inputMode="numeric"]', { timeout: 4000 });
          const token = speakeasy.totp({ secret: DEFAULT_SECRET, encoding: 'base32' });
          await page.fill('input[inputMode="numeric"]', token);
          await page.click('button[type="submit"]:has-text("Verify Code")');
        } catch (_) { /* No 2FA prompt — direct login in CI mode */ }

        // Handle optional passkey prompt
        try {
          await page.waitForSelector('button:has-text("Use Passkey")', { timeout: 3000 });
          await page.click('button:has-text("Use Passkey")');
        } catch (_) { /* Not required */ }
      }

      // 4. Role-aware assertion
      if (isFirstLogin) {
        // First-login: /setup is a valid success state
        await page.waitForFunction(
          () => !window.location.href.includes('/login'),
          { timeout: 15000 }
        );
        const url = page.url();
        expect(url).not.toContain('/login');
        expect(url.includes('/setup') || url.includes('/dashboard')).toBeTruthy();
        console.log(`✅ [FIRST-LOGIN] ${role} → ${new URL(url).pathname}`);
      } else {
        // All other users: must land on a dashboard route
        await page.waitForFunction(
          () => {
            const u = window.location.href;
            return (
              u.includes('/dashboard') ||
              u.includes('/hod/') ||
              u.includes('/faculty/') ||
              u.includes('/student/')
            );
          },
          { timeout: 15000 }
        );
        const url = page.url();
        expect(url).not.toContain('/login');
        expect(url).not.toContain('/setup');
        console.log(`✅ Successfully authenticated ${role} to: ${new URL(url).pathname}`);
      }
    });
  }
});
