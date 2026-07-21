import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:5000';

test.describe('Security — Input Injections', () => {
  test('should handle SQL Injection inputs in email field gracefully', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/auth/login`, {
      data: { email: "' OR '1'='1", password: 'password123' }
    });
    // Server should not return success (200) and must not crash (500)
    expect(res.status()).not.toBe(200);
    expect(res.status()).not.toBe(500);
  });

  test('should handle SQL Injection inputs in password field gracefully', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/auth/login`, {
      data: { email: 'admin@mintcare.com', password: "'; DROP TABLE Users; --" }
    });
    expect(res.status()).not.toBe(200);
    expect(res.status()).not.toBe(500);
  });

  test('should reject requests with tampered JWT authorization header', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/users`, {
      headers: { Authorization: 'Bearer fake.jwt.header' }
    });
    expect(res.status()).toBe(401);
  });
});
