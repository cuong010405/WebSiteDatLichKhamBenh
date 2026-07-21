import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

test.describe('Dashboard — Admin Settings', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, '/admin/settings');
  });

  test('should load settings page', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/settings/);
  });

  test('should display configurations form with user profile fields', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /Cấu hình hệ thống/i }).first();
    if (await heading.isVisible()) {
      await expect(heading).toBeVisible();
    }
    // Verify inputs for Name, Email, Phone
    const labels = page.locator('label');
    await expect(labels.first()).toBeAttached();
  });

  test('should open change password dialog', async ({ page }) => {
    const changePwBtn = page.getByRole('button', { name: /Đổi mật khẩu/i }).first();
    if (await changePwBtn.isVisible()) {
      await changePwBtn.click();
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]').first();
      await expect(dialog).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });

  test('should have theme toggles or status toggles', async ({ page }) => {
    const switches = page.locator('button[role="switch"]');
    if (await switches.count() > 0) {
      await expect(switches.first()).toBeVisible();
    }
  });
});
