import { test, expect } from '@playwright/test';

test.describe('UI — Error States & Offline Fallbacks', () => {
  test('should display base template even when API fails', async ({ page }) => {
    await page.route('**/api/staff', route => route.abort('failed'));
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByText('Chăm sóc y tế')).toBeVisible();
  });

  test('should not crash when routes do not exist', async ({ page }) => {
    await page.goto('/invalid-nonexistent-path-xyz');
    await expect(page.locator('body')).toBeVisible();
  });
});
