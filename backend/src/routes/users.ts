import { Router, Request, Response } from "express";
import { db } from "../db";
import bcrypt from "bcryptjs";
import { assertNoDuplicate } from "../services/duplicateValidation";
import { requireAuth, requireAdmin } from "../middleware/auth";


const router = Router();

/** Simple email format validation */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// GET /api/users - Lấy danh sách tất cả tài khoản
router.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await db.user.findMany({
      orderBy: { CreatedAt: "desc" },
      select: {
        Id: true,
        Email: true,
        FullName: true,
        Phone: true,
        Role: true,
        Age: true,
        Gender: true,
        CreatedAt: true,
        // Không select PasswordHash để bảo mật
      },
    });
    const safeUsers = users.map((u) => ({
      id: u.Id,
      email: u.Email,
      fullName: u.FullName,
      phone: u.Phone,
      role: u.Role,
      age: u.Age,
      gender: u.Gender,
      createdAt: u.CreatedAt,
    }));
    return res.json(safeUsers);
  } catch (err: any) {
    console.error("GET /api/users error:", err);
    return res.status(500).json({ error: "Lỗi lấy danh sách tài khoản" });
  }
});

// POST /api/users - Admin thêm tài khoản mới
router.post("/", async (req: Request, res: Response) => {
  const { email, password, fullName, phone, role, age, gender } = req.body;

  // Input validation
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: "Vui lòng điền đầy đủ email, mật khẩu và họ tên" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Địa chỉ Email không hợp lệ" });
  }
  if (typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ error: "Mật khẩu phải có ít nhất 6 ký tự" });
  }
  if (typeof fullName !== "string" || fullName.trim().length < 2) {
    return res.status(400).json({ error: "Họ tên phải có ít nhất 2 ký tự" });
  }

  try {
    // Kiểm tra trùng Gmail và Số điện thoại - dùng chung qua assertNoDuplicate
    await assertNoDuplicate({
      model: "user",
      checks: [
        { field: "Email", value: email.toLowerCase().trim(), fieldDisplayName: "Gmail" },
        ...(phone?.trim()
          ? [{ field: "Phone", value: phone.trim(), fieldDisplayName: "Số điện thoại" }]
          : []),
      ],
    });

    const hash = await bcrypt.hash(password, 10);
    const userRole = ["admin", "vltl", "dieu_duong", "customer", "chuyen_gia"].includes(role) ? role : "customer";
    const user = await db.user.create({
      data: {
        Email: email.toLowerCase().trim(),
        PasswordHash: hash,
        FullName: fullName.trim(),
        Phone: phone?.trim() || null,
        Role: userRole,
        Age: age ? parseInt(age) : null,
        Gender: gender || null,
      },
    });

    // Auto-link: nếu là nhân viên y tế, cập nhật email của Staff để khớp với tài khoản
    if (userRole === "vltl" || userRole === "dieu_duong" || userRole === "chuyen_gia") {
      try {
        const staffByName = await db.staff.findFirst({
          where: { Name: fullName.trim() },
          select: { Id: true, Email: true },
        });
        if (staffByName) {
          await db.staff.update({
            where: { Id: staffByName.Id },
            data: { Email: email.toLowerCase().trim() },
          });
        }
      } catch (linkErr) {
        console.warn("Auto-link Staff email error:", linkErr);
      }
    }

    return res.status(201).json({
      id: user.Id,
      email: user.Email,
      fullName: user.FullName,
      phone: user.Phone,
      role: user.Role,
      age: user.Age,
      gender: user.Gender,
      createdAt: user.CreatedAt,
    });
  } catch (err: any) {
    console.error("POST /api/users error:", err);
    // Bắt cả lỗi từ assertNoDuplicate (trùng Email/Phone)
    if (err.message && !err.message.includes("Lỗi tạo tài khoản")) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Lỗi tạo tài khoản" });
  }
});

