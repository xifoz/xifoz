/* eslint-disable */
import { execSync, spawn } from 'child_process';
import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { config } from '../config/index.js';

const PORT = config.port;
const BASE_URL = `http://localhost:${PORT}/api`;
const COOKIE_NAME = config.cookie.name;

// Helper to wait
async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(retries = 10): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.ok) return true;
    } catch {
      // Ignore and retry
    }
    await wait(500);
  }
  return false;
}

function extractCookie(setCookieHeaders: string[] | null, cookieName: string): string | null {
  if (!setCookieHeaders) return null;
  for (const header of setCookieHeaders) {
    if (header.includes(`${cookieName}=`)) {
      const match = header.match(new RegExp(`${cookieName}=([^;]*)`));
      return match ? match[1] : '';
    }
  }
  return null;
}

async function runTests() {
  console.log('--- Starting Authentication E2E Integration Validation ---');

  // Reset & seed DB
  console.log('Cleaning up database sessions and audit logs...');
  await prisma.session.deleteMany();
  await prisma.auditLog.deleteMany();

  console.log('Seeding database to reset state...');
  execSync('npm run db:seed', { stdio: 'inherit' });

  // Start Express server
  console.log('Starting Express server...');
  const serverProcess = spawn('npx', ['tsx', 'src/server.ts'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'test' },
  });

  try {
    const isUp = await waitForServer();
    if (!isUp) {
      throw new Error('Server failed to start in time');
    }
    console.log('Express server is up and listening.');

    // Find the seeded admin
    const seededAdmin = await prisma.admin.findUnique({
      where: { email: 'admin@xifoz.com' },
    });
    if (!seededAdmin) throw new Error('Seeded admin not found in database');

    console.log('\n--- 1. Login Endpoint Success Flow ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@xifoz.com',
        password: 'SuperSecurePassword123!',
      }),
    });

    if (loginRes.status !== 200) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }

    const loginData = await loginRes.json() as any;
    if (!loginData.success || !loginData.data.accessToken) {
      throw new Error('Login response payload did not contain access token');
    }
    const accessToken1 = loginData.data.accessToken;
    console.log('Access token received successfully.');

    const rawCookie1 = extractCookie(loginRes.headers.getSetCookie(), COOKIE_NAME);
    if (!rawCookie1) {
      throw new Error('Refresh token cookie not set on response');
    }
    console.log('Refresh token cookie received successfully.');

    // Verify session in database
    const hashedCookie1 = crypto.createHash('sha256').update(rawCookie1).digest('hex');
    const session1 = await prisma.session.findUnique({
      where: { hashedToken: hashedCookie1 },
    });
    if (!session1) {
      throw new Error('Session not found in DB matching the hashed refresh token');
    }
    console.log('Database Session verified: stored only as hashed token.');

    // Check Audit Log for successful login
    const loginAuditLog = await prisma.auditLog.findFirst({
      where: { event: 'LOGIN', adminId: seededAdmin.id, severity: 'INFO' },
      orderBy: { createdAt: 'desc' },
    });
    if (!loginAuditLog) {
      throw new Error('Audit log for successful login not found');
    }
    console.log('Successful login audit log verified.');

    console.log('\n--- 2. GET /me Profile Endpoint ---');
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken1}` },
    });
    if (meRes.status !== 200) {
      throw new Error(`GET /me failed with status ${meRes.status}`);
    }
    const meData = await meRes.json() as any;
    if (!meData.success || meData.data.user.email !== 'admin@xifoz.com') {
      throw new Error('Profile retrieval failed or details mismatched');
    }
    console.log('GET /me profile details verified.');

    console.log('\n--- 3. Refresh Token Rotation (RTR) ---');
    await wait(1000); // Wait to ensure timestamps differ if needed
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `${COOKIE_NAME}=${rawCookie1}` },
    });

    if (refreshRes.status !== 200) {
      throw new Error(`Refresh failed with status ${refreshRes.status}`);
    }

    const refreshData = await refreshRes.json() as any;
    const accessToken2 = refreshData.data.accessToken;
    const rawCookie2 = extractCookie(refreshRes.headers.getSetCookie(), COOKIE_NAME);
    if (!accessToken2 || !rawCookie2) {
      throw new Error('Refresh response did not return rotated tokens');
    }
    if (rawCookie1 === rawCookie2) {
      throw new Error('Refresh token was not rotated!');
    }
    console.log('Rotated refresh token received successfully.');

    // Verify session updated in DB (new session created, old one revoked)
    const hashedCookie2 = crypto.createHash('sha256').update(rawCookie2).digest('hex');
    const session2 = await prisma.session.findUnique({
      where: { hashedToken: hashedCookie2 },
    });
    if (!session2) {
      throw new Error('New session matching the rotated refresh token not found in DB');
    }
    if (session2.id === session1.id) {
      throw new Error('Expected new session ID to be generated for the rotated token');
    }

    const oldSession = await prisma.session.findUnique({
      where: { id: session1.id },
    });
    if (!oldSession || oldSession.revokedAt === null) {
      throw new Error('Expected old session to be marked as revoked');
    }
    console.log('Session rotation and session revocation verified in DB.');

    console.log('\n--- 4. Refresh Token Replay / Reuse Detection ---');
    // Try to refresh again using rawCookie1 (the old, rotated refresh token)
    const replayRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `${COOKIE_NAME}=${rawCookie1}` },
    });

    if (replayRes.status !== 401) {
      throw new Error(`Expected 401 on token replay, got ${replayRes.status}`);
    }
    console.log('Token replay attempt successfully blocked (401).');

    const activeSessionsCount = await prisma.session.count({
      where: { adminId: seededAdmin.id, revokedAt: null },
    });
    if (activeSessionsCount !== 0) {
      const allSessions = await prisma.session.findMany({
        where: { adminId: seededAdmin.id },
      });
      console.log('DEBUG sessions in DB:', allSessions);
      throw new Error(`Expected all admin sessions to be revoked, found ${activeSessionsCount} active`);
    }
    console.log('Replay attack neutralized: all sessions revoked for admin.');

    // Check CRITICAL Audit Log for replay attack
    const replayAudit = await prisma.auditLog.findFirst({
      where: { event: 'SYSTEM', severity: 'CRITICAL', adminId: seededAdmin.id },
      orderBy: { createdAt: 'desc' },
    });
    if (!replayAudit || !replayAudit.details.includes('replay')) {
      throw new Error('Critical replay attack audit log not found in DB');
    }
    console.log('Critical replay attack audit log verified.');

    console.log('\n--- 5. Expired Session Flow ---');
    // Login to get a new session
    const loginRes2 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@xifoz.com',
        password: 'SuperSecurePassword123!',
      }),
    });
    const rawCookie3 = extractCookie(loginRes2.headers.getSetCookie(), COOKIE_NAME)!;
    const hashedCookie3 = crypto.createHash('sha256').update(rawCookie3).digest('hex');

    // Manually expire session in DB
    await prisma.session.update({
      where: { hashedToken: hashedCookie3 },
      data: { expiresAt: new Date(Date.now() - 10000) }, // Expired 10s ago
    });

    const expiredRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `${COOKIE_NAME}=${rawCookie3}` },
    });
    if (expiredRes.status !== 401) {
      throw new Error(`Expected 401 for expired session refresh, got ${expiredRes.status}`);
    }
    console.log('Expired session refresh blocked successfully (401).');

    console.log('\n--- 6. Inactive Admin Account Access Check ---');
    // Login to get new credentials
    const loginRes3 = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@xifoz.com',
        password: 'SuperSecurePassword123!',
      }),
    });
    const loginData3 = await loginRes3.json() as any;
    const activeAccessToken = loginData3.data.accessToken;

    // Set admin to INACTIVE
    await prisma.admin.update({
      where: { id: seededAdmin.id },
      data: { status: 'INACTIVE' },
    });

    const inactiveMeRes = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${activeAccessToken}` },
    });
    if (inactiveMeRes.status !== 401) {
      throw new Error(`Expected 401 for inactive admin /me access, got ${inactiveMeRes.status}`);
    }
    console.log('Inactive admin /me access blocked successfully (401).');

    // Restore admin to ACTIVE
    await prisma.admin.update({
      where: { id: seededAdmin.id },
      data: { status: 'ACTIVE' },
    });

    console.log('\n--- 7. Account Lockout After 5 Failures & Automatic Unlock ---');
    // Failed attempt 1
    let failRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@xifoz.com', password: 'WrongPassword' }),
    });
    if (failRes.status !== 401) throw new Error('Expected 401 on failed attempt 1');

    // Failed attempts 2 to 4
    for (let attempts = 2; attempts <= 4; attempts++) {
      await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@xifoz.com', password: 'WrongPassword' }),
      });
    }

    // Attempt 5 (triggers lockout)
    failRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@xifoz.com', password: 'WrongPassword' }),
    });
    if (failRes.status !== 401) throw new Error('Expected 401 on attempt 5');

    // Attempt 6 (account is locked, returns 403)
    const lockedRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@xifoz.com', password: 'SuperSecurePassword123!' }),
    });
    if (lockedRes.status !== 403) {
      throw new Error(`Expected 403 on lockout check, got ${lockedRes.status}`);
    }
    const lockedData = await lockedRes.json() as any;
    if (!lockedData.message.includes('locked')) {
      throw new Error('Lockout error response message does not contain locked text');
    }
    console.log('Brute force lockout triggered and verified successfully.');

    // Check CRITICAL audit log for lockout
    const lockoutAudit = await prisma.auditLog.findFirst({
      where: { event: 'LOGIN', severity: 'CRITICAL', details: { contains: 'locked' } },
      orderBy: { createdAt: 'desc' },
    });
    if (!lockoutAudit) {
      throw new Error('Lockout audit log not found');
    }
    console.log('Lockout CRITICAL audit log verified.');

    // Unlock simulation (move lockedUntil into the past)
    await prisma.admin.update({
      where: { id: seededAdmin.id },
      data: { lockedUntil: new Date(Date.now() - 1000) },
    });

    // Attempt login now
    const unlockRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@xifoz.com',
        password: 'SuperSecurePassword123!',
      }),
    });
    if (unlockRes.status !== 200) {
      throw new Error(`Expected successful login after lockout expired, got ${unlockRes.status}`);
    }
    const unlockData = await unlockRes.json() as any;
    console.log('Lockout automatic unlock timeout simulated and verified successfully.');

    const logoutAccessToken = unlockData.data.accessToken;
    const logoutCookie = extractCookie(unlockRes.headers.getSetCookie(), COOKIE_NAME)!;

    console.log('\n--- 8. Logout Endpoint Flow ---');
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${logoutAccessToken}`,
        Cookie: `${COOKIE_NAME}=${logoutCookie}`,
      },
    });
    if (logoutRes.status !== 200) {
      throw new Error(`Logout failed with status ${logoutRes.status}`);
    }

    const logoutCookieVal = extractCookie(logoutRes.headers.getSetCookie(), COOKIE_NAME);
    if (logoutCookieVal !== '') {
      throw new Error('Refresh token cookie not cleared on logout');
    }
    console.log('Refresh token cookie cleared on response.');

    // Verify session revoked in DB
    const logoutHashedCookie = crypto.createHash('sha256').update(logoutCookie).digest('hex');
    const logoutSession = await prisma.session.findUnique({
      where: { hashedToken: logoutHashedCookie },
    });
    if (!logoutSession || logoutSession.revokedAt === null) {
      throw new Error('Session not marked revoked in DB on logout');
    }
    console.log('Session revocation in database verified.');

    // Verify audit log
    const logoutAudit = await prisma.auditLog.findFirst({
      where: { event: 'LOGOUT', adminId: seededAdmin.id },
      orderBy: { createdAt: 'desc' },
    });
    if (!logoutAudit) {
      throw new Error('Logout audit log not found');
    }
    console.log('Logout audit log verified.');

    console.log('\n--- ALL END-TO-END VALIDATIONS PASSED SUCCESSFULLY ---');
  } finally {
    // Shutdown Express server
    console.log('Stopping Express server...');
    serverProcess.kill('SIGINT');
  }
}

runTests().catch((err) => {
  console.error('Test run failed with error:', err);
  process.exit(1);
});
