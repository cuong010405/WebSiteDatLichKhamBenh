import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

test.describe('Dashboard — Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, '/admin');
  });

  test('should display sidebar navigation', async ({ page }) => {
    await expect(page.locator('nav, aside').first()).toBeVisible();
  });

  test('should display header', async ({ page }) => {
    await expect(page.locator('header').first()).toBeVisible();
  });

  test('should show greeting message', async ({ page }) => {
    const greeting = page.getByText(/Chào buổi/i).first();
    await expect(greeting).toBeVisible({ timeout: 10000 });
  });

  test('should display stat metrics', async ({ page }) => {
    const numbers = page.locator('text=/\\d+/').first();
    await expect(numbers).toBeAttached();
  });

  test('should show sidebar menu links', async ({ page }) => {
    const sidebar = page.locator('nav, aside').first();
    const links = sidebar.getByRole('link');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display activity log section', async ({ page }) => {
    const logSection = page.getByText(/Hoạt động|Activity|Log/i).first();
    await expect(logSection).toBeAttached();
  });
});
