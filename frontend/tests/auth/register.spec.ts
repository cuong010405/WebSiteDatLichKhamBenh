import { test, expect } from '@playwright/test';

test.describe('Auth — Register', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
    await page.getByRole('button', { name: 'Đăng ký', exact: true }).first().click();
  });

  test('should display registration form fields', async ({ page }) => {
    const modal = page.locator('.fixed.inset-0');
    await expect(modal.getByPlaceholder('VD: Nguyễn Văn A')).toBeVisible();
    await expect(modal.getByPlaceholder('VD: 091 234 5678')).toBeVisible();
  });

  test('should register a new account successfully', async ({ page }) => {
    const modal = page.locator('.fixed.inset-0');
    await modal.getByPlaceholder('VD: Nguyễn Văn A').fill('QA Test User');
    await modal.getByPlaceholder('evelyn.green@gmail.com').fill(`qa_${Date.now()}@test.com`);
    await modal.getByPlaceholder('••••••').first().fill('password123');
    await modal.getByRole('button', { name: /Đăng ký/ }).last().click();
    await page.waitForTimeout(3000);
    const modalGone = !(await page.getByText('Chào mừng tới MintCare').isVisible().catch(() => false));
    expect(modalGone).toBeTruthy();
  });

  test('should not submit when name is empty', async ({ page }) => {
    const modal = page.locator('.fixed.inset-0');
    await modal.getByPlaceholder('evelyn.green@gmail.com').fill(`qa_${Date.now()}@test.com`);
    await modal.getByPlaceholder('••••••').first().fill('password123');
    await modal.getByRole('button', { name: /Đăng ký/ }).last().click();
    await expect(page.getByText('Chào mừng tới MintCare')).toBeVisible();
  });
});
