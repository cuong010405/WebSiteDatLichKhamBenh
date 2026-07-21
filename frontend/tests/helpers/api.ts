import { type APIRequestContext } from '@playwright/test';
import * as crypto from 'crypto';

export const API_BASE = 'http://localhost:5000';
export const JWT_SECRET = 'mintcare_super_secret_jwt_key_2024_do_not_share';

/**
 * Tạo token JWT hợp lệ trực tiếp qua thuật toán ký HS256
 */
export function getAdminToken(): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    id: 'admin-001',
    email: 'admin@mintcare.com',
    role: 'admin',
  };

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

/**
 * Gọi API bảo mật với Token Admin đã được ký
 */
export async function apiWithAuth(
  request: APIRequestContext,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  data?: object
) {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  switch (method) {
    case 'GET':
      return request.get(`${API_BASE}${path}`, { headers });
    case 'POST':
      return request.post(`${API_BASE}${path}`, { headers, data });
    case 'PUT':
      return request.put(`${API_BASE}${path}`, { headers, data });
    case 'DELETE':
      return request.delete(`${API_BASE}${path}`, { headers });
  }
}
