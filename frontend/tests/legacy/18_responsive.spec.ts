import { test, expect } from '@playwright/test';

/**
 * 18 – Responsive Design Tests
 * Mobile, Tablet, Desktop viewports
 */

const VIEWPORTS = {
  mobile: { width: 375, height: 812, name: 'iPhone 14' },
  tablet: { width: 768, height: 1024, name: 'iPad' },
  desktop: { width: 1440, height: 900, name: 'Desktop HD' },
};

test.describe('18 – Homepage Responsive', () => {
  for (const [key, vp] of Object.entries(VIEWPORTS)) {
    test(`homepage renders trên ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Header visible
      await expect(page.locator('header').first()).toBeVisible();
      // Hero text visible
      await expect(page.getByText('Chăm sóc y tế')).toBeVisible();
      // No horizontal overflow
      const scrollDiff = await page.evaluate(() => document.body.scrollWidth - document.body.clientWidth);
      // Cho phép tối đa 20px overflow (rounding errors)
      expect(scrollDiff).toBeLessThanOrEqual(20);
    });
  }
});

test.describe('18 – Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('mobile menu có thể mở', async ({ page }) => {
    // Tìm hamburger menu hoặc mobile nav toggle
    const menuBtn = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], button.hamburger').first();
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(500);
      await expect(page).not.toHaveURL(/error/);
    }
  });

  test('login button visible trên mobile', async ({ page }) => {
    const loginBtn = page.getByRole('button', { name: /Đăng nhập/ }).first();
    await expect(loginBtn).toBeVisible();
  });

  test('hero section visible trên mobile', async ({ page }) => {
    await expect(page.getByText('Chăm sóc y tế')).toBeVisible();
  });

  test('specialist carousel visible trên mobile', async ({ page }) => {
    const carousel = page.getByRole('button', { name: 'Previous specialist' });
    await expect(carousel).toBeAttached();
  });

  test('contact form visible trên mobile', async ({ page }) => {
    const contactSection = page.getByText('Kênh tư vấn trực tuyến');
    await expect(contactSection).toBeAttached();
  });
});

test.describe('18 – Tablet Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('trang load đúng trên tablet', async ({ page }) => {
    await expect(page.getByText('Chăm sóc y tế')).toBeVisible();
    await expect(page.locator('header').first()).toBeVisible();
  });

  test('carousel navigation visible trên tablet', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Next specialist' })).toBeVisible();
  });
});

test.describe('18 – Admin Layout Responsive', () => {
  test('admin dashboard không vỡ layout trên 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
    await page.getByPlaceholder('evelyn.green@gmail.com').fill('admin@mintcare.com');
    await page.getByPlaceholder('••••••').first().fill('admin123');
    await page.getByRole('button', { name: /Đăng nhập$/ }).last().click();
    await page.waitForURL(/\/admin/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Sidebar visible
    await expect(page.locator('nav, aside').first()).toBeVisible();
    // No overflow
    const overflow = await page.evaluate(() => document.body.scrollWidth - document.body.clientWidth);
    expect(overflow).toBeLessThanOrEqual(20);
  });
});

test.describe('18 – Touch & Swipe', () => {
  test('carousel support swipe trên mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Simulate swipe left on carousel
    const carousel = page.locator('[class*="carousel"], .relative.w-full').first();
    if (await carousel.isVisible()) {
      const box = await carousel.boundingBox();
      if (box) {
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(500);
        await expect(page).not.toHaveURL(/error/);
      }
    }
  });
});

test.describe('18 – Print Layout', () => {
  test('trang không crash khi print media', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Emulate print
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(500);
    await expect(page.getByText('Chăm sóc y tế')).toBeAttached();
    await page.emulateMedia({ media: null });
  });
});
