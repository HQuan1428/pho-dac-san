"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/server/access";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";

const categorySchema = z.object({
  name: z.string().trim().min(2, "Tên danh mục cần tối thiểu 2 ký tự"),
  parentId: z.string().nullable().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export async function createCategory(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name")?.toString() || "";
  const parentIdRaw = formData.get("parentId")?.toString();
  const parentId = parentIdRaw && parentIdRaw !== "" && parentIdRaw !== "none" ? parentIdRaw : null;
  const sortOrder = parseInt(formData.get("sortOrder")?.toString() || "0", 10);

  const parsed = categorySchema.safeParse({ name, parentId, sortOrder });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
  }

  let slug = slugify(parsed.data.name);
  const existing = await db.category.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  await db.category.create({
    data: {
      name: parsed.data.name,
      slug,
      parentId: parsed.data.parentId,
      sortOrder: parsed.data.sortOrder,
    },
  });

  revalidatePath("/admin/danh-muc");
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name")?.toString() || "";
  const parentIdRaw = formData.get("parentId")?.toString();
  const parentId = parentIdRaw && parentIdRaw !== "" && parentIdRaw !== "none" ? parentIdRaw : null;
  const sortOrder = parseInt(formData.get("sortOrder")?.toString() || "0", 10);

  if (parentId === id) {
    return { success: false, error: "Danh mục không thể làm cha của chính nó" };
  }

  const parsed = categorySchema.safeParse({ name, parentId, sortOrder });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
  }

  let slug = slugify(parsed.data.name);
  const existing = await db.category.findFirst({
    where: { slug, NOT: { id } },
  });
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  await db.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug,
      parentId: parsed.data.parentId,
      sortOrder: parsed.data.sortOrder,
    },
  });

  revalidatePath("/admin/danh-muc");
  return { success: true };
}

export async function deleteCategory(id: string) {
  await requireAdmin();

  const productCount = await db.product.count({
    where: { categoryId: id },
  });
  if (productCount > 0) {
    return {
      success: false,
      error: `Không thể xóa danh mục đang chứa ${productCount} sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước.`,
    };
  }

  const childCount = await db.category.count({
    where: { parentId: id },
  });
  if (childCount > 0) {
    return {
      success: false,
      error: `Không thể xóa danh mục đang có ${childCount} danh mục con.`,
    };
  }

  await db.category.delete({
    where: { id },
  });

  revalidatePath("/admin/danh-muc");
  return { success: true };
}
