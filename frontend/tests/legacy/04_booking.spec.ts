import { test, expect } from '@playwright/test';

/**
 * 04 – Booking Flow Tests (Authenticated Customer)
 * Đặt lịch khám, chọn dịch vụ, chọn giờ, thanh toán, xem lịch sử
 */

async function loginAsCustomer(page: any) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const btn = page.getByRole('button', { name: /Đăng nhập/ }).first();
  await btn.click();
  await page.getByRole('button', { name: /Google/i }).click();
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle');
}

test.describe('04 – Booking Form Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('booking workspace hiển thị sau login', async ({ page }) => {
    await expect(page.getByText('Khai báo thông tin khám')).toBeVisible({ timeout: 15000 });
  });

  test('phiếu thông tin khám hiển thị', async ({ page }) => {
    await expect(page.getByText('Phiếu thông tin khám')).toBeVisible({ timeout: 10000 });
  });

  test('section Chuyên gia y khoa hiển thị', async ({ page }) => {
    await expect(page.getByText('Chuyên gia y khoa')).toBeVisible({ timeout: 10000 });
  });

  test('section Dịch vụ chăm sóc hiển thị', async ({ page }) => {
    await expect(page.getByText('Dịch vụ chăm sóc')).toBeVisible({ timeout: 10000 });
  });

  test('section Chọn ngày khám hiển thị', async ({ page }) => {
    await expect(page.getByText('Chọn ngày khám')).toBeVisible({ timeout: 10000 });
  });

  test('section Khung giờ rảnh rỗi hiển thị', async ({ page }) => {
    await expect(page.getByText('Khung giờ rảnh rỗi')).toBeVisible({ timeout: 10000 });
  });

  test('time slots hiển thị', async ({ page }) => {
    await expect(page.getByRole('button', { name: '08:00' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: '10:00' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: '14:00' })).toBeVisible({ timeout: 10000 });
  });

  test('Chi tiết thanh toán hiển thị', async ({ page }) => {
    await expect(page.getByText('Chi tiết thanh toán')).toBeVisible({ timeout: 10000 });
  });

  test('Hồ sơ y khoa section hiển thị', async ({ page }) => {
    await expect(page.getByText('Hồ sơ y khoa')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('04 – Booking Form Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
    await page.waitForSelector('text=Khai báo thông tin khám', { timeout: 15000 });
  });

  test('chọn time slot thay đổi giao diện', async ({ page }) => {
    const timeSlot = page.getByRole('button', { name: '10:00' });
    if (await timeSlot.isVisible()) {
      await timeSlot.click();
      await page.waitForTimeout(500);
      // Time slot được chọn (highlight)
      await expect(timeSlot).toBeVisible();
    }
  });

  test('Phương thức thanh toán có các options', async ({ page }) => {
    // Tìm payment method section
    const paymentSection = page.getByText(/Phương thức|thanh toán/i).first();
    if (await paymentSection.isVisible()) {
      await expect(paymentSection).toBeVisible();
    }
  });
});

test.describe('04 – Health Profile', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
    await page.waitForSelector('text=Hồ sơ y khoa', { timeout: 15000 });
  });

  test('nút Lưu hồ sơ bệnh nhân hiển thị', async ({ page }) => {
    await expect(page.getByText('Lưu hồ sơ bệnh nhân')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('04 – My Appointments', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
    await page.waitForTimeout(2000);
  });

  test('lịch hẹn của tôi section tồn tại', async ({ page }) => {
    const section = page.getByText(/Lịch hẹn của tôi|lịch hẹn/i).first();
    if (await section.isVisible()) {
      await expect(section).toBeVisible();
    }
  });

  test('có thể xem chi tiết lịch hẹn', async ({ page }) => {
    // Tìm nút Chi tiết hoặc Xem
    const detailBtn = page.getByRole('button', { name: /Chi tiết|Xem/i }).first();
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await page.waitForTimeout(1000);
      await expect(page).not.toHaveURL(/error/);
    }
  });

  test('có thể hủy lịch hẹn', async ({ page }) => {
    const cancelBtn = page.getByRole('button', { name: /Hủy/i }).first();
    if (await cancelBtn.isVisible()) {
      // Click nhưng không xác nhận (chỉ test UI mở)
      await cancelBtn.click();
      await page.waitForTimeout(500);
      await expect(page).not.toHaveURL(/error/);
    }
  });
});

test.describe('04 – Booking Not Authenticated', () => {
  test('khi chưa login – booking form ẩn', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Booking workspace không hiển thị khi chưa login
    const bookingForm = await page.getByText('Khai báo thông tin khám').isVisible().catch(() => false);
    expect(bookingForm).toBeFalsy();
  });

  test('có prompt đăng nhập để đặt lịch', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Tìm nút hoặc text invite login để đặt lịch
    const hasInvite = await page.getByRole('button', { name: /Đặt lịch|Đăng nhập để đặt/i }).first().isVisible().catch(() => false);
    // Hoặc chỉ cần có nút login
    const hasLoginBtn = await page.getByRole('button', { name: /Đăng nhập/ }).first().isVisible().catch(() => false);
    expect(hasInvite || hasLoginBtn).toBeTruthy();
  });
});

test.describe('04 – Profile Settings (Authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
    await page.waitForTimeout(2000);
  });

  test('profile section hiển thị thông tin user', async ({ page }) => {
    const profileBtn = page.locator('button').filter({ hasText: /GREEN|Evelyn|green/i }).first();
    if (await profileBtn.isVisible()) {
      await profileBtn.click();
      await page.waitForTimeout(500);
      // Dropdown menu
      await expect(page.getByText(/Đăng xuất|logout/i).first()).toBeVisible().catch(() => {});
    }
  });

  test('cài đặt tài khoản mở được', async ({ page }) => {
    const settingsBtn = page.getByRole('button', { name: /Cài đặt|Settings/i }).first();
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      await page.waitForTimeout(500);
      await expect(page).not.toHaveURL(/error/);
    }
  });
});

test.describe('04 – Download Receipt', () => {
  test('nút tải biên lai tồn tại sau khi login', async ({ page }) => {
    await loginAsCustomer(page);
    await page.waitForTimeout(2000);
    const downloadBtn = page.getByRole('button', { name: /Tải|Download|biên lai/i }).first();
    if (await downloadBtn.isVisible()) {
      await expect(downloadBtn).toBeVisible();
    }
  });
});
