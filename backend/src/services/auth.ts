import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";

const JWT_SECRET = process.env.JWT_SECRET || "mintcare_secret_key_2024";
const JWT_EXPIRES_IN = "7d";

export async function registerUser(data: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: string;
}) {
  const existing = await db.user.findUnique({ where: { Email: data.email } });
  if (existing) {
    throw new Error("Email đã được đăng ký");
  }

  const hash = await bcrypt.hash(data.password, 10);
  const role = data.role === "admin" ? "admin" : "customer";

  const user = await db.user.create({
    data: {
      Email: data.email,
      PasswordHash: hash,
      FullName: data.fullName,
      Phone: data.phone || null,
      Role: role,
    },
  });

  const token = jwt.sign({ id: user.Id, email: user.Email, role: user.Role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return {
    token,
    user: {
      id: user.Id,
      email: user.Email,
      fullName: user.FullName,
      phone: user.Phone,
      role: user.Role,
    },
  };
}

export async function loginUser(data: { email: string; password: string }) {
  const user = await db.user.findUnique({ where: { Email: data.email } });
  if (!user) {
    throw new Error("Email hoặc mật khẩu không chính xác");
  }

  const isValid = await bcrypt.compare(data.password, user.PasswordHash);
  if (!isValid) {
    throw new Error("Email hoặc mật khẩu không chính xác");
  }

  const token = jwt.sign({ id: user.Id, email: user.Email, role: user.Role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return {
    token,
    user: {
      id: user.Id,
      email: user.Email,
      fullName: user.FullName,
      phone: user.Phone,
      role: user.Role,
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
