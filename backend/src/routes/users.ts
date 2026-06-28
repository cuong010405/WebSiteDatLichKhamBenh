import { Router, Request, Response } from "express";
import { db } from "../db";
import bcrypt from "bcryptjs";

const router = Router();

// GET /api/users - Lấy danh sách tất cả tài khoản
router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await db.user.findMany({
      orderBy: { CreatedAt: "desc" },
    });
    // Không trả về password hash để bảo mật
    const safeUsers = users.map((u) => ({
      id: u.Id,
      email: u.Email,
      fullName: u.FullName,
      phone: u.Phone,
      role: u.Role,
      createdAt: u.CreatedAt,
    }));
    return res.json(safeUsers);
  } catch (err: any) {
    return res.status(500).json({ error: "Lỗi lấy danh sách tài khoản: " + err.message });
  }
});

// POST /api/users - Admin thêm tài khoản mới
router.post("/", async (req: Request, res: Response) => {
  const { email, password, fullName, phone, role } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: "Vui lòng điền đầy đủ email, mật khẩu và họ tên" });
  }

  try {
    const existing = await db.user.findUnique({ where: { Email: email } });
    if (existing) {
      return res.status(400).json({ error: "Email này đã được sử dụng" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        Email: email,
        PasswordHash: hash,
        FullName: fullName,
        Phone: phone || null,
        Role: role === "admin" ? "admin" : "customer",
      },
    });

    return res.status(201).json({
      id: user.Id,
      email: user.Email,
      fullName: user.FullName,
      phone: user.Phone,
      role: user.Role,
      createdAt: user.CreatedAt,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id - Admin sửa tài khoản (bao gồm đổi mật khẩu nếu cần và phân quyền role)
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, fullName, phone, role, password } = req.body;

  try {
    const existing = await db.user.findUnique({ where: { Id: id } });
    if (!existing) {
      return res.status(404).json({ error: "Không tìm thấy tài khoản" });
    }

    const updateData: any = {
      Email: email ?? existing.Email,
      FullName: fullName ?? existing.FullName,
      Phone: phone !== undefined ? phone : existing.Phone,
      Role: role ?? existing.Role,
    };

    if (password) {
      updateData.PasswordHash = await bcrypt.hash(password, 10);
    }

    const updated = await db.user.update({
      where: { Id: id },
      data: updateData,
    });

    return res.json({
      id: updated.Id,
      email: updated.Email,
      fullName: updated.FullName,
      phone: updated.Phone,
      role: updated.Role,
      createdAt: updated.CreatedAt,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id - Xóa tài khoản
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.user.delete({ where: { Id: id } });
    return res.json({ success: true, message: "Xóa tài khoản thành công" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
