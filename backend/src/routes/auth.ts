import { Router, Request, Response, NextFunction } from "express";
import { registerUser, loginUser, verifyToken } from "../services/auth";
import { db } from "../db";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  const { email, password, fullName, phone, role } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin bắt buộc" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Mật khẩu phải có ít nhất 6 ký tự" });
  }

  try {
    const result = await registerUser({ email, password, fullName, phone, role });
    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(409).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Vui lòng nhập email và mật khẩu" });
  }

  try {
    const result = await loginUser({ email, password });
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
});

// GET /api/auth/me — verify token & get current user
router.get("/me", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Không có token xác thực" });
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
  }

  try {
    const user = await db.user.findUnique({ where: { Id: payload.id } });
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }
    return res.json({
      id: user.Id,
      email: user.Email,
      fullName: user.FullName,
      phone: user.Phone,
      role: user.Role,
      age: user.Age,
      gender: user.Gender,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
