import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

test.describe('Patient — Admin CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, '/admin/patients');
    // Đợi bảng danh sách xuất hiện (hết trạng thái loading)
    await page.locator('table').waitFor({ state: 'visible', timeout: 15000 });
  });

  test('should load patients page', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/patients/);
  });

  test('should display patient list table', async ({ page }) => {
    const table = page.locator('table, [role="table"]').first();
    await expect(table).toBeVisible();
  });

  test('should have search input', async ({ page }) => {
    const search = page.locator('input[placeholder*="Tìm"], input[type="search"]').first();
    await expect(search).toBeVisible();
  });

  test('should search patients', async ({ page }) => {
    const search = page.locator('input[placeholder*="Tìm"], input[type="search"]').first();
    await search.fill('Nguyễn');
    await page.waitForTimeout(1000);
    // Bảng vẫn hiển thị sau khi search
    await expect(page.locator('table')).toBeVisible();
  });

  test('should show empty state for no results', async ({ page }) => {
    const search = page.locator('input[placeholder*="Tìm"], input[type="search"]').first();
    await search.fill('xyz_nonexistent_patient_999');
    await page.waitForTimeout(1500);
    const emptyMsg = page.getByText('Không tìm thấy hồ sơ bệnh nhân nào').first();
    await expect(emptyMsg).toBeVisible({ timeout: 5000 });
  });

  test('should have status filter buttons', async ({ page }) => {
    // Các nút lọc trạng thái lâm sàng (Tất cả, Đang điều trị...)
    const filterBtn = page.getByRole('button', { name: 'Đang điều trị', exact: true });
    await expect(filterBtn).toBeVisible();
  });
});
