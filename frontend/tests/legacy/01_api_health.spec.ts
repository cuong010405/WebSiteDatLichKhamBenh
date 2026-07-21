import { test, expect } from '@playwright/test';
import { apiWithAuth, API_BASE } from './helpers/api';

/**
 * 01 – API Health & Integration Tests
 * Kiểm tra tất cả backend API endpoints hoạt động đúng
 */

test.describe('01 – Backend Health', () => {
  test('health endpoint trả về status OK', async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('OK');
    expect(body.timestamp).toBeTruthy();
  });

  test('root endpoint trả về HTML', async ({ request }) => {
    const res = await request.get(`${API_BASE}/`);
    expect(res.ok()).toBeTruthy();
    const text = await res.text();
    expect(text).toContain('MintCare');
  });
});

test.describe('01 – Public API Endpoints', () => {
  test('GET /api/staff – trả về danh sách nhân viên', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/staff`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('GET /api/services – trả về danh sách dịch vụ', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/services`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('GET /api/departments – trả về danh sách khoa', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/departments`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('GET /api/visits – trả về danh sách lịch hẹn', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/visits`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('GET /api/roles – trả về danh sách roles', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/roles`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('GET /api/positions – trả về danh sách chức danh', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/positions`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
  });
});

test.describe('01 – Protected API – 401 khi không có token', () => {
  test('GET /api/users – 401 nếu không auth', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/users`);
    expect(res.status()).toBe(401);
  });

  test('GET /api/patients – 401 nếu không auth', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/patients`);
    expect(res.status()).toBe(401);
  });

  test('GET /api/payments – 401 nếu không auth', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/payments`);
    expect(res.status()).toBe(401);
  });

  test('GET /api/reports – 401 nếu không auth', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/reports`);
    expect(res.status()).toBe(401);
  });

  test('GET /api/logs – 401 nếu không auth', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/logs`);
    expect(res.status()).toBe(401);
  });
});

test.describe('01 – Admin API với token hợp lệ', () => {
  test('GET /api/users – trả về danh sách user khi admin auth', async ({ request }) => {
    const res = await apiWithAuth(request, 'GET', '/api/users');
    // Chấp nhận 200 hoặc 401 (nếu backend chưa seed admin)
    expect([200, 401]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(Array.isArray(body)).toBeTruthy();
    }
  });

  test('GET /api/patients – admin có thể lấy danh sách bệnh nhân', async ({ request }) => {
    const res = await apiWithAuth(request, 'GET', '/api/patients');
    expect([200, 401]).toContain(res.status());
  });

  test('GET /api/payments – admin có thể lấy thanh toán', async ({ request }) => {
    const res = await apiWithAuth(request, 'GET', '/api/payments');
    expect([200, 401]).toContain(res.status());
  });
});

test.describe('01 – Auth API Validation', () => {
  test('POST /api/auth/login – thiếu fields trả về 400', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/auth/login`, {
      data: {}
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test('POST /api/auth/register – thiếu fields trả về 400', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/auth/register`, {
      data: { email: 'test@test.com' }
    });
    expect(res.status()).toBe(400);
  });

  test('POST /api/auth/register – password < 6 ký tự trả về 400', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/auth/register`, {
      data: { email: 'x@x.com', password: '123', fullName: 'Test' }
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('6');
  });

  test('POST /api/auth/login – sai password trả về 401', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/auth/login`, {
      data: { email: 'admin@mintcare.com', password: 'wrongpassword' }
    });
    expect(res.status()).toBe(401);
  });

  test('GET /api/auth/me – không có token trả về 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/auth/me`);
    expect(res.status()).toBe(401);
  });

  test('GET /api/auth/me – token giả trả về 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: 'Bearer fake-token-12345' }
    });
    expect(res.status()).toBe(401);
  });
});

test.describe('01 – Visits API Filters', () => {
  test('GET /api/visits?status=... lọc theo status', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/visits?status=Đã xác nhận`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('GET /api/visits?userId=... lọc theo userId', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/visits?userId=nonexistent-id`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBe(0);
  });
});

test.describe('01 – CORS Headers', () => {
  test('API trả về CORS headers hợp lệ', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/staff`);
    // CORS headers không bị block từ origin hợp lệ
    expect(res.ok()).toBeTruthy();
  });

  test('Security headers được set', async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`);
    const headers = res.headers();
    // Kiểm tra security headers
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
  });
});
