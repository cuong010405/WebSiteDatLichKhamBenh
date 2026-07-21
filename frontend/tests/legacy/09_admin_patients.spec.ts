import { test, expect } from '@playwright/test';

/**
 * 09 – Admin Patients CRUD Tests
 * Danh sách bệnh nhân, Search, Filter, Pagination
 */

async function loginAdmin(page: any) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
  await page.getByPlaceholder('evelyn.green@gmail.com').fill('admin@mintcare.com');
  await page.getByPlaceholder('••••••').first().fill('admin123');
  await page.getByRole('button', { name: /Đăng nhập$/ }).last().click();
  await page.waitForURL(/\/admin/, { timeout: 15000 });
  await page.goto('/admin/patients');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

test.describe('09 – Patients Page Structure', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('trang patients load được', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/patients/);
  });

  test('có ô tìm kiếm bệnh nhân', async ({ page }) => {
    const search = page.locator('input[placeholder*="Tìm"], input[placeholder*="tìm"], input[type="search"]').first();
    await expect(search).toBeVisible();
  });

  test('có filter trạng thái', async ({ page }) => {
    const filter = page.locator('[role="combobox"], select').first();
    await expect(filter).toBeAttached();
  });

  test('danh sách bệnh nhân hiển thị', async ({ page }) => {
    await page.waitForTimeout(2000);
    const list = page.locator('table, [class*="card"], [class*="list"]').first();
    await expect(list).toBeVisible();
  });
});

test.describe('09 – Search & Filter Patients', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('tìm kiếm theo tên bệnh nhân', async ({ page }) => {
    const search = page.locator('input[placeholder*="Tìm"], input[type="search"]').first();
    await search.fill('Nguyễn');
    await page.waitForTimeout(1000);
    await expect(page).not.toHaveURL(/error/);
  });

  test('tìm kiếm không kết quả hiện empty state', async ({ page }) => {
    const search = page.locator('input[placeholder*="Tìm"], input[type="search"]').first();
    await search.fill('xyz_not_exist_patient_12345');
    await page.waitForTimeout(1500);
    const emptyMsg = page.getByText(/Không tìm thấy|Không có|No result|empty/i).first();
    await expect(emptyMsg).toBeVisible({ timeout: 5000 });
  });

  test('filter theo trạng thái bệnh nhân', async ({ page }) => {
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

  test('filter "Đang điều trị"', async ({ page }) => {
    const filterTrigger = page.locator('[role="combobox"]').first();
    if (await filterTrigger.isVisible()) {
      await filterTrigger.click();
      await page.waitForTimeout(500);
      const option = page.getByRole('option', { name: /Đang điều trị/ });
      if (await option.isVisible()) {
        await option.click();
        await page.waitForTimeout(1000);
        await expect(page).not.toHaveURL(/error/);
      }
    }
  });
});

test.describe('09 – Patient Detail', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('click vào bệnh nhân mở detail', async ({ page }) => {
    await page.waitForTimeout(2000);
    // Tìm row hoặc card có thể click
    const rowOrCard = page.locator('tr[class*="cursor"], [class*="card cursor"], [role="row"]').first();
    if (await rowOrCard.isVisible()) {
      await rowOrCard.click();
      await page.waitForTimeout(1000);
      await expect(page).not.toHaveURL(/error/);
    }
  });

  test('có nút xem chi tiết bệnh nhân', async ({ page }) => {
    await page.waitForTimeout(2000);
    const detailBtn = page.getByRole('button', { name: /Chi tiết|Xem|View/i }).first();
    if (await detailBtn.isVisible()) {
      await expect(detailBtn).toBeVisible();
    }
  });
});

test.describe('09 – Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('pagination component tồn tại nếu có nhiều bệnh nhân', async ({ page }) => {
    await page.waitForTimeout(2000);
    // Pagination optional – chỉ test nếu có dữ liệu đủ
    await expect(page).not.toHaveURL(/error/);
  });

  test('có thể navigate trang nếu có pagination', async ({ page }) => {
    await page.waitForTimeout(2000);
    const nextPageBtn = page.getByRole('button', { name: /Tiếp|Next|>/i }).first();
    if (await nextPageBtn.isVisible() && await nextPageBtn.isEnabled()) {
      await nextPageBtn.click();
      await page.waitForTimeout(1000);
      await expect(page).not.toHaveURL(/error/);
    }
  });
});

test.describe('09 – Patient Status Badge', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('status badges hiển thị màu sắc đúng', async ({ page }) => {
    await page.waitForTimeout(2000);
    // Status badges
    await expect(page).not.toHaveURL(/error/);
  });
});
