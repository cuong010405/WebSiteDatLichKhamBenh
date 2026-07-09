import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const positions = [
    { Id: "pos-001", Name: "Bác sĩ Chuyên khoa", Description: "Bác sĩ chuyên khoa nội/ngoại", Active: true },
    { Id: "pos-002", Name: "Y tá Điều dưỡng", Description: "Y tá điều dưỡng chăm sóc tại nhà", Active: true },
    { Id: "pos-003", Name: "Chuyên gia VLTL", Description: "Chuyên gia vật lý trị liệu", Active: true },
    { Id: "pos-004", Name: "Chuyên gia Dinh dưỡng", Description: "Chuyên gia tư vấn dinh dưỡng", Active: true },
    { Id: "pos-005", Name: "Kỹ thuật viên Xét nghiệm", Description: "Kỹ thuật viên xét nghiệm tại nhà", Active: true },
    { Id: "pos-006", Name: "Hộ sinh", Description: "Hộ sinh chăm sóc sản phụ", Active: true },
  ];

  for (const pos of positions) {
    const existing = await prisma.position.findUnique({ where: { Id: pos.Id } });
    if (!existing) {
      await prisma.position.create({ data: pos });
      console.log(`Created position: ${pos.Name}`);
    } else {
      console.log(`Position already exists: ${pos.Name}`);
    }
  }

  const all = await prisma.position.findMany();
  console.log("\nAll positions:");
  console.table(all);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
