import { PrismaClient } from "@prisma/client";
import { assertNoDuplicate } from "./duplicateValidation";

const prisma = new PrismaClient();

export async function getDepartmentList() {
  return prisma.department.findMany({
    orderBy: { Name: "asc" },
  });
}

export async function getActiveDepartments() {
  return prisma.department.findMany({
    where: { Active: true },
    orderBy: { Name: "asc" },
  });
}

export async function getDepartmentById(id: string) {
  return prisma.department.findUnique({
    where: { Id: id },
  });
}

export async function createDepartment(data: {
  Id: string;
  Name: string;
  Description?: string;
  Active?: boolean;
}) {
  // Kiểm tra trùng Mã khoa và Tên khoa trước khi tạo
  await assertNoDuplicate({
    model: "department",
    checks: [
      { field: "Id", value: data.Id, fieldDisplayName: "Mã khoa phòng" },
      { field: "Name", value: data.Name, fieldDisplayName: "Tên khoa phòng" },
    ],
  });

  return prisma.department.create({
    data: {
      Id: data.Id,
      Name: data.Name,
      Description: data.Description || null,
      Active: data.Active ?? true,
    },
  });
}

export async function updateDepartment(
  id: string,
  data: { Name?: string; Description?: string; Active?: boolean }
) {
  // Kiểm tra trùng Tên khoa với bản ghi khác khi cập nhật
  if (data.Name) {
    await assertNoDuplicate({
      model: "department",
      checks: [
        { field: "Name", value: data.Name, fieldDisplayName: "Tên khoa phòng" },
      ],
      excludeId: { field: "Id", value: id },
    });
  }

  return prisma.department.update({
    where: { Id: id },
    data,
  });
}

export async function deleteDepartment(id: string) {
  return prisma.department.delete({
    where: { Id: id },
  });
}
