import { db } from "../db";
import { activityLogSchema } from "../validations/schemas";
import { z } from "zod";

export async function getActivityLogs() {
  return await db.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function createActivityLog(data: z.infer<typeof activityLogSchema>) {
  const validated = activityLogSchema.parse(data);
  return await db.activityLog.create({
    data: validated,
  });
}
