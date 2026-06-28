const bcrypt = require("bcryptjs");

async function main() {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();

  const hash = await bcrypt.hash("admin123", 10);

  try {
    const user = await prisma.user.create({
      data: {
        Email: "admin@mintcare.vn",
        PasswordHash: hash,
        FullName: "Admin MintCare",
        Phone: "0900000000",
        Role: "admin",
      },
    });
    console.log("Tạo tài khoản admin thành công!");
    console.log("Email: admin@mintcare.vn");
    console.log("Mật khẩu: admin123");
    console.log("ID:", user.Id);
  } catch (err) {
    if (err.code === "P2002") {
      console.log("Tài khoản admin@mintcare.vn đã tồn tại trong database.");
    } else {
      console.error("Lỗi:", err.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
