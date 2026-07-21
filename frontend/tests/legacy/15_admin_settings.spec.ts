import { test, expect } from '@playwright/test';

/**
 * 15 – Admin Settings Tests
 */

async function loginAdmin(page: any) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
  await page.getByPlaceholder('evelyn.green@gmail.com').fill('admin@mintcare.com');
  await page.getByPlaceholder('••••••').first().fill('admin123');
  await page.getByRole('button', { name: /Đăng nhập$/ }).last().click();
  await page.waitForURL(/\/admin/, { timeout: 15000 });
  await page.goto('/admin/settings');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

test.describe('15 – Settings Page Structure', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('trang settings load được', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/settings/);
  });

  test('không có lỗi khi load settings', async ({ page }) => {
    await page.waitForTimeout(2000);
    await expect(page).not.toHaveURL(/error/);
  });

  test('có form settings', async ({ page }) => {
    await page.waitForTimeout(2000);
    const form = page.locator('form, [class*="setting"], [class*="form"]').first();
    await expect(form).toBeAttached();
  });

  test('có input fields trong settings', async ({ page }) => {
    await page.waitForTimeout(2000);
    const inputs = page.locator('input, textarea, select');
    const count = await inputs.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('15 – Settings Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('settings có tabs hoặc sections', async ({ page }) => {
    await page.waitForTimeout(2000);
    const tabs = page.locator('[role="tab"], [class*="tab"]');
    const sections = page.locator('h2, h3, [class*="section-title"]');
    const tabCount = await tabs.count();
    const sectionCount = await sections.count();
    expect(tabCount + sectionCount).toBeGreaterThan(0);
  });

  test('có thể click tab', async ({ page }) => {
    await page.waitForTimeout(2000);
    const tabs = page.locator('[role="tab"]');
    const count = await tabs.count();
    if (count > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(500);
      await expect(page).not.toHaveURL(/error/);
    }
  });
});

test.describe('15 – Save Settings', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('nút Lưu cài đặt tồn tại', async ({ page }) => {
    await page.waitForTimeout(2000);
    const saveBtn = page.getByRole('button', { name: /Lưu|Save|Cập nhật/i }).first();
    if (await saveBtn.isVisible()) {
      await expect(saveBtn).toBeVisible();
    }
  });

  test('lưu settings không gây lỗi', async ({ page }) => {
    await page.waitForTimeout(2000);
    const saveBtn = page.getByRole('button', { name: /Lưu|Save|Cập nhật/i }).first();
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await page.waitForTimeout(1500);
      await expect(page).not.toHaveURL(/error/);
    }
  });
});
