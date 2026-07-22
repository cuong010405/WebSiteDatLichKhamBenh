import { db } from "../db";

export async function getNotifications(userId?: string) {
  const where = userId ? { UserId: userId } : {};
  const notifications = await db.notification.findMany({
    where,
    orderBy: { CreatedAt: "desc" },
    take: 50,
    include: { User: { select: { FullName: true, Email: true } } },
  });
  return notifications.map((n) => ({
    id: n.Id,
    userId: n.UserId,
    visitId: n.VisitId,
    type: n.Type,
    title: n.Title,
    message: n.Message,
    isRead: n.IsRead,
    createdAt: n.CreatedAt,
    time: new Date(n.CreatedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    userName: n.User?.FullName ?? null,
    userEmail: n.User?.Email ?? null,
  }));
}

export async function createNotification(data: {
  userId?: string;
  visitId?: string;
  type: string;
  title: string;
  message: string;
}) {
  const created = await db.notification.create({
    data: {
      Id: `notif-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      UserId: data.userId ?? null,
      VisitId: data.visitId ?? null,
      Type: data.type,
      Title: data.title,
      Message: data.message,
      IsRead: false,
    },
  });
  return {
    id: created.Id,
    userId: created.UserId,
    visitId: created.VisitId,
    type: created.Type,
    title: created.Title,
    message: created.Message,
    isRead: created.IsRead,
    createdAt: created.CreatedAt,
  };
}

export async function markNotificationRead(id: string) {
  return db.notification.update({
    where: { Id: id },
    data: { IsRead: true },
  });
}

export async function markAllNotificationsRead(userId?: string) {
  const where = userId ? { UserId: userId } : {};
  return db.notification.updateMany({
    where,
    data: { IsRead: true },
  });
}

export async function getUnreadCount(userId?: string) {
  const where: any = { IsRead: false };
  if (userId) where.UserId = userId;
  return db.notification.count({ where });
}
