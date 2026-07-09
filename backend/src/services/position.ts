import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getPositionList() {
  return prisma.position.findMany({
    orderBy: { Name: "asc" },
  });
}

export async function getActivePositions() {
  return prisma.position.findMany({
    where: { Active: true },
    orderBy: { Name: "asc" },
  });
}

export async function getPositionById(id: string) {
  return prisma.position.findUnique({
    where: { Id: id },
  });
}

export async function createPosition(data: {
  Id: string;
  Name: string;
  Description?: string;
  Active?: boolean;
}) {
  return prisma.position.create({
    data: {
      Id: data.Id,
      Name: data.Name,
      Description: data.Description || null,
      Active: data.Active ?? true,
    },
  });
}

export async function updatePosition(
  id: string,
  data: { Name?: string; Description?: string; Active?: boolean }
) {
  return prisma.position.update({
    where: { Id: id },
    data,
  });
}

export async function deletePosition(id: string) {
  return prisma.position.delete({
    where: { Id: id },
  });
}
