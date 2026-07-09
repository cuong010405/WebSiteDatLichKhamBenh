import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { Id: "role-001", Name: "Bác sĩ Chuyên khoa", Description: "Bác sĩ chuyên khoa nội/ngoại", Active: true },
    { Id: "role-002", Name: "Y tá Điều dưỡng", Description: "Y tá điều dưỡng chăm sóc tại nhà", Active: true },
    { Id: "role-003", Name: "Chuyên gia VLTL", Description: "Chuyên gia vật lý trị liệu", Active: true },
    { Id: "role-004", Name: "Chuyên gia Dinh dưỡng", Description: "Chuyên gia tư vấn dinh dưỡng", Active: true },
  ];

  for (const role of roles) {
    const existing = await prisma.role.findUnique({ where: { Id: role.Id } });
    if (!existing) {
      await prisma.role.create({ data: role });
      console.log(`Created role: ${role.Name}`);
    } else {
      console.log(`Role already exists: ${role.Name}`);
    }
  }

  const all = await prisma.role.findMany();
  console.log("\nAll roles:");
  console.table(all);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
