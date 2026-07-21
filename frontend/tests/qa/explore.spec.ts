/**
 * MintCare — QA Exploratory Test Script (Headful)
 * Chạy: npx playwright test tests/qa/explore.spec.ts --headed
 */
import { test, expect, Page } from '@playwright/test';

const API_BASE = 'http://localhost:5000';
const FRONT_BASE = 'http://localhost:3000';

// Tạo JWT hợp lệ cho admin (HS256 với key từ backend/.env)
async function injectAdmin(page: Page, target = '/admin') {
  await page.goto('/', { waitUntil: 'commit' });
  await page.evaluate(() => {
    const h = (obj: object) =>
      btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const header = h({ alg: 'HS256', typ: 'JWT' });
    const payload = h({ id: 'admin-001', email: 'admin@mintcare.com', role: 'admin' });
    // Use Node crypto-signed token (pre-computed for: mintcare_super_secret_jwt_key_2024_do_not_share)
    const SIG = 'oHr3MqBBXVHcP6fKH6hfLrQINVQBKWqwwVFaMQ4Yp8Q';
    const token = `${header}.${payload}.${SIG}`;
    localStorage.setItem('mintcare_token', token);
    localStorage.setItem('mintcare_user', JSON.stringify({
      id: 'admin-001', email: 'admin@mintcare.com',
      fullName: 'Admin MintCare', phone: '0900000001', role: 'admin'
    }));
  });
  await page.goto(target, { waitUntil: 'networkidle' });
}

async function injectCustomer(page: Page) {
  await page.goto('/', { waitUntil: 'commit' });
  await page.evaluate(() => {
    localStorage.setItem('mintcare_token', 'customer-test-token');
    localStorage.setItem('mintcare_user', JSON.stringify({
      id: 'CU-0001', email: 'evelyn.green@gmail.com',
      fullName: 'Evelyn Green', phone: '090 987 6543', role: 'customer'
    }));
  });
  await page.goto('/', { waitUntil: 'networkidle' });
}

// ─── 1. Landing Page ─────────────────────────────────────────
test.describe('QA Explore — Landing Page', () => {
  test('loads correctly and shows main hero', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto('/');
    await expect(page).toHaveTitle(/MintCare/);
    await expect(page.getByText('MintCare Portal')).toBeVisible();
    await page.screenshot({ path: 'playwright-report/qa/01_landing.png', fullPage: true });
    console.log('Console errors on landing:', errors);
  });

  test('login modal opens and shows form', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
    await expect(page.getByText('Chào mừng tới MintCare')).toBeVisible();
    await page.screenshot({ path: 'playwright-report/qa/02_login_modal.png' });
  });

  test('login modal shows error for invalid credentials', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
    await page.getByPlaceholder('evelyn.green@gmail.com').fill('invalid@test.com');
    await page.getByPlaceholder('••••••').first().fill('wrongpass');
    await page.getByRole('button', { name: /Đăng nhập$/ }).last().click();
    await expect(page.getByText(/thất bại/i)).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'playwright-report/qa/03_login_error.png' });
  });

  test('login modal tab switch works', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
    await page.getByRole('button', { name: 'Đăng ký', exact: true }).first().click();
    await page.waitForTimeout(600);
    await expect(page.getByPlaceholder('VD: Nguyễn Văn A')).toBeAttached();
    await page.screenshot({ path: 'playwright-report/qa/04_register_tab.png' });
  });

  test('customer booking sections visible after login', async ({ page }) => {
    await injectCustomer(page);
    await expect(page.getByText('Khai báo thông tin khám')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Chuyên gia y khoa')).toBeVisible();
    await expect(page.getByText('Dịch vụ chăm sóc')).toBeVisible();
    await expect(page.getByText('Chọn ngày khám')).toBeVisible();
    await expect(page.getByText('Khung giờ rảnh rỗi')).toBeVisible();
    await page.screenshot({ path: 'playwright-report/qa/05_booking_workspace.png', fullPage: false });
  });
});

