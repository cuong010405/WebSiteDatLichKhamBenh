import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

test.describe('Appointment — Admin Payments', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, '/admin/pay');
  });

  test('should load payments page', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/pay/);
  });

  test('should display payments data', async ({ page }) => {
    const table = page.locator('table, [role="table"], [class*="card"]').first();
    await expect(table).toBeAttached();
  });

  test('should display summary totals', async ({ page }) => {
    await expect(page.getByText(/Chờ thanh toán|Đã thanh toán|Tổng doanh thu/i).first()).toBeVisible();
  });

  test('should display payment creation form', async ({ page }) => {
    const formHeading = page.getByRole('heading', { name: /Form thanh toán/i }).first();
    await expect(formHeading).toBeVisible();

    // Verify method selection and amount input are visible
    const selectMethod = page.locator('select').last();
    await expect(selectMethod).toBeVisible();

    const amountInput = page.locator('input[placeholder*="500000"]').first();
    await expect(amountInput).toBeVisible();
  });
});
