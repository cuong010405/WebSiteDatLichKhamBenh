import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

test.describe('Appointment — Admin Departments CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, '/admin/departments');
  });

  test('should load departments page', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/departments/);
  });

  test('should display departments list', async ({ page }) => {
    const list = page.locator('table, [class*="card"], [class*="department"]').first();
    await expect(list).toBeAttached();
  });

  test('should open add department dialog and show inputs', async ({ page }) => {
    // Click button to add department
    const addBtn = page.getByRole('button', { name: /Thêm phòng ban/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible();
    // Use placeholder because label is not associated via htmlFor
    await expect(dialog.getByPlaceholder('VD: Nội khoa')).toBeVisible();
    await expect(dialog.getByPlaceholder('Mô tả về phòng ban...')).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('should switch to positions tab and open add position dialog', async ({ page }) => {
    // Switch to Chức vụ tab
    const posTab = page.getByRole('button', { name: /Chức vụ/i }).first();
    await posTab.click();
    await page.waitForTimeout(300);

    // Click button to add position (Chức vụ)
    const addBtn = page.getByRole('button', { name: /Thêm chức vụ/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('should perform search filtering', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Tìm"]').first();
    await searchInput.fill('Nội khoa');
    await page.waitForTimeout(500);
    await expect(page).not.toHaveURL(/error/);
  });
});
