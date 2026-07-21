import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

test.describe('Appointment — Admin Schedule', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, '/admin/schedule');
  });

  test('should load schedule page', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/schedule/);
  });

  test('should display schedule view', async ({ page }) => {
    const view = page.locator('[class*="calendar"], [class*="schedule"], [class*="gantt"], [class*="timeline"]').first();
    await expect(view).toBeAttached();
  });

  test('should have add ca truc button', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Phân công/i }).first();
    await expect(addBtn).toBeVisible();
  });

  test('should open add dialog', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Phân công/i }).first();
    await addBtn.click();
    await page.waitForTimeout(800);
    await expect(page.locator('[role="dialog"]').first()).toBeVisible();
  });

  test('should have search input', async ({ page }) => {
    const search = page.locator('input[placeholder*="Tìm"], input[placeholder*="tìm"]').first();
    await expect(search).toBeVisible();
  });
});
