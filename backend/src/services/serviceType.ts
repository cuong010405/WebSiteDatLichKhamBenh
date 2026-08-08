import { PrismaClient } from "@prisma/client";
import { assertNoDuplicate } from "./duplicateValidation";

const prisma = new PrismaClient();

export async function getServiceTypeList() {
  return prisma.serviceType.findMany({ orderBy: { Name: "asc" } });
}

export async function getActiveServiceTypes() {
  return prisma.serviceType.findMany({
    where: { Active: true },
    orderBy: { Name: "asc" },
  });
}

export async function getServiceTypeById(id: string) {
  return prisma.serviceType.findUnique({ where: { Id: id } });
}

export async function createServiceType(data: {
  Id?: string;
  Name: string;
  Description?: string;
  Color?: string;
  Active?: boolean;
}) {
  // Kiểm tra trùng tên loại dịch vụ trước khi tạo
  await assertNoDuplicate({
    model: "serviceType",
    checks: [
      { field: "Name", value: data.Name, fieldDisplayName: "Tên loại dịch vụ" },
    ],
  });

  return prisma.serviceType.create({
    data: {
      Id: data.Id || crypto.randomUUID(),
      Name: data.Name,
      Description: data.Description ?? null,
      Color: data.Color ?? null,
      Active: data.Active ?? true,
    },
  });
}

export async function updateServiceType(
  id: string,
  data: {
    Name?: string;
    Description?: string;
    Color?: string;
    Active?: boolean;
  }
) {
  // Kiểm tra trùng tên loại dịch vụ với bản ghi khác khi cập nhật
  if (data.Name) {
    await assertNoDuplicate({
      model: "serviceType",
      checks: [
        { field: "Name", value: data.Name, fieldDisplayName: "Tên loại dịch vụ" },
      ],
      excludeId: { field: "Id", value: id },
    });
  }

  return prisma.serviceType.update({
    where: { Id: id },
    data: {
      ...(data.Name !== undefined && { Name: data.Name }),
      ...(data.Description !== undefined && { Description: data.Description }),
      ...(data.Color !== undefined && { Color: data.Color }),
      ...(data.Active !== undefined && { Active: data.Active }),
    },
  });
}

export async function deleteServiceType(id: string) {
  return prisma.serviceType.delete({ where: { Id: id } });
}
