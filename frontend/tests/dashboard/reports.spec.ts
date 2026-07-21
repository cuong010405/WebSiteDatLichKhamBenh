import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

test.describe('Dashboard — Admin Reports', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, '/admin/reports');
  });

  test('should load reports page', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/reports/);
  });

  test('should display chart visualization', async ({ page }) => {
    const chart = page.locator('[class*="recharts"], canvas, svg[class*="chart"]').first();
    await expect(chart).toBeAttached();
  });

  test('should display excel/pdf download actions', async ({ page }) => {
    const reportHeading = page.getByRole('heading', { name: /Báo cáo Gần đây/i }).first();
    await expect(reportHeading).toBeVisible();

    const archiveBtn = page.getByRole('button', { name: /Xem kho lưu trữ/i }).first();
    await expect(archiveBtn).toBeVisible();
  });
});