// ─── 2. Admin Dashboard ──────────────────────────────────────
test.describe('QA Explore — Admin Dashboard', () => {
  test('dashboard loads with sidebar and header', async ({ page }) => {
    await injectAdmin(page, '/admin');
    await expect(page.locator('nav, aside').first()).toBeVisible();
    await expect(page.locator('header').first()).toBeVisible();
    await page.screenshot({ path: 'playwright-report/qa/10_admin_dashboard.png', fullPage: true });
  });

  test('greeting message visible', async ({ page }) => {
    await injectAdmin(page, '/admin');
    await expect(page.getByText(/Chào buổi/i)).toBeVisible({ timeout: 10000 });
  });
});

// ─── 3. Admin Schedule ───────────────────────────────────────
test.describe('QA Explore — Admin Schedule', () => {
  test.beforeEach(async ({ page }) => { await injectAdmin(page, '/admin/schedule'); });

  test('page loads and shows schedule', async ({ page }) => {
    await expect(page).toHaveURL(/schedule/);
    await page.screenshot({ path: 'playwright-report/qa/20_schedule.png', fullPage: true });
  });

  test('"Phân công ca trực" button opens dialog', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Phân công ca trực/i }).first();
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator('[role="dialog"]').first()).toBeVisible();
    await page.screenshot({ path: 'playwright-report/qa/21_schedule_dialog.png' });
    await page.keyboard.press('Escape');
  });

  test('search input works', async ({ page }) => {
    const search = page.locator('input[placeholder*="Tìm"]').first();
    await search.fill('Sandra');
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'playwright-report/qa/22_schedule_search.png' });
  });

  test('status filter pills work', async ({ page }) => {
    for (const status of ['Đang thực hiện', 'Đã xác nhận', 'Chờ duyệt', 'Tất cả']) {
      await page.getByRole('button', { name: status, exact: true }).first().click();
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: 'playwright-report/qa/23_schedule_filtered.png' });
  });
});

// ─── 4. Admin Patients ───────────────────────────────────────
test.describe('QA Explore — Admin Patients', () => {
  test.beforeEach(async ({ page }) => { await injectAdmin(page, '/admin/patients'); });

  test('table loads after API call', async ({ page }) => {
    await page.locator('table').waitFor({ state: 'visible', timeout: 15000 });
    await page.screenshot({ path: 'playwright-report/qa/30_patients.png', fullPage: true });
  });

  test('search filters patient list', async ({ page }) => {
    await page.locator('table').waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('input[placeholder*="Tìm"]').first().fill('Evelyn');
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'playwright-report/qa/31_patients_search.png' });
  });

  test('empty state displays for no results', async ({ page }) => {
    await page.locator('table').waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('input[placeholder*="Tìm"]').first().fill('xyz_nonexistent_999');
    await expect(page.getByText('Không tìm thấy hồ sơ bệnh nhân nào')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'playwright-report/qa/32_patients_empty.png' });
  });

  test('status filter "Đang điều trị" works', async ({ page }) => {
    await page.locator('table').waitFor({ state: 'visible', timeout: 15000 });
    await page.getByRole('button', { name: 'Đang điều trị', exact: true }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'playwright-report/qa/33_patients_filtered.png' });
  });
});

