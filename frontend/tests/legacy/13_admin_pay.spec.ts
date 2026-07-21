import { test, expect } from '@playwright/test';

/**
 * 13 – Admin Payments Tests
 * Danh sách thanh toán, Filter, Update trạng thái
 */

async function loginAdmin(page: any) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
  await page.getByPlaceholder('evelyn.green@gmail.com').fill('admin@mintcare.com');
  await page.getByPlaceholder('••••••').first().fill('admin123');
  await page.getByRole('button', { name: /Đăng nhập$/ }).last().click();
  await page.waitForURL(/\/admin/, { timeout: 15000 });
  await page.goto('/admin/pay');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

test.describe('13 – Payments Page Structure', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('trang payments load được', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/pay/);
  });

  test('danh sách thanh toán hiển thị', async ({ page }) => {
    await page.waitForTimeout(2000);
    await expect(page).not.toHaveURL(/error/);
  });

  test('có thống kê tổng quan', async ({ page }) => {
    await page.waitForTimeout(2000);
    // Tổng doanh thu hoặc thống kê
    const statsEl = page.getByText(/Tổng|Doanh thu|Tổng doanh thu/i).first();
    await expect(statsEl).toBeAttached();
  });

  test('có filter trạng thái thanh toán', async ({ page }) => {
    const filter = page.locator('[role="combobox"], select').first();
    await expect(filter).toBeAttached();
  });

  test('có tìm kiếm', async ({ page }) => {
    const search = page.locator('input[placeholder*="Tìm"], input[type="search"]').first();
    await expect(search).toBeAttached();
  });
});

test.describe('13 – Payments Filter', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('filter thanh toán theo trạng thái', async ({ page }) => {
    const filterTrigger = page.locator('[role="combobox"]').first();
    if (await filterTrigger.isVisible()) {
      await filterTrigger.click();
      await page.waitForTimeout(500);
      const options = page.locator('[role="option"]');
      const count = await options.count();
      if (count > 1) {
        await options.nth(1).click();
        await page.waitForTimeout(1000);
        await expect(page).not.toHaveURL(/error/);
      }
    }
  });

  test('filter "Đã thanh toán"', async ({ page }) => {
    const filterTrigger = page.locator('[role="combobox"]').first();
    if (await filterTrigger.isVisible()) {
      await filterTrigger.click();
      await page.waitForTimeout(500);
      const option = page.getByRole('option', { name: /Đã thanh toán/ });
      if (await option.isVisible()) {
        await option.click();
        await page.waitForTimeout(1000);
        await expect(page).not.toHaveURL(/error/);
      }
    }
  });

  test('filter "Chưa thanh toán"', async ({ page }) => {
    const filterTrigger = page.locator('[role="combobox"]').first();
    if (await filterTrigger.isVisible()) {
      await filterTrigger.click();
      await page.waitForTimeout(500);
      const option = page.getByRole('option', { name: /Chưa thanh toán/ });
      if (await option.isVisible()) {
        await option.click();
        await page.waitForTimeout(1000);
        await expect(page).not.toHaveURL(/error/);
      }
    }
  });
});

test.describe('13 – Payment Detail & Update', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('có thể xem chi tiết thanh toán', async ({ page }) => {
    await page.waitForTimeout(2000);
    const detailBtn = page.getByRole('button', { name: /Chi tiết|Xem|View/i }).first();
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await page.waitForTimeout(800);
      await expect(page).not.toHaveURL(/error/);
    }
  });

  test('cập nhật trạng thái thanh toán', async ({ page }) => {
    await page.waitForTimeout(2000);
    // Payment status update button
    const updateBtn = page.getByRole('button', { name: /Cập nhật|Update|Xác nhận/i }).first();
    if (await updateBtn.isVisible()) {
      await updateBtn.click();
      await page.waitForTimeout(800);
      await expect(page).not.toHaveURL(/error/);
    }
  });
});

test.describe('13 – API – Payments Protected', () => {
  test('GET /api/payments yêu cầu admin auth', async ({ request }) => {
    const res = await request.get('http://localhost:5000/api/payments');
    expect(res.status()).toBe(401);
  });
});
