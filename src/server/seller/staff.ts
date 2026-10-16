"use server";

import "server-only";
import crypto from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { escapeHtml } from "@/lib/html";
import { requireShop } from "@/server/access";

const inviteSchema = z.object({
  email: z.string().email("Địa chỉ email không hợp lệ").toLowerCase().trim(),
});

export async function getSellerStaffData() {
  const { shop } = await requireShop({ ownerOnly: true });

  const [members, pendingInvites] = await Promise.all([
    db.shopMember.findMany({
      where: { shopId: shop.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.shopInvite.findMany({
      where: {
        shopId: shop.id,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { members, pendingInvites, shop };
}

export async function inviteStaffAction(email: string) {
  const { shop } = await requireShop({ ownerOnly: true });

  const parsed = inviteSchema.safeParse({ email });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Email không hợp lệ" };
  }

  const normalizedEmail = parsed.data.email;

  // Check if owner's own email
  const owner = await db.user.findUnique({ where: { id: shop.ownerId } });
  if (owner?.email.toLowerCase() === normalizedEmail) {
    return { error: "Bạn là chủ gian hàng, không thể tự mời làm nhân viên" };
  }

  // Check if already a member
  const existingMember = await db.shopMember.findFirst({
    where: {
      shopId: shop.id,
      user: { email: { equals: normalizedEmail, mode: "insensitive" } },
    },
  });
  if (existingMember) {
    return { error: "Người dùng này đã là nhân viên của gian hàng" };
  }

  // Generate 32-byte hex token and SHA-256 hash
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  try {
    // Delete any previous active invite for this email in this shop
    await db.shopInvite.deleteMany({
      where: {
        shopId: shop.id,
        email: normalizedEmail,
        acceptedAt: null,
      },
    });

    await db.shopInvite.create({
      data: {
        shopId: shop.id,
        email: normalizedEmail,
        tokenHash,
        expiresAt,
      },
    });

    // Send invitation email
    const appUrl = (process.env.APP_URL || "http://localhost:3004").replace(/\/$/, "");
    const inviteUrl = `${appUrl}/seller/invite?token=${rawToken}`;
    const safeShopName = escapeHtml(shop.name);
    const safeInviteUrl = escapeHtml(inviteUrl);

    await sendMail(
      normalizedEmail,
      `[Phố Đặc Sản] Lời mời tham gia quản lý gian hàng ${shop.name}`,
      `<div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0b6b55;">Phố Đặc Sản</h2>
        <p>Xin chào,</p>
        <p>Bạn đã được mời làm nhân viên quản lý cho gian hàng <strong>${safeShopName}</strong> trên sàn Phố Đặc Sản.</p>
        <p>Với vai trò nhân viên, bạn có quyền quản lý đơn hàng và cập nhật sản phẩm cho gian hàng.</p>
        <p>Vui lòng bấm vào liên kết dưới đây để chấp nhận lời mời (liên kết có hiệu lực trong 7 ngày):</p>
        <p style="margin: 24px 0;">
          <a href="${safeInviteUrl}" style="background-color: #0b6b55; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Chấp nhận lời mời</a>
        </p>
        <p>Hoặc truy cập đường dẫn: <br/><a href="${safeInviteUrl}">${safeInviteUrl}</a></p>
        <p>Nếu bạn không nhận ra lời mời này, vui lòng bỏ qua email.</p>
      </div>`
    );

    revalidatePath("/seller/staff");
    return { success: true };
  } catch (err: unknown) {
    console.error("inviteStaffAction error:", err);
    return { error: "Gửi lời mời thất bại" };
  }
}

export async function revokeInviteAction(inviteId: string) {
  const { shop } = await requireShop({ ownerOnly: true });

  try {
    await db.shopInvite.deleteMany({
      where: { id: inviteId, shopId: shop.id },
    });

    revalidatePath("/seller/staff");
    return { success: true };
  } catch (err: unknown) {
    console.error("revokeInviteAction error:", err);
    return { error: "Thu hồi lời mời thất bại" };
  }
}

export async function removeStaffAction(memberId: string) {
  const { shop } = await requireShop({ ownerOnly: true });

  try {
    await db.shopMember.deleteMany({
      where: { id: memberId, shopId: shop.id },
    });

    revalidatePath("/seller/staff");
    return { success: true };
  } catch (err: unknown) {
    console.error("removeStaffAction error:", err);
    return { error: "Xóa nhân viên thất bại" };
  }
}
