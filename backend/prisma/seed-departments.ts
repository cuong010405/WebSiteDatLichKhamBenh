import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const departments = [
    { Id: "dept-001", Name: "Nội khoa", Description: "Chuyên khoa nội tổng hợp", Active: true },
    { Id: "dept-002", Name: "Ngoại khoa", Description: "Chuyên khoa ngoại tổng hợp", Active: true },
    { Id: "dept-003", Name: "Phục hồi chức năng", Description: "Phục hồi chức năng sau phẫu thuật và chấn thương", Active: true },
    { Id: "dept-004", Name: "Cấp cứu tại gia", Description: "Dịch vụ cấp cứu và chăm sóc khẩn cấp tại nhà", Active: true },
  ];

  for (const dept of departments) {
    const existing = await prisma.department.findUnique({ where: { Id: dept.Id } });
    if (!existing) {
      await prisma.department.create({ data: dept });
      console.log(`Created department: ${dept.Name}`);
    } else {
      console.log(`Department already exists: ${dept.Name}`);
    }
  }

  const all = await prisma.department.findMany();
  console.log("\nAll departments:");
  console.table(all);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
