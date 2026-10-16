"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/access";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { escapeHtml } from "@/lib/html";
import type { ShopPlan } from "@prisma/client";

export async function approveShop(shopId: string) {
  await requireAdmin();

  const shop = await db.shop.findUnique({
    where: { id: shopId },
    include: { owner: true },
  });

  if (!shop) return { success: false, error: "Không tìm thấy gian hàng" };

  const updated = await db.shop.updateMany({
    where: { id: shopId, status: "PENDING" },
    data: {
      status: "ACTIVE",
      statusReason: null,
    },
  });

  if (updated.count === 0) {
    return { success: false, error: "Trạng thái gian hàng đã thay đổi, vui lòng tải lại" };
  }

  await db.notification.create({
    data: {
      userId: shop.ownerId,
      title: "Gian hàng của bạn đã được phê duyệt!",
      body: `Chúc mừng bạn! Gian hàng "${shop.name}" đã được Ban quản trị phê duyệt và chính thức hoạt động trên Phố Đặc Sản.`,
      link: "/kenh-ban",
    },
  });

  if (shop.owner.email) {
    try {
      const safeOwnerName = escapeHtml(shop.owner.name);
      const safeShopName = escapeHtml(shop.name);
      await sendMail(
        shop.owner.email,
        `[Phố Đặc Sản] Gian hàng "${shop.name}" đã được phê duyệt`,
        `<div style="font-family: sans-serif; line-height: 1.6;">
          <h2>Chúc mừng ${safeOwnerName}!</h2>
          <p>Hồ sơ gian hàng <strong>${safeShopName}</strong> của bạn đã được Ban quản trị Phố Đặc Sản phê duyệt thành công.</p>
          <p>Bạn có thể đăng nhập vào Kênh Người Bán để bắt đầu đăng sản phẩm và tiếp nhận đơn hàng.</p>
          <p><a href="${process.env.NEXTAUTH_URL || "http://localhost:3001"}/kenh-ban" style="display:inline-block;padding:10px 20px;background:#10b981;color:#fff;text-decoration:none;border-radius:6px;">Truy cập Kênh Người Bán</a></p>
        </div>`
      );
    } catch (err) {
      console.error("Gửi email duyệt shop thất bại:", err);
    }
  }

  revalidatePath("/admin/gian-hang");
  revalidatePath("/admin");
  return { success: true };
}

const rejectSchema = z.object({
  shopId: z.string().min(1),
  reason: z.string().trim().min(3, "Lý do từ chối cần tối thiểu 3 ký tự"),
});

export async function rejectShop(shopId: string, reason: string) {
  await requireAdmin();

  const parsed = rejectSchema.safeParse({ shopId, reason });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Lý do không hợp lệ" };
  }

  const shop = await db.shop.findUnique({
    where: { id: shopId },
    include: { owner: true },
  });

  if (!shop) return { success: false, error: "Không tìm thấy gian hàng" };

  const updated = await db.shop.updateMany({
    where: { id: shopId, status: "PENDING" },
    data: {
      status: "REJECTED",
      statusReason: parsed.data.reason,
    },
  });

  if (updated.count === 0) {
    return { success: false, error: "Trạng thái gian hàng đã thay đổi, vui lòng tải lại" };
  }

  await db.notification.create({
    data: {
      userId: shop.ownerId,
      title: "Hồ sơ gian hàng chưa được duyệt",
      body: `Gian hàng "${shop.name}" chưa được phê duyệt. Lý do: ${parsed.data.reason}`,
      link: "/kenh-ban",
    },
  });

  if (shop.owner.email) {
    try {
      const safeOwnerName = escapeHtml(shop.owner.name);
      const safeShopName = escapeHtml(shop.name);
      const safeReason = escapeHtml(parsed.data.reason);
      await sendMail(
        shop.owner.email,
        `[Phố Đặc Sản] Thông báo về hồ sơ gian hàng "${shop.name}"`,
        `<div style="font-family: sans-serif; line-height: 1.6;">
          <h2>Kính chào ${safeOwnerName},</h2>
          <p>Hồ sơ gian hàng <strong>${safeShopName}</strong> của bạn chưa được Ban quản trị phê duyệt.</p>
          <p><strong>Lý do:</strong> ${safeReason}</p>
          <p>Vui lòng cập nhật lại thông tin gian hàng theo hướng dẫn để được xét duyệt lại.</p>
        </div>`
      );
    } catch (err) {
      console.error("Gửi email từ chối shop thất bại:", err);
    }
  }

  revalidatePath("/admin/gian-hang");
  revalidatePath("/admin");
  return { success: true };
}

