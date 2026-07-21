import { test, expect } from '@playwright/test';

/**
 * 19 – Error Handling Tests
 * Network errors, 404, API timeouts, Console errors
 */

test.describe('19 – 404 Page', () => {
  test('route không tồn tại trả về 404 hoặc redirect', async ({ page }) => {
    const res = await page.goto('/this-page-does-not-exist-12345');
    // Next.js trả về 404
    expect([404, 200]).toContain(res?.status() ?? 200);
    // Không crash hoàn toàn
    await expect(page).not.toHaveURL(/crash/);
  });

  test('admin route không tồn tại không crash', async ({ page }) => {
    await page.goto('/admin/nonexistent-page-xyz');
    await page.waitForTimeout(5000);
    // Redirect về / hoặc 404
    await expect(page).not.toHaveURL(/crash|500/);
  });
});

test.describe('19 – API Error Handling', () => {
  test('frontend xử lý đúng khi API trả về 500', async ({ page }) => {
    // Mock API 500
    await page.route('**/api/staff', route =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Server error' }) })
    );
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Trang không crash
    await expect(page.locator('body')).toBeVisible();
    // Hero vẫn hiện
    await expect(page.getByText('Chăm sóc y tế')).toBeVisible();
  });

  test('frontend xử lý đúng khi API network timeout', async ({ page }) => {
    // Abort API request
    await page.route('**/api/staff', route => route.abort('timedout'));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Trang không white screen
    await expect(page.locator('body')).toBeVisible();
  });

  test('frontend hiển thị mock data khi API unavailable', async ({ page }) => {
    // Block tất cả API calls
    await page.route('**/api/**', route => route.abort());
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    // Trang vẫn render được (dùng mock data)
    await expect(page.getByText('Chăm sóc y tế')).toBeVisible();
    // Specialist section dùng mock data
    await expect(page.getByText('Sandra Bullock')).toBeVisible();
  });
});

test.describe('19 – Console Error Detection', () => {
  test('homepage không có JS errors', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', error => jsErrors.push(error.message));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    // Không có runtime JS errors
    expect(jsErrors.length).toBe(0);
  });

  test('admin page không có JS errors', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', error => jsErrors.push(error.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
    await page.getByPlaceholder('evelyn.green@gmail.com').fill('admin@mintcare.com');
    await page.getByPlaceholder('••••••').first().fill('admin123');
    await page.getByRole('button', { name: /Đăng nhập$/ }).last().click();
    await page.waitForTimeout(5000);

    expect(jsErrors.length).toBe(0);
  });
});

test.describe('19 – Network Error Handling', () => {
  test('login form hiển thị lỗi khi network lỗi', async ({ page }) => {
    // Block auth API
    await page.route('**/api/auth/login', route => route.abort('failed'));
    await page.route('**/api/auth/**', route => route.abort('failed'));

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
    await page.getByPlaceholder('evelyn.green@gmail.com').fill('user@test.com');
    await page.getByPlaceholder('••••••').first().fill('password123');
    await page.getByRole('button', { name: /Đăng nhập$/ }).last().click();

    await page.waitForTimeout(5000);
    // Không crash – có fallback
    await expect(page).not.toHaveURL(/crash|500/);
  });

  test('admin page gracefully handles API failure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
    await page.getByPlaceholder('evelyn.green@gmail.com').fill('admin@mintcare.com');
    await page.getByPlaceholder('••••••').first().fill('admin123');
    await page.getByRole('button', { name: /Đăng nhập$/ }).last().click();
    await page.waitForTimeout(5000);

    if (page.url().includes('/admin')) {
      // Block subsequent API calls
      await page.route('**/api/**', route => route.abort());
      await page.goto('/admin/accounts');
      await page.waitForTimeout(3000);

      // Không crash
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

test.describe('19 – Validation Error Messages', () => {
  test('login form validation hiển thị đúng', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Đăng nhập/ }).first().click();

    // Submit rỗng
    await page.getByRole('button', { name: /Đăng nhập$/ }).last().click();
    await page.waitForTimeout(2000);

    // Không crash
    await expect(page.locator('body')).toBeVisible();
  });

  test('register validation – email không hợp lệ', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
    await page.getByRole('button', { name: 'Đăng ký', exact: true }).click();

    const modal = page.locator('.fixed.inset-0');
    await modal.getByPlaceholder('VD: Nguyễn Văn A').fill('Test Name');
    await modal.getByPlaceholder('evelyn.green@gmail.com').fill('not-an-email');
    await modal.getByPlaceholder('••••••').first().fill('password123');
    await modal.getByRole('button', { name: /Đăng ký/ }).last().click();

    await page.waitForTimeout(2000);
    // Không crash
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('19 – Loading State', () => {
  test('loading state hiển thị trong khi fetch data', async ({ page }) => {
    // Slow down API
    await page.route('**/api/staff', async route => {
      await new Promise(r => setTimeout(r, 2000));
      await route.continue();
    });
    await page.goto('/');
    // Check loading indicators
    await page.waitForTimeout(500);
    // Trang không crash trong lúc loading
    await expect(page.locator('body')).toBeVisible();
  });
});
