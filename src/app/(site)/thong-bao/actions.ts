"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/server/access";

export async function markAsReadAction(notificationId: string) {
  const user = await requireUser("/thong-bao");

  await db.notification.updateMany({
    where: {
      id: notificationId,
      userId: user.id,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  revalidatePath("/thong-bao");
  return { success: true };
}

export async function markAllAsReadAction() {
  const user = await requireUser("/thong-bao");

  await db.notification.updateMany({
    where: {
      userId: user.id,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  revalidatePath("/thong-bao");
  return { success: true };
}
