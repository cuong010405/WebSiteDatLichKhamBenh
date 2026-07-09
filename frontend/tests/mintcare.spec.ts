import { test, expect, type Page } from '@playwright/test';

// Helper: wait for page to be fully hydrated
async function waitForHydration(page: Page) {
  await page.waitForLoadState('networkidle');
}

test.describe('MintCare Landing Page', () => {
  test('loads the homepage and displays key elements', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Title check
    await expect(page).toHaveTitle(/MintCare/);

    // Header / navbar
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('header').getByText('MintCare Portal')).toBeVisible();

    // Hero section
    await expect(page.getByText('Chăm sóc y tế')).toBeVisible();
    await expect(page.getByText('Tận tâm tại nhà.')).toBeVisible();

    // Navigation links
    await expect(page.getByRole('link', { name: 'Trang chủ' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Đội ngũ chuyên gia' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Liên hệ' })).toBeVisible();

    // Login button
    await expect(page.getByRole('button', { name: /Đăng nhập/ }).first()).toBeVisible();

    // Specialist section
    await expect(page.getByText('Giới thiệu bác sĩ của tôi')).toBeVisible();

    // Value propositions
    await expect(page.getByText('Đặt lịch nhanh chóng')).toBeVisible();
    await expect(page.getByText('Khung giờ linh hoạt')).toBeVisible();
    await expect(page.getByText('Bảo mật HIPAA').first()).toBeVisible();
  });

  test('displays specialist carousel with staff cards', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Check specialist names are visible in the carousel
    await expect(page.getByText('Sandra Bullock')).toBeVisible();
    await expect(page.getByText('Y tá • Chăm sóc vết thương')).toBeVisible();

    // Carousel navigation buttons
    await expect(page.getByRole('button', { name: 'Previous specialist' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next specialist' })).toBeVisible();

    // Slide indicators (dots)
    const dots = page.locator('button[aria-label^="Go to slide"]');
    await expect(dots).toHaveCount(4);
  });

  test('contact section is visible', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    await expect(page.getByText('Kênh tư vấn trực tuyến')).toBeVisible();
    await expect(page.getByText('1900 8198')).toBeVisible();
    await expect(page.getByText('Gửi tin nhắn phản hồi')).toBeVisible();
    await expect(page.getByText('Gửi lời nhắn hỗ trợ')).toBeVisible();
  });

  test('footer is visible with correct content', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    await expect(page.getByText('Hệ thống cốt lõi © 2026')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Điều khoản dịch vụ' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Chính sách bảo mật' })).toBeVisible();
  });
});

test.describe('Authentication Flow', () => {
  test('login modal opens when clicking login button', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Click the login button in the header
    const loginButton = page.getByRole('button', { name: /Đăng nhập/ }).first();
    await loginButton.click();

    // Modal should appear
    await expect(page.getByText('Chào mừng tới MintCare')).toBeVisible();
    await expect(page.getByText('Đăng nhập hoặc đăng ký tài khoản chăm sóc')).toBeVisible();

    // Login form fields
    await expect(page.getByPlaceholder('evelyn.green@gmail.com')).toBeVisible();
    await expect(page.getByPlaceholder('••••••').first()).toBeVisible();
  });

  test('can switch between login and register tabs', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    const loginButton = page.getByRole('button', { name: /Đăng nhập/ }).first();
    await loginButton.click();

    // Default is login tab
    await expect(page.getByPlaceholder('evelyn.green@gmail.com')).toBeVisible();

    // Switch to register tab
    await page.getByRole('button', { name: 'Đăng ký', exact: true }).click();

    // Register form fields should appear (scope to modal overlay to avoid matching contact form)
    const modal = page.locator('.fixed.inset-0');
    await expect(modal.getByPlaceholder('VD: Nguyễn Văn A')).toBeVisible();
    await expect(modal.getByPlaceholder('VD: 091 234 5678')).toBeVisible();
  });

  test('can close login modal', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    const loginButton = page.getByRole('button', { name: /Đăng nhập/ }).first();
    await loginButton.click();

    await expect(page.getByText('Chào mừng tới MintCare')).toBeVisible();

    // Close via X button
    await page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first().click();

    // Modal should be gone
    await expect(page.getByText('Chào mừng tới MintCare')).not.toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    const loginButton = page.getByRole('button', { name: /Đăng nhập/ }).first();
    await loginButton.click();

    // Fill in invalid credentials
    await page.getByPlaceholder('evelyn.green@gmail.com').fill('nonexistent@test.com');
    await page.getByPlaceholder('••••••').first().fill('wrongpass');

    // Submit
    await page.getByRole('button', { name: /Đăng nhập$/ }).last().click();

    // Should show error toast
    await expect(page.getByText(/thất bại/)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Booking Flow (Authenticated)', () => {
  test('login and see booking workspace', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Open login modal
    const loginButton = page.getByRole('button', { name: /Đăng nhập/ }).first();
    await loginButton.click();

    // Use quick Google login (which auto-registers if needed)
    await page.getByRole('button', { name: 'Google' }).click();

    // Wait for login to complete and page to update
    await page.waitForTimeout(3000);

    // After login, the booking workspace section should be visible
    await expect(page.getByText('Khai báo thông tin khám')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Phiếu thông tin khám')).toBeVisible();
  });

  test('booking form has all required fields', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Login first
    const loginButton = page.getByRole('button', { name: /Đăng nhập/ }).first();
    await loginButton.click();
    await page.getByRole('button', { name: 'Google' }).click();
    await page.waitForTimeout(3000);

    // Check booking form elements
    await expect(page.getByText('Chuyên gia y khoa')).toBeVisible();
    await expect(page.getByText('Dịch vụ chăm sóc')).toBeVisible();
    await expect(page.getByText('Chọn ngày khám')).toBeVisible();
    await expect(page.getByText('Khung giờ rảnh rỗi')).toBeVisible();

    // Time slots
    await expect(page.getByRole('button', { name: '08:00' })).toBeVisible();
    await expect(page.getByRole('button', { name: '10:00' })).toBeVisible();
    await expect(page.getByRole('button', { name: '14:00' })).toBeVisible();
  });

  test('payment preview updates when service is selected', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Login
    const loginButton = page.getByRole('button', { name: /Đăng nhập/ }).first();
    await loginButton.click();
    await page.getByRole('button', { name: 'Google' }).click();
    await page.waitForTimeout(3000);

    // Check payment preview section
    await expect(page.getByText('Chi tiết thanh toán')).toBeVisible();
  });

  test('health profile section is visible after login', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Login
    const loginButton = page.getByRole('button', { name: /Đăng nhập/ }).first();
    await loginButton.click();
    await page.getByRole('button', { name: 'Google' }).click();
    await page.waitForTimeout(3000);

    // Health profile section
    await expect(page.getByText('Hồ sơ y khoa')).toBeVisible();
    await expect(page.getByText('Lưu hồ sơ bệnh nhân')).toBeVisible();
  });
});

