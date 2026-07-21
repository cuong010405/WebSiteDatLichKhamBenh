import { test, expect } from '@playwright/test';

/**
 * 16 – Security Tests
 * SQL Injection, XSS, Broken Links, Token Tampering
 */

const API_BASE = 'http://localhost:5000';

// SQL Injection payloads
const SQL_PAYLOADS = [
  "' OR '1'='1",
  "'; DROP TABLE users; --",
  "1' OR 1=1 --",
  "' UNION SELECT * FROM users --",
  "admin'--",
];

// XSS payloads
const XSS_PAYLOADS = [
  '<script>alert("xss")</script>',
  '<img src=x onerror=alert(1)>',
  'javascript:alert(1)',
  '<svg onload=alert(1)>',
];

test.describe('16 – SQL Injection – API Login', () => {
  for (const payload of SQL_PAYLOADS) {
    test(`SQL Injection login email: "${payload.slice(0, 30)}..."`, async ({ request }) => {
      const res = await request.post(`${API_BASE}/api/auth/login`, {
        data: { email: payload, password: 'anypassword' }
      });
      // Phải trả về 400 hoặc 401 – không được 200
      expect(res.status()).not.toBe(200);
      // Không bị crash (500 thì warn)
      expect(res.status()).not.toBe(500);
    });
  }
});

test.describe('16 – SQL Injection – API Register', () => {
  test('SQL Injection trong email field khi register', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/auth/register`, {
      data: {
        email: "' OR '1'='1",
        password: 'password123',
        fullName: 'SQL Test'
      }
    });
    expect([400, 409, 422]).toContain(res.status());
  });

  test('SQL Injection trong fullName field', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/auth/register`, {
      data: {
        email: `sqli_${Date.now()}@test.com`,
        password: 'password123',
        fullName: "'; DROP TABLE users; --"
      }
    });
    // Chấp nhận 201 (lưu thành chuỗi literal) hoặc 400 (blocked)
    expect([201, 400, 409]).toContain(res.status());
    // Quan trọng: server không crash
    expect(res.status()).not.toBe(500);
  });
});

test.describe('16 – XSS – Frontend Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  for (const payload of XSS_PAYLOADS.slice(0, 2)) {
    test(`XSS payload không execute trong search: "${payload.slice(0, 30)}"`, async ({ page }) => {
      // Listen for dialog (alert XSS)
      let alertFired = false;
      page.on('dialog', async dialog => {
        alertFired = true;
        await dialog.dismiss();
      });

      // Inject XSS vào contact form name field
      const nameInput = page.getByPlaceholder('VD: Nguyễn Văn A');
      if (await nameInput.isVisible()) {
        await nameInput.fill(payload);
        await page.waitForTimeout(1000);
      }

      // XSS không được execute
      expect(alertFired).toBeFalsy();
    });
  }

  test('XSS trong login email field không execute', async ({ page }) => {
    let alertFired = false;
    page.on('dialog', async dialog => {
      alertFired = true;
      await dialog.dismiss();
    });

    const loginBtn = page.getByRole('button', { name: /Đăng nhập/ }).first();
    await loginBtn.click();
    const emailInput = page.getByPlaceholder('evelyn.green@gmail.com');
    await emailInput.fill('<script>alert("xss")</script>@test.com');
    await page.waitForTimeout(1000);

    expect(alertFired).toBeFalsy();
  });
});

test.describe('16 – XSS – API Response', () => {
  test('API không reflect XSS payload trong response', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/auth/login`, {
      data: {
        email: '<script>alert(1)</script>@test.com',
        password: 'test'
      }
    });
    const text = await res.text();
    // Response không chứa unescaped script tag
    expect(text).not.toContain('<script>alert(1)</script>');
  });
});

test.describe('16 – Token Tampering', () => {
  test('token giả bị reject bởi protected API', async ({ request }) => {
    const fakeTokens = [
      'Bearer fake.token.here',
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4ifQ.fake',
      'Bearer ' + 'A'.repeat(200),
    ];

    for (const token of fakeTokens) {
      const res = await request.get(`${API_BASE}/api/users`, {
        headers: { Authorization: token }
      });
      expect(res.status()).toBe(401);
    }
  });

  test('request không có Authorization header bị reject', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/users`);
    expect(res.status()).toBe(401);
  });
});

test.describe('16 – Broken Links', () => {
  test('homepage không có broken image', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const brokenImages: string[] = [];
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 20); i++) {
      const src = await images.nth(i).getAttribute('src');
      const naturalWidth = await images.nth(i).evaluate((img: HTMLImageElement) => img.naturalWidth);
      if (src && naturalWidth === 0 && !src.startsWith('data:')) {
        brokenImages.push(src);
      }
    }

    // Cho phép tối đa 2 broken images (placeholder/fallback)
    expect(brokenImages.length).toBeLessThanOrEqual(2);
  });

  test('navigation links không dẫn đến 404', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const links = page.locator('a[href^="/"], a[href^="http://localhost"]');
    const count = await links.count();

    const brokenLinks: string[] = [];
    for (let i = 0; i < Math.min(count, 10); i++) {
      const href = await links.nth(i).getAttribute('href');
      if (href && !href.includes('#') && !href.includes('tel:') && !href.includes('mailto:')) {
        const response = await page.request.get(href.startsWith('http') ? href : `http://localhost:3000${href}`).catch(() => null);
        if (response && response.status() === 404) {
          brokenLinks.push(href);
        }
      }
    }
    expect(brokenLinks.length).toBe(0);
  });
});

test.describe('16 – Header Security', () => {
  test('security headers hiện diện trong API response', async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`);
    const headers = res.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
  });

  test('không có thông tin nhạy cảm trong error response', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/auth/login`, {
      data: { email: 'test@test.com', password: 'wrongpass' }
    });
    const body = await res.json();
    const bodyStr = JSON.stringify(body).toLowerCase();
    // Không leak stack trace, database info
    expect(bodyStr).not.toContain('prisma');
    expect(bodyStr).not.toContain('sql');
    expect(bodyStr).not.toContain('stack');
  });
});

test.describe('16 – Mass Assignment', () => {
  test('không thể escalate role qua register', async ({ request }) => {
    const email = `massassign_${Date.now()}@test.com`;
    const res = await request.post(`${API_BASE}/api/auth/register`, {
      data: {
        email,
        password: 'password123',
        fullName: 'Mass Assign Test',
        role: 'admin' // Cố tình inject admin role
      }
    });

    if (res.status() === 201) {
      const body = await res.json();
      // Role phải là customer, không phải admin
      expect(body.user?.role ?? body.role).not.toBe('admin');
    }
  });
});
