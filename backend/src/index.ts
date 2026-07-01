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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Cấu hình CORS để cho phép frontend Next.js gọi API
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Đăng ký API Routes
app.use("/api/staff", staffRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/visits", visitsRouter);
app.use("/api/logs", logsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);

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
