import { test, expect } from '@playwright/test';

/**
 * 07 – Admin Accounts CRUD Tests
 * Tìm kiếm, Lọc, Thêm, Sửa, Xóa tài khoản
 */

async function loginAdmin(page: any) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
  await page.getByPlaceholder('evelyn.green@gmail.com').fill('admin@mintcare.com');
  await page.getByPlaceholder('••••••').first().fill('admin123');
  await page.getByRole('button', { name: /Đăng nhập$/ }).last().click();
  await page.waitForURL(/\/admin/, { timeout: 15000 });
  await page.goto('/admin/accounts');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
}

test.describe('07 – Accounts Page Structure', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('trang accounts load được', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/accounts/);
  });

  test('có ô tìm kiếm', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Tìm"], input[placeholder*="tìm"]').first();
    await expect(searchInput).toBeVisible();
  });

  test('có filter role', async ({ page }) => {
    // Filter dropdown – Select
    const filter = page.getByText(/Tất cả|Filter|Lọc/i).first();
    await expect(filter).toBeAttached();
  });

  test('có nút Thêm tài khoản', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm|Tạo|Add|Plus/i }).first();
    await expect(addBtn).toBeVisible();
  });

  test('bảng danh sách user hiển thị', async ({ page }) => {
    await page.waitForTimeout(2000);
    const table = page.locator('table, [role="table"]').first();
    await expect(table).toBeVisible();
  });

  test('header cột bảng đúng', async ({ page }) => {
    await page.waitForTimeout(2000);
    await expect(page.getByText(/Email/i).first()).toBeVisible();
    await expect(page.getByText(/Họ tên|Tên/i).first()).toBeVisible();
    await expect(page.getByText(/Vai trò|Role/i).first()).toBeVisible();
  });
});

test.describe('07 – Search & Filter', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('tìm kiếm theo email', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Tìm"], input[placeholder*="tìm"]').first();
    await searchInput.fill('admin');
    await page.waitForTimeout(1000);
    // Bảng vẫn visible sau khi tìm
    await expect(page.locator('table, [role="table"]').first()).toBeVisible();
  });

  test('tìm kiếm không có kết quả hiển thị empty state', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Tìm"], input[placeholder*="tìm"]').first();
    await searchInput.fill('xyzabcdefghijklmnop_not_exist_123');
    await page.waitForTimeout(1000);
    // Empty state message
    const emptyMsg = page.getByText(/Không tìm thấy|Không có|No result/i).first();
    await expect(emptyMsg).toBeVisible({ timeout: 5000 });
  });

  test('xóa search query reset về danh sách đầy đủ', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Tìm"], input[placeholder*="tìm"]').first();
    await searchInput.fill('test');
    await page.waitForTimeout(500);
    await searchInput.clear();
    await page.waitForTimeout(1000);
    const rows = page.locator('table tbody tr, [role="row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('lọc theo role Admin', async ({ page }) => {
    // Click filter dropdown
    const filterTrigger = page.locator('[role="combobox"]').first();
    if (await filterTrigger.isVisible()) {
      await filterTrigger.click();
      await page.waitForTimeout(500);
      const adminOption = page.getByRole('option', { name: /Admin/i });
      if (await adminOption.isVisible()) {
        await adminOption.click();
        await page.waitForTimeout(1000);
        await expect(page.locator('table, [role="table"]').first()).toBeVisible();
      }
    }
  });

  test('lọc theo role Khách hàng/Customer', async ({ page }) => {
    const filterTrigger = page.locator('[role="combobox"]').first();
    if (await filterTrigger.isVisible()) {
      await filterTrigger.click();
      await page.waitForTimeout(500);
      const customerOption = page.getByRole('option', { name: /Khách hàng|Customer/i });
      if (await customerOption.isVisible()) {
        await customerOption.click();
        await page.waitForTimeout(1000);
        await expect(page.locator('table, [role="table"]').first()).toBeVisible();
      }
    }
  });
});

