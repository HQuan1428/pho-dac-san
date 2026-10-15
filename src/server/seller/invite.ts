"use server";

import "server-only";
import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/server/access";

export async function verifyInviteToken(rawToken: string) {
  const sessionUser = await requireUser(`/kenh-ban/moi-nhan-vien?token=${encodeURIComponent(rawToken)}`);
  const user = await db.user.findUnique({ where: { id: sessionUser.id } });

  if (!user || !user.email) {
    return { valid: false, error: "Không tìm thấy thông tin tài khoản người dùng" };
  }

  if (!rawToken || rawToken.trim().length === 0) {
    return { valid: false, error: "Mã lời mời không hợp lệ" };
  }

  const tokenHash = crypto.createHash("sha256").update(rawToken.trim()).digest("hex");

  const invite = await db.shopInvite.findUnique({
    where: { tokenHash },
    include: { shop: { select: { id: true, name: true, logo: true, description: true } } },
  });

  if (!invite) {
    return { valid: false, error: "Lời mời không tồn tại hoặc đã bị thu hồi" };
  }

  if (invite.acceptedAt) {
    return { valid: false, error: "Lời mời này đã được chấp nhận trước đó" };
  }

  if (invite.expiresAt < new Date()) {
    return { valid: false, error: "Lời mời đã hết hạn hiệu lực (quá hạn 7 ngày)" };
  }

  if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return {
      valid: false,
      error: `Tài khoản đang đăng nhập (${user.email}) không trùng khớp với email nhận lời mời (${invite.email}). Vui lòng đăng nhập đúng tài khoản.`,
    };
  }

  const ownedShop = await db.shop.findUnique({ where: { ownerId: user.id } });
  if (ownedShop) {
    return {
      valid: false,
      error: "Bạn hiện đang sở hữu một gian hàng khác. Mỗi tài khoản chỉ có thể mở hoặc làm việc tại 1 gian hàng.",
    };
  }

  const existingMembership = await db.shopMember.findFirst({
    where: { userId: user.id },
    include: { shop: { select: { name: true } } },
  });
  if (existingMembership) {
    return {
      valid: false,
      error: `Bạn hiện đang là nhân viên của gian hàng "${existingMembership.shop.name}". Mỗi tài khoản chỉ có thể làm việc tại 1 gian hàng.`,
    };
  }

  return {
    valid: true,
    user,
    invite: {
      id: invite.id,
      email: invite.email,
      shop: invite.shop,
      expiresAt: invite.expiresAt,
    },
  };
}

export async function acceptInviteAction(rawToken: string) {
  const result = await verifyInviteToken(rawToken);
  if (!result.valid || !result.invite || !result.user) {
    return { error: result.error || "Không thể chấp nhận lời mời" };
  }

  const { invite, user } = result;

  try {
    await db.$transaction(async (tx) => {
      // Create shop member
      await tx.shopMember.create({
        data: {
          shopId: invite.shop.id,
          userId: user.id,
        },
      });

      // Mark invite accepted
      await tx.shopInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Chấp nhận lời mời thất bại";
    return { error: msg };
  }

  redirect("/kenh-ban");
}
