import { test, expect } from '@playwright/test';
import { loginAsCustomer, logout } from '../helpers/auth';

test.describe('Auth — Logout', () => {
  test('should clear session and restore login button', async ({ page }) => {
    await loginAsCustomer(page);
    // Verify user is logged in (booking section visible)
    await expect(page.getByText('Khai báo thông tin khám')).toBeVisible({ timeout: 10000 });

    await logout(page);
    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: /Đăng nhập/ }).first()).toBeVisible();
  });
});
