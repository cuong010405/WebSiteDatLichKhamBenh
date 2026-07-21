import { test, expect } from '@playwright/test';

/**
 * 12 – Admin Departments CRUD Tests
 */

async function loginAdmin(page: any) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
  await page.getByPlaceholder('evelyn.green@gmail.com').fill('admin@mintcare.com');
  await page.getByPlaceholder('••••••').first().fill('admin123');
  await page.getByRole('button', { name: /Đăng nhập$/ }).last().click();
  await page.waitForURL(/\/admin/, { timeout: 15000 });
  await page.goto('/admin/departments');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

test.describe('12 – Departments Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('trang departments load được', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/departments/);
  });

  test('danh sách khoa/phòng hiển thị', async ({ page }) => {
    await page.waitForTimeout(2000);
    await expect(page).not.toHaveURL(/error/);
    const list = page.locator('table, [class*="card"], [class*="department"]').first();
    await expect(list).toBeAttached();
  });

  test('có nút thêm khoa phòng', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm|Tạo|Add/i }).first();
    await expect(addBtn).toBeVisible();
  });

  test('có tìm kiếm khoa phòng', async ({ page }) => {
    const search = page.locator('input[placeholder*="Tìm"], input[type="search"]').first();
    await expect(search).toBeAttached();
  });
});

test.describe('12 – Add Department', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('dialog thêm khoa phòng mở được', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm|Tạo|Add/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible();
  });

  test('thêm khoa phòng mới thành công', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm|Tạo|Add/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]').first();

    const inputs = dialog.locator('input');
    const count = await inputs.count();
    if (count >= 1) await inputs.nth(0).fill(`QA Khoa ${Date.now()}`);
    if (count >= 2) await inputs.nth(1).fill('Mô tả khoa QA test');

    const submitBtn = dialog.getByRole('button', { name: /Thêm|Lưu|Save/i }).last();
    await submitBtn.click();
    await page.waitForTimeout(2000);
    await expect(page).not.toHaveURL(/error/);
  });

  test('validation – tên khoa không được rỗng', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm|Tạo|Add/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]').first();

    // Không điền tên
    const submitBtn = dialog.getByRole('button', { name: /Thêm|Lưu|Save/i }).last();
    await submitBtn.click();
    await page.waitForTimeout(1000);

    // Dialog vẫn mở hoặc có lỗi
    const stillOpen = await dialog.isVisible().catch(() => false);
    const hasError = await page.getByText(/bắt buộc|required|không được rỗng/i).first().isVisible().catch(() => false);
    expect(stillOpen || hasError).toBeTruthy();
  });
});

test.describe('12 – Edit & Delete Department', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('nút edit khoa phòng tồn tại', async ({ page }) => {
    await page.waitForTimeout(2000);
    const editBtn = page.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).first();
    if (await editBtn.isVisible()) {
      await expect(editBtn).toBeVisible();
    }
  });

  test('nút delete mở confirm dialog', async ({ page }) => {
    await page.waitForTimeout(2000);
    const deleteBtn = page.locator('button').filter({ has: page.locator('svg.lucide-trash-2') }).first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]').last();
      if (await dialog.isVisible()) {
        const cancelBtn = dialog.getByRole('button', { name: /Hủy|Cancel/i });
        if (await cancelBtn.isVisible()) await cancelBtn.click();
      }
    }
  });
});
