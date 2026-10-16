"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/access";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";

const regionSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2, "Tên vùng miền cần tối thiểu 2 ký tự"),
});

export async function updateRegion(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id")?.toString() || "";
  const name = formData.get("name")?.toString() || "";

  const parsed = regionSchema.safeParse({ id, name });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
  }

  const slug = slugify(parsed.data.name);

  try {
    await db.region.update({
      where: { id: parsed.data.id },
      data: { name: parsed.data.name, slug },
    });
    revalidatePath("/admin/regions");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error)?.message || "Không thể cập nhật vùng miền" };
  }
}

const provinceSchema = z.object({
  name: z.string().trim().min(2, "Tên tỉnh/thành cần tối thiểu 2 ký tự"),
  regionId: z.string().min(1, "Vui lòng chọn vùng miền"),
});

export async function addProvince(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name")?.toString() || "";
  const regionId = formData.get("regionId")?.toString() || "";

  const parsed = provinceSchema.safeParse({ name, regionId });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
  }

  let slug = slugify(parsed.data.name);
  const existing = await db.province.findFirst({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  try {
    await db.province.create({
      data: {
        name: parsed.data.name,
        slug,
        regionId: parsed.data.regionId,
      },
    });
    revalidatePath("/admin/regions");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error)?.message || "Không thể thêm tỉnh/thành" };
  }
}

const editProvinceSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2, "Tên tỉnh/thành cần tối thiểu 2 ký tự"),
  regionId: z.string().min(1, "Vui lòng chọn vùng miền"),
});

export async function updateProvince(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id")?.toString() || "";
  const name = formData.get("name")?.toString() || "";
  const regionId = formData.get("regionId")?.toString() || "";

  const parsed = editProvinceSchema.safeParse({ id, name, regionId });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
  }

  let slug = slugify(parsed.data.name);
  const existing = await db.province.findFirst({
    where: { slug, NOT: { id: parsed.data.id } },
  });
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  try {
    await db.province.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        slug,
        regionId: parsed.data.regionId,
      },
    });
    revalidatePath("/admin/regions");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error)?.message || "Không thể cập nhật tỉnh/thành" };
  }
}
