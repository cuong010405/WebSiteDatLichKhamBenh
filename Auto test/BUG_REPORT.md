# BUG_REPORT.md — MintCare Healthcare Portal

**Ngày:** 2026-07-16  
**Môi trường:** localhost:3000 + localhost:5000  
**Công cụ phát hiện:** Playwright Automated Testing + Manual Exploration

---

## Phân loại mức độ

| Mức độ | Mô tả |
|---|---|
| 🔴 Critical | Hệ thống không hoạt động, crash hoàn toàn |
| 🟠 High | Chức năng chính bị lỗi, ảnh hưởng người dùng trực tiếp |
| 🟡 Medium | Chức năng phụ lỗi hoặc UX bị ảnh hưởng |
| 🟢 Low | Lỗi nhỏ, cosmetic, ít ảnh hưởng |

---

## BUG-001 🟠 HIGH — Database chưa seed User table

**Tiêu đề:** Backend không có tài khoản admin trong database

**Mô tả:**  
File `prisma/seed.ts` chỉ seed `Staff`, `Patient`, `Visit`, `ActivityLog` nhưng không seed bảng `User`. Khi test hoặc người dùng mới cố đăng nhập với tài khoản `admin@mintcare.com`, backend trả về lỗi 401 vì email không tồn tại trong DB.

**Console Error:**
```
Backend auth failed, using local fallback: Error: Email hoặc mật khẩu không chính xác
at login (lib/auth-context.tsx:177:15)
```

**File liên quan:**
- `backend/prisma/seed.ts` — thiếu User seed data
- `frontend/lib/auth-context.tsx:177` — throw error khi backend trả 401

**Tái hiện:**
1. Đảm bảo backend đang chạy
2. Mở `localhost:3000`
3. Điền email `admin@mintcare.com`, password `admin123`
4. Click đăng nhập → **Error: Email hoặc mật khẩu không chính xác**

**Giải pháp:**
```typescript
// Thêm vào backend/prisma/seed.ts
import bcrypt from 'bcryptjs';

const userData = [
  {
    email: 'admin@mintcare.com',
    passwordHash: await bcrypt.hash('admin123', 10),
    fullName: 'Admin MintCare',
    phone: '0900000001',
    role: 'admin',
  },
  {
    email: 'evelyn.green@gmail.com',
    passwordHash: await bcrypt.hash('123456', 10),
    fullName: 'Evelyn Green',
    phone: '090 987 6543',
    role: 'customer',
  }
];

for (const u of userData) {
  await prisma.user.upsert({
    where: { email: u.email },
    update: {},
    create: u,
  });
}
```

**Workaround hiện tại:** Frontend có LocalStorage fallback auth, hoạt động khi backend fail.

---

## BUG-002 🟠 HIGH — Schedule Page: 401 khi load Patients list

**Tiêu đề:** Trang Schedule log lỗi "Token không hợp lệ hoặc đã hết hạn" khi load

**Mô tả:**  
`/admin/schedule` gọi `authFetch('/api/patients')` khi load. Khi token trong localStorage không phải JWT thật được ký bởi backend, request bị reject 401. Trang vẫn hiển thị nhưng danh sách bệnh nhân để phân công ca trực sẽ rỗng.

**Console Error:**
```
[SchedulePage] Lỗi tải dữ liệu lịch trình: Error: Patients fetch failed 401: 
{"error":"Token không hợp lệ hoặc đã hết hạn"}
    at SchedulePage.useCallback[loadData] (app/admin/schedule/page.tsx:1253:17)
```

**File liên quan:**
- `frontend/app/admin/schedule/page.tsx:1250-1260`
- `backend/src/middleware/auth.ts:31` — JWT verify

**Tái hiện:**
1. Đăng nhập qua LocalStorage fallback (token không phải JWT thật)
2. Vào `/admin/schedule`
3. Console log 401 error

**Giải pháp:**
- Ưu tiên: Seed User table (xem BUG-001) để đăng nhập thật
- Hoặc: Thêm error handling hiển thị friendly message thay vì console.error

---

## BUG-003 🟡 MEDIUM — Password form thiếu client-side minLength validation

**Tiêu đề:** Form không báo lỗi ngay khi nhập mật khẩu < 6 ký tự

**Mô tả:**  
Input mật khẩu trong modal đăng ký và dialog "Thêm tài khoản" chỉ có `required` attribute. Khi nhập password ngắn hơn 6 ký tự và submit, browser sẽ submit form và chờ backend trả lỗi (latency cao, UX kém).

**File liên quan:**
- `frontend/app/page.tsx` — register form password input (line ~2940)
- `frontend/app/admin/accounts/page.tsx:280` — add account password input

