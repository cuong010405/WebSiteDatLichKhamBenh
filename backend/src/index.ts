import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import staffRouter from "./routes/staff";
import patientsRouter from "./routes/patients";
import visitsRouter from "./routes/visits";
import logsRouter from "./routes/logs";
import reportsRouter from "./routes/reports";
import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import paymentsRouter from "./routes/payments";
import servicesRouter from "./routes/services";
import departmentsRouter from "./routes/departments";
import rolesRouter from "./routes/roles";
import positionsRouter from "./routes/positions";
import { requireAuth, requireAdmin } from "./middleware/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins — restrict to known frontend origins
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
];

// Cấu hình CORS chỉ cho phép frontend đã biết
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, Postman)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

// Thêm Security Headers cơ bản
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Đăng ký API Routes
app.use("/api/auth", authRouter);

// Public read-only endpoints (customer page needs these)
app.use("/api/staff", staffRouter);
app.use("/api/visits", visitsRouter);
app.use("/api/services", servicesRouter);
app.use("/api/departments", departmentsRouter);
app.use("/api/roles", rolesRouter);
app.use("/api/positions", positionsRouter);

// Admin-only endpoints
app.use("/api/patients", requireAuth, requireAdmin, patientsRouter);
app.use("/api/logs", requireAuth, requireAdmin, logsRouter);
app.use("/api/reports", requireAuth, requireAdmin, reportsRouter);
app.use("/api/users", requireAuth, requireAdmin, usersRouter);
app.use("/api/payments", requireAuth, requireAdmin, paymentsRouter);

// Endpoint kiểm tra trạng thái hoạt động
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

app.get("/", (req, res) => {
  res.send(
    "<h1>MintCare API Server đang chạy!</h1><p>Hãy sử dụng các API endpoints như <code>/health</code> hoặc <code>/api/staff</code> để lấy dữ liệu.</p>",
  );
});

// Global error handler để trả JSON khi có lỗi không mong muốn
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Unhandled backend error:", err);
  if (res.headersSent) {
    return next(err);
  }
  res
    .status(err?.status || 500)
    .json({ error: err?.message || "Lỗi máy chủ nội bộ" });
});

app.listen(PORT, () => {
  console.log(
    `Express Backend Server đang chạy trên cổng: http://localhost:${PORT}`,
  );
});