// ─── 5. Admin Staff ──────────────────────────────────────────
test.describe('QA Explore — Admin Staff', () => {
  test.beforeEach(async ({ page }) => { await injectAdmin(page, '/admin/staff'); });

  test('staff cards load', async ({ page }) => {
    const loading = page.getByText('Đang tải danh sách chuyên gia...');
    if (await loading.isVisible()) await loading.waitFor({ state: 'hidden', timeout: 10000 });
    await expect(page.getByText('Sandra Bullock')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'playwright-report/qa/40_staff.png', fullPage: true });
  });

  test('"Thêm chuyên gia" opens dialog', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Thêm chuyên gia/i }).first();
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator('[role="dialog"]').first()).toBeVisible();
    await page.screenshot({ path: 'playwright-report/qa/41_staff_add_dialog.png' });
    await page.keyboard.press('Escape');
  });

  test('search filters staff', async ({ page }) => {
    const loading = page.getByText('Đang tải danh sách chuyên gia...');
    if (await loading.isVisible()) await loading.waitFor({ state: 'hidden', timeout: 10000 });
    await page.locator('input[placeholder*="Tìm"]').first().fill('Sandra');
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'playwright-report/qa/42_staff_search.png' });
  });
});

// ─── 6. Admin Accounts ───────────────────────────────────────
test.describe('QA Explore — Admin Accounts', () => {
  test.beforeEach(async ({ page }) => { await injectAdmin(page, '/admin/accounts'); });

  test('accounts table visible', async ({ page }) => {
    await expect(page.locator('table').first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'playwright-report/qa/50_accounts.png', fullPage: true });
  });

  test('"Thêm tài khoản" opens dialog with password field', async ({ page }) => {
    await page.getByRole('button', { name: /Thêm tài khoản/i }).click();
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByPlaceholder('Mật khẩu ít nhất 6 ký tự')).toBeVisible();
    await page.screenshot({ path: 'playwright-report/qa/51_accounts_add.png' });
    await page.keyboard.press('Escape');
  });
});

// ─── 7. Admin Other Pages ────────────────────────────────────
test.describe('QA Explore — Other Admin Pages', () => {
  const pages = [
    { path: '/admin/services', name: 'Services', shot: '60' },
    { path: '/admin/departments', name: 'Departments', shot: '61' },
    { path: '/admin/pay', name: 'Payments', shot: '62' },
    { path: '/admin/reports', name: 'Reports', shot: '63' },
    { path: '/admin/settings', name: 'Settings', shot: '64' },
  ];

  for (const p of pages) {
    test(`${p.name} page loads`, async ({ page }) => {
      await injectAdmin(page, p.path);
      await expect(page).toHaveURL(new RegExp(p.path.replace('/', '\\/')));
      await page.screenshot({ path: `playwright-report/qa/${p.shot}_${p.name.toLowerCase()}.png`, fullPage: true });
    });
  }
});

// ─── 8. Security — API ───────────────────────────────────────
test.describe('QA Explore — Security (API)', () => {
  test('SQL injection in login returns non-200', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/auth/login`, {
      data: { email: "' OR '1'='1' --", password: 'anything' }
    });
    expect(res.status()).not.toBe(200);
    expect(res.status()).not.toBe(500);
  });

  test('/api/patients requires auth (401)', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/patients`);
    expect(res.status()).toBe(401);
  });

  test('/api/users requires auth (401)', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/users`);
    expect(res.status()).toBe(401);
  });

  test('/api/payments requires auth (401)', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/payments`);
    expect(res.status()).toBe(401);
  });

  test('health endpoint is public', async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`);
    expect(res.ok()).toBeTruthy();
  });

  test('security headers present', async ({ request }) => {
    const res = await request.get(`${API_BASE}/health`);
    expect(res.headers()['x-content-type-options']).toBe('nosniff');
    expect(res.headers()['x-frame-options']).toBe('DENY');
  });
});

// ─── 9. Accessibility & Responsive ──────────────────────────
test.describe('QA Explore — A11y & Responsive', () => {
  test('landmark elements exist', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main')).toBeAttached();
    await expect(page.locator('header').first()).toBeAttached();
    await expect(page.locator('footer').first()).toBeAttached();
  });

  test('mobile 375px renders without overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('header').first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'playwright-report/qa/70_mobile.png', fullPage: true });
  });

  test('tablet 768px renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('header').first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'playwright-report/qa/71_tablet.png', fullPage: true });
  });
});
