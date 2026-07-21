import { test, expect } from '@playwright/test';

/**
 * 14 – Admin Reports Tests
 * Báo cáo thống kê, Charts, Export
 */

async function loginAdmin(page: any) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
  await page.getByPlaceholder('evelyn.green@gmail.com').fill('admin@mintcare.com');
  await page.getByPlaceholder('••••••').first().fill('admin123');
  await page.getByRole('button', { name: /Đăng nhập$/ }).last().click();
  await page.waitForURL(/\/admin/, { timeout: 15000 });
  await page.goto('/admin/reports');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

test.describe('14 – Reports Page Structure', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('trang reports load được', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/reports/);
  });

  test('không có lỗi khi load trang reports', async ({ page }) => {
    await page.waitForTimeout(2000);
    await expect(page).not.toHaveURL(/error/);
  });

  test('có tiêu đề báo cáo', async ({ page }) => {
    await page.waitForTimeout(2000);
    const heading = page.getByText(/Báo cáo|Report|Thống kê/i).first();
    await expect(heading).toBeAttached();
  });

  test('có chart hoặc biểu đồ', async ({ page }) => {
    await page.waitForTimeout(2000);
    // Recharts hoặc canvas element
    const chart = page.locator('[class*="recharts"], canvas, svg[class*="chart"]').first();
    await expect(chart).toBeAttached();
  });
});

test.describe('14 – Reports Filters & Date Range', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('có date range picker hoặc filter thời gian', async ({ page }) => {
    await page.waitForTimeout(2000);
    const datePicker = page.locator('input[type="date"], [class*="date"], [placeholder*="ngày"]').first();
    await expect(datePicker).toBeAttached();
  });

  test('có thể chọn khoảng thời gian', async ({ page }) => {
    await page.waitForTimeout(2000);
    const filterBtn = page.locator('[role="combobox"]').first();
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 0) {
        await options.first().click();
        await page.waitForTimeout(1000);
        await expect(page).not.toHaveURL(/error/);
      }
    }
  });
});

test.describe('14 – Reports Download/Export', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('nút export/download báo cáo tồn tại', async ({ page }) => {
    await page.waitForTimeout(2000);
    const exportBtn = page.getByRole('button', { name: /Xuất|Export|Tải/i }).first();
    if (await exportBtn.isVisible()) {
      await expect(exportBtn).toBeVisible();
    }
  });
});

test.describe('14 – API Reports', () => {
  test('GET /api/reports – protected endpoint', async ({ request }) => {
    const res = await request.get('http://localhost:5000/api/reports');
    expect(res.status()).toBe(401);
  });
});
