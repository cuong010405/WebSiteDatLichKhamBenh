import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:5000';

test.describe('API — Health & Integration', () => {
  test('health endpoint returns OK', async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('OK');
  });

  test('GET /api/departments returns array', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/departments`);
    expect(res.ok()).toBeTruthy();
    expect(Array.isArray(await res.json())).toBeTruthy();
  });

  test('GET /api/visits returns array', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/visits`);
    expect(res.ok()).toBeTruthy();
    expect(Array.isArray(await res.json())).toBeTruthy();
  });

  test('GET /api/roles returns array', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/roles`);
    expect(res.ok()).toBeTruthy();
    expect(Array.isArray(await res.json())).toBeTruthy();
  });

  test('GET /api/positions returns array', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/positions`);
    expect(res.ok()).toBeTruthy();
    expect(Array.isArray(await res.json())).toBeTruthy();
  });
});

test.describe('API — Protected Routes (401)', () => {
  test('GET /api/users requires auth', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/users`);
    expect(res.status()).toBe(401);
  });

  test('GET /api/patients requires auth', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/patients`);
    expect(res.status()).toBe(401);
  });

  test('GET /api/payments requires auth', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/payments`);
    expect(res.status()).toBe(401);
  });

  test('GET /api/reports requires auth', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/reports`);
    expect(res.status()).toBe(401);
  });

  test('GET /api/logs requires auth', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/logs`);
    expect(res.status()).toBe(401);
  });
});

test.describe('API — Auth Validation', () => {
  test('login with missing fields returns 400', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/auth/login`, { data: {} });
    expect(res.status()).toBe(400);
  });

  test('login with wrong password returns 401', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/auth/login`, {
      data: { email: 'admin@mintcare.com', password: 'wrong' }
    });
    expect(res.status()).toBe(401);
  });

  test('register with short password returns 400', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/auth/register`, {
      data: { email: 'x@x.com', password: '12', fullName: 'T' }
    });
    expect(res.status()).toBe(400);
  });

  test('GET /api/auth/me without token returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/auth/me`);
    expect(res.status()).toBe(401);
  });

  test('GET /api/auth/me with fake token returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: 'Bearer fake-token' }
    });
    expect(res.status()).toBe(401);
  });
});

test.describe('API — Security Headers', () => {
  test('response includes X-Content-Type-Options', async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`);
    expect(res.headers()['x-content-type-options']).toBe('nosniff');
  });

  test('response includes X-Frame-Options', async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`);
    expect(res.headers()['x-frame-options']).toBe('DENY');
  });
});
