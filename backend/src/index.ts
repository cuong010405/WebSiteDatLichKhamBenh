import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import staffRouter from "./routes/staff";
import patientsRouter from "./routes/patients";
import visitsRouter from "./routes/visits";
import logsRouter from "./routes/logs";
import reportsRouter from "./routes/reports";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Cấu hình CORS để cho phép frontend Next.js gọi API
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Đăng ký API Routes
app.use("/api/staff", staffRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/visits", visitsRouter);
app.use("/api/logs", logsRouter);
app.use("/api/reports", reportsRouter);

// Endpoint kiểm tra trạng thái hoạt động
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

app.get("/", (req, res) => {
  res.send("<h1>MintCare API Server đang chạy!</h1><p>Hãy sử dụng các API endpoints như <code>/health</code> hoặc <code>/api/staff</code> để lấy dữ liệu.</p>");
});

app.listen(PORT, () => {
  console.log(`Express Backend Server đang chạy trên cổng: http://localhost:${PORT}`);
});
