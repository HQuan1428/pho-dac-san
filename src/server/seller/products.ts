"use server";

import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { requireShop } from "@/server/access";

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Tên phân loại không được để trống"),
  price: z.coerce.number().int().min(0, "Giá bán không hợp lệ"),
  compareAtPrice: z.coerce.number().int().min(0).nullable().optional(),
  stock: z.coerce.number().int().min(0, "Tồn kho không hợp lệ").default(0),
  sku: z.string().nullable().optional(),
});

const productSchema = z.object({
  name: z.string().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự").max(200, "Tên sản phẩm tối đa 200 ký tự"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  provinceId: z.string().min(1, "Vui lòng chọn tỉnh thành xuất xứ"),
  description: z.string().min(10, "Mô tả sản phẩm phải có ít nhất 10 ký tự"),
  images: z.array(z.string().url("URL ảnh không hợp lệ")).max(8, "Tối đa 8 hình ảnh"),
  status: z.enum(["DRAFT", "ACTIVE", "HIDDEN"]),
  variants: z.array(variantSchema).min(1, "Sản phẩm phải có ít nhất 1 phân loại hàng"),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export async function getProductFormData() {
  const [categories, provinces] = await Promise.all([
    db.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    db.province.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, region: { select: { name: true } } },
    }),
  ]);
  return { categories, provinces };
}

export async function getSellerProducts({
  page = 1,
  pageSize = 10,
  search = "",
  status = "",
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}) {
  const { shop } = await requireShop();

  const where: import("@prisma/client").Prisma.ProductWhereInput = {
    shopId: shop.id,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status && ["DRAFT", "ACTIVE", "HIDDEN"].includes(status)
      ? { status: status as import("@prisma/client").ProductStatus }
      : {}),
  };

  const [total, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { name: true } },
        variants: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, price: true, stock: true },
        },
      },
    }),
  ]);

  const items = products.map((p) => {
    const minPrice = p.variants.reduce((min, v) => (v.price < min ? v.price : min), Infinity);
    const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      status: p.status,
      image: p.images[0] || null,
      categoryName: p.category.name,
      minPrice: minPrice === Infinity ? 0 : minPrice,
      totalStock,
      soldCount: p.soldCount,
      variantCount: p.variants.length,
      createdAt: p.createdAt,
    };
  });

  return {
    items,
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage: page,
  };
}

export async function getSellerProductById(id: string) {
  const { shop } = await requireShop();

  const product = await db.product.findFirst({
    where: { id, shopId: shop.id },
    include: {
      variants: {
        orderBy: { sortOrder: "asc" },
      },
      category: { select: { id: true, name: true } },
      province: { select: { id: true, name: true } },
      _count: { select: { orderItems: true } },
    },
  });

  if (!product) notFound();
  return product;
}

export async function createProductAction(data: ProductFormValues) {
  const { shop } = await requireShop();

  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dữ liệu sản phẩm không hợp lệ" };
  }

  const { name, categoryId, provinceId, description, images, status, variants } = parsed.data;

  // Generate unique slug for shop
  const baseSlug = slugify(name) || "san-pham";
  let slug = baseSlug;
  let counter = 1;
  while (await db.product.findUnique({ where: { shopId_slug: { shopId: shop.id, slug } } })) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  try {
    const product = await db.$transaction(async (tx) => {
      return tx.product.create({
        data: {
          shopId: shop.id,
          categoryId,
          provinceId,
          name,
          slug,
          description,
          images,
          status,
          variants: {
            create: variants.map((v, index) => ({
              name: v.name,
              price: v.price,
              compareAtPrice: v.compareAtPrice && v.compareAtPrice > 0 ? v.compareAtPrice : null,
              stock: v.stock,
              sku: v.sku?.trim() || null,
              sortOrder: index,
            })),
          },
        },
      });
    });

    revalidatePath("/kenh-ban/san-pham");
    revalidatePath("/kenh-ban");
    return { success: true, productId: product.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Thêm sản phẩm thất bại";
    return { error: msg };
  }
}

export async function updateProductAction(id: string, data: ProductFormValues) {
  const { shop } = await requireShop();

  const existing = await db.product.findFirst({
    where: { id, shopId: shop.id },
    include: { variants: true },
  });
  if (!existing) {
    return { error: "Không tìm thấy sản phẩm" };
  }

  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
  }

  const { name, categoryId, provinceId, description, images, status, variants } = parsed.data;

  // Update slug if name changed
  let slug = existing.slug;
  if (name !== existing.name) {
    const baseSlug = slugify(name) || "san-pham";
    slug = baseSlug;
    let counter = 1;
    while (true) {
      const other = await db.product.findUnique({
        where: { shopId_slug: { shopId: shop.id, slug } },
      });
      if (!other || other.id === id) break;
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
  }

  try {
    await db.$transaction(async (tx) => {
      // Delete variants not in incoming list
      const incomingIds = variants.map((v) => v.id).filter(Boolean) as string[];
      await tx.productVariant.deleteMany({
        where: {
          productId: id,
          id: { notIn: incomingIds },
        },
      });

      // Update or create variants
      for (const [index, v] of variants.entries()) {
        const variantData = {
          name: v.name,
          price: v.price,
          compareAtPrice: v.compareAtPrice && v.compareAtPrice > 0 ? v.compareAtPrice : null,
          stock: v.stock,
          sku: v.sku?.trim() || null,
          sortOrder: index,
        };

        if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: variantData,
          });
        } else {
          await tx.productVariant.create({
            data: {
              ...variantData,
              productId: id,
            },
          });
        }
      }

      // Update product info
      await tx.product.update({
        where: { id },
        data: {
          categoryId,
          provinceId,
          name,
          slug,
          description,
          images,
          status,
        },
      });
    });

    revalidatePath("/kenh-ban/san-pham");
    revalidatePath(`/kenh-ban/san-pham/${id}`);
    revalidatePath("/kenh-ban");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Cập nhật sản phẩm thất bại";
    return { error: msg };
  }
}

export async function deleteProductAction(id: string) {
  const { shop } = await requireShop();

  const product = await db.product.findFirst({
    where: { id, shopId: shop.id },
    include: {
      _count: { select: { orderItems: true } },
    },
  });

  if (!product) {
    return { error: "Không tìm thấy sản phẩm" };
  }

  if (product._count.orderItems > 0) {
    return {
      error: "Sản phẩm đã có đơn hàng phát sinh, không thể xóa. Bạn vui lòng chuyển trạng thái sang 'Ẩn' (HIDDEN).",
    };
  }

  try {
    await db.product.delete({ where: { id } });
    revalidatePath("/kenh-ban/san-pham");
    revalidatePath("/kenh-ban");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Xóa sản phẩm thất bại";
    return { error: msg };
  }
}
