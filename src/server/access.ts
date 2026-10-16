import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// Guards for server components, server actions and route handlers.
// Every mutation must call one of these first; never trust ids from the client.

export const getCurrentUser = cache(async () => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, status: true },
  });

  if (!user || user.status === "LOCKED") return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
});

export async function requireUser(callbackUrl = "/") {
  const user = await getCurrentUser();
  if (!user) redirect(`/dang-nhap?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return user;
}

export async function requireAdmin() {
  const user = await requireUser("/admin");
  if (user.role !== "ADMIN") notFound();
  return user;
}

export type ShopRole = "OWNER" | "STAFF";

// The shop the current user works on, as owner or staff. Staff may manage
// orders and products only; pass ownerOnly for shop settings, staff and vouchers.
export async function requireShop({ ownerOnly = false } = {}) {
  const user = await requireUser("/kenh-ban");
  const owned = await db.shop.findUnique({ where: { ownerId: user.id } });
  if (owned) return { user, shop: owned, role: "OWNER" as ShopRole };
  if (ownerOnly) notFound();
  const membership = await db.shopMember.findFirst({
    where: { userId: user.id },
    include: { shop: true },
  });
  if (membership) return { user, shop: membership.shop, role: "STAFF" as ShopRole };
  redirect("/kenh-ban/dang-ky");
}
