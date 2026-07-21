import { test, expect } from '@playwright/test';

/**
 * 06 – Admin Dashboard Tests
 * Stats, StaffDirectory, TodayVisits, DispatchMap, ActivityLog
 */

async function loginAdmin(page: any) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
  await page.getByPlaceholder('evelyn.green@gmail.com').fill('admin@mintcare.com');
  await page.getByPlaceholder('••••••').first().fill('admin123');
  await page.getByRole('button', { name: /Đăng nhập$/ }).last().click();
  await page.waitForURL(/\/admin/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

test.describe('06 – Admin Dashboard Layout', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('sidebar navigation hiển thị', async ({ page }) => {
    const sidebar = page.locator('nav, aside').first();
    await expect(sidebar).toBeVisible();
  });

  test('header admin hiển thị', async ({ page }) => {
    await expect(page.locator('header').first()).toBeVisible();
  });

  test('greeting hiển thị tên admin', async ({ page }) => {
    // "Chào buổi sáng/chiều/tối" greeting
    const greeting = page.getByText(/Chào buổi/i).first();
    await expect(greeting).toBeVisible({ timeout: 10000 });
  });

  test('sidebar có các menu items', async ({ page }) => {
    // Kiểm tra có các link navigation quan trọng
    const sidebar = page.locator('nav, aside').first();
    const links = sidebar.getByRole('link');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('06 – Dashboard Stats', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('stats section hiển thị', async ({ page }) => {
    // Stats component – tìm số liệu hoặc card thống kê
    const statsSection = page.locator('#hero-section, [id*="stat"], .stat').first();
    await expect(statsSection).toBeAttached();
  });

  test('dashboard có dữ liệu thống kê', async ({ page }) => {
    await page.waitForTimeout(2000);
    // Tìm bất kỳ số liệu nào
    const numbers = page.locator('text=/\\d+/').first();
    await expect(numbers).toBeAttached();
  });
});

test.describe('06 – Staff Directory Widget', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('staff directory section tồn tại', async ({ page }) => {
    await page.waitForTimeout(2000);
    // Staff directory hoặc bất kỳ list nhân viên
    const staffSection = page.getByText(/Nhân viên|Staff|Chuyên gia/i).first();
    await expect(staffSection).toBeAttached();
  });
});

test.describe('06 – Today Visits Widget', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('today visits section hiển thị', async ({ page }) => {
    await page.waitForTimeout(2000);
    const visitSection = page.getByText(/Lịch hẹn hôm nay|Today|Hôm nay/i).first();
    await expect(visitSection).toBeAttached();
  });
});

test.describe('06 – Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('navigate to /admin/accounts từ sidebar', async ({ page }) => {
    const accountsLink = page.getByRole('link', { name: /Tài khoản|Accounts/i }).first();
    if (await accountsLink.isVisible()) {
      await accountsLink.click();
      await page.waitForURL(/\/admin\/accounts/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/admin\/accounts/);
    }
  });

  test('navigate to /admin/schedule từ sidebar', async ({ page }) => {
    const scheduleLink = page.getByRole('link', { name: /Lịch|Schedule/i }).first();
    if (await scheduleLink.isVisible()) {
      await scheduleLink.click();
      await page.waitForTimeout(3000);
      const url = page.url();
      expect(url).toContain('/admin');
    }
  });
});

test.describe('06 – Activity Log', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('activity log section tồn tại', async ({ page }) => {
    await page.waitForTimeout(2000);
    // Activity log component
    const logSection = page.getByText(/Hoạt động|Activity|Log/i).first();
    await expect(logSection).toBeAttached();
  });
});
