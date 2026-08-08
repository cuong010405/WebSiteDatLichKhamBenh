import { PrismaClient } from "@prisma/client";
import { assertNoDuplicate } from "./duplicateValidation";

const prisma = new PrismaClient();

export async function getRoleList() {
  return prisma.role.findMany({
    orderBy: { Name: "asc" },
  });
}

export async function getActiveRoles() {
  return prisma.role.findMany({
    where: { Active: true },
    orderBy: { Name: "asc" },
  });
}

export async function getRoleById(id: string) {
  return prisma.role.findUnique({
    where: { Id: id },
  });
}

export async function createRole(data: {
  Id: string;
  Name: string;
  Description?: string;
  Active?: boolean;
}) {
  // Kiểm tra trùng Mã và Tên chức danh trước khi tạo
  await assertNoDuplicate({
    model: "role",
    checks: [
      { field: "Id", value: data.Id, fieldDisplayName: "Mã chức danh" },
      { field: "Name", value: data.Name, fieldDisplayName: "Tên chức danh" },
    ],
  });

  return prisma.role.create({
    data: {
      Id: data.Id,
      Name: data.Name,
      Description: data.Description || null,
      Active: data.Active ?? true,
    },
  });
}

export async function updateRole(
  id: string,
  data: { Name?: string; Description?: string; Active?: boolean }
) {
  // Kiểm tra trùng Tên chức danh với bản ghi khác khi cập nhật
  if (data.Name) {
    await assertNoDuplicate({
      model: "role",
      checks: [
        { field: "Name", value: data.Name, fieldDisplayName: "Tên chức danh" },
      ],
      excludeId: { field: "Id", value: id },
    });
  }

  return prisma.role.update({
    where: { Id: id },
    data,
  });
}

export async function deleteRole(id: string) {
  return prisma.role.delete({
    where: { Id: id },
  });
}
