import { type Page } from '@playwright/test';
import * as crypto from 'crypto';

/* ──────────────────────── constants ──────────────────────── */
export const API_BASE = 'http://localhost:5000';
export const FRONTEND_BASE = 'http://localhost:3000';
export const JWT_SECRET = 'mintcare_super_secret_jwt_key_2024_do_not_share';

export const ADMIN_USER = {
  id: 'admin-001',
  email: 'admin@mintcare.com',
  fullName: 'Admin MintCare',
  phone: '0900000001',
  role: 'admin' as const,
};

export const CUSTOMER_USER = {
  id: 'CU-0001',
  email: 'evelyn.green@gmail.com',
  fullName: 'Evelyn Green',
  phone: '090 987 6543',
  role: 'customer' as const,
};

/* ──────────────────────── signature helper ──────────────────────── */
function signToken(payload: { id: string; email: string; role: string }): string {
  const header = { alg: 'HS256', typ: 'JWT' };

  const base64UrlEncode = (obj: object) => {
    return Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  const headerPart = base64UrlEncode(header);
  const payloadPart = base64UrlEncode(payload);

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${headerPart}.${payloadPart}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${headerPart}.${payloadPart}.${signature}`;
}

/* ──────────────────────── helpers ──────────────────────── */

/**
 * Inject admin session with a valid JWT signed by the test runner.
 */
export async function loginAsAdmin(page: Page, targetPath = '/admin') {
  await page.goto('/', { waitUntil: 'commit' });

  const token = signToken({
    id: ADMIN_USER.id,
    email: ADMIN_USER.email,
    role: ADMIN_USER.role,
  });

  await page.evaluate(({ user, token }) => {
    localStorage.setItem('mintcare_token', token);
    localStorage.setItem('mintcare_user', JSON.stringify(user));

    const usersRaw = localStorage.getItem('mintcare_users');
    let users: any[] = [];
    try { users = usersRaw ? JSON.parse(usersRaw) : []; } catch { users = []; }
    if (!users.some((u: any) => u.role === 'admin')) {
      users.push({ ...user, passwordHash: btoa('admin123') });
      localStorage.setItem('mintcare_users', JSON.stringify(users));
    }
  }, { user: ADMIN_USER, token });

  await page.goto(targetPath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
}

/**
 * Inject customer session with a valid JWT signed by the test runner.
 */
export async function loginAsCustomer(page: Page) {
  await page.goto('/', { waitUntil: 'commit' });

  const token = signToken({
    id: CUSTOMER_USER.id,
    email: CUSTOMER_USER.email,
    role: CUSTOMER_USER.role,
  });

  await page.evaluate(({ user, token }) => {
    localStorage.setItem('mintcare_token', token);
    localStorage.setItem('mintcare_user', JSON.stringify(user));

    const usersRaw = localStorage.getItem('mintcare_users');
    let users: any[] = [];
    try { users = usersRaw ? JSON.parse(usersRaw) : []; } catch { users = []; }
    if (!users.some((u: any) => u.email === user.email)) {
      users.push({ ...user, passwordHash: btoa('123456') });
      localStorage.setItem('mintcare_users', JSON.stringify(users));
    }
  }, { user: CUSTOMER_USER, token });

  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
}

/**
 * Đăng xuất
 */
export async function logout(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('mintcare_token');
    localStorage.removeItem('mintcare_user');
  });
}
