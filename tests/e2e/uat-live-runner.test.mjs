import test from 'node:test';
import assert from 'node:assert/strict';

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:3001';

test.describe('UAT Suite: Live Acceptance Verification', () => {
  let authToken = '';

  test('Persona 1: Guest - Homepage SSR is accessible', async () => {
    const res = await fetch(`${FRONTEND_URL}/`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Swathi/i);
    assert.match(html, /Publications/i);
  });

  test('Persona 1: Guest - Public catalog discovery returns active publications', async () => {
    const res = await fetch(`${BACKEND_URL}/api/publishing/publications`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.data.data || json.data.publications || json.data));
  });

  test('Persona 1: Guest - Subscription pricing plans visible', async () => {
    const res = await fetch(`${BACKEND_URL}/api/v1/plans`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
  });

  test('Persona 2: Registered User - Login produces valid JWT tokens', async () => {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@swathi.com', password: 'Password123!' })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.tokens.accessToken);
    authToken = json.data.tokens.accessToken;
  });

  test('Persona 2: Registered User - Access authenticated member profile', async () => {
    assert.ok(authToken, 'Auth token must exist');
    const res = await fetch(`${BACKEND_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.email, 'user@swathi.com');
  });

  test('Persona 3: Subscriber - Device registration & active devices query', async () => {
    assert.ok(authToken);
    const res = await fetch(`${BACKEND_URL}/api/pdf/drm/devices`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
  });

  test('Persona 4: Editor - OCR review queue accessible to staff', async () => {
    const adminLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@swathi.com', password: 'Password123!' })
    });
    const adminData = await adminLoginRes.json();
    const adminToken = adminData.data.tokens.accessToken;

    const res = await fetch(`${BACKEND_URL}/api/nlp/ocr/queue`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
  });

  test('Persona 5: Administrator - System health check returns healthy status', async () => {
    const res = await fetch(`${BACKEND_URL}/health`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.uptime >= 0);
  });
});
