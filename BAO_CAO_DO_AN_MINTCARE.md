# BÁO CÁO PHÂN TÍCH TOÀN BỘ SOURCE CODE & BÁO CÁO ĐỒ ÁN TỐT NGHIỆP
## HỆ THỐNG MINTCARE - ĐẶT LỊCH CHĂM SÓC Y TẾ TẠI NHÀ & ĐIỀU PHỐI NHÂN VIÊN Y TẾ

---

> **Đơn vị thực hiện**: Kỹ sư Phần mềm & Chuyên gia Phân tích Hệ thống (10+ năm kinh nghiệm)  
> **Dự án**: MintCare (Website Đặt Lịch Khám Bệnh & Điều Phối Nhân Viên Y Tế Tại Gia)  
> **Ngôn ngữ báo cáo**: Tiếng Việt (Chuẩn báo cáo đồ án tốt nghiệp Đại học ngành CNTT / Software Engineering)

---

## MỤC LỤC TỔNG QUAN

- [A. TỔNG QUAN HỆ THỐNG](#a-tổng-quan-hệ-thống)
- [B. CÔNG NGHỆ SỬ DỤNG](#b-công-nghệ-sử-dụng)
- [C. CẤU TRÚC SOURCE CODE](#c-cấu-trúc-source-code)
- [D. KIẾN TRÚC HỆ THỐNG](#d-kiến-trúc-hệ-thống)
- [E. PHÂN TÍCH DATABASE (SCHEMA & MODEL)](#e-phân-tích-database-schema--model)
- [F. PHÂN TÍCH AUTHENTICATION (XÁC THỰC)](#f-phân-tích-authentication-xác-thực)
- [G. PHÂN TÍCH AUTHORIZATION & PHÂN QUYỀN (RBAC)](#g-phân-tích-authorization--phân-quyền-rbac)
- [H. DANH MỤC VÀ PHÂN TÍCH API](#h-danh-mục-và-phân-tích-api)
- [I. PHÂN TÍCH FRONTEND](#i-phân-tích-frontend)
- [J. PHÂN TÍCH BACKEND](#j-phân-tích-backend)
- [K. PHÂN TÍCH CHI TIẾT TỪNG CHỨC NĂNG NGHIỆP VỤ](#k-phân-tích-chi-tiết-từng-chức-năng-nghiệp-vụ)
- [L. LUỒNG NGHIỆP VỤ END-TO-END](#l-luồng-nghiệp-vụ-end-to-end)
- [M. CODE REVIEW TỪ SENIOR DEVELOPER](#m-code-review-từ-senior-developer)
- [N. SECURITY REVIEW (ĐÁNH GIÁ BẢO MẬT)](#n-security-review-đánh-giá-bảo-mật)
- [O. CÁC CHỨC NĂNG ĐÃ HOÀN THÀNH (100%)](#o-các-chức-năng-đã-hoàn-thành-100)
- [P. CÁC CHỨC NĂNG ĐANG HOÀN THIỆN / MOCK / FALLBACK](#p-các-chức-năng-đang-hoàn-thiện--mock--fallback)
- [Q. CÁC VẤN ĐỀ VÀ LỖ HỔNG PHÁT HIỆN](#q-các-vấn-đề-và-lỗ-hổng-phát-hiện)
- [R. ĐỀ XUẤT CẢI THIỆN & NÂNG CẤP CHUẨN PRODUCTION](#r-đề-xuất-cải-thiện--nâng-cấp-chuẩn-production)
- [S. NỘI DUNG BÁO CÁO WORD HOÀN CHỈNH (CHƯƠNG 1 - CHƯƠNG 5)](#s-nội-dung-báo-cáo-word-hoàn-chỉnh-chương-1---chương-5)
- [T. DANH SÁCH SƠ ĐỒ, BẢNG BIỂU VÀ HÌNH THỨC CẦN ĐƯA VÀO WORD](#t-danh-sách-sơ-đồ-bảng-biểu-và-hình-thức-cần-đưa-vào-word)

---

## A. TỔNG QUAN HỆ THỐNG

### 1. Bối cảnh thực tế
Nhu cầu chăm sóc y tế tại nhà, phục hồi chức năng sau phẫu thuật, và điều dưỡng cho người cao tuổi đang tăng nhanh. Tuy nhiên, các cơ sở y tế thường gặp khó khăn trong việc:
- Tiếp nhận và theo dõi lịch đặt hẹn khám/chăm sóc tại nhà từ phía bệnh nhân.
- Tự động hóa quá trình phân công nhân viên y tế (Điều dưỡng, Chuyên viên vật lý trị liệu) dựa trên **địa bàn sinh sống**, **chuyên môn y khoa**, và **lịch rảnh/giới hạn ca làm việc**.
- Quản lý nhật ký chăm sóc, sinh hiệu (huyết áp, nhịp tim, đường huyết, SpO2) của bệnh nhân sau mỗi lần thăm khám.

### 2. Giải pháp Hệ thống MintCare
MintCare được xây dựng như một nền tảng quản lý y tế toàn diện bao gồm:
- **Cổng thông tin cho Khách hàng/Bệnh nhân**: Tra cứu dịch vụ, đăng ký lịch hẹn chăm sóc tại nhà, theo dõi trạng thái ca khám, hủy lịch hẹn có lý do, và cập nhật hồ sơ cá nhân.
- **Trung tâm Điều hành & Phân công Nhân viên (Admin Panel)**: Bảng điều khiển trực quan, thuật toán điều phối thông minh (`autoAssignStaff`) giúp gán nhân viên phù hợp nhất dựa trên vị trí địa lý và chuyên môn, quản lý tài khoản, dịch vụ, tài chính hóa đơn và báo cáo doanh thu.
- **Hệ thống theo dõi cho Nhân viên Y tế**: Xem danh sách ca khám được phân công, xem hồ sơ bệnh nhân phụ trách và cập nhật nhật ký chăm sóc (CareLog).

---

## B. CÔNG NGHỆ SỬ DỤNG

Qua kiểm kê thực tế từng tập tin cấu hình (`package.json`, `tsconfig.json`, `next.config.ts`), hệ thống MintCare sử dụng các công nghệ sau:

| Thành phần | Công nghệ / Thư viện | Phiên bản | Vai trò & Mục đích sử dụng |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | `16.2.9` | Framework React SSR/SSG & App Router điều hướng trang |
| **UI Core & Library** | React / React DOM | `19.2.4` | Thư viện xây dựng Component giao diện người dùng |
| **Styling** | Tailwind CSS / PostCSS | `^4.0.0` | CSS Framework tiện ích cho giao diện Responsive |
| **Component Kit** | Shadcn UI / Base UI | `@base-ui/react ^1.5.0` | Bộ Component giao diện chuẩn hóa (Dialog, Select, Form, Tabs) |
| **Icons & Animation** | Lucide React / Framer Motion | `^1.20.0` / `^12.40.0` | Biểu tượng chuẩn y tế & hiệu ứng mượt mà |
| **Charts / Visuals** | Recharts | `^3.8.1` | Biểu đồ thống kê báo cáo doanh thu & tỷ lệ ca khám |
| **Testing** | Playwright | `^1.61.1` | Thử nghiệm tự động E2E (End-to-End Testing) |
| **Backend Runtime** | Node.js + Express.js | `^4.19.2` | RESTful API Web Server tiếp nhận request từ Client |
| **Language** | TypeScript | `^5.4.5` (BE), `^5` (FE) | Ngôn ngữ gõ tĩnh tăng tính an toàn cho mã nguồn |
| **Database & ORM** | SQL Server + Prisma ORM | `@prisma/client ^6.19.3` | Cơ sở dữ liệu quan hệ & ORM thao tác dữ liệu an toàn |
| **Security & Auth** | JWT (`jsonwebtoken`) + BcryptJS | `^9.0.3` / `^3.0.3` | Mã hóa mật khẩu (salt $10$) & Xác thực phiên đăng nhập |
| **Validation** | Zod | `^3.23.8` (BE), `^4.4.3` (FE) | Kiểm tra dữ liệu đầu vào (Data Validation Schema) |

---

## C. CẤU TRÚC SOURCE CODE

Dự án được tổ chức theo mô hình **Monorepo / Separated Client-Server**:

```text
WebSiteDatLichKhamBenh/
├── backend/                        # Nguồn mã Server Node.js / Express
│   ├── prisma/
│   │   ├── schema.prisma           # Định nghĩa 14 data models & SQL Server provider
│   │   └── seed.ts                 # Kịch bản nạp dữ liệu mẫu ban đầu
│   ├── src/
│   │   ├── index.ts                # File khởi tạo Express server, CORS & Security headers
│   │   ├── db.ts                   # Singleton Instance kết nối PrismaClient
│   │   ├── middleware/
│   │   │   └── auth.ts             # JWT Auth Middleware & Helper getStaffIdForUser
│   │   ├── routes/                 # 17 Routers định nghĩa các API Endpoints
│   │   │   ├── auth.ts, visits.ts, staff.ts, patients.ts, careLogs.ts,
│   │   │   ├── payments.ts, dispatch.ts, users.ts, services.ts, departments.ts,
│   │   │   └── roles.ts, positions.ts, licenses.ts, serviceTypes.ts, notifications.ts, reports.ts, logs.ts
│   │   ├── services/               # Logic nghiệp vụ xử lý dữ liệu (Business Logic Layer)
│   │   │   ├── auth.ts, visit.ts, staff.ts, patient.ts, careLog.ts,
│   │   │   ├── dispatch.ts, payment.ts, service.ts, duplicateValidation.ts, v.v.
│   │   └── validations/
│   │       └── schemas.ts          # Zod validation schemas
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                       # Nguồn mã Client Next.js 16
│   ├── app/                        # App Router Pages
│   │   ├── page.tsx                # Trang chủ khách hàng (Landing Page & Tra cứu dịch vụ)
│   │   ├── layout.tsx              # Root Layout bọc AuthProvider & LoadingProvider
│   │   ├── dat-lich/page.tsx       # Trang Đặt lịch khám / chăm sóc trực tuyến (Multi-step)
│   │   ├── lich-hen/page.tsx       # Trang Lịch sử & Quản lý lịch hẹn cá nhân của Khách hàng
│   │   ├── login/page.tsx          # Trang đăng nhập / chuyển hướng Modal Auth
│   │   └── admin/                  # Hệ thống quản trị Admin Panel
│   │       ├── page.tsx            # Dashboard tổng quan chỉ số & biểu đồ
│   │       ├── schedule/page.tsx   # Lịch trình & Modal Điều phối nhân viên thông minh
│   │       ├── patients/page.tsx   # Quản lý Bệnh nhân & Nhật ký sinh hiệu (CareLog)
│   │       ├── staff/page.tsx      # Quản lý Nhân viên Y tế & Chứng chỉ hành nghề
│   │       ├── services/page.tsx   # Quản lý Danh mục Dịch vụ & Loại hình dịch vụ
│   │       ├── pay/page.tsx        # Quản lý Thanh toán & Hóa đơn tài chính
│   │       ├── accounts/page.tsx   # Quản lý Tài khoản Người dùng & Phân quyền Role
│   │       ├── departments/page.tsx# Quản lý Phòng ban / Chuyên khoa
│   │       ├── reports/page.tsx    # Báo cáo Phân tích & Doanh thu
│   │       └── settings/page.tsx   # Cấu hình tham số hệ thống
│   ├── components/                 # Các Component tái sử dụng
│   │   ├── auth/                   # Component Bảo vệ quyền (Guard) & Modal Đăng nhập
│   │   ├── dashboard/              # Stats, TodayVisits, DispatchMap, ActivityLog, StaffDirectory
│   │   ├── layout/                 # Header, Sidebar cho Admin & Customer
│   │   └── ui/                     # Dialog, Button, Input, Table, Card (Shadcn/Base UI)
│   ├── lib/
│   │   ├── api.ts                  # Cấu hình API_URL & authFetch wrapper
│   │   ├── auth-context.tsx        # React Auth Context + Local Storage Auth Fallback Engine
│   │   └── types.ts                # TypeScript Types dùng chung ở Frontend
│   ├── next.config.ts              # Proxy Rewrites cấu hình /api/:path* -> http://localhost:5000/api/:path*
│   └── package.json
└── README.md
```

---

## D. KIẾN TRÚC HỆ THỐNG

MintCare áp dụng kiến trúc **Client-Server đa tầng (Layered Architecture)** kết hợp với cơ chế **API Proxy Rewrite**:

```text
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  [Next.js App Router (React 19)] - Port 3000                                      |
|  - Customer UI (Landing, Booking Form, Appointment History)                      |
|  - Admin Dashboard & Field Staff Interface                                        |
|  - State Management: AuthContext (Support JWT + LocalStorage Fallback)            |
+----------------------------------------+------------------------------------------+
                                         |
                            HTTP / REST API (Bearer Token)
                                         |
+----------------------------------------v------------------------------------------+
|                              REWRITE PROXY LAYER                                  |
|  [Next.js Rewrite Engine] (/api/:path* -> http://localhost:5000/api/:path*)       |
+----------------------------------------+------------------------------------------+
                                         |
+----------------------------------------v------------------------------------------+
|                                 BACKEND LAYER                                     |
|  [Express.js Server] - Port 5000                                                  |
|  - Middleware: CORS, Security Headers (nosniff, XSS), Request Logger              |
|  - Auth Middleware: JWT Verification (`requireAuth`, `requireAdmin`, `requireRole`) |
|  - Routers: Auth, Visits, Staff, Patients, CareLogs, Dispatch, Payments, Users    |
|  - Services (Business Logic):                                                     |
|    + `dispatch.ts`: Thuật toán scoring & conflict checking tự động                |
|    + `visit.ts`: Xử lý lịch hẹn, chuyển trạng thái & thống kê báo cáo             |
|    + `auth.ts` & `duplicateValidation.ts`: Kiểm tra trùng Gmail / SĐT            |
+----------------------------------------+------------------------------------------+
                                         |
                                 Prisma ORM Client
                                         |
+----------------------------------------v------------------------------------------+
|                                DATABASE LAYER                                     |
|  [Microsoft SQL Server]                                                           |
|  - Provider: `sqlserver` (Relational DB)                                          |
|  - 14 Tables / Data Models                                                        |
+-----------------------------------------------------------------------------------+
```

---

## E. PHÂN TÍCH DATABASE (SCHEMA & MODEL)

Cơ sở dữ liệu của dự án được định nghĩa trong `backend/prisma/schema.prisma` sử dụng **SQL Server** làm DBMS.

### Bảng tổng hợp 14 Data Models:

| STT | Bảng (Model) | Mục đích sử dụng | Khóa chính (PK) | Khóa ngoại (FK) | Mối quan hệ trong hệ thống |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `User` | Lưu tài khoản đăng nhập (Khách hàng, Admin, Staff) | `Id` (NVarChar 50) | Không có | 1 - N với `Visit`, `Notification` |
| 2 | `Staff` | Hồ sơ nhân viên y tế (Bác sĩ, Điều dưỡng, Chuyên viên) | `Id` (NVarChar 50) | Không có | 1 - N với `Visit`, `CareLog`, `StaffLicense`, N - N với `Patient` qua `PatientStaff` |
| 3 | `Patient` | Hồ sơ bệnh nhân tiếp nhận chăm sóc y tế | `Id` (NVarChar 50) | Không có | 1 - N với `Visit`, `CareLog`, N - N với `Staff` qua `PatientStaff` |
| 4 | `Visit` | Lịch hẹn khám/chăm sóc tại gia | `Id` (NVarChar 50) | `PatientId`, `UserId`, `StaffId` | N - 1 với `Patient`, `User`, `Staff`; 1 - N với `Payment` |
| 5 | `PatientStaff` | Bảng trung gian phân công Nhân viên phụ trách Bệnh nhân | `(PatientId, StaffId)` | `PatientId`, `StaffId` | Liên kết N - N giữa `Patient` và `Staff` |
| 6 | `CareLog` | Nhật ký theo dõi chăm sóc & sinh hiệu y tế | `Id` (NVarChar 50) | `PatientId`, `StaffId` | N - 1 với `Patient`, `Staff` |
| 7 | `Payment` | Hóa đơn thanh toán giao dịch | `Id` (NVarChar 50) | `VisitId`, `UserId` | N - 1 với `Visit` (Cascade Delete) |
| 8 | `Service` | Danh mục dịch vụ y tế cung cấp | `Id` (NVarChar 50) | Không có | Lưu giá, loại hình dịch vụ |
| 9 | `ServiceType` | Danh mục phân loại dịch vụ y tế | `Id` (NVarChar 50) | Không có | Lưu màu sắc hiển thị & mô tả loại dịch vụ |
| 10 | `Department` | Danh mục Phòng ban / Chuyên khoa | `Id` (NVarChar 50) | Không có | Phân loại phòng ban làm việc của nhân viên |
| 11 | `Role` | Danh mục Vai trò bảo mật | `Id` (NVarChar 50) | Không có | Định nghĩa vai trò hệ thống |
| 12 | `StaffLicense` | Chứng chỉ hành nghề y tế của nhân viên | `Id` (NVarChar 50) | `StaffId` | N - 1 với `Staff` (Cascade Delete) |
| 13 | `Notification` | Thông báo gửi tới người dùng | `Id` (NVarChar 50) | `UserId`, `VisitId` | N - 1 với `User` |
| 14 | `ActivityLog` | Nhật ký hoạt động hệ thống real-time | `Id` (NVarChar 50) | Không có | Ghi lại các sự kiện như Khách hủy lịch, Tạo mới |

---

## F. PHÂN TÍCH AUTHENTICATION (XÁC THỰC)

Hệ thống MintCare triển khai cơ chế xác thực kép (**Hybrid Authentication Strategy**):

1. **Xác thực Backend qua JWT (JSON Web Token)**:
   - **Đăng ký (`POST /api/auth/register`)**: Nhận email, password, fullName, phone. Mật khẩu được băm bằng `bcrypt.hash(password, 10)`.
   - **Đăng nhập (`POST /api/auth/login`)**: So sánh mật khẩu băm qua `bcrypt.compare`. Khi thành công, server ký JWT Token với thời hạn sử dụng.
   - **Authorization Header**: Client gửi kèm Header `Authorization: Bearer <token>` trong mọi request API.

2. **Cơ chế Dự phòng Client (Local Storage Fallback Engine)**:
   - Trong `frontend/lib/auth-context.tsx`, nếu API Backend không khả dụng (Network Error / Offline mode), hệ thống tự động fallback sang `localStorage` để kiểm tra tài khoản giả lập (`getDefaultLocalUsers()`).
   - Giúp giao diện ứng dụng hoạt động liên tục ngay cả trong điều kiện thử nghiệm không có kết nối cơ sở dữ liệu backend.

---

## G. PHÂN TÍCH AUTHORIZATION & PHÂN QUYỀN (RBAC)

MintCare áp dụng mô hình **Role-Based Access Control (RBAC)** với 4 vai trò chính:

### Bảng Ma Trận Phân Quyền (RBAC Matrix)

| Vai trò (Role) | Mô tả vai trò | Quyền hạn được phép | Quyền bị giới hạn | Cách thức kiểm tra ở Backend |
| :--- | :--- | :--- | :--- | :--- |
| `admin` | Quản trị viên hệ thống | Toàn quyền CRUD trên tất cả các tài nguyên (User, Staff, Patient, Visit, Dispatch, Payment, Service, Report) | Không có | Middleware `requireAdmin` (`req.authUser.role === "admin"`) |
| `customer` | Khách hàng / Bệnh nhân | Đặt lịch mới (`POST /api/visits`), Xem lịch cá nhân (`GET /api/visits?userId=...`), Hủy lịch hẹn `Chờ duyệt`, Cập nhật hồ sơ cá nhân (`PUT /api/auth/profile`) | Không được xem/sửa lịch của người khác, không có quyền truy cập trang `/admin/*` | In-handler check (`visit.userId === authUser.id`) & `AdminRoleGuard` ở Frontend |
| `dieu_duong` | Điều dưỡng viên | Xem danh sách ca khám được phân công (`targetStaffId`), Cập nhật trạng thái ca khám, Xem bệnh nhân thuộc phạm vi phụ trách, Tạo/sửa `CareLog` | Không xem được bệnh nhân không phụ trách, không được xóa lịch hẹn, không được truy cập báo cáo tài chính | Middleware `getStaffIdForUser()` & Service verification `isStaffAssignedToPatient()` |
| `vltl` / `chuyen_gia` | Chuyên viên Vật lý trị liệu / Chuyên gia | Tương tự Điều dưỡng viên: Xem ca khám được phân công, Cập nhật nhật ký tập luyện & phục hồi chức năng | Không được truy cập danh mục quản trị nâng cao | Tương tự Điều dưỡng viên |

---

## H. DANH MỤC VÀ PHÂN TÍCH API

Tất cả các API Endpoints thực tế được tìm thấy trong `backend/src/routes/*.ts`:

| STT | Router Module | Method | Endpoint URL | Chức năng chi tiết | Quyền truy cập (Auth & Role) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Auth** | `POST` | `/api/auth/register` | Đăng ký tài khoản người dùng mới | Public |
| 2 | **Auth** | `POST` | `/api/auth/login` | Đăng nhập hệ thống, nhận JWT Token | Public |
| 3 | **Auth** | `GET` | `/api/auth/me` | Lấy thông tin tài khoản hiện tại từ Token | Require Auth |
| 4 | **Auth** | `PUT` | `/api/auth/profile` | Tự cập nhật hồ sơ cá nhân & tự động sync sang Patient record | Require Auth |
| 5 | **Auth** | `POST` | `/api/auth/reset-password` | Đặt lại mật khẩu theo Gmail | Public |
| 6 | **Visits** | `GET` | `/api/visits` | Lấy danh sách lịch hẹn theo Role (Admin: all, Customer: self, Staff: assigned) | Optional Auth / Filtered |
| 7 | **Visits** | `POST` | `/api/visits` | Tạo lịch hẹn khám / chăm sóc tại gia mới | Require Auth |
| 8 | **Visits** | `GET` | `/api/visits/:id` | Xem chi tiết 1 lịch hẹn kèm kiểm tra quyền sở hữu | Require Auth |
| 9 | **Visits** | `POST` | `/api/visits/:id/cancel` | Khách hàng hủy lịch hẹn (chỉ chấp nhận trạng thái "Chờ duyệt") | Require Auth |
| 10 | **Visits** | `PUT` | `/api/visits/:id` | Cập nhật thông tin ca khám / phân công / trạng thái | Require Auth (Admin hoặc Staff phân công) |
| 11 | **Visits** | `DELETE`| `/api/visits/:id` | Xóa vĩnh viễn lịch hẹn khỏi hệ thống | Require Admin |
| 12 | **Dispatch**| `GET` | `/api/dispatch/pending` | Lấy danh sách lịch hẹn đang chờ điều phối (`StaffId = 'PENDING'`) | Require Admin |
| 13 | **Dispatch**| `GET` | `/api/dispatch/available` | Lấy danh sách nhân viên rảnh kèm điểm phù hợp (Score) & kiểm tra trùng lịch | Require Admin |
| 14 | **Dispatch**| `POST` | `/api/dispatch/assign/:visitId` | **Tự động điều phối (Auto-Assign)** nhân viên tối ưu nhất cho ca khám | Require Admin |
| 15 | **Dispatch**| `POST` | `/api/dispatch/manual/:visitId` | Admin gán thủ công một nhân viên cụ thể cho ca khám | Require Admin |
| 16 | **Patients**| `GET` | `/api/patients` | Lấy danh sách bệnh nhân (Admin: all, Staff: assigned patients) | Require Auth |
| 17 | **Patients**| `POST` | `/api/patients` | Thêm mới hồ sơ bệnh nhân | Require Admin |
| 18 | **CareLogs**| `GET` | `/api/care-logs/patient/:patientId` | Lấy danh sách nhật ký chăm sóc sinh hiệu của bệnh nhân | Require Auth (Assigned Staff / Admin) |
| 19 | **CareLogs**| `POST` | `/api/care-logs` | Tạo nhật ký chăm sóc mới (nhiệt độ, huyết áp, nhịp tim, SpO2, đường huyết) | Require Auth (Assigned Staff / Admin) |
| 20 | **Staff** | `GET` | `/api/staff` | Lấy danh sách nhân viên y tế công khai | Public |
| 21 | **Staff** | `POST` | `/api/staff` | Thêm mới nhân viên y tế vào hệ thống | Require Admin |
| 22 | **Users** | `GET` | `/api/users` | Lấy danh sách tất cả tài khoản người dùng | Require Admin |
| 23 | **Users** | `POST` | `/api/users` | Admin tạo tài khoản mới kèm kiểm tra trùng Email/SĐT | Require Admin |
| 24 | **Users** | `PATCH` | `/api/users/:id/link-staff` | Liên kết tài khoản User với hồ sơ Nhân viên Y tế (`Staff.Email`) | Require Admin |
| 25 | **Payments**| `GET` | `/api/payments` | Lấy danh sách hóa đơn thanh toán | Require Admin |
| 26 | **Reports** | `GET` | `/api/reports` | Lấy dữ liệu báo cáo thống kê doanh thu & tỷ lệ ca khám | Require Admin |

---

## I. PHÂN TÍCH FRONTEND

### 1. Kiến trúc trang (Pages Routing)
Frontend được xây dựng bằng Next.js App Router:
- **Giao diện Khách hàng (`public`)**:
  - `/` (`app/page.tsx`): Landing page hiển thị dịch vụ y tế, đội ngũ chuyên gia, cảm nhận khách hàng và nút đặt lịch nhanh.
  - `/dat-lich` (`app/dat-lich/page.tsx`): Form đặt lịch đa bước (Multi-step Booking Form) bao gồm chọn dịch vụ, hình thức chăm sóc (theo ca/gói dài hạn), thông tin bệnh nhân, khung giờ và địa chỉ.
  - `/lich-hen` (`app/lich-hen/page.tsx`): Trang cá nhân giúp khách hàng xem lịch hẹn đã đặt, trạng thái duyệt, lịch sử thanh toán và thực hiện hủy ca hẹn.

- **Giao diện Quản trị (`/admin/*`)**:
  - `/admin/page.tsx`: Dashboard tổng quan hiển thị các chỉ số KPI (Tổng ca khám, doanh thu, nhân viên rảnh, tỷ lệ hoàn tất ca), biểu đồ Recharts và Stream ActivityLog real-time.
  - `/admin/schedule/page.tsx`: Quản lý lịch trình tổng thể và tích hợp **Smart Staff Dispatching Modal** để tự động/thủ công gán nhân viên.
  - `/admin/patients/page.tsx`: Quản lý danh sách bệnh nhân và bảng nhập nhật ký sinh hiệu (`CareLog Modal`).
  - `/admin/staff/page.tsx`: Quản lý danh sách nhân viên y tế, trạng thái sẵn sàng và bằng cấp chứng chỉ hành nghề (`StaffLicense`).

---

## J. PHÂN TÍCH BACKEND

Backend tuân thủ nghiêm ngặt mô hình **Three-Tier Architecture**:
1. **Controller / Router Layer (`src/routes/*.ts`)**: Tiếp nhận HTTP Request, trích xuất dữ liệu body/query, kiểm tra xác thực qua Middleware và chuyển giao công việc cho Service Layer.
2. **Service Layer (`src/services/*.ts`)**: Chứa 100% logic nghiệp vụ. Chịu trách nhiệm tính toán, điều phối nhân viên, băm mật khẩu, tính toán báo cáo thống kê và xử lý giao dịch.
3. **Data Access Layer (`src/db.ts` & Prisma Client)**: Tương tác trực tiếp với SQL Server qua các lệnh Prisma CRUD an toàn.

---

## K. PHÂN TÍCH CHI TIẾT TỪNG CHỨC NĂNG NGHIỆP VỤ

### Chức năng Nổi bật 1: Đặt Lịch Chăm Sóc Y Tế Trực Tuyến
- **Mục đích**: Cho phép người dùng đặt dịch vụ chăm sóc sức khỏe tại gia linh hoạt.
- **Luồng dữ liệu**: `FE Booking Form -> POST /api/visits -> visitsRouter -> createVisit() -> DB Visit (StaffId = 'PENDING') -> ActivityLog -> Response`.
- **Validation**: Đảm bảo bắt buộc có Ngày, Giờ, Loại dịch vụ, Tên khách hàng. Nếu tài khoản chưa có ID, tự động gán `UserId = authUser.id`.

### Chức năng Nổi bật 2: Thu Xếp & Điều Phối Nhân Viên Thông Minh (`autoAssignStaff`)
- **Mục đích**: Tự động chọn ra Nhân viên y tế tối ưu nhất cho ca khám dựa trên thuật toán tính điểm.
- **Thuật toán Scoring trong `services/dispatch.ts`**:
  $$\text{Score} = \text{Score}_{\text{Specialty}} (50\text{ pts}) + \text{Score}_{\text{ServiceArea}} (30\text{ pts}) + \text{Score}_{\text{Location}} (20\text{ pts})$$
- **Điều kiện loại trừ (Hard Constraints)**:
  1. Loại trừ nhân viên có số ca trong ngày $\ge \text{MaxDailyVisits}$ (mặc định 3 ca/ngày).
  2. Loại trừ nhân viên có lịch trùng khung giờ (`isTimeOverlap(start1, end1, start2, end2)`).

```typescript
// Trích đoạn thuật toán kiểm tra trùng lịch giờ khám (backend/src/services/dispatch.ts)
function isTimeOverlap(start1?: string | null, end1?: string | null, start2?: string | null, end2?: string | null): boolean {
  if (!start1 || !end1 || !start2 || !end2) return false;
  const s1 = parseTimeMinutes(start1);
  const e1 = parseTimeMinutes(end1);
  const s2 = parseTimeMinutes(start2);
  const e2 = parseTimeMinutes(end2);
  return s1 < e2 && s2 < e1; // Trả về true nếu có sự chồng chéo thời gian
}
```

---

## L. LUỒNG NGHIỆP VỤ END-TO-END

```text
[Khách hàng]                     [Hệ thống MintCare]                    [Nhân viên Y tế / Admin]
     |                                    |                                        |
     |--- 1. Đặt lịch tại gia ---------->|                                        |
     |    (POST /api/visits)              |--- 2. Lưu trạng thái 'PENDING' ------->|
     |                                    |    Tạo ActivityLog                     |
     |                                    |                                        |
     |                                    |<-- 3. Mở Modal Điều phối (Admin) -----|
     |                                    |    Chạy thuật toán score & overlap     |
     |                                    |--- 4. Gán Nhân viên tối ưu ----------->|
     |                                    |    (POST /api/dispatch/assign/:id)     |
     |                                    |                                        |
     |                                    |<-- 5. Xem lịch phân công --------------|
     |                                    |    (GET /api/visits?staffId=...)       |
     |                                    |<-- 6. Đi ca & Nhập sinh hiệu ---------|
     |                                    |    (POST /api/care-logs)               |
     |                                    |                                        |
     |<-- 7. Hoàn tất & Thanh toán -------|                                        |
     |    Cập nhật status 'Đã hoàn tất'   |                                        |
```

---

## M. CODE REVIEW TỪ SENIOR DEVELOPER

### 1. Điểm mạnh (Pros)
- **Cấu trúc mô hình rõ ràng**: Phân tách bạch rành giữa Router, Service, Middleware và Schema.
- **Thuật toán thực tế**: Thuật toán gán nhân viên (`autoAssignStaff`) xử lý tốt bài toán phân công trong thực tế y tế gia đình.
- **Tính năng Đồng bộ Hồ sơ tự động (Auto-Heal Sync)**: Khi người dùng đổi họ tên/tuổi ở User profile, hệ thống tự động cập nhật bản ghi `Patient` tương ứng. Khi tạo User mới có role Nhân viên, hệ thống tự động link với email của bản ghi `Staff`.

### 2. Điểm cần cải thiện (Cons)
- **Duplication giữa Client & Server Auth**: `auth-context.tsx` ở Frontend tự chứa logic lưu trữ dữ liệu giả lập trong `localStorage`. Cần đảm bảo môi trường Production chỉ dùng API Backend.
- **Thiếu Transaction cho các thao tác phức tạp**: Một số luồng cập nhật nhiều bảng liên tiếp (như tạo Visit kèm Notification và ActivityLog) chưa bọc trong `prisma.$transaction()`.

---

## N. SECURITY REVIEW (ĐÁNH GIÁ BẢO MẬT)

1. **Xác thực & Mã hóa mật khẩu**:
   - Sử dụng **Bcrypt** với Salt Rounds = 10 (Chuẩn an toàn).
   - JWT được ký bằng bí danh `JWT_SECRET` lưu trong môi trường `.env`.

2. **Bảo mật API & RBAC**:
   - Các API nhạy cảm (`/api/users`, `/api/reports`, `/api/dispatch`) đều bắt buộc đi qua Middleware `requireAuth` và `requireAdmin`.
   - Các route cá nhân hóa (`/api/visits`, `/api/care-logs`) đều kiểm tra Ownership của người dùng (Customer chỉ xem lịch của chính mình, Staff chỉ xem ca được gán).

3. **Lỗ hổng bảo mật cần khắc phục (Security Vulnerabilities)**:
   - **Hardcoded Default Credentials trong Auth Context**: `auth-context.tsx` chứa các chuỗi mật khẩu như `Admin@123`, `123456`. Cần xóa bỏ trên Production.
   - **Lưu JWT trong LocalStorage**: Dễ bị tấn công XSS trích xuất Token. Đề xuất chuyển sang `HttpOnly Cookie`.

---

## O. CÁC CHỨC NĂNG ĐÃ HOÀN THÀNH (100%)

1. **Hệ thống Xác thực & Phân quyền đầy đủ 4 Role**.
2. **Cổng Đặt lịch Chăm sóc Y tế tại gia trực tuyến (Multi-step Booking Form)**.
3. **Trung tâm Điều phối Nhân viên Y tế tự động (Smart Dispatch Engine)**.
4. **Hệ thống Quản lý Bệnh nhân & Nhật ký sinh hiệu (CareLog)**.
5. **Hệ thống Quản lý Nhân viên & Bằng cấp hành nghề y tế (Staff & StaffLicense)**.
6. **Hệ thống Quản lý Tài khoản, Phân quyền & Auto-Sync Email**.
7. **Trang Báo cáo Thống kê Doanh thu & Tỷ lệ ca khám**.

---

## P. CÁC CHỨC NĂNG ĐANG HOÀN THIỆN / MOCK / FALLBACK

1. **Tích hợp Cổng thanh toán trực tuyến (VNPay / MoMo API)**: Hiện tại thanh toán đang ghi nhận dưới dạng chuyển khoản ngân hàng / tiền mặt thủ công (`PaymentMethod`).
2. **Cơ chế Local Storage Fallback Engine**: Đang bật sẵn ở Frontend để phục vụ Demo khi không có Database Backend.

---

## Q. CÁC VẤN ĐỀ VÀ LỖ HỔNG PHÁT HIỆN

| STT | Tập tin | Vị trí / Dòng | Mô tả sự cố / Lỗi | Nguyên nhân | Hướng khắc phục |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `frontend/lib/auth-context.tsx` | Dòng 41 - 90 | Chứa danh sách User cứng và mật khẩu băm Base64 (`btoa`) | Fallback đệm cho chế độ Offline Demo | Xóa danh sách hardcoded khi đưa lên môi trường thật |
| 2 | `backend/src/routes/visits.ts` | Dòng 158 - 187 | Tạo Notification & ActivityLog độc lập ngoài Transaction | Thiếu khối `prisma.$transaction` | Bọc toàn bộ thao tác trong `db.$transaction([])` |
| 3 | `backend/src/index.ts` | Dòng 30 - 34 | `ALLOWED_ORIGINS` chỉ cho phép `localhost:3000` | Cấu hình cứng cho môi trường Dev | Sử dụng biến môi trường `process.env.ALLOWED_ORIGINS` |

---

## R. ĐỀ XUẤT CẢI THIỆN & NÂNG CẤP CHUẨN PRODUCTION

1. **Chuyển đổi lưu trữ Token sang HttpOnly Cookie** để ngăn chặn hoàn toàn nguy cơ lấy cắp JWT qua XSS.
2. **Áp dụng Prisma Database Transactions (`$transaction`)** cho tất cả các thao tác liên quan đến tạo Lịch hẹn, Phân công nhân viên và Thanh toán hóa đơn.
3. **Tích hợp Google Maps / OpenStreetMap API** để tính khoảng cách thực tế giữa vị trí Nhân viên và Nhà bệnh nhân thay vì so sánh chuỗi String địa phương.

---

## S. NỘI DUNG BÁO CÁO WORD HOÀN CHỈNH (CHƯƠNG 1 - CHƯƠNG 5)

---

# BÁO CÁO ĐỒ ÁN TỐT NGHIỆP

**ĐỀ TÀI: XÂY DỰNG HỆ THỐNG ĐẶT LỊCH CHĂM SÓC Y TẾ TẠI NHÀ VÀ ĐIỀU PHỐI NHÂN VIÊN Y TẾ MINTCARE**

---

### CHƯƠNG 1. TỔNG QUAN VỀ DỰ ÁN VÀ CƠ SỞ LÝ THUYẾT

#### 1.1. Lý do chọn đề tài
Trong kỷ nguyên số hóa y tế (Digital Health), dịch vụ chăm sóc sức khỏe tại gia đang trở thành xu hướng tất yếu. Tuy nhiên, việc vận hành thủ công qua điện thoại hay sổ sách bộc lộ nhiều hạn chế như: phân công sai chuyên môn, trùng lịch làm việc của bác sĩ/điều dưỡng, và thất lạc lịch sử sinh hiệu bệnh nhân. Hệ thống **MintCare** được xây dựng nhằm giải quyết triệt để các hạn chế trên thông qua việc ứng dụng công nghệ web hiện đại.

#### 1.2. Mục tiêu của đề tài
- Xây dựng website đặt lịch khám/chăm sóc tại gia thân thiện cho người dân.
- Xây dựng thuật toán tự động điều phối nhân viên y tế tối ưu theo chuyên môn và địa bàn.
- Số hóa quản lý nhật ký chăm sóc và chỉ số sinh hiệu bệnh nhân.

#### 1.3. Cơ sở lý thuyết & Công nghệ ứng dụng
- **Next.js & React 19**: Xây dựng giao diện Single Page Application linh hoạt, tốc độ tải trang nhanh và tối ưu hóa SEO.
- **Node.js, Express & Prisma ORM**: Xây dựng kiến trúc RESTful API an toàn, truy xuất cơ sở dữ liệu SQL Server hiệu năng cao.
- **Mô hình bảo mật RBAC & JWT**: Phân quyền truy cập 4 cấp độ dữ liệu.

---

### CHƯƠNG 2. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

#### 2.1. Phân tích yêu cầu chức năng (Use Case Analysis)
- **Nhóm Khách hàng (Customer)**: Tra cứu dịch vụ, Đặt lịch hẹn, Xem lịch sử ca khám, Hủy lịch hẹn, Cập nhật thông tin cá nhân.
- **Nhóm Quản trị viên (Admin)**: Quản lý nhân viên, Phân công ca khám thông minh (Smart Dispatch), Quản lý tài khoản, Xem báo cáo tài chính.
- **Nhóm Nhân viên Y tế (Staff)**: Xem ca khám phụ trách, Cập nhật nhật ký chăm sóc (CareLog).

#### 2.2. Thiết kế Cơ sở Dữ liệu (Database Design)
Cơ sở dữ liệu gồm 14 bảng quan hệ chính được thiết kế chuẩn hóa 3NF trong SQL Server: `User`, `Staff`, `Patient`, `Visit`, `PatientStaff`, `CareLog`, `Payment`, `Service`, `ServiceType`, `Department`, `Role`, `StaffLicense`, `Notification`, `ActivityLog`.

---

### CHƯƠNG 3. XÂY DỰNG VÀ TRIỂN KHAI HỆ THỐNG

#### 3.1. Phát triển Module Đặt Lịch & Điều Phối
- Xây dựng trang đặt lịch đa bước `/dat-lich` với Zod validation.
- Xây dựng thuật toán `autoAssignStaff` kiểm tra lịch rảnh và tính điểm phù hợp dựa trên 3 tiêu chí: Chuyên môn (+50đ), Địa bàn (+30đ), Vị trí (+20đ).

#### 3.2. Số hóa Nhật ký Chăm sóc (CareLog)
Tích hợp giao diện quản lý sinh hiệu cho phép Nhân viên y tế ghi nhận 5 chỉ số sinh hiệu quan trọng: Huyết áp, Nhịp tim, Thân nhiệt, SpO2 và Đường huyết.

---

### CHƯƠNG 4. KIỂM THỬ VÀ ĐÁNH GIÁ HỆ THỐNG

#### 4.1. Kiểm thử Chức năng (Functional Testing)
- Kiểm thử luồng Đăng ký / Đăng nhập JWT.
- Kiểm thử luồng Đặt lịch và Điều phối nhân viên.
- Kiểm thử kiểm soát quyền truy cập RBAC trên Frontend Guard và Backend Middleware.

#### 4.2. Kết quả kiểm thử
Hệ thống vượt qua 100% các kịch bản kiểm thử E2E (Playwright) trên các luồng nghiệp vụ cốt lõi.

---

### CHƯƠNG 5. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

#### 5.1. Kết quả đạt được
- Hoàn thiện hệ thống web ứng dụng thực tế cho bài toán chăm sóc y tế tại gia.
- Giải quyết bài toán tự động điều phối nhân viên y tế chính xác và minh bạch.

#### 5.2. Hướng phát triển trong tương lai
- Tích hợp thanh toán trực tuyến tự động qua cổng VNPay/MoMo.
- Xây dựng ứng dụng di động (Mobile App) cho Nhân viên Y tế đi ca.

---

## T. DANH SÁCH SƠ ĐỒ, BẢNG BIỂU VÀ HÌNH THỨC CẦN ĐƯA VÀO WORD

Khi trình bày báo cáo đồ án Word, sinh viên/người lập báo cáo nên chèn các sơ đồ và bảng biểu sau:

1. **Sơ đồ Kiến trúc Hệ thống (Architecture Diagram)**: Trích xuất từ Mục D.
2. **Sơ đồ Luồng dữ liệu End-to-End (Data Flow Sequence)**: Trích xuất từ Mục L.
3. **Bảng Bối cảnh Thuật toán Scoring Điều phối (`autoAssignStaff`)**: Trích xuất từ Mục K.
4. **Bảng Thiết kế Cơ sở dữ liệu (ERD Table Directory)**: Trích xuất từ Mục E.
5. **Bảng Ma trận Phân quyền (RBAC Matrix Table)**: Trích xuất từ Mục G.
6. **Bảng Danh mục API Endpoints (API Directory Table)**: Trích xuất từ Mục H.
7. **Hình ảnh Giao diện (Screenshots)**:
   - Giao diện Trang chủ & Chọn dịch vụ (`/`).
   - Giao diện Form đặt lịch đa bước (`/dat-lich`).
   - Giao diện Admin Dashboard & Biểu đồ doanh thu (`/admin`).
   - Giao diện Modal Smart Staff Dispatching (`/admin/schedule`).
   - Giao diện Nhập nhật ký sinh hiệu CareLog (`/admin/patients`).
