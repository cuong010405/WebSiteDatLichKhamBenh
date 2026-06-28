import { db } from "../db";
import { activityLogSchema } from "../validations/schemas";
import { z } from "zod";

function mapLogToUI(l: any) {
  return {
    id: l.Id,
    status: l.Status ?? "",
    title: l.Title ?? "",
    desc: l.Desc ?? "",
    time: l.Time ?? "",
    color: l.Color ?? "",
    createdAt: l.CreatedAt,
  };
}

export async function getActivityLogs() {
  const logs = await db.activityLog.findMany({
    orderBy: { CreatedAt: "desc" },
    take: 20,
  });
  return logs.map(mapLogToUI);
}

export async function createActivityLog(data: z.infer<typeof activityLogSchema>) {
  const validated = activityLogSchema.parse(data);
  const created = await db.activityLog.create({
    data: {
      Id: validated.id,
      Status: validated.status,
      Title: validated.title,
      Desc: validated.desc,
      Time: validated.time,
      Color: validated.color,
    },
  });
  return mapLogToUI(created);
}