**Giải pháp:**
```tsx
// Thêm minLength và pattern vào các input password
<Input
  type="password"
  minLength={6}
  title="Mật khẩu phải có ít nhất 6 ký tự"
  placeholder="Mật khẩu ít nhất 6 ký tự"
  ...
/>
```

---

## BUG-004 🟡 MEDIUM — Tab "Đăng ký" animation gây timeout trong test

**Tiêu đề:** Playwright `toBeVisible()` timeout khi kiểm tra form đăng ký sau khi click tab

**Mô tả:**  
Form đăng ký nằm trong `motion.div` với `flex w-[200%]` + `overflow:hidden`. Khi click tab "Đăng ký", form trượt vào nhưng trong lúc animation chạy (300-500ms), Playwright không thấy element là "visible" dù element đã attach vào DOM.

**File liên quan:**
- `frontend/app/page.tsx:2655-2658` — sliding form container

**Code liên quan:**
```tsx
<div className="overflow-hidden relative w-full">
  <motion.div
    className="flex w-[200%]"
    animate={{ x: authView === "login" ? "0%" : "-50%" }}
    transition={{ type: "spring", stiffness: 260, damping: 28 }}
  >
```

**Giải pháp cho tests:** Dùng `toBeAttached()` thay `toBeVisible()` + thêm `waitForTimeout(600)`.
**Giải pháp code:** Thêm `data-testid="register-form"` để test dễ target hơn.

---

## BUG-005 🟡 MEDIUM — Backend "Backend auth failed" log gây nhầm lẫn trong development

**Tiêu đề:** Frontend log console error khi backend trả lỗi auth, gây nhầm tưởng crash

**Mô tả:**  
Khi backend không có user trong DB, `auth-context.tsx` catch error và log `"Backend auth failed, using local fallback"` ra console. Developers và QA có thể nghĩ đây là crash thật.

**File liên quan:**
- `frontend/lib/auth-context.tsx:177`

**Giải pháp:**
```typescript
// Đổi console.error thành console.warn hoặc console.info
} catch (backendErr) {
  console.info('[Auth] Backend unavailable, trying local fallback');
  // ... local fallback logic
}
```

---

## BUG-006 🟢 LOW — Google/Facebook Login là mock, không có OAuth thật

**Tiêu đề:** Nút Google Login tự động đăng nhập bằng tài khoản cố định không phải OAuth thật

**Mô tả:**  
Nút "Google" trong login modal thực ra tự động login bằng `evelyn.green@gmail.com` / `123456` (hardcoded), không phải OAuth Google thật.

**File liên quan:**
- `frontend/app/page.tsx:2751-2790`

**Mức ảnh hưởng:** Low — đây có thể là demo placeholder, nhưng cần ghi chú rõ ràng.

---

## BUG-007 🟢 LOW — Pagination buttons luôn hiển thị dù chỉ có 1 trang

**Tiêu đề:** Nút phân trang hiển thị dù số bệnh nhân ≤ 5 (chỉ 1 trang)

**Mô tả:**  
Trên trang `/admin/patients`, khi có ≤ 5 bệnh nhân (1 trang), nút "Trang trước" và "Trang sau" vẫn render (dù bị disable). Nên ẩn luôn khi `totalPages === 1`.

**File liên quan:**
- `frontend/app/admin/patients/page.tsx:1364-1396`

**Giải pháp:**
```tsx
{totalPages > 1 && (
  <div className="flex items-center gap-4">
    {/* pagination buttons */}
  </div>
)}
```

---

## BUG-008 🟢 LOW — Avatar upload trong Staff dialog chưa validate file type

**Tiêu đề:** Không có validation rõ ràng cho file size khi upload avatar nhân viên

**Mô tả:**  
Function `handleFile` trong `AvatarUpload` kiểm tra `file.type.startsWith("image/")` nhưng không giới hạn file size. User có thể upload ảnh 50MB làm chậm trang.

**File liên quan:**
- `frontend/app/admin/staff/page.tsx:50-55`

---

## Tổng hợp

| ID | Mức độ | Trạng thái | Mô tả ngắn |
|---|---|---|---|
| BUG-001 | 🟠 HIGH | Open | Database thiếu User seed data |
| BUG-002 | 🟠 HIGH | Open | Schedule page 401 khi load patients |
| BUG-003 | 🟡 MEDIUM | Open | Thiếu client-side password minLength |
| BUG-004 | 🟡 MEDIUM | Open | Tab animation gây test timeout |
| BUG-005 | 🟡 MEDIUM | Open | Console.error gây nhầm lẫn |
| BUG-006 | 🟢 LOW | Open | Google Login là mock |
| BUG-007 | 🟢 LOW | Open | Pagination hiển thị khi 1 trang |
| BUG-008 | 🟢 LOW | Open | Avatar upload thiếu size validation |

---

*Bug Report tự động sinh bởi QA Automation Engineer — 2026-07-16*
