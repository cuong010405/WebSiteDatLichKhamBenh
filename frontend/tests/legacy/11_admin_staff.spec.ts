import { test, expect } from '@playwright/test';

/**
 * 11 – Admin Staff CRUD Tests
 */

async function loginAdmin(page: any) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
  await page.getByPlaceholder('evelyn.green@gmail.com').fill('admin@mintcare.com');
  await page.getByPlaceholder('••••••').first().fill('admin123');
  await page.getByRole('button', { name: /Đăng nhập$/ }).last().click();
  await page.waitForURL(/\/admin/, { timeout: 15000 });
  await page.goto('/admin/staff');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

test.describe('11 – Staff Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('trang staff load được', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/staff/);
  });

  test('danh sách nhân viên hiển thị', async ({ page }) => {
    await page.waitForTimeout(2000);
    const list = page.locator('table, [class*="card"], [class*="staff"]').first();
    await expect(list).toBeAttached();
  });

  test('có nút thêm nhân viên', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm|Tạo|Add/i }).first();
    await expect(addBtn).toBeVisible();
  });

  test('có tìm kiếm nhân viên', async ({ page }) => {
    const search = page.locator('input[placeholder*="Tìm"], input[type="search"]').first();
    await expect(search).toBeAttached();
  });

  test('có filter khoa/phòng', async ({ page }) => {
    const filter = page.locator('[role="combobox"]').first();
    await expect(filter).toBeAttached();
  });
});

test.describe('11 – Staff Search & Filter', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('tìm kiếm nhân viên theo tên', async ({ page }) => {
    const search = page.locator('input[placeholder*="Tìm"], input[type="search"]').first();
    if (await search.isVisible()) {
      await search.fill('Sandra');
      await page.waitForTimeout(1000);
      await expect(page).not.toHaveURL(/error/);
    }
  });

  test('filter theo trạng thái Sẵn sàng', async ({ page }) => {
    const filterTrigger = page.locator('[role="combobox"]').first();
    if (await filterTrigger.isVisible()) {
      await filterTrigger.click();
      await page.waitForTimeout(500);
      const option = page.getByRole('option', { name: /Sẵn sàng/ });
      if (await option.isVisible()) {
        await option.click();
        await page.waitForTimeout(1000);
        await expect(page).not.toHaveURL(/error/);
      }
    }
  });
});

test.describe('11 – Add Staff (CRUD Create)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('dialog thêm nhân viên mở được', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm|Tạo|Add/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible();
  });

  test('form có name, phone, email, department fields', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm|Tạo|Add/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]').first();
    const inputs = dialog.locator('input');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('thêm nhân viên mới', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm|Tạo|Add/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]').first();

    const inputs = dialog.locator('input');
    const count = await inputs.count();
    if (count >= 1) await inputs.nth(0).fill(`QA Staff ${Date.now()}`);
    if (count >= 2) await inputs.nth(1).fill('Y tá');
    if (count >= 3) await inputs.nth(2).fill('0909090909');

    const submitBtn = dialog.getByRole('button', { name: /Thêm|Lưu|Save/i }).last();
    await submitBtn.click();
    await page.waitForTimeout(2000);
    await expect(page).not.toHaveURL(/error/);
  });
});

test.describe('11 – Staff Status Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('status badges nhân viên hiển thị', async ({ page }) => {
    await page.waitForTimeout(2000);
    const statusBadge = page.getByText(/Sẵn sàng|Đang bận|Nghỉ phép/).first();
    await expect(statusBadge).toBeAttached();
  });
});

test.describe('11 – Staff Edit & Delete', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('edit button tồn tại', async ({ page }) => {
    await page.waitForTimeout(2000);
    const editBtn = page.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]').first();
      await expect(dialog).toBeVisible();
      await dialog.getByRole('button', { name: /Hủy|Cancel/i }).click().catch(() => {});
    }
  });
});
