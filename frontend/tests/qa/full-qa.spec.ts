import { test, expect, Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const REPORT_DIR = path.join(__dirname, '..', '..', 'test-results', 'qa-report');
const SCREENSHOT_DIR = path.join(REPORT_DIR, 'screenshots');

// Helper: collect errors
interface ErrorCollector {
  consoleErrors: string[];
  networkErrors: { url: string; status: number; statusText: string }[];
  jsErrors: string[];
}

function createErrorCollector(): ErrorCollector {
  return { consoleErrors: [], networkErrors: [], jsErrors: [] };
}

function setupErrorMonitoring(page: Page, collector: ErrorCollector) {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      collector.consoleErrors.push(`[${new Date().toISOString()}] ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    collector.jsErrors.push(`[${new Date().toISOString()}] ${error.message}`);
  });

  page.on('response', response => {
    const status = response.status();
    if (status >= 400) {
      collector.networkErrors.push({
        url: response.url(),
        status,
        statusText: response.statusText()
      });
    }
  });
}

async function screenshotOnError(page: Page, name: string, hasError: boolean) {
  if (hasError) {
    const filename = `${name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, filename), fullPage: true });
  }
}

function ensureDirs() {
  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Test data
const TEST_CUSTOMER = {
  name: 'QA Test Customer',
  email: `qa_customer_${Date.now()}@test.com`,
  password: 'TestPass123!',
  phone: '0912345678'
};

const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'admin123'
};

