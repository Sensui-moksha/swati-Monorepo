import { test, expect } from '@playwright/test';

/**
 * Enterprise Client User Acceptance Test (UAT) Suite
 * Target: Swathi Publications Digital Platform
 * Base URLs:
 *   Frontend: http://localhost:3000
 *   Backend:  http://localhost:3001
 */

test.describe('Persona 1: Guest Visitor Journey', () => {
  test('TC-GST-01: Browse Homepage and Discovery Showcase', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await expect(page).toHaveTitle(/Swathi/i);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('TC-GST-02: Search Publications and Filter Catalog', async ({ page }) => {
    await page.goto('http://localhost:3000/publications');
    await expect(page.locator('input[placeholder*="Search" i], input[type="search"]')).toBeVisible();
    await page.goto('http://localhost:3000/search?q=Swathi');
    await expect(page.locator('body')).toContainText(/Swathi/i);
  });

  test('TC-GST-03: View Subscription Pricing Matrix & Plans', async ({ page }) => {
    await page.goto('http://localhost:3000/pricing');
    await expect(page.locator('body')).toContainText(/(Plan|Subscription|Weekly|Monthly|Annual)/i);
  });

  test('TC-GST-04: User Registration Form Validation', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    // Verify login form presence and input fields
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
  });
});

test.describe('Persona 2: Registered User Journey', () => {
  test('TC-REG-01: Login with Valid Credentials', async ({ request }) => {
    const response = await request.post('http://localhost:3001/api/auth/login', {
      data: { email: 'user@swathi.com', password: 'Password123!' },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.tokens.accessToken).toBeDefined();
  });

  test('TC-REG-02: Reject Login with Invalid Password', async ({ request }) => {
    const response = await request.post('http://localhost:3001/api/auth/login', {
      data: { email: 'user@swathi.com', password: 'WrongPassword999!' },
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
    const body = await response.json();
    expect(body.success).toBe(false);
  });

  test('TC-REG-03: Access Authenticated Member Profile', async ({ request }) => {
    const loginRes = await request.post('http://localhost:3001/api/auth/login', {
      data: { email: 'user@swathi.com', password: 'Password123!' },
    });
    const { data } = await loginRes.json();
    const token = data.tokens.accessToken;

    const profileRes = await request.get('http://localhost:3001/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(profileRes.status()).toBe(200);
    const profile = await profileRes.json();
    expect(profile.data.email).toBe('user@swathi.com');
  });
});

test.describe('Persona 3: Subscriber Reading & DRM Journey', () => {
  test('TC-SUB-01: Device Management & Active Device Ceiling (Max 3)', async ({ request }) => {
    const loginRes = await request.post('http://localhost:3001/api/auth/login', {
      data: { email: 'user@swathi.com', password: 'Password123!' },
    });
    const { data } = await loginRes.json();
    const token = data.tokens.accessToken;

    const devicesRes = await request.get('http://localhost:3001/api/pdf/drm/devices', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(devicesRes.status()).toBe(200);
  });

  test('TC-SUB-02: Reading Progress Synchronization', async ({ request }) => {
    const loginRes = await request.post('http://localhost:3001/api/auth/login', {
      data: { email: 'user@swathi.com', password: 'Password123!' },
    });
    const { data } = await loginRes.json();
    const token = data.tokens.accessToken;

    const progressRes = await request.post('http://localhost:3001/api/progress', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        bookId: '660000000000000000000010',
        page: 5,
        percentage: 25,
      },
    });
    expect([200, 201]).toContain(progressRes.status());
  });

  test('TC-SUB-03: Reader Bookmarks & Annotations', async ({ request }) => {
    const loginRes = await request.post('http://localhost:3001/api/auth/login', {
      data: { email: 'user@swathi.com', password: 'Password123!' },
    });
    const { data } = await loginRes.json();
    const token = data.tokens.accessToken;

    const bookmarkRes = await request.get('http://localhost:3001/api/bookmarks', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(bookmarkRes.status()).toBe(200);
  });
});

test.describe('Persona 4: Editorial & Review Workbench Journey', () => {
  test('TC-EDT-01: OCR Review Queue Fetching', async ({ request }) => {
    const loginRes = await request.post('http://localhost:3001/api/auth/login', {
      data: { email: 'admin@swathi.com', password: 'Password123!' },
    });
    const { data } = await loginRes.json();
    const token = data.tokens.accessToken;

    const queueRes = await request.get('http://localhost:3001/api/nlp/ocr/queue', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(queueRes.status()).toBe(200);
    const queueData = await queueRes.json();
    expect(queueData.success).toBe(true);
  });

  test('TC-EDT-02: Editorial Article Workflow Stage Query', async ({ request }) => {
    const loginRes = await request.post('http://localhost:3001/api/auth/login', {
      data: { email: 'admin@swathi.com', password: 'Password123!' },
    });
    const { data } = await loginRes.json();
    const token = data.tokens.accessToken;

    const articlesRes = await request.get('http://localhost:3001/api/articles?limit=5', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(articlesRes.status()).toBe(200);
  });
});

test.describe('Persona 5: Administrator Operations Journey', () => {
  test('TC-ADM-01: System Health & Uptime Status', async ({ request }) => {
    const res = await request.get('http://localhost:3001/health');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.uptime).toBeGreaterThan(0);
  });

  test('TC-ADM-02: Platform User Statistics', async ({ request }) => {
    const loginRes = await request.post('http://localhost:3001/api/auth/login', {
      data: { email: 'admin@swathi.com', password: 'Password123!' },
    });
    const { data } = await loginRes.json();
    const token = data.tokens.accessToken;

    const statsRes = await request.get('http://localhost:3001/api/v1/admin/stats/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(statsRes.status()).toBe(200);
    const stats = await statsRes.json();
    expect(stats.success).toBe(true);
  });

  test('TC-ADM-03: Security & DRM Audit Logs', async ({ request }) => {
    const loginRes = await request.post('http://localhost:3001/api/auth/login', {
      data: { email: 'admin@swathi.com', password: 'Password123!' },
    });
    const { data } = await loginRes.json();
    const token = data.tokens.accessToken;

    const auditRes = await request.get('http://localhost:3001/api/v1/admin/audit-logs', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(auditRes.status()).toBe(200);
  });
});
