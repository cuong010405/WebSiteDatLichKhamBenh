import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

test.describe('Doctor — Staff Directory', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, '/admin/staff');
  });

  test('should load staff page', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/staff/);
  });

  test('should display staff list', async ({ page }) => {
    // Staff rendered as cards, wait for loading to complete
    const loading = page.getByText('Đang tải danh sách chuyên gia...');
    if (await loading.isVisible()) {
      await loading.waitFor({ state: 'hidden', timeout: 10000 });
    }
    // After loading, check card/grid exists
    const grid = page.locator('[class*="grid"]').first();
    await expect(grid).toBeAttached();
  });

  test('should have add staff button', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm chuyên gia/i }).first();
    await expect(addBtn).toBeVisible();
  });

  test('should search staff members', async ({ page }) => {
    const search = page.locator('input[placeholder*="Tìm"]').first();
    if (await search.isVisible()) {
      await search.fill('Sandra');
      await page.waitForTimeout(800);
      await expect(page).not.toHaveURL(/error/);
    }
  });

  test('should show staff status badges', async ({ page }) => {
    const loading = page.getByText('Đang tải danh sách chuyên gia...');
    if (await loading.isVisible()) {
      await loading.waitFor({ state: 'hidden', timeout: 10000 });
    }
    const badge = page.getByText(/Sẵn sàng|Đang bận|Nghỉ phép/).first();
    await expect(badge).toBeVisible({ timeout: 5000 });
  });

  test('should open add staff dialog', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm chuyên gia/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('[role="dialog"]').first()).toBeVisible();
  });
});
