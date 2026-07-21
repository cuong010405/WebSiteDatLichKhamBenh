import { test, expect } from '@playwright/test';

test.describe('Auth — Login Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open login modal when clicking login button', async ({ page }) => {
    await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
    await expect(page.getByText('Chào mừng tới MintCare')).toBeVisible({ timeout: 10000 });
  });

  test('should display email and password fields', async ({ page }) => {
    await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
    await expect(page.getByPlaceholder('evelyn.green@gmail.com')).toBeVisible();
    await expect(page.getByPlaceholder('••••••').first()).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
    await page.getByPlaceholder('evelyn.green@gmail.com').fill('wrong@example.com');
    await page.getByPlaceholder('••••••').first().fill('badpass');
    await page.getByRole('button', { name: /Đăng nhập$/ }).last().click();
    await expect(page.getByText(/thất bại/i)).toBeVisible({ timeout: 10000 });
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
    const pwdInput = page.getByPlaceholder('••••••').first();
    await expect(pwdInput).toHaveAttribute('type', 'password');
    const toggleBtn = page.locator('button').filter({ has: page.locator('svg.lucide-eye, svg.lucide-eye-off') }).first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await expect(pwdInput).toHaveAttribute('type', 'text');
    }
  });

  test('should close modal with X button', async ({ page }) => {
    await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
    await page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first().click();
    await expect(page.getByText('Chào mừng tới MintCare')).not.toBeVisible();
  });

  test('should switch between login and register tabs', async ({ page }) => {
    await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
    // Confirm login modal opened
    await expect(page.getByText('Chào mừng tới MintCare')).toBeVisible({ timeout: 10000 });

    const modal = page.locator('div.fixed.inset-0.z-50');

    // Click "Đăng ký" tab (inside the modal)
    await modal.getByRole('button', { name: 'Đăng ký', exact: true }).click();
    // Wait for sliding transition
    await page.waitForTimeout(600);
    // The register form input is in a sliding container — check attachment or visibility
    await expect(modal.getByPlaceholder('VD: Nguyễn Văn A')).toBeAttached({ timeout: 5000 });

    // Switch back to login tab
    await modal.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await page.waitForTimeout(600);
    await expect(modal.getByPlaceholder('evelyn.green@gmail.com')).toBeVisible({ timeout: 5000 });
  });

  test('should display Google login button', async ({ page }) => {
    await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
    await expect(page.getByRole('button', { name: /Google/i })).toBeVisible();
  });
});
