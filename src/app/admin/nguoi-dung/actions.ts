"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/access";
import { db } from "@/lib/db";

export async function lockUser(userId: string) {
  const admin = await requireAdmin();

  if (userId === admin.id) {
    return { success: false, error: "Không thể tự khóa tài khoản của chính mình" };
  }

  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) return { success: false, error: "Không tìm thấy người dùng" };

  if (target.role === "ADMIN") {
    return { success: false, error: "Không thể khóa tài khoản Quản trị viên khác" };
  }

  await db.user.update({
    where: { id: userId },
    data: { status: "LOCKED" },
  });

  revalidatePath("/admin/nguoi-dung");
  return { success: true };
}

export async function unlockUser(userId: string) {
  await requireAdmin();

  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) return { success: false, error: "Không tìm thấy người dùng" };

  await db.user.update({
    where: { id: userId },
    data: { status: "ACTIVE" },
  });

  revalidatePath("/admin/nguoi-dung");
  return { success: true };
}