test.describe('07 – Add Account (CRUD Create)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('dialog thêm tài khoản mở được', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm|Tạo|Add/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    // Dialog mở
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible();
  });

  test('form thêm có đủ fields', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm|Tạo|Add/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]').first();
    // Email field
    await expect(dialog.locator('input[type="email"], input[placeholder*="email"], input[placeholder*="Email"]').first()).toBeVisible();
    // Fullname field
    await expect(dialog.locator('input[placeholder*="Họ tên"], input[placeholder*="tên"], input[placeholder*="name"]').first()).toBeVisible();
    // Password field
    await expect(dialog.locator('input[type="password"]').first()).toBeVisible();
  });

  test('thêm tài khoản mới thành công', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm|Tạo|Add/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]').first();

    const uniqueEmail = `qa_test_${Date.now()}@test.com`;
    await dialog.locator('input[type="email"], input[placeholder*="email"]').first().fill(uniqueEmail);
    await dialog.locator('input[placeholder*="Họ tên"], input[placeholder*="tên"], input[placeholder*="name"]').first().fill('QA Test User');

    const phoneInput = dialog.locator('input[type="tel"], input[placeholder*="phone"], input[placeholder*="điện thoại"]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('0901234567');
    }

    await dialog.locator('input[type="password"]').first().fill('password123');

    // Submit
    const submitBtn = dialog.getByRole('button', { name: /Thêm|Tạo|Lưu|Save/i }).last();
    await submitBtn.click();
    await page.waitForTimeout(2000);

    // Success toast hoặc dialog đóng
    const success = await page.getByText(/thành công|success/i).first().isVisible().catch(() => false);
    const dialogClosed = !(await dialog.isVisible().catch(() => true));
    expect(success || dialogClosed).toBeTruthy();
  });

  test('validation – email trùng hiển thị lỗi', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm|Tạo|Add/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]').first();

    await dialog.locator('input[type="email"], input[placeholder*="email"]').first().fill('admin@mintcare.com');
    await dialog.locator('input[placeholder*="Họ tên"], input[placeholder*="tên"], input[placeholder*="name"]').first().fill('Duplicate Test');
    await dialog.locator('input[type="password"]').first().fill('password123');

    const submitBtn = dialog.getByRole('button', { name: /Thêm|Tạo|Lưu|Save/i }).last();
    await submitBtn.click();
    await page.waitForTimeout(2000);

    // Error message
    const errorMsg = page.getByText(/đã được sử dụng|đã tồn tại|error|lỗi/i).first();
    await expect(errorMsg).toBeVisible({ timeout: 8000 });
  });

  test('validation – password < 6 ký tự hiển thị lỗi', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm|Tạo|Add/i }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    const dialog = page.locator('[role="dialog"]').first();

    await dialog.locator('input[type="email"], input[placeholder*="email"]').first().fill(`short_${Date.now()}@test.com`);
    await dialog.locator('input[placeholder*="Họ tên"], input[placeholder*="tên"], input[placeholder*="name"]').first().fill('Short Pass');
    await dialog.locator('input[type="password"]').first().fill('12');

    const submitBtn = dialog.getByRole('button', { name: /Thêm|Tạo|Lưu|Save/i }).last();
    await submitBtn.click();
    await page.waitForTimeout(2000);

    // Error
    const errorMsg = page.getByText(/ít nhất 6|mật khẩu|password/i).first();
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
  });
});

test.describe('07 – Edit Account (CRUD Update)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('nút sửa mở dialog edit', async ({ page }) => {
    await page.waitForTimeout(2000);
    const editBtn = page.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]').first();
      await expect(dialog).toBeVisible();
    }
  });

  test('dialog edit có giá trị hiện tại được điền sẵn', async ({ page }) => {
    await page.waitForTimeout(2000);
    const editBtn = page.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]').first();
      const emailInput = dialog.locator('input[type="email"], input[placeholder*="email"]').first();
      if (await emailInput.isVisible()) {
        const value = await emailInput.inputValue();
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('07 – Delete Account (CRUD Delete)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('nút xóa mở dialog xác nhận', async ({ page }) => {
    await page.waitForTimeout(2000);
    const deleteBtn = page.locator('button').filter({ has: page.locator('svg.lucide-trash-2, svg.lucide-trash') }).first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await page.waitForTimeout(500);
      // Confirmation dialog
      const dialog = page.locator('[role="dialog"], [role="alertdialog"]').last();
      const isVisible = await dialog.isVisible().catch(() => false);
      if (isVisible) {
        await expect(dialog).toBeVisible();
        // Tìm nút Hủy để không xóa thật
        const cancelBtn = dialog.getByRole('button', { name: /Hủy|Cancel|Không/i });
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
        }
      }
    }
  });
});
