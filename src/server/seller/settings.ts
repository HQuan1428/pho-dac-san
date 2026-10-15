"use server";

import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { requireShop } from "@/server/access";

const shopSettingsSchema = z.object({
  name: z.string().min(2, "Tên gian hàng phải có ít nhất 2 ký tự").max(100, "Tên gian hàng tối đa 100 ký tự"),
  description: z.string().max(1000, "Mô tả tối đa 1000 ký tự").nullable().optional(),
  phone: z
    .string()
    .regex(/^(0|\+84)(3|5|7|8|9)\d{8}$/, "Số điện thoại không hợp lệ (VD: 0912345678)"),
  address: z.string().max(255, "Địa chỉ tối đa 255 ký tự").nullable().optional(),
  provinceId: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
  logo: z.string().nullable().optional(),
  banner: z.string().nullable().optional(),
});

export type ShopSettingsFormValues = z.infer<typeof shopSettingsSchema>;

export async function getShopSettingsData() {
  const { shop } = await requireShop({ ownerOnly: true });

  const [provinces, currentShop] = await Promise.all([
    db.province.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, region: { select: { name: true } } },
    }),
    db.shop.findUniqueOrThrow({
      where: { id: shop.id },
      include: {
        province: { select: { id: true, name: true } },
      },
    }),
  ]);

  return { shop: currentShop, provinces };
}

export async function updateShopSettingsAction(data: ShopSettingsFormValues) {
  const { shop } = await requireShop({ ownerOnly: true });

  const parsed = shopSettingsSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
  }

  const { name, description, phone, address, provinceId, logo, banner } = parsed.data;

  // Verify province
  const province = await db.province.findUnique({ where: { id: provinceId } });
  if (!province) {
    return { error: "Tỉnh/Thành phố không tồn tại" };
  }

  // If name changed, update slug
  let slug = shop.slug;
  if (name !== shop.name) {
    const baseSlug = slugify(name) || "gian-hang";
    slug = baseSlug;
    let counter = 1;
    while (true) {
      const other = await db.shop.findUnique({ where: { slug } });
      if (!other || other.id === shop.id) break;
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
  }

  try {
    await db.shop.update({
      where: { id: shop.id },
      data: {
        name,
        slug,
        description: description?.trim() || null,
        phone,
        address: address?.trim() || null,
        provinceId,
        logo: logo || null,
        banner: banner || null,
      },
    });

    revalidatePath("/kenh-ban/cai-dat");
    revalidatePath("/kenh-ban");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Cập nhật thông tin thất bại";
    return { error: msg };
  }
}
