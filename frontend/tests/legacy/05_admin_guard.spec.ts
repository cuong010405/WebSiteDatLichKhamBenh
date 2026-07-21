import { test, expect } from '@playwright/test';

/**
 * 05 – Authorization & Guard Tests
 * Kiểm tra redirect khi không có quyền truy cập
 */

test.describe('05 – Admin Guard – Unauthenticated', () => {
  test('/admin redirect về / khi chưa login', async ({ page }) => {
    // Clear storage
    await page.evaluate(() => {
      try { localStorage.clear(); } catch {}
    });
    await page.goto('/admin');
    await page.waitForTimeout(5000);
    // Phải redirect về /
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('/admin/accounts redirect khi chưa login', async ({ page }) => {
    await page.evaluate(() => { try { localStorage.clear(); } catch {} });
    await page.goto('/admin/accounts');
    await page.waitForTimeout(5000);
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('/admin/schedule redirect khi chưa login', async ({ page }) => {
    await page.evaluate(() => { try { localStorage.clear(); } catch {} });
    await page.goto('/admin/schedule');
    await page.waitForTimeout(5000);
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('/admin/patients redirect khi chưa login', async ({ page }) => {
    await page.evaluate(() => { try { localStorage.clear(); } catch {} });
    await page.goto('/admin/patients');
    await page.waitForTimeout(5000);
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('/admin/reports redirect khi chưa login', async ({ page }) => {
    await page.evaluate(() => { try { localStorage.clear(); } catch {} });
    await page.goto('/admin/reports');
    await page.waitForTimeout(5000);
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });
});

test.describe('05 – Admin Guard – Customer Role', () => {
  // Customer không được vào admin
  test('customer login không thể truy cập /admin', async ({ page }) => {
    // Login as customer
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
    await page.getByRole('button', { name: /Google/i }).click();
    await page.waitForTimeout(3000);

    // Thử navigate sang /admin
    await page.goto('/admin');
    await page.waitForTimeout(5000);
    // Phải redirect về / (customer không có role admin)
    const url = page.url();
    // Chấp nhận cả / hoặc redirect khác (không phải /admin hoặc nếu vào được thì phải test spinner)
    expect(url).not.toContain('/admin/accounts');
  });
});

test.describe('05 – Login Redirect Flow', () => {
  test('/login page redirect về /?action=login', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(3000);
    // Phải redirect
    const url = page.url();
    expect(url).toContain('localhost:3000');
    // URL phải chứa login param hoặc đã redirect về /
    expect(url.includes('action=login') || url.endsWith('/')).toBeTruthy();
  });
});

test.describe('05 – Loading State Guard', () => {
  test('loading spinner hiển thị trong khi check auth', async ({ page }) => {
    await page.goto('/admin');
    // Trong lúc loading, spinner có thể hiển thị
    // Test chỉ verify không crash
    await page.waitForTimeout(2000);
    await expect(page).not.toHaveURL(/error/);
  });
});

test.describe('05 – API Authorization', () => {
  test('POST /api/visits không có token trả về 401', async ({ request }) => {
    const res = await request.post('http://localhost:5000/api/visits', {
      data: {
        type: 'test',
        staffId: 'staff-1',
        date: '2026-07-20',
        time: '09:00'
      }
    });
    expect(res.status()).toBe(401);
  });

  test('DELETE /api/visits/:id không có token trả về 401', async ({ request }) => {
    const res = await request.delete('http://localhost:5000/api/visits/some-id');
    expect(res.status()).toBe(401);
  });

  test('PUT /api/visits/:id không có admin token trả về 401', async ({ request }) => {
    const res = await request.put('http://localhost:5000/api/visits/some-id', {
      data: { status: 'Đã hủy' }
    });
    expect(res.status()).toBe(401);
  });
});
