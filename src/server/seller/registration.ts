"use server";

import "server-only";
import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { requireUser } from "@/server/access";

const registerShopSchema = z.object({
  name: z.string().min(2, "Tên gian hàng phải có ít nhất 2 ký tự").max(100, "Tên gian hàng tối đa 100 ký tự"),
  phone: z
    .string()
    .regex(/^(0|\+84)(3|5|7|8|9)\d{8}$/, "Số điện thoại không hợp lệ (VD: 0912345678)"),
  provinceId: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
  address: z.string().max(255, "Địa chỉ tối đa 255 ký tự").optional(),
  description: z.string().max(1000, "Mô tả tối đa 1000 ký tự").optional(),
});

export type RegisterShopInput = z.infer<typeof registerShopSchema>;

export async function checkUserShopMembership() {
  const sessionUser = await requireUser("/kenh-ban/dang-ky");
  const user = await db.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) {
    redirect("/dang-nhap?callbackUrl=/kenh-ban/dang-ky");
  }

  const owned = await db.shop.findUnique({ where: { ownerId: user.id } });
  if (owned) return { hasShop: true, shop: owned, role: "OWNER" as const, user };

  const member = await db.shopMember.findFirst({
    where: { userId: user.id },
    include: { shop: true },
  });
  if (member) return { hasShop: true, shop: member.shop, role: "STAFF" as const, user };

  return { hasShop: false, user };
}

export async function getProvincesForRegistration() {
  return db.province.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, region: { select: { name: true } } },
  });
}

export async function registerShopAction(formData: FormData) {
  const user = await requireUser("/kenh-ban/dang-ky");

  const existingOwned = await db.shop.findUnique({ where: { ownerId: user.id } });
  if (existingOwned) {
    redirect("/kenh-ban");
  }

  const existingMember = await db.shopMember.findFirst({ where: { userId: user.id } });
  if (existingMember) {
    redirect("/kenh-ban");
  }

  const raw = {
    name: formData.get("name")?.toString().trim() || "",
    phone: formData.get("phone")?.toString().trim() || "",
    provinceId: formData.get("provinceId")?.toString().trim() || "",
    address: formData.get("address")?.toString().trim() || undefined,
    description: formData.get("description")?.toString().trim() || undefined,
  };

  const parsed = registerShopSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
  }

  const { name, phone, provinceId, address, description } = parsed.data;

  // Verify province exists
  const province = await db.province.findUnique({ where: { id: provinceId } });
  if (!province) {
    return { error: "Tỉnh/Thành phố không tồn tại" };
  }

  // Generate unique slug
  const baseSlug = slugify(name) || "gian-hang";
  let slug = baseSlug;
  let counter = 1;
  while (await db.shop.findUnique({ where: { slug } })) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  try {
    await db.shop.create({
      data: {
        ownerId: user.id,
        name,
        slug,
        phone,
        provinceId,
        address,
        description,
        status: "PENDING",
      },
    });
  } catch (err: unknown) {
    console.error("registerShopAction error:", err);
    return { error: "Đăng ký gian hàng thất bại" };
  }

  redirect("/kenh-ban");
}
