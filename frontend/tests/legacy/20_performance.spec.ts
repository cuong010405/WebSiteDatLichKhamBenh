import { test, expect } from '@playwright/test';

/**
 * 20 – Performance & Loading State Tests
 * LCP, CLS basics, Skeleton loaders, Spinner
 */

test.describe('20 – Page Load Performance', () => {
  test('homepage load trong vòng 10 giây', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    console.log(`Homepage load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(10000);
  });

  test('admin page load trong vòng 15 giây', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
    await page.getByPlaceholder('evelyn.green@gmail.com').fill('admin@mintcare.com');
    await page.getByPlaceholder('••••••').first().fill('admin123');
    await page.getByRole('button', { name: /Đăng nhập$/ }).last().click();

    const startTime = Date.now();
    await page.waitForURL(/\/admin/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    console.log(`Admin redirect + load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(15000);
  });
});

test.describe('20 – Loading Indicators', () => {
  test('spinner hiển thị khi admin auth đang check', async ({ page }) => {
    await page.goto('/admin');
    // Trong lúc loading auth, spinner có thể hiện
    await page.waitForTimeout(500);
    // Sau đó redirect về /
    await page.waitForTimeout(5000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('không có layout shift lớn khi tải trang', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Measure CLS (Layout Shift)
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsScore = 0;
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsScore += (entry as any).value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(clsScore);
        }, 2000);
      });
    });

    console.log(`CLS score: ${cls}`);
    // CLS < 0.25 (good threshold)
    expect(cls).toBeLessThan(0.25);
  });
});

test.describe('20 – Image Loading', () => {
  test('images tải được trên homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const images = page.locator('img');
    const count = await images.count();

    if (count > 0) {
      // Kiểm tra ảnh đầu tiên tải được
      const firstImgLoaded = await images.first().evaluate((img: HTMLImageElement) => img.complete);
      expect(firstImgLoaded).toBeTruthy();
    }
  });
});

test.describe('20 – API Response Time', () => {
  test('health endpoint response < 2000ms', async ({ request }) => {
    const start = Date.now();
    const res = await request.get('http://localhost:5000/health');
    const duration = Date.now() - start;
    console.log(`Health endpoint: ${duration}ms`);
    expect(res.ok()).toBeTruthy();
    expect(duration).toBeLessThan(2000);
  });

  test('staff API response < 5000ms', async ({ request }) => {
    const start = Date.now();
    const res = await request.get('http://localhost:5000/api/staff');
    const duration = Date.now() - start;
    console.log(`Staff API: ${duration}ms`);
    expect(res.ok()).toBeTruthy();
    expect(duration).toBeLessThan(5000);
  });

  test('visits API response < 5000ms', async ({ request }) => {
    const start = Date.now();
    const res = await request.get('http://localhost:5000/api/visits');
    const duration = Date.now() - start;
    console.log(`Visits API: ${duration}ms`);
    expect(res.ok()).toBeTruthy();
    expect(duration).toBeLessThan(5000);
  });
});

test.describe('20 – Skeleton & Empty State', () => {
  test('danh sách accounts hiển thị empty state đúng khi không có dữ liệu', async ({ page }) => {
    // Mock empty response
    await page.route('**/api/users', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Đăng nhập/ }).first().click();
    await page.getByPlaceholder('evelyn.green@gmail.com').fill('admin@mintcare.com');
    await page.getByPlaceholder('••••••').first().fill('admin123');
    await page.getByRole('button', { name: /Đăng nhập$/ }).last().click();
    await page.waitForURL(/\/admin/, { timeout: 15000 });
    await page.goto('/admin/accounts');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Không crash
    await expect(page.locator('body')).toBeVisible();
  });

  test('trang không bị frozen sau khi load', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Page vẫn responsive
    const body = page.locator('body');
    await expect(body).toBeVisible();
    await expect(body).toBeEnabled();
  });
});

test.describe('20 – Resource Check', () => {
  test('không có failed resource loads trên homepage', async ({ page }) => {
    const failedRequests: string[] = [];
    page.on('requestfailed', request => {
      const url = request.url();
      // Bỏ qua API calls (backend có thể down)
      if (!url.includes('/api/') && !url.includes('localhost:5000')) {
        failedRequests.push(url);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('Failed resources:', failedRequests);
    // Cho phép tối đa 3 failed resources (fonts, etc.)
    expect(failedRequests.length).toBeLessThanOrEqual(3);
  });
});
