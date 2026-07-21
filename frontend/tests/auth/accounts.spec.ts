import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

test.describe('Auth — Admin Accounts CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, '/admin/accounts');
  });

  test('should load accounts page', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/accounts/);
  });

  test('should display accounts list table', async ({ page }) => {
    const table = page.locator('table, [role="table"]').first();
    await expect(table).toBeVisible();
  });

  test('should have search input', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Tìm"], input[placeholder*="tìm"]').first();
    await expect(searchInput).toBeVisible();
  });

  test('should open add account dialog', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm tài khoản/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible();
    // Check password field has descriptive placeholder
    await expect(dialog.getByPlaceholder('Mật khẩu ít nhất 6 ký tự')).toBeVisible();
  });

  test('should show password placeholder hint', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm tài khoản/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]').first();
    // The password input has placeholder text indicating minimum length requirement
    const pwdInput = dialog.getByPlaceholder('Mật khẩu ít nhất 6 ký tự');
    await expect(pwdInput).toBeVisible();
    await expect(pwdInput).toHaveAttribute('type', 'password');
  });

  test('should have a submit button to create account', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm tài khoản/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]').first();
    const submitBtn = dialog.getByRole('button', { name: /Tạo tài khoản/i });
    await expect(submitBtn).toBeVisible();
  });
});
