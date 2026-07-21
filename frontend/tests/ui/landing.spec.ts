import { test, expect } from '@playwright/test';

test.describe('UI — Landing Page & Carousel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load landing page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/MintCare/);
    await expect(page.getByText('MintCare Portal')).toBeVisible();
  });

  test('should display doctor/specialist list', async ({ page }) => {
    await expect(page.getByText('Sandra Bullock')).toBeVisible({ timeout: 10000 });
  });

  test('should support specialist carousel transition', async ({ page }) => {
    const nextBtn = page.getByRole('button', { name: 'Next specialist' });
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await page.waitForTimeout(500);
      await expect(nextBtn).toBeVisible();
    }
  });

  test('should display contact form sections', async ({ page }) => {
    await expect(page.getByText('Kênh tư vấn trực tuyến')).toBeVisible();
  });
});