// PUT /api/users/:id - Admin sửa tài khoản (bao gồm đổi mật khẩu nếu cần và phân quyền role)
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, fullName, phone, role, password, age, gender } = req.body;

  // Input validation
  if (email && !isValidEmail(email)) {
    return res.status(400).json({ error: "Địa chỉ Gmail không hợp lệ" });
  }
  if (password && (typeof password !== "string" || password.length < 6)) {
    return res.status(400).json({ error: "Mật khẩu mới phải có ít nhất 6 ký tự" });
  }

  try {
    const existing = await db.user.findUnique({ where: { Id: id } });
    if (!existing) {
      return res.status(404).json({ error: "Không tìm thấy tài khoản" });
    }

    // Kiểm tra trùng Gmail và Số điện thoại khi thay đổi - loại trừ chính tài khoản đang sửa
    const checks: any[] = [];
    if (email && email.toLowerCase().trim() !== existing.Email) {
      checks.push({ field: "Email", value: email.toLowerCase().trim(), fieldDisplayName: "Gmail" });
    }
    if (phone && phone.trim() !== existing.Phone) {
      checks.push({ field: "Phone", value: phone.trim(), fieldDisplayName: "Số điện thoại" });
    }

    if (checks.length > 0) {
      await assertNoDuplicate({
        model: "user",
        checks,
        excludeId: { field: "Id", value: id },
      });
    }


    const updateData: any = {
      Email: email ? email.toLowerCase().trim() : existing.Email,
      FullName: fullName ? fullName.trim() : existing.FullName,
      Phone: phone !== undefined ? (phone?.trim() || null) : existing.Phone,
      Role: role ?? existing.Role,
      Age: age !== undefined ? (age ? parseInt(age) : null) : existing.Age,
      Gender: gender !== undefined ? gender : existing.Gender,
    };

    if (password) {
      updateData.PasswordHash = await bcrypt.hash(password, 10);
    }

    const updated = await db.user.update({
      where: { Id: id },
      data: updateData,
    });

    // Đồng bộ sang các bản ghi Bệnh nhân (Patient) tương ứng trong SQL Server
    try {
      const visitsWithPatient = await db.visit.findMany({
        where: { UserId: id, PatientId: { not: null } },
        select: { PatientId: true },
      });
      const patientIds = Array.from(new Set(visitsWithPatient.map((v) => v.PatientId).filter(Boolean))) as string[];

      const patientsByName = await db.patient.findMany({
        where: {
          OR: [
            { Name: existing.FullName },
            { Name: updated.FullName },
          ],
        },
        select: { Id: true },
      });
      const allPatientIds = Array.from(new Set([...patientIds, ...patientsByName.map((p) => p.Id)]));

      if (allPatientIds.length > 0) {
        const patientUpdateData: any = {};
        if (fullName) patientUpdateData.Name = updated.FullName;
        if (updated.Age !== null && updated.Age !== undefined) patientUpdateData.Age = updated.Age;
        if (updated.Gender) patientUpdateData.Gender = updated.Gender;

        if (Object.keys(patientUpdateData).length > 0) {
          await db.patient.updateMany({
            where: { Id: { in: allPatientIds } },
            data: patientUpdateData,
          });
        }
      }
    } catch (syncErr) {
      console.warn("Lỗi đồng bộ user update sang Patient record:", syncErr);
    }

    return res.json({
      id: updated.Id,
      email: updated.Email,
      fullName: updated.FullName,
      phone: updated.Phone,
      role: updated.Role,
      age: updated.Age,
      gender: updated.Gender,
      createdAt: updated.CreatedAt,
    });
  } catch (err: any) {
    console.error("PUT /api/users/:id error:", err);
    return res.status(500).json({ error: "Lỗi cập nhật tài khoản" });
  }
});

// PATCH /api/users/:id/link-staff — Admin links a user to a Staff record
router.patch("/:id/link-staff", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { staffId } = req.body as { staffId: string };
  try {
    const user = await db.user.findUnique({ where: { Id: id }, select: { Email: true, FullName: true } });
    if (!user) return res.status(404).json({ error: "Không tìm thấy tài khoản" });

    const staff = await db.staff.findUnique({ where: { Id: staffId } });
    if (!staff) return res.status(404).json({ error: "Không tìm thấy nhân viên" });

    // Update Staff's email to match the user email so future lookups work
    await db.staff.update({
      where: { Id: staffId },
      data: { Email: user.Email },
    });

    return res.json({ success: true, message: `Đã liên kết tài khoản ${user.FullName} với nhân viên ${staff.Name}` });
  } catch (err: any) {
    console.error("PATCH /api/users/:id/link-staff error:", err);
    return res.status(500).json({ error: "Lỗi liên kết tài khoản với nhân viên" });
  }
});

// DELETE /api/users/:id - Xóa tài khoản
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existing = await db.user.findUnique({ where: { Id: id } });
    if (!existing) {
      return res.status(404).json({ error: "Không tìm thấy tài khoản" });
    }
    await db.user.delete({ where: { Id: id } });
    return res.json({ success: true, message: "Xóa tài khoản thành công" });
  } catch (err: any) {
    console.error("DELETE /api/users/:id error:", err);
    return res.status(500).json({ error: "Lỗi xóa tài khoản" });
  }
});

export default router;

