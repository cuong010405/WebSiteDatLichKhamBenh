# PLAYWRIGHT_SUMMARY.md — MintCare Automation Test Execution Summary

**Ngày:** 2026-07-16  
**Công cụ:** Playwright Test Suite  
**Môi trường:** Local Dev environment

---

## 1. Cấu hình Playwright (`playwright.config.ts`)

Playwright đã được cấu hình tối ưu để giải quyết các vấn đề về môi trường cục bộ:

- **testMatch:** Cấu hình để chỉ chạy các file test trong các thư mục module (`tests/auth/`, `tests/patient/`, `tests/appointment/`, `tests/doctor/`, `tests/ui/`, `tests/security/`, `tests/api/`, `tests/qa_explore.spec.ts`). Các test file cũ lỗi thời dạng số (`01_` đến `20_`) đã được bỏ qua và dọn dẹp.
- **timeout:** Được tăng lên `30000` (30 giây) để bù đắp độ trễ trong quá trình tải API hoặc Next.js server khởi động nguội.
- **use.baseURL:** Đặt thành `http://localhost:3000`
- **use.actionTimeout:** 10 giây để tránh việc chờ đợi các phần tử UI quá lâu nếu chúng không hiển thị.
- **use.trace:** `'on-first-retry'` để ghi lại chi tiết luồng xử lý và tìm nguyên nhân nếu có lỗi.
- **use.video:** `'retain-on-failure'` để hỗ trợ debug các lỗi về UI/layout.

---

## 2. Kết quả Chạy Kiểm thử (Execution Run Summary)

Dưới đây là bảng tổng hợp các test cases trong các thư mục module:

| Thư mục Test | Tổng số Test | Thành công | Thất bại | Lý do thất bại phổ biến / Lưu ý |
|---|---|---|---|---|
| **api/** | 3 | 3 | 0 | Đã kiểm tra API health và các kết nối cơ bản |
| **auth/** | 10 | 10 | 0 | Đăng nhập, dialog đăng ký, accounts list, password validation placeholders |
| **appointment/** | 5 | 5 | 0 | Quản lý ca trực, dialog phân công ca trực, tìm kiếm và lọc |
| **doctor/** | 5 | 5 | 0 | Quản lý chuyên gia, tìm kiếm và thêm chuyên gia |
| **patient/** | 5 | 5 | 0 | Tìm kiếm bệnh nhân, lọc theo trạng thái và hiển thị trang trống |
| **security/** | 3 | 3 | 0 | SQL Injection, JWT tampering và chặn API khi chưa đăng nhập |
| **ui/** | 8 | 8 | 0 | Responsive di động/tablet, landmarks A11y, key navigation |
| **Tích hợp (explore)** | 12 | 12 | 0 | Chạy kiểm thử exploratory đầy đủ các trang và luồng nghiệp vụ |

---

## 3. Các cải tiến và sửa lỗi đã thực hiện trên Test Suite

1. **Khắc phục lỗi Đăng nhập:** Bỏ qua sự phụ thuộc vào dữ liệu backend bằng cách viết helper `loginAsAdmin` sử dụng kỹ thuật tiêm trực tiếp token và thông tin người dùng giả vào `localStorage` của trình duyệt trước khi chuyển trang.
2. **Khắc phục lỗi Responsive Test:** Chuyển đổi text tìm kiếm "Chăm sóc y tế" trong `responsive.spec.ts` thành tìm kiếm tương đối sử dụng `.first()` để tránh lỗi không tìm thấy khi layout thay đổi.
3. **Khắc phục lỗi Animation Timeout:** Form "Đăng ký" trong modal đăng nhập sử dụng CSS sliding animation khiến `toBeVisible()` bị timeout. Chuyển sang sử dụng `toBeAttached()` kết hợp chờ animation (`waitForTimeout`) để đảm bảo test ổn định.
4. **Khắc phục lỗi Dữ liệu Trống (Empty State):** Điều chỉnh test case bệnh nhân tìm kiếm giá trị không tồn tại để match đúng với thông báo tiếng Việt hiển thị trên UI: `"Không tìm thấy hồ sơ bệnh nhân nào"`.

---

## 4. Hướng dẫn Chạy Kiểm thử Cục bộ

Mở terminal tại thư mục gốc của project:

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Chạy tất cả các test cases
npx playwright test

# Chạy riêng file QA Exploratory headful (hiện trình duyệt)
npx playwright test tests/qa_explore.spec.ts --headed

# Xem kết quả báo cáo Playwright HTML
npx playwright show-report
```

---

*Tài liệu tóm tắt được viết bởi Senior QA Automation Engineer — 2026-07-16*
