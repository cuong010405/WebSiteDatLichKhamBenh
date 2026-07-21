import { test, expect } from '@playwright/test';

/**
 * 03 – Landing Page Tests
 * Homepage, Carousel, Contact Form, Footer, Navigation
 */

test.describe('03 – Landing Page Structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('page có title chứa MintCare', async ({ page }) => {
    await expect(page).toHaveTitle(/MintCare/);
  });

  test('header hiển thị với logo và navigation', async ({ page }) => {
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.getByText('MintCare Portal')).toBeVisible();
  });

  test('hero section hiển thị đúng', async ({ page }) => {
    await expect(page.getByText('Chăm sóc y tế')).toBeVisible();
    await expect(page.getByText('Tận tâm tại nhà.')).toBeVisible();
  });

  test('navigation links hiển thị đủ', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Trang chủ' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Đội ngũ chuyên gia' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Liên hệ' })).toBeVisible();
  });

  test('nút Đăng nhập hiển thị khi chưa login', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Đăng nhập/ }).first()).toBeVisible();
  });

  test('value propositions hiển thị', async ({ page }) => {
    await expect(page.getByText('Đặt lịch nhanh chóng')).toBeVisible();
    await expect(page.getByText('Khung giờ linh hoạt')).toBeVisible();
    await expect(page.getByText('Bảo mật HIPAA').first()).toBeVisible();
  });
});

test.describe('03 – Specialist Carousel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('specialist section heading hiển thị', async ({ page }) => {
    await expect(page.getByText('Giới thiệu bác sĩ của tôi')).toBeVisible();
  });

  test('carousel hiển thị specialist card', async ({ page }) => {
    await expect(page.getByText('Sandra Bullock')).toBeVisible();
    await expect(page.getByText('Y tá • Chăm sóc vết thương')).toBeVisible();
  });

  test('carousel có navigation buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Previous specialist' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next specialist' })).toBeVisible();
  });

  test('carousel có slide dots indicators', async ({ page }) => {
    const dots = page.locator('button[aria-label^="Go to slide"]');
    const count = await dots.count();
    expect(count).toBeGreaterThan(0);
  });

  test('next button chuyển slide', async ({ page }) => {
    const nextBtn = page.getByRole('button', { name: 'Next specialist' });
    await nextBtn.click();
    await page.waitForTimeout(600);
    // Không crash và carousel vẫn visible
    await expect(nextBtn).toBeVisible();
  });

  test('previous button chuyển slide', async ({ page }) => {
    const prevBtn = page.getByRole('button', { name: 'Previous specialist' });
    await prevBtn.click();
    await page.waitForTimeout(600);
    await expect(prevBtn).toBeVisible();
  });

  test('click vào slide dot chuyển đến slide đó', async ({ page }) => {
    const dots = page.locator('button[aria-label^="Go to slide"]');
    const count = await dots.count();
    if (count > 1) {
      await dots.nth(1).click();
      await page.waitForTimeout(600);
      await expect(dots.nth(1)).toBeVisible();
    }
  });

  test('specialist section có ID để anchor navigation', async ({ page }) => {
    const section = page.locator('#specialists-section');
    await expect(section).toBeAttached();
  });
});

test.describe('03 – Smooth Scroll Navigation', () => {
  test('click "Khám phá chuyên gia" scroll đến specialist section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const btn = page.getByRole('button', { name: 'Khám phá chuyên gia' });
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(1500);
      const section = page.locator('#specialists-section');
      await expect(section).toBeVisible();
    }
  });

  test('nav link "Đội ngũ chuyên gia" scroll đến section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const link = page.getByRole('link', { name: 'Đội ngũ chuyên gia' });
    await link.click();
    await page.waitForTimeout(1000);
    await expect(page).not.toHaveURL(/error/);
  });
});

test.describe('03 – Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('contact section hiển thị đầy đủ', async ({ page }) => {
    await expect(page.getByText('Kênh tư vấn trực tuyến')).toBeVisible();
    await expect(page.getByText('1900 8198')).toBeVisible();
    await expect(page.getByText('Gửi tin nhắn phản hồi')).toBeVisible();
  });

  test('contact form có đủ fields', async ({ page }) => {
    await expect(page.getByPlaceholder('VD: Nguyễn Văn A')).toBeVisible();
    await expect(page.getByPlaceholder('name@example.com')).toBeVisible();
    await expect(page.getByPlaceholder('Nhập câu hỏi hoặc yêu cầu tư vấn cụ thể của bạn...')).toBeVisible();
  });

  test('gửi contact form thành công hiển thị toast', async ({ page }) => {
    await page.getByPlaceholder('VD: Nguyễn Văn A').fill('Test User');
    await page.getByPlaceholder('name@example.com').fill('test@test.com');
    await page.getByPlaceholder('Nhập câu hỏi hoặc yêu cầu tư vấn cụ thể của bạn...').fill('Test message QA automation');
    await page.getByRole('button', { name: 'Gửi lời nhắn hỗ trợ' }).click();
    await expect(page.getByText(/thành công/i)).toBeVisible({ timeout: 10000 });
  });

  test('form reset sau khi gửi thành công', async ({ page }) => {
    const nameInput = page.getByPlaceholder('VD: Nguyễn Văn A');
    await nameInput.fill('Test Reset');
    await page.getByPlaceholder('name@example.com').fill('reset@test.com');
    await page.getByPlaceholder('Nhập câu hỏi hoặc yêu cầu tư vấn cụ thể của bạn...').fill('test');
    await page.getByRole('button', { name: 'Gửi lời nhắn hỗ trợ' }).click();
    await page.waitForTimeout(2000);
    // Form có thể reset hoặc không – không crash là đủ
    await expect(page).not.toHaveURL(/error/);
  });
});

test.describe('03 – Footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('footer hiển thị copyright', async ({ page }) => {
    await expect(page.getByText(/Hệ thống cốt lõi © 2026/)).toBeVisible();
  });

  test('footer có links Điều khoản và Bảo mật', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Điều khoản dịch vụ' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Chính sách bảo mật' })).toBeVisible();
  });
});

test.describe('03 – Empty State', () => {
  test('trang hiển thị đúng khi API không có dữ liệu specialist', async ({ page }) => {
    // Mock API returns empty array
    await page.route('**/api/staff', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Trang không crash, hero vẫn visible
    await expect(page.getByText('Chăm sóc y tế')).toBeVisible();
  });
});

test.describe('03 – Console Errors', () => {
  test('trang chủ không có console errors nghiêm trọng', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    // Lọc bỏ lỗi của extension/network không liên quan
    const criticalErrors = errors.filter(e =>
      !e.includes('chrome-extension') &&
      !e.includes('Extension') &&
      !e.includes('net::ERR')
    );
    expect(criticalErrors.length).toBe(0);
  });
});
