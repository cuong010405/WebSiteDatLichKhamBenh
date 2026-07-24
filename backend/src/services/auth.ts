import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set. Aborting server startup.");
}

/** Simple email format validation */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function registerUser(data: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: string;
  age?: number;
  gender?: string;
}) {
  const email = data.email.toLowerCase().trim();

  if (!isValidEmail(email)) {
    throw new Error("Địa chỉ email không hợp lệ");
  }
  if (!data.password || data.password.length < 6) {
    throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
  }
  if (!data.fullName || data.fullName.trim().length < 2) {
    throw new Error("Họ tên phải có ít nhất 2 ký tự");
  }

  const existing = await db.user.findUnique({ where: { Email: email } });
  if (existing) {
    throw new Error("Email đã được đăng ký");
  }

  const hash = await bcrypt.hash(data.password, 10);
  const role = data.role === "admin" ? "admin" : "customer";

  const user = await db.user.create({
    data: {
      Email: email,
      PasswordHash: hash,
      FullName: data.fullName.trim(),
      Phone: data.phone?.trim() || null,
      Role: role,
      Age: data.age ? Number(data.age) : null,
      Gender: data.gender || null,
    },
  });

  const token = jwt.sign(
    { id: user.Id, email: user.Email, role: user.Role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );

  return {
    token,
    user: {
      id: user.Id,
      email: user.Email,
      fullName: user.FullName,
      phone: user.Phone,
      role: user.Role,
      age: user.Age,
      gender: user.Gender,
      address: user.Address,
      medicalHistory: user.MedicalHistory,
    },
  };
}

export async function loginUser(data: { email: string; password: string }) {
  const email = data.email.toLowerCase().trim();

  if (!isValidEmail(email)) {
    throw new Error("Email hoặc mật khẩu không chính xác");
  }
  if (!data.password) {
    throw new Error("Email hoặc mật khẩu không chính xác");
  }

  const user = await db.user.findUnique({ where: { Email: email } });
  if (!user) {
    // Use generic message to avoid email enumeration attacks
    throw new Error("Email hoặc mật khẩu không chính xác");
  }

  const isValid = await bcrypt.compare(data.password, user.PasswordHash);
  if (!isValid) {
    throw new Error("Email hoặc mật khẩu không chính xác");
  }

  const token = jwt.sign(
    { id: user.Id, email: user.Email, role: user.Role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );

  return {
    token,
    user: {
      id: user.Id,
      email: user.Email,
      fullName: user.FullName,
      phone: user.Phone,
      role: user.Role,
      age: user.Age,
      gender: user.Gender,
      address: user.Address,
      medicalHistory: user.MedicalHistory,
    },
  };
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };
  } catch {
    return null;
  }
}
