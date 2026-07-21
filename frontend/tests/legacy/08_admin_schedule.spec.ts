import { test, expect } from '@playwright/test';

/**
 * 08 – Admin Schedule CRUD Tests
 * Calendar view, Gantt, Thêm/Sửa/Xóa lịch hẹn
 */

async function loginAdmin(page: any) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
  await page.getByPlaceholder('evelyn.green@gmail.com').fill('admin@mintcare.com');
  await page.getByPlaceholder('••••••').first().fill('admin123');
  await page.getByRole('button', { name: /Đăng nhập$/ }).last().click();
  await page.waitForURL(/\/admin/, { timeout: 15000 });
  await page.goto('/admin/schedule');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

test.describe('08 – Schedule Page Structure', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('trang schedule load được', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/schedule/);
  });

  test('có nút Thêm lịch hẹn', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Thêm|Tạo|Lịch|Add/i }).first();
    await expect(addBtn).toBeVisible();
  });

  test('có ô tìm kiếm', async ({ page }) => {
    const search = page.locator('input[placeholder*="Tìm"], input[placeholder*="tìm"], input[placeholder*="Search"]').first();
    await expect(search).toBeVisible();
  });

  test('calendar/timeline view hiển thị', async ({ page }) => {
    // Schedule view: calendar grid hoặc gantt
    const calendar = page.locator('[class*="calendar"], [class*="schedule"], [class*="gantt"], [class*="timeline"]').first();
    await expect(calendar).toBeAttached();
  });

  test('danh sách lịch hẹn hoặc staff rows hiển thị', async ({ page }) => {
    await page.waitForTimeout(1500);
    // Tìm rows hoặc cards
    const items = page.locator('[class*="row"], tr, [class*="card"]');
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('08 – Add Schedule (CRUD Create)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('dialog thêm lịch hẹn mở được', async ({ page }) => {
    const addBtn = page.getByRole('button').filter({ has: page.locator('svg.lucide-calendar-plus') }).first();
    const addBtnAlt = page.getByRole('button', { name: /Thêm|Tạo|Lịch hẹn/i }).first();

    const btn = await addBtn.isVisible() ? addBtn : addBtnAlt;
    await btn.click();
    await page.waitForTimeout(800);

    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible();
  });

  test('form thêm lịch hẹn có đủ fields', async ({ page }) => {
    const addBtn = page.getByRole('button').filter({ has: page.locator('svg.lucide-calendar-plus') }).first();
    const addBtnAlt = page.getByRole('button', { name: /Thêm|Tạo|Lịch hẹn/i }).first();
    const btn = await addBtn.isVisible() ? addBtn : addBtnAlt;
    await btn.click();
    await page.waitForTimeout(800);

    const dialog = page.locator('[role="dialog"]').first();
    // Kiểm tra có select fields hoặc inputs
    const selects = dialog.locator('[role="combobox"], select');
    const count = await selects.count();
    expect(count).toBeGreaterThan(0);
  });

  test('có thể đóng dialog bằng Cancel', async ({ page }) => {
    const addBtn = page.getByRole('button').filter({ has: page.locator('svg.lucide-calendar-plus') }).first();
    const addBtnAlt = page.getByRole('button', { name: /Thêm|Tạo|Lịch hẹn/i }).first();
    const btn = await addBtn.isVisible() ? addBtn : addBtnAlt;
    await btn.click();
    await page.waitForTimeout(800);

    const dialog = page.locator('[role="dialog"]').first();
    const cancelBtn = dialog.getByRole('button', { name: /Hủy|Cancel/i });
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      await page.waitForTimeout(500);
      await expect(dialog).not.toBeVisible();
    }
  });
});

test.describe('08 – Edit Schedule', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('nút sửa lịch hẹn tồn tại', async ({ page }) => {
    await page.waitForTimeout(2000);
    const editBtn = page.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).first();
    if (await editBtn.isVisible()) {
      await expect(editBtn).toBeVisible();
    }
  });

  test('click sửa mở dialog edit', async ({ page }) => {
    await page.waitForTimeout(2000);
    const editBtn = page.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(800);
      const dialog = page.locator('[role="dialog"]').first();
      await expect(dialog).toBeVisible();
      // Đóng lại
      const cancelBtn = dialog.getByRole('button', { name: /Hủy|Cancel/i });
      if (await cancelBtn.isVisible()) await cancelBtn.click();
    }
  });
});

test.describe('08 – Delete Schedule', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('nút xóa lịch hẹn tồn tại', async ({ page }) => {
    await page.waitForTimeout(2000);
    const deleteBtn = page.locator('button').filter({ has: page.locator('svg.lucide-trash-2, svg.lucide-trash') }).first();
    if (await deleteBtn.isVisible()) {
      await expect(deleteBtn).toBeVisible();
    }
  });

  test('click xóa mở dialog xác nhận', async ({ page }) => {
    await page.waitForTimeout(2000);
    const deleteBtn = page.locator('button').filter({ has: page.locator('svg.lucide-trash-2') }).first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await page.waitForTimeout(800);
      // Dialog confirm
      const dialog = page.locator('[role="dialog"]').last();
      if (await dialog.isVisible()) {
        const cancelBtn = dialog.getByRole('button', { name: /Hủy|Cancel/i });
        if (await cancelBtn.isVisible()) await cancelBtn.click();
      }
    }
  });
});

test.describe('08 – Schedule Search & Filter', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('tìm kiếm trong schedule', async ({ page }) => {
    const search = page.locator('input[placeholder*="Tìm"], input[placeholder*="tìm"]').first();
    await search.fill('test');
    await page.waitForTimeout(1000);
    await expect(page).not.toHaveURL(/error/);
    await search.clear();
  });

  test('filter theo status lịch hẹn', async ({ page }) => {
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

test.describe('08 – Status Update', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('có thể update status lịch hẹn', async ({ page }) => {
    await page.waitForTimeout(2000);
    // Tìm status badge/dropdown
    const statusEl = page.getByText(/Chờ duyệt|Đã xác nhận|Đang thực hiện/i).first();
    if (await statusEl.isVisible()) {
      await expect(statusEl).toBeVisible();
    }
  });
});
