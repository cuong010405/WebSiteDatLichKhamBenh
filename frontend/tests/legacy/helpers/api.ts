import type { APIRequestContext } from '@playwright/test';

/**
 * Base URL của backend API (chạy trên port 5000)
 * Frontend proxy /api/* → http://localhost:5000/api/*
 * Nhưng health endpoint cần gọi thẳng vào backend
 */
export const API_BASE = 'http://localhost:5000';

/**
 * Credentials mặc định cho admin test
 * Thay đổi nếu seed data khác
 */
const ADMIN_EMAIL = 'admin@mintcare.com';
const ADMIN_PASSWORD = 'Admin123!';

let _cachedToken: string | null = null;

/**
 * Lấy JWT token bằng cách đăng nhập với tài khoản admin.
 * Kết quả được cache để tránh gọi API nhiều lần.
 */
export async function getAdminToken(request: APIRequestContext): Promise<string | null> {
  if (_cachedToken) return _cachedToken;

  try {
    const res = await request.post(`${API_BASE}/api/auth/login`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });

    if (!res.ok()) return null;

    const body = await res.json();
    _cachedToken = body.token || body.accessToken || null;
    return _cachedToken;
  } catch {
    return null;
  }
}

/**
 * Gọi API với JWT token của admin.
 * Nếu không lấy được token, vẫn gọi bình thường (sẽ nhận 401).
 */
export async function apiWithAuth(
  request: APIRequestContext,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  data?: Record<string, unknown>,
) {
  const token = await getAdminToken(request);
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${path}`;

  switch (method) {
    case 'POST':
      return request.post(url, { headers, data });
    case 'PUT':
      return request.put(url, { headers, data });
    case 'DELETE':
      return request.delete(url, { headers });
    default:
      return request.get(url, { headers });
  }
}
