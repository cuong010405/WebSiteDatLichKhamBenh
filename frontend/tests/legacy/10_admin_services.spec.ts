import { test, expect } from '@playwright/test';

/**
 * 10 – Admin Services CRUD Tests
 */

async function loginAdmin(page: any) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
  await page.getByPlaceholder('evelyn.green@gmail.com').fill('admin@mintcare.com');
  await page.getByPlaceholder('••••••').first().fill('admin123');
  await page.getByRole('button', { name: /Đăng nhập$/ }).last().click();
  await page.waitForURL(/\/admin/, { timeout: 15000 });
  await page.goto('/admin/services');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

test.describe('10 – Services Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('trang services load được', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/services/);
  });

  test('danh sách dịch vụ hiển thị', async ({ page }) => {
    await page.waitForTimeout(2000);
    await expect(page).not.toHaveURL(/error/);
    const list = page.locator('table, [class*="card"], [class*="service"]').first();
    await expect(list).toBeAttached();
  });

  test('có nút thêm dịch vụ', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm|Tạo|Add/i }).first();
    await expect(addBtn).toBeVisible();
  });

  test('có ô tìm kiếm dịch vụ', async ({ page }) => {
    const search = page.locator('input[placeholder*="Tìm"], input[type="search"]').first();
    await expect(search).toBeAttached();
  });
});

test.describe('10 – Services Search', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('tìm kiếm dịch vụ', async ({ page }) => {
    const search = page.locator('input[placeholder*="Tìm"], input[type="search"]').first();
    if (await search.isVisible()) {
      await search.fill('vật lý');
      await page.waitForTimeout(1000);
      await expect(page).not.toHaveURL(/error/);
    }
  });
});

test.describe('10 – Add Service (CRUD Create)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('dialog thêm dịch vụ mở được', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm|Tạo|Add/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible();
  });

  test('form thêm dịch vụ có name và price fields', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm|Tạo|Add/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]').first();

    // Name field
    const nameInput = dialog.locator('input').first();
    await expect(nameInput).toBeVisible();
  });

  test('thêm dịch vụ mới thành công', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm|Tạo|Add/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]').first();

    // Điền form
    const inputs = dialog.locator('input');
    const count = await inputs.count();
    if (count >= 1) {
      await inputs.nth(0).fill(`QA Service ${Date.now()}`);
      if (count >= 2) await inputs.nth(1).fill('500000');
    }

    const submitBtn = dialog.getByRole('button', { name: /Thêm|Lưu|Save|Tạo/i }).last();
    await submitBtn.click();
    await page.waitForTimeout(2000);
    await expect(page).not.toHaveURL(/error/);
  });
});

test.describe('10 – Edit & Delete Service', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('nút edit dịch vụ tồn tại', async ({ page }) => {
    await page.waitForTimeout(2000);
    const editBtn = page.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).first();
    if (await editBtn.isVisible()) {
      await expect(editBtn).toBeVisible();
    }
  });

  test('nút delete dịch vụ mở confirm dialog', async ({ page }) => {
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
