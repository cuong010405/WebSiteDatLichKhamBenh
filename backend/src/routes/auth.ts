import { Router, Request, Response, NextFunction } from "express";
import { registerUser, loginUser, verifyToken } from "../services/auth";
import { db } from "../db";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  const { email, password, fullName, phone, role, age, gender } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin bắt buộc" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Mật khẩu phải có ít nhất 6 ký tự" });
  }

  try {
    const result = await registerUser({ email, password, fullName, phone, role, age, gender });
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
      address: user.Address,
      medicalHistory: user.MedicalHistory,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/profile — user tự cập nhật hồ sơ (không cần admin)
router.put("/profile", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Không có token xác thực" });
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
  }

  const { fullName, phone, age, gender, address, medicalHistory } = req.body;

  try {
    const user = await db.user.findUnique({ where: { Id: payload.id } });
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    const updated = await db.user.update({
      where: { Id: payload.id },
      data: {
        FullName: fullName ? String(fullName).trim() : user.FullName,
        Phone: phone !== undefined ? (phone?.trim() || null) : user.Phone,
        Age: age !== undefined ? (age ? parseInt(String(age)) : null) : user.Age,
        Gender: gender !== undefined ? gender : user.Gender,
        Address: address !== undefined ? (address?.trim() || null) : user.Address,
        MedicalHistory: medicalHistory !== undefined ? (medicalHistory?.trim() || null) : user.MedicalHistory,
      },
    });

    // Đồng bộ trực tiếp sang các bản ghi Bệnh nhân (Patient) tương ứng trong SQL Server
    try {
      const visitsWithPatient = await db.visit.findMany({
        where: { UserId: payload.id, PatientId: { not: null } },
        select: { PatientId: true },
      });
      const patientIds = Array.from(new Set(visitsWithPatient.map((v) => v.PatientId).filter(Boolean))) as string[];

      const patientsByName = await db.patient.findMany({
        where: {
          OR: [
            { Name: user.FullName },
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
      console.warn("Lỗi đồng bộ hồ sơ sang Patient record:", syncErr);
    }

    return res.json({
      id: updated.Id,
      email: updated.Email,
      fullName: updated.FullName,
      phone: updated.Phone,
      role: updated.Role,
      age: updated.Age,
      gender: updated.Gender,
      address: updated.Address,
      medicalHistory: updated.MedicalHistory,
    });
  } catch (err: any) {
    console.error("PUT /api/auth/profile error:", err);
    return res.status(500).json({ error: "Lỗi cập nhật hồ sơ" });
  }
});

export default router;
