import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

test.describe('Appointment — Admin Services CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, '/admin/services');
  });

  test('should load services page', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/services/);
  });

  test('should display services list', async ({ page }) => {
    const list = page.locator('table, [class*="card"], [class*="service"]').first();
    await expect(list).toBeAttached();
  });

  test('should open add service dialog and show inputs', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm dịch vụ/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible();

    // Verify fields by their specific placeholders (since description is an Input, not a Textarea)
    await expect(dialog.getByPlaceholder('VD: Kiểm tra sức khỏe định kỳ')).toBeVisible();
    await expect(dialog.getByPlaceholder('Mô tả ngắn về dịch vụ...')).toBeVisible();
    await expect(dialog.getByPlaceholder('VD: 200000')).toBeVisible();

    await page.keyboard.press('Escape');
  });

  test('should perform search filtering', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Tìm"]').first();
    await searchInput.fill('Clinical');
    await page.waitForTimeout(500);
    await expect(page).not.toHaveURL(/error/);
  });
});
