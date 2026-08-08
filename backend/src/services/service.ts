import { db } from "../db";
import { serviceSchema } from "../validations/service-schema";
import { z } from "zod";
import { assertNoDuplicate } from "./duplicateValidation";

function mapServiceToUI(s: any) {
  return {
    id: s.Id,
    name: s.Name,
    description: s.Description ?? "",
    price: s.Price,
    duration: s.Duration ?? "",
    type: s.Type,
    active: s.Active,
  };
}

function mapServiceToDb(s: any) {
  return {
    Id: s.id,
    Name: s.name,
    Description: s.description || null,
    Price: s.price,
    Duration: s.duration || null,
    Type: s.type,
    Active: s.active ?? true,
  };
}

export async function getServiceList() {
  const services = await db.service.findMany({
    orderBy: { Name: "asc" },
  });
  return services.map(mapServiceToUI);
}

export async function getActiveServices() {
  const services = await db.service.findMany({
    where: { Active: true },
    orderBy: { Name: "asc" },
  });
  return services.map(mapServiceToUI);
}

export async function getServiceById(id: string) {
  const s = await db.service.findUnique({
    where: { Id: id },
  });
  if (!s) return null;
  return mapServiceToUI(s);
}

export async function createService(data: z.infer<typeof serviceSchema>) {
  const validated = serviceSchema.parse(data);

  // Kiểm tra trùng tên dịch vụ trước khi tạo
  await assertNoDuplicate({
    model: "service",
    checks: [
      { field: "Name", value: validated.name, fieldDisplayName: "Tên dịch vụ" },
    ],
  });

  const created = await db.service.create({
    data: mapServiceToDb(validated),
  });
  return mapServiceToUI(created);
}

export async function updateService(id: string, data: Partial<z.infer<typeof serviceSchema>>) {
  const { id: _id, ...rest } = data;
  const dbData: any = {};
  if (rest.name !== undefined) dbData.Name = rest.name;
  if (rest.description !== undefined) dbData.Description = rest.description || null;
  if (rest.price !== undefined) dbData.Price = rest.price;
  if (rest.duration !== undefined) dbData.Duration = rest.duration;
  if (rest.type !== undefined) dbData.Type = rest.type;
  if (rest.active !== undefined) dbData.Active = rest.active;

  // Kiểm tra trùng tên dịch vụ với dịch vụ khác khi cập nhật
  if (rest.name) {
    await assertNoDuplicate({
      model: "service",
      checks: [
        { field: "Name", value: rest.name, fieldDisplayName: "Tên dịch vụ" },
      ],
      excludeId: { field: "Id", value: id },
    });
  }

  const updated = await db.service.update({
    where: { Id: id },
    data: dbData,
  });
  return mapServiceToUI(updated);
}

export async function deleteService(id: string) {
  return await db.service.delete({
    where: { Id: id },
  });
}
