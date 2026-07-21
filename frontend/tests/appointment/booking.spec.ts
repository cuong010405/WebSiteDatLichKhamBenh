import { test, expect } from '@playwright/test';
import { loginAsCustomer } from '../helpers/auth';

test.describe('Appointment — Customer Booking', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCustomer(page);
  });

  test('should display booking workspace', async ({ page }) => {
    await expect(page.getByText('Khai báo thông tin khám')).toBeVisible({ timeout: 10000 });
  });

  test('should show specialist and service sections', async ({ page }) => {
    await expect(page.getByText('Chuyên gia y khoa')).toBeVisible();
    await expect(page.getByText('Dịch vụ chăm sóc')).toBeVisible();
  });

  test('should show date and time slot sections', async ({ page }) => {
    await expect(page.getByText('Chọn ngày khám')).toBeVisible();
    await expect(page.getByText('Khung giờ rảnh rỗi')).toBeVisible();
  });

  test('should display time slot buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: '08:00' })).toBeVisible();
    await expect(page.getByRole('button', { name: '10:00' })).toBeVisible();
  });

  test('should select a time slot', async ({ page }) => {
    const slot = page.getByRole('button', { name: '10:00' });
    await slot.click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Chi tiết thanh toán')).toBeVisible();
  });

  test('should show payment details section', async ({ page }) => {
    await expect(page.getByText('Chi tiết thanh toán')).toBeVisible();
  });

  test('should show medical profile section', async ({ page }) => {
    await expect(page.getByText('Hồ sơ y khoa')).toBeVisible();
  });
});