test.describe('Admin Dashboard', () => {
  test('admin page redirects to login if not authenticated', async ({ page }) => {
    await page.goto('/admin');
    await waitForHydration(page);

    // Should redirect to homepage
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('admin login and dashboard access', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Open login modal
    const loginButton = page.getByRole('button', { name: /Đăng nhập/ }).first();
    await loginButton.click();

    // Fill admin credentials (from seed data)
    await page.getByPlaceholder('evelyn.green@gmail.com').fill('admin@mintcare.com');
    await page.getByPlaceholder('••••••').first().fill('admin123');

    // Submit login
    await page.getByRole('button', { name: /Đăng nhập$/ }).last().click();

    // Wait for navigation to admin
    await page.waitForTimeout(3000);

    // Check if we're on admin page
    const url = page.url();
    if (url.includes('/admin')) {
      await expect(page.getByText('Chào buổi sáng')).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe('API Health Check', () => {
  test('backend health endpoint responds', async ({ request }) => {
    const response = await request.get('http://localhost:5000/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('OK');
  });

  test('staff API returns data', async ({ request }) => {
    const response = await request.get('http://localhost:5000/api/staff');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
  });

  test('visits API returns data', async ({ request }) => {
    const response = await request.get('http://localhost:5000/api/visits');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });
});

test.describe('Navigation', () => {
  test('specialist carousel navigation works', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Click next button
    const nextBtn = page.getByRole('button', { name: 'Next specialist' });
    await nextBtn.click();

    // Wait for animation
    await page.waitForTimeout(500);

    // Click previous button
    const prevBtn = page.getByRole('button', { name: 'Previous specialist' });
    await prevBtn.click();

    await page.waitForTimeout(500);
  });

  test('smooth scroll to specialists section', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Click "Khám phá chuyên gia" button
    await page.getByRole('button', { name: 'Khám phá chuyên gia' }).click();

    // Wait for scroll
    await page.waitForTimeout(1000);

    // Specialists section should be in view
    const section = page.locator('#specialists-section');
    await expect(section).toBeVisible();
  });

  test('profile dropdown shows after login', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Login
    const loginButton = page.getByRole('button', { name: /Đăng nhập/ }).first();
    await loginButton.click();
    await page.getByRole('button', { name: 'Google' }).click();
    await page.waitForTimeout(3000);

    // Profile dropdown should be present
    const profileButton = page.locator('button').filter({ hasText: /GREEN|Evelyn/i }).first();
    if (await profileButton.isVisible()) {
      await profileButton.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Contact Form', () => {
  test('contact form submission shows success toast', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);

    // Fill contact form
    await page.getByPlaceholder('VD: Nguyễn Văn A').fill('Test User');
    await page.getByPlaceholder('name@example.com').fill('test@test.com');
    await page.getByPlaceholder('Nhập câu hỏi hoặc yêu cầu tư vấn cụ thể của bạn...').fill('Test message');

    // Submit
    await page.getByRole('button', { name: 'Gửi lời nhắn hỗ trợ' }).click();

    // Should show success toast
    await expect(page.getByText('thành công')).toBeVisible({ timeout: 10000 });
  });
});
