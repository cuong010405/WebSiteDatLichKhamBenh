    # TÀI LIỆU PHÂN TÍCH DỰ ÁN MINTCARE — WebSiteDatLichKhamBenh

    > Ngày tạo: 2026-07-14
    > Tác giả: MiMoCode Auto-Analysis

    ---

    # PHẦN 1: TỔNG QUAN DỰ ÁN

    ## 1.1 Tên dự án
    **MintCare** — Nền tảng Chăm sóc Y tế Tại gia & Đặt lịch Khám bệnh trực tuyến.

    ## 1.2 Mục đích dự án
    Hệ thống quản lý đặt lịch khám bệnh tại gia, cho phép:
    - **Khách hàng (Customer):** Đăng ký tài khoản, xem danh sách chuyên gia, đặt lịch hẹn khám bệnh tại nhà, theo dõi trạng thái lịch hẹn, quản lý hồ sơ y tế, thanh toán.
    - **Quản trị viên (Admin):** Quản lý chuyên gia, bệnh nhân, lịch trực, dịch vụ, phòng ban, chức vụ, tài khoản người dùng, hóa đơn thanh toán, báo cáo vận hành.

    ## 1.3 Bài toán giải quyết
    MintCare giải quyết bài toán **điều phối dịch vụ chăm sóc y tế tại gia** — kết nối bệnh nhân với đội ngũ y tá, bác sĩ, chuyên gia phục hồi chức năng, chuyên gia dinh dưỡng theo lịch hẹn trực tuyến.

    ## 1.4 Kiến trúc tổng thể

    ```
    ┌──────────────────────────────────────────────────────────────────┐
    │                        FRONTEND (Next.js 16)                    │
    │   ┌──────────────┐   ┌──────────────┐   ┌───────────────────┐   │
    │   │  Customer UI │   │   Admin UI   │   │   UI Components   │   │
    │   │  (page.tsx)  │   │  (/admin/*)  │   │   (shadcn/ui)     │   │
    │   └──────┬───────┘   └──────┬───────┘   └───────────────────┘   │
    │          │                  │                                    │
    │   ┌──────┴──────────────────┴──────┐                            │
    │   │     API Layer (fetch/authFetch) │                            │
    │   │     + LocalStorage fallback     │                            │
    │   └──────────────┬─────────────────┘                            │
    │                  │  /api/* rewrite → localhost:5000             │
    ├──────────────────┼──────────────────────────────────────────────┤
    │                  ▼                                               │
    │            BACKEND (Express.js + TypeScript)                    │
    │   ┌──────────────┬──────────────┐                               │
    │   │   Routes     │  Middleware   │                               │
    │   │  (12 files)  │ (auth.ts)    │                               │
    │   └──────┬───────┴──────┬───────┘                               │
    │          │              │                                       │
    │   ┌──────┴───────┐  ┌───┴─────────┐                            │
    │   │  Services    │  │ Validations │                            │
    │   │ (10 files)   │  │   (Zod)     │                            │
    │   └──────┬───────┘  └─────────────┘                            │
    │          │                                                      │
    │   ┌──────┴───────┐                                              │
    │   │  Prisma ORM  │                                              │
    │   └──────┬───────┘                                              │
    │          │                                                      │
    ├──────────┼──────────────────────────────────────────────────────┤
    │          ▼                                                      │
    │   ┌──────────────┐                                              │
    │   │  SQL Server  │                                              │
    │   │ DatLichKhamDB│                                              │
    │   └──────────────┘                                              │
    └──────────────────────────────────────────────────────────────────┘
    ```

    ## 1.5 Luồng hoạt động từ đầu đến cuối

    ```mermaid
    sequenceDiagram
        participant C as Customer
        participant FE as Frontend (Next.js)
        participant BE as Backend (Express)
        participant DB as SQL Server

        C->>FE: Mở trang chủ (localhost:3000)
        FE->>FE: Render Landing Page + 3D Carousel

        C->>FE: Nhấn "Đăng nhập"
        FE->>BE: POST /api/auth/login {email, password}
        BE->>DB: SELECT User WHERE Email = ?
        DB-->>BE: User record
        BE->>BE: bcrypt.compare(password, hash)
        BE->>BE: jwt.sign({id, email, role})
        BE-->>FE: {token, user}
        FE->>FE: Lưu token + user vào localStorage

        C->>FE: Chọn chuyên gia → "Đặt lịch hẹn"
        FE->>FE: Scroll xuống form đặt lịch

        C->>FE: Điền thông tin → Submit
        FE->>BE: POST /api/visits {staffId, type, date, time, userId...}
        BE->>DB: INSERT INTO Visit
        DB-->>BE: Created visit
        BE-->>FE: Visit object (status: "Chờ duyệt")

        Note over C,DB: Admin phê duyệt

        C->>FE: Mở trang Admin → Lịch trực
        FE->>BE: GET /api/visits?status=Chờ+duyệt
        BE->>DB: SELECT * FROM Visit
        DB-->>BE: Visit list
        BE-->>FE: Visits data

        C->>FE: Nhấn "Phê duyệt"
        FE->>BE: PUT /api/visits/:id {status: "Đã xác nhận"}
        BE->>DB: UPDATE Visit SET Status = 'Đã xác nhận'
        BE->>BE: ensurePatientForVisit() → Tạo Patient mới
        BE-->>FE: Updated visit
    ```

    ---

    # PHẦN 2: CÔNG NGHỆ SỬ DỤNG

    ## Frontend

    | Công nghệ | Phiên bản | Vị trí | Mục đích |
    |-----------|-----------|--------|----------|
    | **Next.js** | 16.2.9 | `frontend/` | Framework React full-stack, App Router |
    | **React** | 19.2.4 | `frontend/` | UI library |
    | **TypeScript** | ^5 | `frontend/` | Type-safe JavaScript |
    | **Tailwind CSS** | ^4 | `frontend/` | Utility-first CSS framework |
    | **shadcn/ui** | ^4.11.0 | `frontend/components/ui/` | Component library (base-nova style) |
    | **Framer Motion** | ^12.40.0 | Tất cả trang | Animation library |
    | **Recharts** | ^3.8.1 | `frontend/app/admin/reports/page.tsx` | Biểu đồ báo cáo |
    | **Lucide React** | ^1.20.0 | Tất cả file UI | Icon library |
    | **Zod** | ^4.4.3 | `frontend/lib/validations/` | Schema validation |
    | **class-variance-authority** | ^0.7.1 | `frontend/components/ui/` | Variant management cho className |
    | **clsx** | ^2.1.1 | `frontend/lib/utils.ts` | Conditional className |
    | **tailwind-merge** | ^3.6.0 | `frontend/lib/utils.ts` | Merge Tailwind classes |
    | **tw-animate-css** | ^1.4.0 | `frontend/app/globals.css` | Animation utilities |
    | **Playwright** | ^1.61.1 | `frontend/tests/` | E2E testing framework |

    ## Backend

    | Công nghệ | Phiên bản | Vị trí | Mục đích |
    |-----------|-----------|--------|----------|
    | **Express.js** | ^4.19.2 | `backend/src/` | Web framework cho Node.js |
    | **Prisma** | ^6.19.3 | `backend/prisma/` | ORM cho SQL Server |
    | **bcryptjs** | ^3.0.3 | `backend/src/services/auth.ts` | Hash mật khẩu |
    | **jsonwebtoken** | ^9.0.3 | `backend/src/middleware/auth.ts` | JWT authentication |
    | **Zod** | ^3.23.8 | `backend/src/validations/` | Request validation |
    | **cors** | ^2.8.5 | `backend/src/index.ts` | Cross-origin resource sharing |
    | **dotenv** | ^16.4.5 | `backend/src/index.ts` | Environment variables |
    | **tsx** | ^4.7.2 | `backend/` | TypeScript execution |

    ## Database

    | Công nghệ | Chi tiết |
    |-----------|----------|
    | **SQL Server** | `localhost:1433`, database `DatLichKhamDB` |
    | **Prisma Client** | ORM kết nối từ Backend → SQL Server |

    ---

    # PHẦN 3: PHÂN TÍCH CẤU TRÚC THƯ MỤC

    ```
    WebSiteDatLichKhamBenh/
    ├── backend/                          # Backend API server
    │   ├── prisma/
    │   │   ├── schema.prisma             # Database schema (10 models)
    │   │   ├── seed.ts                   # Seed dữ liệu chính
    │   │   ├── seed-departments.ts       # Seed phòng ban
    │   │   ├── seed-positions.ts         # Seed chức vụ
    │   │   ├── seed-roles.ts             # Seed vai trò
    │   │   ├── seed_services.sql         # Seed dịch vụ (SQL)
    │   │   └── migrations/               # DB migrations
    │   ├── src/
    │   │   ├── index.ts                  # Express server entry point
    │   │   ├── db.ts                     # Prisma Client singleton
    │   │   ├── middleware/
    │   │   │   └── auth.ts              # JWT auth middleware
    │   │   ├── routes/                   # 12 route files
    │   │   │   ├── auth.ts              # /api/auth/*
    │   │   │   ├── staff.ts             # /api/staff/*
    │   │   │   ├── patients.ts          # /api/patients/*
    │   │   │   ├── visits.ts            # /api/visits/*
    │   │   │   ├── logs.ts              # /api/logs/*
    │   │   │   ├── reports.ts           # /api/reports/*
    │   │   │   ├── users.ts             # /api/users/*
    │   │   │   ├── payments.ts          # /api/payments/*
    │   │   │   ├── services.ts          # /api/services/*
    │   │   │   ├── departments.ts       # /api/departments/*
    │   │   │   ├── roles.ts             # /api/roles/*
    │   │   │   └── positions.ts         # /api/positions/*
    │   │   ├── services/                 # Business logic layer
    │   │   │   ├── auth.ts              # Auth service (register/login/JWT)
    │   │   │   ├── staff.ts             # Staff CRUD + mapping
    │   │   │   ├── patient.ts           # Patient CRUD + transaction
    │   │   │   ├── visit.ts             # Visit CRUD + sync patients + reports
    │   │   │   ├── log.ts               # Activity log
    │   │   │   ├── payment.ts           # Payment CRUD + visit status update
    │   │   │   ├── service.ts           # Service CRUD
    │   │   │   ├── department.ts        # Department CRUD
    │   │   │   ├── role.ts              # Role CRUD
    │   │   │   └── position.ts          # Position CRUD
    │   │   └── validations/
    │   │       ├── schemas.ts           # Zod schemas (staff, patient, visit, log)
    │   │       └── service-schema.ts    # Zod schema cho service
    │   ├── .env                          # Environment config
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── seed-admin.js                 # Script seed admin account
    │
    ├── frontend/                         # Frontend (Next.js)
    │   ├── app/
    │   │   ├── layout.tsx               # Root layout (AuthProvider, LoadingProvider)
    │   │   ├── page.tsx                 # Trang chủ Customer (~3241 lines!)
    │   │   ├── globals.css              # Global styles + Tailwind + shadcn
    │   │   ├── favicon.ico
    │   │   ├── login/
    │   │   │   └── page.tsx            # Redirect → /?action=login
    │   │   └── admin/
    │   │       ├── layout.tsx           # Admin layout (Sidebar + Header)
    │   │       ├── page.tsx             # Dashboard tổng quan
    │   │       ├── staff/page.tsx       # Quản lý chuyên gia
    │   │       ├── patients/page.tsx    # Quản lý bệnh nhân
    │   │       ├── schedule/page.tsx    # Lịch trực (Gantt-like view)
    │   │       ├── services/page.tsx    # Quản lý dịch vụ
    │   │       ├── departments/page.tsx # Quản lý phòng ban & chức vụ
    │   │       ├── pay/page.tsx         # Hóa đơn & thanh toán
    │   │       ├── reports/page.tsx     # Báo cáo vận hành (charts)
    │   │       ├── accounts/page.tsx    # Quản lý tài khoản
    │   │       └── settings/page.tsx    # Cài đặt tài khoản
    │   ├── components/
    │   │   ├── ui/                      # 15 shadcn/ui components
    │   │   ├── layout/
    │   │   │   ├── sidebar.tsx          # Sidebar navigation admin
    │   │   │   └── header.tsx           # Header admin (search, user menu)
    │   │   ├── auth/
    │   │   │   └── login-dialog.tsx     # Login dialog component
    │   │   ├── dashboard/
    │   │   │   ├── stats.tsx            # Stats dashboard cards
    │   │   │   ├── staff-directory.tsx  # Staff directory widget
    │   │   │   ├── today-visits.tsx     # Today's visits widget
    │   │   │   ├── dispatch-map.tsx     # Dispatch map widget
    │   │   │   └── activity-log.tsx     # Activity log widget
    │   │   └── global-loading.tsx       # Global loading overlay
    │   ├── lib/
    │   │   ├── api.ts                   # API_URL + authFetch wrapper
    │   │   ├── auth-context.tsx         # AuthProvider + useAuth hook
    │   │   ├── loading-context.tsx      # LoadingProvider + useLoading hook
    │   │   ├── types.ts                 # TypeScript interfaces
    │   │   ├── utils.ts                 # cn() helper (clsx + twMerge)
    │   │   ├── mock-data.ts             # Mock data (fallback)
    │   │   └── validations/
    │   │       └── schemas.ts           # Zod schemas (frontend)
    │   ├── tests/
    │   │   ├── example.spec.ts
    │   │   └── mintcare.spec.ts
    │   ├── public/                      # Static assets (SVG icons)
    │   ├── .github/workflows/           # GitHub Actions
    │   ├── next.config.ts               # Next.js config (API rewrites)
    │   ├── postcss.config.mjs
    │   ├── components.json              # shadcn/ui config
    │   ├── playwright.config.ts         # E2E test config
    │   ├── tsconfig.json
    │   └── package.json
    │
    ├── README.md
    ├── .gitignore
    └── .kombai/
    ```

    ### Giải thích quan hệ giữa các thư mục:
    - `frontend/app/` → Next.js App Router, mỗi thư mục con = 1 route
    - `frontend/components/ui/` → Các component tái sử dụng (shadcn/ui)
    - `frontend/lib/` → Shared utilities, hooks, types
    - `backend/src/routes/` → Express route handlers
    - `backend/src/services/` → Business logic (gọi Prisma)
    - `backend/src/validations/` → Zod schemas cho validation
    - `backend/prisma/` → ORM config, seed data

    ---

    # PHẦN 4: PHÂN TÍCH TỪNG FILE CHI TIẾT

    ## 4.1 `backend/src/index.ts` — Express Server Entry

    - **Đường dẫn:** `backend/src/index.ts`
    - **Mục đích:** Server chính, cấu hình middleware và đăng ký routes
    - **Import:** express, cors, dotenv, tất cả routes, auth middleware
    - **Export:** None (chạy server)
    - **Chi tiết:**
      - Config CORS: chỉ cho phép `localhost:3000`, `localhost:3001`, `127.0.0.1:3000`
      - Security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`
      - Request logging: `[ISO timestamp] METHOD /path`
      - Parse JSON body (limit 10mb)
      - Route registration:
        - **Public:** `/api/auth`, `/api/staff`, `/api/visits`, `/api/services`, `/api/departments`, `/api/roles`, `/api/positions`
        - **Admin-only:** `/api/patients`, `/api/logs`, `/api/reports`, `/api/users`, `/api/payments`
      - Health check: `GET /health`
      - Root page: HTML response
      - Global error handler

    ## 4.2 `backend/src/db.ts` — Prisma Client Singleton

    - **Đường dẫn:** `backend/src/db.ts`
    - **Mục đích:** Tạo PrismaClient instance duy nhất
    - **Export:** `db` (PrismaClient instance)
    - **Lưu ý:** Các files `department.ts`, `role.ts`, `position.ts` KHÔNG dùng file này mà tự tạo `new PrismaClient()` → **connection leak risk**

    ## 4.3 `backend/src/middleware/auth.ts` — JWT Auth Middleware

    - **Đường dẫn:** `backend/src/middleware/auth.ts`
    - **Export:** `requireAuth`, `requireAdmin`, `AuthPayload` interface
    - **`requireAuth`:**
      - Kiểm tra header `Authorization: Bearer <token>`
      - jwt.verify(token, JWT_SECRET)
      - Populate `req.authUser` = {id, email, role}
      - Trả 401 nếu không có token hoặc token invalid
    - **`requireAdmin`:**
      - Kiểm tra `req.authUser.role === "admin"`
      - Trả 403 nếu không phải admin

    ## 4.4 `backend/src/services/auth.ts` — Auth Service

    - **Đường dẫn:** `backend/src/services/auth.ts`
    - **Export:** `registerUser`, `loginUser`, `verifyToken`
    - **`registerUser(data)`:**
      - Validate email format, password >= 6 chars, fullName >= 2 chars
      - Check duplicate email
      - bcrypt.hash(password, 10)
      - Create user in DB
      - jwt.sign({id, email, role}, JWT_SECRET, {expiresIn: "7d"})
      - Return {token, user}
    - **`loginUser(data)`:**
      - Validate email/password
      - Find user by email
      - bcrypt.compare(password, hash)
      - Sign JWT
      - Return {token, user}
      - Generic error message to prevent email enumeration
    - **`verifyToken(token)`:**
      - jwt.verify → return payload or null

    ## 4.5 `backend/src/services/visit.ts` — Visit Service (CORE, 477 lines)

    - **Đường dẫn:** `backend/src/services/visit.ts`
    - **Export:** `getVisitList`, `getVisitById`, `createVisit`, `updateVisit`, `deleteVisit`, `syncPatientsForVisits`, `getReportData`
    - **Internal:** `mapVisitToUI`, `ensurePatientForVisit`
    - **`mapVisitToUI(v)`:** Map DB columns (PascalCase) → API response (camelCase)
    - **`ensurePatientForVisit(visitId)`:** Logic phức tạp:
      1. Find visit with Patient + User
      2. Check if User already has Patient from past visits → link
      3. If Patient exists → update status, assign Staff
      4. If no Patient → create new Patient with crypto.randomUUID()
      5. Link visit to Patient
    - **`syncPatientsForVisits()`:** Batch sync — find all confirmed visits without Patient → call ensurePatientForVisit for each
    - **`getVisitList(userId?, status?, paymentStatus?)`:** Query with filters, special handling for "Chưa thanh toán" (match NULL OR explicit value)
    - **`createVisit(data)`:** Validate → check PatientId/UserId exist → create visit → auto-sync if confirmed
    - **`updateVisit(id, data)`:** Validate → update → auto-sync if confirmed
    - **`getReportData()`:** Aggregate stats: totalVisits, totalPatients, totalStaff, totalRevenue, deptBreakdown, chart data (patientInflow, staffHours), bedOccupancy

    ## 4.6 `backend/src/services/staff.ts` — Staff Service

    - **Export:** `getStaffList`, `getStaffById`, `createStaff`, `updateStaff`, `deleteStaff`
    - **Internal:** `mapStaffToUI`, `mapStaffToDb`
    - **Mapping:** DB uses PascalCase (Id, Name, Role...), API uses camelCase (id, name, role...)
    - **Delete cascade:** Delete PatientStaff → Delete Visits → Delete Staff (transaction)

    ## 4.7 `backend/src/services/patient.ts` — Patient Service

    - **Export:** `getPatientList`, `getPatientById`, `createPatient`, `updatePatient`, `deletePatient`
    - **Include PatientStaff** for assigned staff list
    - **Transaction:** Create patient + create PatientStaff relations
    - **Delete:** Unlink visits (PatientId = null) instead of deleting them → preserves history

    ## 4.8 `backend/src/services/payment.ts` — Payment Service

    - **Export:** `getPaymentList`, `getPaymentById`, `createPayment`, `deletePayment`
    - **`createPayment`:** Create Payment record → Update Visit: PaymentStatus = "Đã thanh toán", Status = "Đã hoàn tất"
    - **`deletePayment`:** Revert Visit: PaymentStatus = "Chưa thanh toán", Status = "Đã xác nhận" → Delete payment

    ## 4.9 `backend/src/services/service.ts` — Service CRUD

    - Standard CRUD: `getServiceList`, `getActiveServices`, `getServiceById`, `createService`, `updateService`, `deleteService`
    - Mapping: Id/Name/Price/Duration/Type/Active

    ## 4.10 `backend/src/services/department.ts`, `role.ts`, `position.ts`

    - Identical structure: CRUD + getActive variants
    - **BUG:** Each creates own `new PrismaClient()` instead of using `db.ts`

    ## 4.11 `backend/src/services/log.ts` — Activity Log

    - `getActivityLogs()`: Last 20 logs, ordered by CreatedAt desc
    - `createActivityLog(data)`: Validate with Zod, create record

    ## 4.12 `backend/src/validations/schemas.ts` — Zod Schemas

    - `staffSchema`: id, name, role, status (enum), department, phone, email, location, avatar, available, isNew
    - `patientSchema`: id, name, age, gender (enum), lastVisit, lastVisitTime, status (enum), summary, assignedStaff[]
    - `visitSchema`: id, type, date, patientId, userId, staffId, time, startTime, endTime, duration, status (enum), paymentMethod/Amount/Note/Status
    - `activityLogSchema`: id, status, title, desc, time, color

    ## 4.13 `backend/src/validations/service-schema.ts`

    - `serviceSchema`: id, name, description, price (int), duration, type, active

    ## 4.14 `backend/prisma/schema.prisma` — Database Schema

    10 models: Staff, Patient, Visit, ActivityLog, PatientStaff (M2M), User, Payment, Service, Department, Role, Position

    Key relations:
    - Visit → Patient (FK, nullable)
    - Visit → User (FK, nullable)
    - Visit → Staff (FK, NOT NULL)
    - Payment → Visit (FK, ON DELETE CASCADE)
    - PatientStaff → Patient + Staff (composite PK)

    ## 4.15 `frontend/app/layout.tsx` — Root Layout

    - **Font:** Inter (sans-serif, Vietnamese subset) + Geist Mono
    - **Providers:** `LoadingProvider` → `AuthProvider` → children + `GlobalLoading`
    - **Metadata:** "MintCare | Nền tảng Chăm sóc Y tế Tại gia"

    ## 4.16 `frontend/app/page.tsx` — Customer Page (~3241 lines!)

    **File lớn nhất dự án.** Chứa toàn bộ customer experience.

    **Sub-components:**
    - `Doctor3DCarousel`: 3D rotating staff cards with hover details, auto-play, drag support
    - Review dialog per specialist (hardcoded SPECIALIST_REVIEWS)

    **Sections:**
    1. **Guest Landing:** Hero + value propositions + specialist carousel + contact
    2. **Booking Workspace (logged in):** Booking form + payment preview + appointment history + health profile
    3. **Auth Modal:** Sliding login/register with Google/Facebook quick login
    4. **Settings Modal:** Profile edit + password change
    5. **Toast system:** Custom notification popups

    **States:** ~40+ useState hooks
    **Key functions:** handleCreateBooking, handleCancelBooking, handleDownloadSlip, handleSaveProfile, handleChangePassword, selectSpecialistForBooking

    ## 4.17 `frontend/lib/auth-context.tsx` — Auth Provider

    - **Dual system:** Try backend API first, fallback to localStorage
    - **Default local user:** `evelyn.green@gmail.com` / `123456`
    - **localStorage keys:** `mintcare_users`, `mintcare_token`, `mintcare_user`
    - **`login()`:** POST /api/auth/login → catch → loginLocal()
    - **`register()`:** POST /api/auth/register → catch → registerLocal()
    - **`logout()`:** Remove tokens, set user = null

    ## 4.18 `frontend/lib/api.ts` — API Helper

    ```typescript
    export const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
    // Frontend rewrites /api/* → http://localhost:5000/api/*

    export async function authFetch(url, options) {
      // Attach Bearer token from localStorage
    }
    ```

    ## 4.19 `frontend/lib/types.ts` — TypeScript Interfaces

    - `Staff`: {id, name, role, status, department, phone, email, location, avatar, available, isNew}
    - `Patient`: {id, name, age, gender, lastVisit, lastVisitTime, status, summary, assignedStaff[]}
    - `Visit`: {id, type, patientId, staffId, userId, time, duration, status, paymentMethod/Amount/Note/Status}
    - `ActivityLogEntry`: {id, status, title, desc, time, color}
    - Type aliases: StaffStatus, PatientStatus, VisitStatus

    ## 4.20 `frontend/app/admin/layout.tsx` — Admin Layout

    - Auth guard: Redirect to `/` if not logged in or not admin
    - Layout: Sidebar (fixed, w-64) + Header + Main content
    - Loading spinner while checking auth

    ## 4.21 `frontend/app/admin/page.tsx` — Admin Dashboard

    - Hero section with greeting
    - Stats component
    - Grid: StaffDirectory + TodayVisits + DispatchMap + ActivityLog

    ## 4.22 `frontend/app/admin/staff/page.tsx` (758 lines)

    - Staff grid with search/filter
    - Add/Edit/Delete staff dialogs
    - Avatar upload (drag & drop, FileReader → base64)
    - Department/Position dropdowns (loaded from API)

    ## 4.23 `frontend/app/admin/patients/page.tsx` (~1300+ lines)

    - Patient table with expandable rows (medical info, assigned staff, treatment history)
    - Add/Edit/Delete patient dialogs
    - Staff multi-select component
    - Auto-sync patients from visits
    - CSV export

    ## 4.24 `frontend/app/admin/schedule/page.tsx` (~1300+ lines)

    - Gantt-like timeline view (08:00-20:00)
    - Session cards with position/duration calculations
    - Create/Edit/Delete session dialogs
    - Approve pending visits dialog
    - Payment form dialog
    - Tooltip on hover with full visit details

    ## 4.25 `frontend/app/admin/services/page.tsx` (735 lines)

    - Service cards grid
    - Add/Edit/Toggle active/Delete service dialogs
    - Fallback hardcoded data if API unavailable

    ## 4.26 `frontend/app/admin/departments/page.tsx` (450 lines)

    - Tab switcher: Departments vs Positions
    - Shared CRUD components (Add, Edit, Toggle, Delete, ItemCard)
    - Single page handles both departments and positions

    ## 4.27 `frontend/app/admin/pay/page.tsx` (483 lines)

    - Left panel: Pending visits list + Payment form
    - Right panel: Invoice history
    - Auto-prefill amount based on visit type
    - Stats: Chờ thanh toán / Đã thanh toán / Tổng doanh thu

    ## 4.28 `frontend/app/admin/reports/page.tsx` (797 lines)

    - Area chart: Visit trends (week comparison)
    - Pie chart: Department breakdown
    - Stats cards: Total visits, Patients, CSAT, Staff
    - Payment summary section
    - Top staff ranking
    - Recent reports list

    ## 4.29 `frontend/app/admin/accounts/page.tsx` (514 lines)

    - Account table with search/role filter
    - Add/Edit/Delete account dialogs
    - Password visibility toggle

    ## 4.30 `frontend/app/admin/settings/page.tsx` (462 lines)

    - Profile section: name, email, phone, role
    - Notification settings (push, email, SMS — switch toggles, no backend)
    - Security: Password change dialog
    - Preferences: Language (hardcoded Vietnamese)

    ## 4.31 `frontend/components/layout/sidebar.tsx` (122 lines)

    - Fixed left sidebar (w-64)
    - MintCare logo + version badge
    - 9 nav items with active state highlighting
    - Security status card at bottom

    ## 4.32 `frontend/components/layout/header.tsx` (555 lines)

    - Search bar with ⌘K hint
    - System status badge
    - User dropdown menu (profile, help, logout)
    - Auth dialog (login/register tabs)
    - Help dialog with topic selection

    ## 4.33 `frontend/components/global-loading.tsx` (49 lines)

    - Full-screen overlay with blur backdrop
    - Animated spinner + loading message
    - Controlled by LoadingContext

    ## 4.34 `frontend/lib/loading-context.tsx` (42 lines)

    - LoadingProvider with `show(message?)` and `hide()` functions
    - Global loading state management

    ## 4.35 `frontend/lib/mock-data.ts` (171 lines)

    - Mock staff (4 members), patients (3), visits (4), logs (3)
    - Mock report data (patientInflow, bedOccupancy, staffHours)
    - Used as fallback when API unavailable

    ## 4.36 `frontend/lib/utils.ts` (6 lines)

    - `cn()` = twMerge(clsx(...inputs)) — Tailwind class merging utility

    ## 4.37 `frontend/lib/validations/schemas.ts` (48 lines)

    - Duplicate of backend schemas (staffSchema, patientSchema, visitSchema, activityLogSchema)
    - Slightly different validation rules

    ## 4.38 `frontend/app/globals.css` (90 lines)

    - Imports: tailwindcss, tw-animate-css, shadcn/tailwind.css
    - Custom theme: Primary (#18BE66), Action (#18181B), Surface colors
    - Custom utilities: .tight-tracking, .eyebrow, .animate-shimmer
    - Base layer: box-sizing, font-sans, overflow-x hidden

    ## 4.39 `frontend/next.config.ts` (16 lines)

    - API rewrites: `/api/:path*` → `http://localhost:5000/api/:path*`
    - Empty images.domains

    ## 4.40 `frontend/components.json` (25 lines)

    - shadcn/ui config: base-nova style, RSC enabled, lucide icons, aliases configured

    ## 4.41 Backend Routes Summary

    All 12 route files follow the same pattern:
    1. Import Router, service functions, middleware
    2. Define routes with async handlers
    3. Call service function, return JSON response
    4. Error handling with try/catch

    Specific auth middleware usage:
    - **No auth:** GET /api/staff, GET /api/visits, GET /api/services, GET /api/departments, GET /api/roles, GET /api/positions
    - **Auth required:** POST /api/visits, DELETE /api/visits/:id
    - **Admin required:** POST/PUT/DELETE /api/staff, POST/PUT/DELETE /api/patients, POST /api/visits/sync-patients, PUT /api/visits/:id, all /api/users, all /api/payments, POST/PUT/DELETE /api/services, POST/PUT/DELETE /api/departments, POST/PUT/DELETE /api/roles, POST/PUT/DELETE /api/positions, all /api/logs, all /api/reports

    ---

    # PHẦN 5: LUỒNG CHƯƠNG TRÌNH

    ## 5.1 Luồng Đăng nhập

    ```
    User enters email/password
      → Frontend: handleLocalLogin()
        → authContext.login(email, password)
          → POST /api/auth/login {email, password}
            → Backend: routes/auth.ts → services/auth.ts → loginUser()
              → DB: SELECT User WHERE Email = ?
              → bcrypt.compare()
              → jwt.sign({id, email, role})
            → Return {token, user}
          → localStorage.setItem("mintcare_token", token)
          → localStorage.setItem("mintcare_user", JSON.stringify(user))
          → setUser(user)
        → If admin → router.push("/admin")
        → If customer → scroll to booking section
    ```

    ## 5.2 Luồng Đặt lịch hẹn

    ```
    Customer selects specialist → scrolls to form
      → Fills: service, date, time slot, payment method, notes
      → handleCreateBooking()
        → POST /api/visits {id, type, date, staffId, userId, time, status: "Chờ duyệt"}
          → Backend: validate → create visit in DB
        → Frontend saves to myBookings + localStorage
        → Toast: "Gửi yêu cầu thành công! Chờ Admin phê duyệt"
    ```

    ## 5.3 Luồng Phê duyệt lịch hẹn (Admin)

    ```
    Admin opens Schedule page
      → GET /api/visits → shows all visits including "Chờ duyệt"
      → Clicks "Duyệt lịch hẹn" → sees pending list
      → Clicks "Phê duyệt" on a visit
        → PUT /api/visits/:id {status: "Đã xác nhận"}
          → Backend: update visit status
          → Backend: ensurePatientForVisit()
            → Create Patient record (if not exists)
            → Link Patient ↔ Staff via PatientStaff
        → Frontend: reload visits list
    ```

    ## 5.4 Luồng Thanh toán

    ```
    Admin opens Pay page
      → GET /api/visits?status=Đã+xác+nận&paymentStatus=Chưa+thanh+t toán
      → Shows pending visits + invoice form
      → Admin selects visit, enters amount, method, note
      → POST /api/payments {visitId, amount, method, note}
        → Backend: create Payment record
        → Backend: update Visit → PaymentStatus = "Đã thanh toán", Status = "Đã hoàn tất"
      → Frontend: refresh pending visits + invoice history
    ```

    ---

    # PHẦN 6: PHÂN TÍCH API CHI TIẾT

    ## Auth APIs

    | Method | URL | Input | Output | Middleware |
    |--------|-----|-------|--------|-----------|
    | POST | `/api/auth/register` | {email, password, fullName, phone?, role?} | {token, user} | None |
    | POST | `/api/auth/login` | {email, password} | {token, user} | None |
    | GET | `/api/auth/me` | - | {id, email, fullName, phone, role, age, gender} | Bearer token |

    ## Staff APIs

    | Method | URL | Input | Output | Middleware |
    |--------|-----|-------|--------|-----------|
    | GET | `/api/staff` | - | Staff[] | None |
    | GET | `/api/staff/:id` | - | Staff | None |
    | POST | `/api/staff` | Staff body | Staff | Admin |
    | PUT | `/api/staff/:id` | Partial Staff | Staff | Admin |
    | DELETE | `/api/staff/:id` | - | {message} | Admin |

    ## Visit APIs

    | Method | URL | Input | Output | Middleware |
    |--------|-----|-------|--------|-----------|
    | GET | `/api/visits?userId=&status=&paymentStatus=` | - | Visit[] | None |
    | GET | `/api/visits/:id` | - | Visit | None |
    | POST | `/api/visits` | Visit body | Visit | Bearer |
    | POST | `/api/visits/sync-patients` | - | {message, count} | Admin |
    | PUT | `/api/visits/:id` | Partial Visit | Visit | Admin |
    | DELETE | `/api/visits/:id` | - | {message} | Bearer |

    ## Patient APIs

    | Method | URL | Input | Output | Middleware |
    |--------|-----|-------|--------|-----------|
    | GET | `/api/patients` | - | Patient[] | Admin |
    | GET | `/api/patients/:id` | - | Patient | Admin |
    | POST | `/api/patients` | Patient body | Patient | Admin |
    | PUT | `/api/patients/:id` | Partial Patient | Patient | Admin |
    | DELETE | `/api/patients/:id` | - | {message} | Admin |

    ## Payment APIs

    | Method | URL | Input | Output | Middleware |
    |--------|-----|-------|--------|-----------|
    | GET | `/api/payments` | - | Payment[] | Admin |
    | GET | `/api/payments/:id` | - | Payment | Admin |
    | POST | `/api/payments` | {visitId, userId?, amount, method, note?} | Payment | Admin |
    | DELETE | `/api/payments/:id` | - | {success: true} | Admin |

    ## User Management APIs

    | Method | URL | Input | Output | Middleware |
    |--------|-----|-------|--------|-----------|
    | GET | `/api/users` | - | User[] | Admin |
    | POST | `/api/users` | {email, password, fullName, phone?, role?, age?, gender?} | User | Admin |
    | PUT | `/api/users/:id` | Partial User (incl. password) | User | Admin |
    | DELETE | `/api/users/:id` | - | {success, message} | Admin |

    ## Service APIs

    | Method | URL | Input | Output | Middleware |
    |--------|-----|-------|--------|-----------|
    | GET | `/api/services` | - | Service[] | None |
    | GET | `/api/services/active` | - | Service[] | None |
    | GET | `/api/services/:id` | - | Service | None |
    | POST | `/api/services` | Service body | Service | Admin |
    | PUT | `/api/services/:id` | Partial Service | Service | Admin |
    | DELETE | `/api/services/:id` | - | {message} | Admin |

    ## Department/Role/Position APIs (identical pattern)

    | Method | URL | Middleware |
    |--------|-----|-----------|
    | GET | `/api/departments` | None |
    | GET | `/api/departments/active` | None |
    | GET | `/api/departments/:id` | None |
    | POST | `/api/departments` | Admin |
    | PUT | `/api/departments/:id` | Admin |
    | DELETE | `/api/departments/:id` | Admin |

    Same pattern for `/api/roles` and `/api/positions`.

    ---

    # PHẦN 7: DATABASE

    ## 7.1 Schema Models (10 models)

    ```
    ┌──────────┐     ┌──────────────┐     ┌──────────┐
    │  Staff   │────<│ PatientStaff │>────│ Patient  │
    │          │     │ (composite)  │     │          │
    └────┬─────┘     └──────────────┘     └────┬─────┘
        │                                      │
        │         ┌──────────┐                │
        └────────>│  Visit   │<───────────────┘
                  │          │
                  └────┬─────┘
                        │
                  ┌────┴─────┐
                  │ Payment  │
                  └──────────┘

    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
    │   User   │  │ Service  │  │Department│  │   Role   │
    └──────────┘  └──────────┘  └──────────┘  └──────────┘

    ┌──────────┐  ┌──────────────┐
    │ Position │  │ ActivityLog  │
    └──────────┘  └──────────────┘
    ```

    ## 7.2 Chi tiết từng bảng

    ### User
    | Field | Type | Constraint |
    |-------|------|------------|
    | Id | NVARCHAR(50) | PK, default uuid() |
    | Email | NVARCHAR(200) | UNIQUE |
    | PasswordHash | NVARCHAR(500) | NOT NULL |
    | FullName | NVARCHAR(200) | NOT NULL |
    | Phone | NVARCHAR(30) | Nullable |
    | Role | NVARCHAR(20) | DEFAULT 'customer' |
    | Age | INT | Nullable |
    | Gender | NVARCHAR(20) | Nullable |
    | CreatedAt | DATETIME | DEFAULT now() |

    ### Staff
    | Field | Type | Constraint |
    |-------|------|------------|
    | Id | NVARCHAR(50) | PK |
    | Name | NVARCHAR(200) | NOT NULL |
    | Role | NVARCHAR(100) | NOT NULL |
    | Status | NVARCHAR(100) | NOT NULL |
    | Department | NVARCHAR(100) | NOT NULL |
    | Phone | NVARCHAR(20) | NOT NULL |
    | Email | NVARCHAR(200) | NOT NULL |
    | Location | NVARCHAR(200) | NOT NULL |
    | Avatar | NVARCHAR(MAX) | Nullable |
    | Available | BOOLEAN | DEFAULT true |
    | IsNew | BOOLEAN | DEFAULT false |

    ### Patient
    | Field | Type | Constraint |
    |-------|------|------------|
    | Id | NVARCHAR(50) | PK |
    | Name | NVARCHAR(200) | NOT NULL |
    | Age | INT | NOT NULL |
    | Gender | NVARCHAR(20) | NOT NULL |
    | LastVisit | NVARCHAR(100) | Nullable |
    | LastVisitTime | NVARCHAR(100) | Nullable |
    | Status | NVARCHAR(100) | Nullable |
    | Summary | NVARCHAR(MAX) | Nullable |

    ### Visit
    | Field | Type | Constraint |
    |-------|------|------------|
    | Id | NVARCHAR(50) | PK |
    | Type | NVARCHAR(100) | Nullable |
    | PatientId | NVARCHAR(50) | FK → Patient (nullable) |
    | UserId | NVARCHAR(50) | FK → User (nullable) |
    | StaffId | NVARCHAR(50) | FK → Staff (NOT NULL) |
    | Date | NVARCHAR(20) | Nullable |
    | Time | NVARCHAR(100) | Nullable |
    | StartTime | NVARCHAR(100) | Nullable |
    | EndTime | NVARCHAR(100) | Nullable |
    | Duration | NVARCHAR(100) | Nullable |
    | Status | NVARCHAR(100) | Nullable |
    | PaymentMethod | NVARCHAR(100) | Nullable |
    | PaymentAmount | NVARCHAR(100) | Nullable |
    | PaymentNote | NVARCHAR(MAX) | Nullable |
    | PaymentStatus | NVARCHAR(100) | Nullable |

    ### Payment
    | Field | Type | Constraint |
    |-------|------|------------|
    | Id | NVARCHAR(50) | PK, uuid |
    | VisitId | NVARCHAR(50) | FK → Visit (ON DELETE CASCADE) |
    | UserId | NVARCHAR(50) | Nullable |
    | Amount | NVARCHAR(50) | NOT NULL |
    | Method | NVARCHAR(50) | NOT NULL |
    | Status | NVARCHAR(50) | DEFAULT 'Đã thanh toán' |
    | Note | NVARCHAR(MAX) | Nullable |
    | CreatedAt | DATETIME | DEFAULT now() |

    ### PatientStaff (Many-to-Many)
    | Field | Type | Constraint |
    |-------|------|------------|
    | PatientId | NVARCHAR(50) | PK (composite) + FK → Patient |
    | StaffId | NVARCHAR(50) | PK (composite) + FK → Staff |

    ### Service
    | Field | Type | Constraint |
    |-------|------|------------|
    | Id | NVARCHAR(50) | PK, uuid |
    | Name | NVARCHAR(200) | NOT NULL |
    | Description | NVARCHAR(MAX) | Nullable |
    | Price | INT | NOT NULL |
    | Duration | NVARCHAR(20) | NOT NULL |
    | Type | NVARCHAR(100) | NOT NULL |
    | Active | BOOLEAN | DEFAULT true |

    ### Department / Role / Position (identical structure)
    | Field | Type | Constraint |
    |-------|------|------------|
    | Id | NVARCHAR(50) | PK, uuid |
    | Name | NVARCHAR(200) | NOT NULL |
    | Description | NVARCHAR(MAX) | Nullable |
    | Active | BOOLEAN | DEFAULT true |

    ### ActivityLog
    | Field | Type | Constraint |
    |-------|------|------------|
    | Id | NVARCHAR(50) | PK |
    | Status | NVARCHAR(50) | Nullable |
    | Title | NVARCHAR(200) | Nullable |
    | Desc | NVARCHAR(MAX) | Nullable |
    | Time | NVARCHAR(50) | Nullable |
    | Color | NVARCHAR(50) | Nullable |
    | CreatedAt | DATETIME | DEFAULT now() |

    ## 7.3 Visit Status Flow

    ```
    "Chờ duyệt" → "Đã xác nhận" → "Đang thực hiện" → "Đã hoàn tất"
                                      ↓
                                  "Đã hủy"
    ```

    ---

    # PHẦN 8: FRONTEND CHI TIẾT

    ## 8.1 Trang Customer (`/`)

    - **Hero Section:** Landing page với CTA
    - **Specialist Carousel:** 3D card carousel (Framer Motion)
    - **Value Propositions:** 3 features cards
    - **Booking Form:** Chọn chuyên gia, dịch vụ, ngày, giờ, thanh toán
    - **Payment Preview:** Hóa đơn xem trước real-time
    - **Appointment History:** Danh sách lịch hẹn + progress stepper
    - **Health Profile:** Hồ sơ y tế editor
    - **Contact:** Form liên hệ + hotline

    ## 8.2 Trang Admin

    | Route | Component | Chức năng |
    |-------|-----------|-----------|
    | `/admin` | Dashboard | Stats, staff directory, today visits, dispatch map, activity log |
    | `/admin/staff` | StaffPage | Grid staff cards, CRUD dialogs, search |
    | `/admin/patients` | PatientsPage | Table + expandable rows, CRUD, CSV export |
    | `/admin/schedule` | SchedulePage | Gantt timeline, session CRUD, approve visits, payment |
    | `/admin/services` | ServicesPage | Service cards grid, CRUD + toggle active |
    | `/admin/departments` | DepartmentsPage | Tab departments/positions, shared CRUD |
    | `/admin/pay` | AdminPayPage | Pending visits + payment form + invoice history |
    | `/admin/reports` | ReportsPage | Area/Pie charts, stats, payment summary |
    | `/admin/accounts` | AccountsPage | Account table, CRUD |
    | `/admin/settings` | SettingsPage | Profile edit, password change, notification prefs |

    ## 8.3 Component Architecture

    ```
    App Layout
    ├── LoadingProvider (global loading state)
    ├── AuthProvider (auth state)
    │   ├── RootLayout
    │   │   ├── page.tsx (Customer)
    │   │   └── admin/
    │   │       ├── layout.tsx (auth guard)
    │   │       │   ├── Sidebar
    │   │       │   ├── Header
    │   │       │   └── children (admin pages)
    │   │       └── [admin pages]
    │   └── GlobalLoading (overlay)
    ```

    ## 8.4 State Management

    - **No Redux/Zustand** — pure React useState + Context
    - **Auth state:** `useAuth()` → AuthContext
    - **Loading state:** `useLoading()` → LoadingContext
    - **Page state:** Local useState in each page component

    ---

    # PHẦN 9: BACKEND CHI TIẾT

    ## 9.1 Architecture Pattern

    ```
    Route (HTTP handler) → Service (business logic) → Prisma (ORM) → SQL Server
    ```

    No Controller/Repository separation — simplified architecture.

    ## 9.2 Authentication Flow

    1. User sends POST /api/auth/login with email/password
    2. Route validates input
    3. Service finds user by email, compares password with bcrypt
    4. If valid: sign JWT (7 day expiry) with {id, email, role}
    5. Return {token, user}

    ## 9.3 Authorization

    - **Public endpoints:** No middleware
    - **Auth required:** `requireAuth` → checks Bearer token
    - **Admin only:** `requireAuth` + `requireAdmin` → checks role === "admin"

    ## 9.4 Data Mapping Pattern

    Every service has mapping functions:
    - `mapXToUI(dbObject)`: PascalCase → camelCase (for API response)
    - `mapXToDb(uiObject)`: camelCase → PascalCase (for DB operations)

    ## 9.5 Validation

    - **Backend:** Zod schemas in `validations/schemas.ts`
    - **Frontend:** Duplicate Zod schemas in `lib/validations/schemas.ts`
    - **Route level:** Manual checks for required fields

    ---

    # PHẦN 10: THƯ VIỆN CHI TIẾT

    ## Frontend Dependencies

    | Thư viện | Phiên bản | Chức năng | File sử dụng |
    |-----------|-----------|-----------|--------------|
    | `next` | 16.2.9 | Framework | Tất cả app/* |
    | `react` / `react-dom` | 19.2.4 | UI rendering | Tất cả |
    | `framer-motion` | ^12.40.0 | Animation | page.tsx, admin pages |
    | `recharts` | ^3.8.1 | Charts | reports/page.tsx |
    | `lucide-react` | ^1.20.0 | Icons | Tất cả file UI |
    | `zod` | ^4.4.3 | Validation | lib/validations/ |
    | `@base-ui/react` | ^1.5.0 | Base UI | components/ui/ |
    | `@prisma/client` | ^6.2.1 | ORM | (unused in frontend) |
    | `class-variance-authority` | ^0.7.1 | Variants | components/ui/button.tsx |
    | `clsx` | ^2.1.1 | Classnames | lib/utils.ts |
    | `tailwind-merge` | ^3.6.0 | Class merge | lib/utils.ts |
    | `shadcn` | ^4.11.0 | Scaffolding | components.json |
    | `tw-animate-css` | ^1.4.0 | Animations | globals.css |
    | `@playwright/test` | ^1.61.1 | E2E testing | tests/ |

    ## Backend Dependencies

    | Thư viện | Phiên bản | Chức năng | File sử dụng |
    |-----------|-----------|-----------|--------------|
    | `express` | ^4.19.2 | HTTP server | src/index.ts |
    | `@prisma/client` | ^6.19.3 | ORM | src/db.ts, all services |
    | `bcryptjs` | ^3.0.3 | Password hash | services/auth.ts, routes/users.ts |
    | `jsonwebtoken` | ^9.0.3 | JWT | middleware/auth.ts, services/auth.ts |
    | `zod` | ^3.23.8 | Validation | validations/* |
    | `cors` | ^2.8.5 | CORS | src/index.ts |
    | `dotenv` | ^16.4.5 | Env vars | src/index.ts |
    | `tsx` | ^4.7.2 | TS execution | dev server |
    | `typescript` | ^5.4.5 | Type checking | tsconfig.json |

    ---

    # PHẦN 11: CẤU HÌNH

    ## `.env` (backend)
    ```
    DATABASE_URL="sqlserver://localhost:1433;database=DatLichKhamDB;user=prisma;password=Prisma123;trustServerCertificate=true"
    PORT=5000
    JWT_SECRET=mintcare_super_secret_jwt_key_2024_do_not_share
    ```

    ## `next.config.ts` (frontend)
    - API proxy: `/api/:path*` → `http://localhost:5000/api/:path*`
    - images.domains: [] (empty)

    ## `tsconfig.json` (both)
    - Backend: target ES2022, module node16
    - Frontend: target ES2017, module esnext, bundler resolution

    ---

    # PHẦN 12: ĐIỂM MẠNH

    1. **Kiến trúc Backend-Frontend tách biệt rõ ràng** — API-based, dễ scale và maintain.
    2. **Dual auth system** — Fallback từ backend API sang localStorage, chạy được offline/development.
    3. **Zod validation** — Cả backend lẫn frontend đều validate data bằng Zod.
    4. **Prisma ORM** — Type-safe database queries, migration management tốt.
    5. **UI hiện đại** — shadcn/ui + Framer Motion + Tailwind — giao diện đẹp, animation mượt.
    6. **Security cơ bản** — JWT auth, bcrypt hashing, CORS restriction, security headers.
    7. **Role-based access control** — Phân quyền admin/customer ở cả frontend và backend.
    8. **Auto patient sync** — Khi visit được duyệt, tự động tạo Patient record.
    9. **E2E testing setup** — Playwright với 3 browsers.
    10. **Responsive design** — Tailwind responsive utilities xuyên suốt.

    ---

    # PHẦN 13: ĐIỂM YẾU

    1. **`page.tsx` customer ~3241 dòng** — "God component", quá lớn, khó maintain.
    2. **~40 useState trong BookingPage** — State management phức tạp, nên dùng useReducer hoặc Zustand.
    3. **Duplicate code** — `schemas.ts` (Zod) bị duplicate ở cả frontend/backend.
    4. **Mock data fallback** — Hardcoded fallbacks gây data inconsistency risk.
    5. **Hardcoded values** — Magic numbers (giá tiền), hardcoded addresses, email.
    6. **No React Error Boundaries** — Thiếu graceful error handling.
    7. **Missing TypeScript types** — `any` used extensively in service layer.
    8. **PrismaClient leak** — department.ts, role.ts, position.ts tạo own PrismaClient.
    9. **No rate limiting** — API dễ bị abuse.
    10. **No refresh token** — JWT hết hạn thì user bị logout.
    11. **No input sanitization** — XSS risk in some fields.
    12. **Payment validation weakness** — Frontend tự set amount, không cross-check với backend.

    ---

    # PHẦN 14: ĐỀ XUẤT TỐI ƯU

    | # | Tối ưu | Lợi ích |
    |---|--------|---------|
    | 1 | Tách `page.tsx` customer thành 10+ components | Dễ maintain, test |
    | 2 | Dùng Zustand/Redux thay 40 useState | State management tập trung |
    | 3 | Unify PrismaClient instance | Tránh connection leak |
    | 4 | Thêm payment validation ở backend | Tránh manipulated amounts |
    | 5 | Thêm rate limiting (express-rate-limit) | Bảo vệ API |
    | 6 | Type all API responses | Type safety |
    | 7 | Tách validation schemas thành shared package | DRY |
    | 8 | Thay mock-data fallback bằng error states | UX tốt hơn |
    | 9 | Implement refresh token | Better auth UX |
    | 10 | Thêm React Error Boundaries | Graceful errors |
    | 11 | Thay `any` bằng proper types | IDE support, safety |
    | 12 | Thêm pagination | Performance |

    ---

    # PHẦN 15: ROADMAP HỌC DỰ ÁN

    **Bước 1:** Đọc `.env` và `package.json` → Hiểu công nghệ

    **Bước 2:** Đọc `backend/prisma/schema.prisma` → Hiểu data model

    **Bước 3:** Đọc `backend/src/index.ts` → Hiểu server structure

    **Bước 4:** Đọc `backend/src/middleware/auth.ts` → Hiểu auth flow

    **Bước 5:** Đọc `backend/src/services/auth.ts` → Hiểu login/register

    **Bước 6:** Đọc `backend/src/services/visit.ts` → Core business logic

    **Bước 7:** Đọc 12 route files → Hiểu API endpoints

    **Bước 8:** Đọc các service còn lại → Hoàn thiện backend

    **Bước 9:** Đọc `frontend/lib/auth-context.tsx` → Frontend auth

    **Bước 10:** Đọc `frontend/lib/api.ts` → Frontend → Backend connection

    **Bước 11:** Đọc `frontend/app/layout.tsx` → App structure

    **Bước 12:** Đọc `frontend/app/admin/layout.tsx` → Admin auth guard

    **Bước 13:** Đọc `frontend/components/layout/sidebar.tsx` → Navigation

    **Bước 14:** Đọc `frontend/app/page.tsx` → Customer flow

    **Bước 15:** Đọc lần lượt admin pages → Admin features

    **Bước 16:** Đọc `frontend/components/dashboard/` → Dashboard widgets

    **Bước 17:** Chạy seed → run backend → run frontend → Test toàn bộ flow

    ---

    # BẢNG TÓM TẮT TOÀN BỘ FILE

    | # | Đường dẫn | Loại | Chức năng | Quan trọng |
    |---|-----------|------|-----------|------------|
    | 1 | `backend/src/index.ts` | TS | Express server entry, routes, middleware | ★★★★★ |
    | 2 | `backend/src/db.ts` | TS | PrismaClient singleton | ★★★★☆ |
    | 3 | `backend/src/middleware/auth.ts` | TS | JWT auth middleware | ★★★★★ |
    | 4 | `backend/src/services/auth.ts` | TS | Register, login, JWT | ★★★★★ |
    | 5 | `backend/src/services/visit.ts` | TS | Visit CRUD, patient sync, reports (477 lines) | ★★★★★ |
    | 6 | `backend/src/services/staff.ts` | TS | Staff CRUD + mapping | ★★★★☆ |
    | 7 | `backend/src/services/patient.ts` | TS | Patient CRUD + transaction | ★★★★☆ |
    | 8 | `backend/src/services/payment.ts` | TS | Payment CRUD + visit status | ★★★★☆ |
    | 9 | `backend/src/services/service.ts` | TS | Service CRUD | ★★★☆☆ |
    | 10 | `backend/src/services/department.ts` | TS | Department CRUD (has PrismaClient bug) | ★★★☆☆ |
    | 11 | `backend/src/services/role.ts` | TS | Role CRUD (has PrismaClient bug) | ★★★☆☆ |
    | 12 | `backend/src/services/position.ts` | TS | Position CRUD (has PrismaClient bug) | ★★★☆☆ |
    | 13 | `backend/src/services/log.ts` | TS | Activity log | ★★☆☆☆ |
    | 14 | `backend/src/routes/auth.ts` | TS | Auth routes | ★★★★★ |
    | 15 | `backend/src/routes/staff.ts` | TS | Staff routes | ★★★★☆ |
    | 16 | `backend/src/routes/visits.ts` | TS | Visit routes + sync | ★★★★★ |
    | 17 | `backend/src/routes/patients.ts` | TS | Patient routes | ★★★★☆ |
    | 18 | `backend/src/routes/users.ts` | TS | User management routes | ★★★★☆ |
    | 19 | `backend/src/routes/payments.ts` | TS | Payment routes | ★★★★☆ |
    | 20 | `backend/src/routes/services.ts` | TS | Service routes | ★★★☆☆ |
    | 21 | `backend/src/routes/departments.ts` | TS | Department routes | ★★★☆☆ |
    | 22 | `backend/src/routes/roles.ts` | TS | Role routes | ★★★☆☆ |
    | 23 | `backend/src/routes/positions.ts` | TS | Position routes | ★★★☆☆ |
    | 24 | `backend/src/routes/logs.ts` | TS | Activity log routes | ★★☆☆☆ |
    | 25 | `backend/src/routes/reports.ts` | TS | Reports route | ★★★☆☆ |
    | 26 | `backend/src/validations/schemas.ts` | TS | Zod schemas | ★★★★☆ |
    | 27 | `backend/src/validations/service-schema.ts` | TS | Service schema | ★★★☆☆ |
    | 28 | `backend/prisma/schema.prisma` | Prisma | Database schema (10 models) | ★★★★★ |
    | 29 | `backend/prisma/seed.ts` | TS | Seed data | ★★★☆☆ |
    | 30 | `backend/prisma/seed-departments.ts` | TS | Seed departments | ★★☆☆☆ |
    | 31 | `backend/prisma/seed-positions.ts` | TS | Seed positions | ★★☆☆☆ |
    | 32 | `backend/prisma/seed-roles.ts` | TS | Seed roles | ★★☆☆☆ |
    | 33 | `backend/prisma/seed_services.sql` | SQL | Seed services | ★★☆☆☆ |
    | 34 | `backend/.env` | ENV | Config | ★★★★☆ |
    | 35 | `backend/package.json` | JSON | Dependencies | ★★★★☆ |
    | 36 | `backend/seed-admin.js` | JS | Admin seed script | ★★★☆☆ |
    | 37 | `frontend/app/layout.tsx` | TSX | Root layout | ★★★★★ |
    | 38 | `frontend/app/page.tsx` | TSX | Customer page (~3241 lines!) | ★★★★★ |
    | 39 | `frontend/app/globals.css` | CSS | Global styles + Tailwind config | ★★★★☆ |
    | 40 | `frontend/app/login/page.tsx` | TSX | Login redirect | ★★☆☆☆ |
    | 41 | `frontend/app/admin/layout.tsx` | TSX | Admin layout + auth guard | ★★★★★ |
    | 42 | `frontend/app/admin/page.tsx` | TSX | Admin dashboard | ★★★★☆ |
    | 43 | `frontend/app/admin/staff/page.tsx` | TSX | Staff management (758 lines) | ★★★★☆ |
    | 44 | `frontend/app/admin/patients/page.tsx` | TSX | Patient management (1300+ lines) | ★★★★★ |
    | 45 | `frontend/app/admin/schedule/page.tsx` | TSX | Schedule/Gantt view (1300+ lines) | ★★★★★ |
    | 46 | `frontend/app/admin/services/page.tsx` | TSX | Service management (735 lines) | ★★★★☆ |
    | 47 | `frontend/app/admin/departments/page.tsx` | TSX | Department + Position (450 lines) | ★★★★☆ |
    | 48 | `frontend/app/admin/pay/page.tsx` | TSX | Payment management (483 lines) | ★★★★☆ |
    | 49 | `frontend/app/admin/reports/page.tsx` | TSX | Reports + charts (797 lines) | ★★★★☆ |
    | 50 | `frontend/app/admin/accounts/page.tsx` | TSX | Account management (514 lines) | ★★★★☆ |
    | 51 | `frontend/app/admin/settings/page.tsx` | TSX | Settings (462 lines) | ★★★☆☆ |
    | 52 | `frontend/components/layout/sidebar.tsx` | TSX | Admin sidebar | ★★★★☆ |
    | 53 | `frontend/components/layout/header.tsx` | TSX | Admin header (555 lines) | ★★★★☆ |
    | 54 | `frontend/components/auth/login-dialog.tsx` | TSX | Login dialog | ★★★☆☆ |
    | 55 | `frontend/components/global-loading.tsx` | TSX | Global loading overlay | ★★★☆☆ |
    | 56 | `frontend/components/dashboard/stats.tsx` | TSX | Stats widget | ★★★☆☆ |
    | 57 | `frontend/components/dashboard/staff-directory.tsx` | TSX | Staff directory widget | ★★★☆☆ |
    | 58 | `frontend/components/dashboard/today-visits.tsx` | TSX | Today visits widget | ★★★☆☆ |
    | 59 | `frontend/components/dashboard/dispatch-map.tsx` | TSX | Dispatch map widget | ★★☆☆☆ |
    | 60 | `frontend/components/dashboard/activity-log.tsx` | TSX | Activity log widget | ★★☆☆☆ |
    | 61 | `frontend/components/ui/*.tsx` (15 files) | TSX | shadcn/ui components | ★★★★☆ |
    | 62 | `frontend/lib/api.ts` | TS | API_URL + authFetch | ★★★★★ |
    | 63 | `frontend/lib/auth-context.tsx` | TSX | AuthProvider + useAuth | ★★★★★ |
    | 64 | `frontend/lib/loading-context.tsx` | TSX | LoadingProvider | ★★★☆☆ |
    | 65 | `frontend/lib/types.ts` | TS | TypeScript interfaces | ★★★★☆ |
    | 66 | `frontend/lib/utils.ts` | TS | cn() helper | ★★★☆☆ |
    | 67 | `frontend/lib/mock-data.ts` | TS | Mock data | ★★★☆☆ |
    | 68 | `frontend/lib/validations/schemas.ts` | TS | Frontend Zod schemas | ★★★☆☆ |
    | 69 | `frontend/next.config.ts` | TS | Next.js config + API rewrite | ★★★★☆ |
    | 70 | `frontend/package.json` | JSON | Dependencies | ★★★★☆ |
    | 71 | `frontend/components.json` | JSON | shadcn config | ★★☆☆☆ |
    | 72 | `frontend/playwright.config.ts` | TS | E2E config | ★★★☆☆ |
    | 73 | `frontend/tests/*.spec.ts` | TS | E2E tests | ★★★☆☆ |
    | 74 | `frontend/postcss.config.mjs` | MJS | PostCSS config | ★★☆☆☆ |
    | 75 | `frontend/tsconfig.json` | JSON | TypeScript config | ★★☆☆☆ |
    | 76 | `frontend/eslint.config.mjs` | MJS | ESLint config | ★★☆☆☆ |

    ---

    > **Kết luận:** MintCare là một dự án full-stack hoàn chỉnh với kiến trúc Backend (Express + Prisma + SQL Server) và Frontend (Next.js 16 + shadcn/ui + Tailwind). Điểm nổi bật nhất là giao diện hiện đại và luồng business logic phức tạp (đặc biệt là auto-patient sync). Điểm cần cải thiện lớn nhất là refactoring file `page.tsx` customer (~3241 dòng) và thống nhất PrismaClient usage.
