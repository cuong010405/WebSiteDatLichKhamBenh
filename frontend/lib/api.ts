export const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

/**
 * Authenticated fetch wrapper — attaches Bearer token from localStorage if present.
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window !== "undefined" ? localStorage.getItem("mintcare_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}