const suspendSchema = z.object({
  shopId: z.string().min(1),
  reason: z.string().trim().min(3, "Lý do tạm đình chỉ cần tối thiểu 3 ký tự"),
});

export async function suspendShop(shopId: string, reason: string) {
  await requireAdmin();

  const parsed = suspendSchema.safeParse({ shopId, reason });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Lý do không hợp lệ" };
  }

  const shop = await db.shop.findUnique({
    where: { id: shopId },
    include: { owner: true },
  });

  if (!shop) return { success: false, error: "Không tìm thấy gian hàng" };

  const updated = await db.shop.updateMany({
    where: { id: shopId, status: "ACTIVE" },
    data: {
      status: "SUSPENDED",
      statusReason: parsed.data.reason,
    },
  });

  if (updated.count === 0) {
    return { success: false, error: "Trạng thái gian hàng đã thay đổi, vui lòng tải lại" };
  }

  await db.notification.create({
    data: {
      userId: shop.ownerId,
      title: "Gian hàng của bạn bị tạm đình chỉ",
      body: `Gian hàng "${shop.name}" đã bị tạm dừng hoạt động. Lý do: ${parsed.data.reason}`,
      link: "/kenh-ban",
    },
  });

  if (shop.owner.email) {
    try {
      const safeOwnerName = escapeHtml(shop.owner.name);
      const safeShopName = escapeHtml(shop.name);
      const safeReason = escapeHtml(parsed.data.reason);
      await sendMail(
        shop.owner.email,
        `[Phố Đặc Sản] Thông báo tạm đình chỉ gian hàng "${shop.name}"`,
        `<div style="font-family: sans-serif; line-height: 1.6;">
          <h2>Kính chào ${safeOwnerName},</h2>
          <p>Gian hàng <strong>${safeShopName}</strong> của bạn đã bị tạm đình chỉ hoạt động trên Phố Đặc Sản.</p>
          <p><strong>Lý do:</strong> ${safeReason}</p>
          <p>Vui lòng liên hệ Ban quản trị để phối hợp làm rõ và khắc phục.</p>
        </div>`
      );
    } catch (err) {
      console.error("Gửi email đình chỉ shop thất bại:", err);
    }
  }

  revalidatePath("/admin/gian-hang");
  revalidatePath("/admin");
  return { success: true };
}

export async function reactivateShop(shopId: string) {
  await requireAdmin();

  const shop = await db.shop.findUnique({
    where: { id: shopId },
    include: { owner: true },
  });

  if (!shop) return { success: false, error: "Không tìm thấy gian hàng" };

  const updated = await db.shop.updateMany({
    where: {
      id: shopId,
      status: { in: ["SUSPENDED", "REJECTED"] },
    },
    data: {
      status: "ACTIVE",
      statusReason: null,
    },
  });

  if (updated.count === 0) {
    return { success: false, error: "Trạng thái gian hàng đã thay đổi, vui lòng tải lại" };
  }

  await db.notification.create({
    data: {
      userId: shop.ownerId,
      title: "Gian hàng đã được kích hoạt lại",
      body: `Gian hàng "${shop.name}" đã được mở lại và tiếp tục hoạt động trên Phố Đặc Sản.`,
      link: "/kenh-ban",
    },
  });

  revalidatePath("/admin/gian-hang");
  revalidatePath("/admin");
  return { success: true };
}

export async function changeShopPlan(shopId: string, plan: ShopPlan) {
  await requireAdmin();

  if (!["FREE", "PRO", "BUSINESS"].includes(plan)) {
    throw new Error("Gói dịch vụ không hợp lệ");
  }

  await db.shop.update({
    where: { id: shopId },
    data: { plan },
  });

  revalidatePath("/admin/gian-hang");
  revalidatePath("/admin");
  return { success: true };
}