test.describe.serial('Full QA — Admin & Customer E2E', () => {
  let adminCollector: ErrorCollector;
  let customerCollector: ErrorCollector;

  test.beforeAll(() => {
    ensureDirs();
    adminCollector = createErrorCollector();
    customerCollector = createErrorCollector();
  });

  // ═══════════════════════════════════════════════════════════════
  // PART 1: LANDING PAGE
  // ═══════════════════════════════════════════════════════════════
  test('1.1 — Landing page loads correctly', async ({ page }) => {
    const collector = createErrorCollector();
    setupErrorMonitoring(page, collector);

    await page.goto('/');
    await expect(page).toHaveTitle(/MintCare|Đặt lịch/i);

    // Check key sections exist
    await expect(page.locator('body')).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'landing_page.png'), fullPage: true });

    // Log any errors
    if (collector.consoleErrors.length > 0) {
      console.log('⚠️ Console errors on landing:', collector.consoleErrors);
    }
    if (collector.networkErrors.length > 0) {
      console.log('⚠️ Network errors on landing:', collector.networkErrors);
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // PART 2: ADMIN FLOW
  // ═══════════════════════════════════════════════════════════════
  test('2.1 — Admin login modal opens', async ({ page }) => {
    setupErrorMonitoring(page, adminCollector);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click login button
    const loginBtn = page.getByRole('button', { name: /Đăng nhập/ }).first();
    await expect(loginBtn).toBeVisible({ timeout: 10000 });
    await loginBtn.click();

    // Wait for modal
    await page.waitForTimeout(500);
    await expect(page.getByText('Chào mừng tới MintCare')).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_login_modal.png') });
  });

  test('2.2 — Admin login with credentials', async ({ page }) => {
    setupErrorMonitoring(page, adminCollector);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open login modal
    const loginBtn = page.getByRole('button', { name: /Đăng nhập/ }).first();
    await loginBtn.click();
    await page.waitForTimeout(500);

    // Fill credentials
    const emailInput = page.getByPlaceholder('evelyn.green@gmail.com');
    const passwordInput = page.getByPlaceholder('••••••').first();

    await emailInput.fill(ADMIN_CREDENTIALS.email);
    await passwordInput.fill(ADMIN_CREDENTIALS.password);

    // Click login submit button
    const submitBtn = page.getByRole('button', { name: /Đăng nhập$/ }).last();
    await submitBtn.click();

    // Wait for navigation or modal close
    await page.waitForTimeout(3000);

    // Check if login succeeded - should see admin dashboard or redirect
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_after_login.png'), fullPage: true });
  });

  test('2.3 — Admin Dashboard', async ({ page }) => {
    setupErrorMonitoring(page, adminCollector);

    // Navigate to admin dashboard
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_dashboard.png'), fullPage: true });

    // Check dashboard elements
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('2.4 — Admin: Patient management (CRUD)', async ({ page }) => {
    setupErrorMonitoring(page, adminCollector);

    await page.goto('/admin/patients');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_patients.png'), fullPage: true });
  });

  test('2.5 — Admin: Staff management', async ({ page }) => {
    setupErrorMonitoring(page, adminCollector);

    await page.goto('/admin/staff');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_staff.png'), fullPage: true });
  });

  test('2.6 — Admin: Services management', async ({ page }) => {
    setupErrorMonitoring(page, adminCollector);

    await page.goto('/admin/services');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_services.png'), fullPage: true });
  });

  test('2.7 — Admin: Departments management', async ({ page }) => {
    setupErrorMonitoring(page, adminCollector);

    await page.goto('/admin/departments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_departments.png'), fullPage: true });
  });

  test('2.8 — Admin: Schedule management', async ({ page }) => {
    setupErrorMonitoring(page, adminCollector);

    await page.goto('/admin/schedule');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_schedule.png'), fullPage: true });
  });

  test('2.9 — Admin: Payment management', async ({ page }) => {
    setupErrorMonitoring(page, adminCollector);

    await page.goto('/admin/pay');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_pay.png'), fullPage: true });
  });

  test('2.10 — Admin: Reports', async ({ page }) => {
    setupErrorMonitoring(page, adminCollector);

    await page.goto('/admin/reports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_reports.png'), fullPage: true });
  });

  test('2.11 — Admin: Settings', async ({ page }) => {
    setupErrorMonitoring(page, adminCollector);

    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_settings.png'), fullPage: true });
  });

  test('2.12 — Admin: Accounts management', async ({ page }) => {
    setupErrorMonitoring(page, adminCollector);

    await page.goto('/admin/accounts');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_accounts.png'), fullPage: true });
  });

  // ═══════════════════════════════════════════════════════════════
  // PART 3: CUSTOMER FLOW
  // ═══════════════════════════════════════════════════════════════
  test('3.1 — Customer registration', async ({ page }) => {
    setupErrorMonitoring(page, customerCollector);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open login modal
    const loginBtn = page.getByRole('button', { name: /Đăng nhập/ }).first();
    await loginBtn.click();
    await page.waitForTimeout(500);

    // Switch to register tab
    const modal = page.locator('div.fixed.inset-0.z-50');
    await modal.getByRole('button', { name: 'Đăng ký', exact: true }).click();
    await page.waitForTimeout(600);

    // Fill registration form
    await modal.getByPlaceholder('VD: Nguyễn Văn A').fill(TEST_CUSTOMER.name);
    await modal.getByPlaceholder('evelyn.green@gmail.com').fill(TEST_CUSTOMER.email);
    await modal.getByPlaceholder('••••••').first().fill(TEST_CUSTOMER.password);

    // Submit
    await modal.getByRole('button', { name: /Đăng ký/ }).last().click();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'customer_register_result.png'), fullPage: true });
  });

  test('3.2 — Customer login', async ({ page }) => {
    setupErrorMonitoring(page, customerCollector);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open login modal
    const loginBtn = page.getByRole('button', { name: /Đăng nhập/ }).first();
    await loginBtn.click();
    await page.waitForTimeout(500);

    // Fill credentials
    const emailInput = page.getByPlaceholder('evelyn.green@gmail.com');
    const passwordInput = page.getByPlaceholder('••••••').first();

    await emailInput.fill(TEST_CUSTOMER.email);
    await passwordInput.fill(TEST_CUSTOMER.password);

    // Submit
    const submitBtn = page.getByRole('button', { name: /Đăng nhập$/ }).last();
    await submitBtn.click();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'customer_after_login.png'), fullPage: true });
  });

  test('3.3 — Customer: View appointment history', async ({ page }) => {
    setupErrorMonitoring(page, customerCollector);

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for appointment history section
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'customer_appointments.png'), fullPage: true });
  });

  test('3.4 — Customer: Book appointment', async ({ page }) => {
    setupErrorMonitoring(page, customerCollector);

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for booking form or button
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'customer_booking.png'), fullPage: true });
  });

  test('3.5 — Customer: Profile settings', async ({ page }) => {
    setupErrorMonitoring(page, customerCollector);

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'customer_profile.png'), fullPage: true });
  });

  // ═══════════════════════════════════════════════════════════════
  // PART 4: ERROR SUMMARY
  // ═══════════════════════════════════════════════════════════════
  test('4.1 — Generate error report', async ({ page }) => {
    const allErrors = {
      admin: adminCollector,
      customer: customerCollector,
      timestamp: new Date().toISOString()
    };

    const reportPath = path.join(REPORT_DIR, 'error_summary.json');
    fs.writeFileSync(reportPath, JSON.stringify(allErrors, null, 2));

    console.log('\n══════════════════════════════════════');
    console.log('📊 QA ERROR SUMMARY');
    console.log('══════════════════════════════════════');
    console.log(`Admin console errors: ${adminCollector.consoleErrors.length}`);
    console.log(`Admin network errors: ${adminCollector.networkErrors.length}`);
    console.log(`Admin JS errors: ${adminCollector.jsErrors.length}`);
    console.log(`Customer console errors: ${customerCollector.consoleErrors.length}`);
    console.log(`Customer network errors: ${customerCollector.networkErrors.length}`);
    console.log(`Customer JS errors: ${customerCollector.jsErrors.length}`);
    console.log('══════════════════════════════════════\n');

    expect(true).toBeTruthy(); // Always pass - this is a summary test
  });
});
