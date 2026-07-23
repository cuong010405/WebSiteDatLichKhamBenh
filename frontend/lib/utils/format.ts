/**
 * Utilities for formatting currency, numbers, and dates
 */

/**
 * Formats a raw number or string value into Vietnamese currency input string with dots (e.g. 2000000 -> 2.000.000)
 */
export function formatCurrencyInput(val: string | number | null | undefined): string {
  if (val === null || val === undefined || val === "") return "";
  // Remove non-digit characters
  const cleanStr = String(val).replace(/\D/g, "");
  if (!cleanStr) return "";
  const num = parseInt(cleanStr, 10);
  if (isNaN(num)) return "";
  return num.toLocaleString("vi-VN");
}

/**
 * Converts a formatted currency string (e.g. "2.000.000") back to integer number (e.g. 2000000)
 */
export function parseCurrencyNumber(val: string | number | null | undefined): number {
  if (val === null || val === undefined || val === "") return 0;
  const cleanStr = String(val).replace(/\D/g, "");
  if (!cleanStr) return 0;
  const num = parseInt(cleanStr, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Formats a number to Vietnamese currency string with suffix "đ" or "VNĐ"
 */
export function formatVND(val: number | string | null | undefined): string {
  const num = typeof val === "number" ? val : parseCurrencyNumber(val);
  return `${num.toLocaleString("vi-VN")}đ`;
}

/**
 * Returns formatted real-time Vietnamese date string (e.g., "Thứ Năm, 23/07/2026")
 */
export function formatVietnameseDate(dateInput?: Date | string | null): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return "";
  
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const dayName = days[d.getDay()];
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  
  return `${dayName}, ${day}/${month}/${year}`;
}
