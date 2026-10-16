"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/access";
import { db } from "@/lib/db";

export async function lockUser(userId: string) {
  const admin = await requireAdmin();

  if (userId === admin.id) {
    return { success: false, error: "Không thể tự khóa tài khoản của chính mình" };
  }

  const updated = await db.user.updateMany({
    where: {
      id: userId,
      role: "USER",
      NOT: { id: admin.id },
    },
    data: { status: "LOCKED" },
  });

  if (updated.count === 0) {
    const target = await db.user.findUnique({ where: { id: userId } });
    if (!target) return { success: false, error: "Không tìm thấy người dùng" };
    if (target.role === "ADMIN") {
      return { success: false, error: "Không thể khóa tài khoản Quản trị viên khác" };
    }
    return { success: false, error: "Không thể khóa người dùng này" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function unlockUser(userId: string) {
  const admin = await requireAdmin();

  const updated = await db.user.updateMany({
    where: {
      id: userId,
      role: "USER",
      NOT: { id: admin.id },
    },
    data: { status: "ACTIVE" },
  });

  if (updated.count === 0) {
    const target = await db.user.findUnique({ where: { id: userId } });
    if (!target) return { success: false, error: "Không tìm thấy người dùng" };
    return { success: false, error: "Không thể mở khóa người dùng này" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}
