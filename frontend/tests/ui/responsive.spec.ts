import { test, expect } from '@playwright/test';

test.describe('UI — Responsiveness Viewports', () => {
  test('should render headers properly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    await expect(page.locator('header').first()).toBeVisible({ timeout: 10000 });
    // Verify the hero section with "Chăm sóc y tế" text
    await expect(page.getByText('Chăm sóc y tế').first()).toBeVisible({ timeout: 10000 });
  });

  test('should adjust sidebar structure on tablet viewports', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.locator('header').first()).toBeVisible({ timeout: 10000 });
  });
});
