import { PrismaClient } from "@prisma/client";

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
