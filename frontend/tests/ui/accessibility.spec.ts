import { test, expect } from '@playwright/test';

test.describe('UI — Accessibility (a11y)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render landmark elements', async ({ page }) => {
    await expect(page.locator('main')).toBeAttached({ timeout: 10000 });
    await expect(page.locator('header').first()).toBeAttached();
    await expect(page.locator('footer').first()).toBeAttached();
  });

  test('should support key landmark keyboard focus', async ({ page }) => {
    await page.keyboard.press('Tab');
    const tagName = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(tagName || '')).toBeTruthy();
  });

  test('should have image descriptive labels', async ({ page }) => {
    const imgList = page.locator('img');
    const count = await imgList.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      const alt = await imgList.nth(i).getAttribute('alt');
      const label = await imgList.nth(i).getAttribute('aria-label');
      const role = await imgList.nth(i).getAttribute('role');
      expect(alt || label || role === 'presentation').toBeTruthy();
    }
  });
});
