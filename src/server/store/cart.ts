"use server";

import { db } from "@/lib/db";

export type CartLineData = {
  variantId: string;
  variantName: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  productId: string;
  productName: string;
  productSlug: string;
  productImages: string[];
  shopId: string;
  shopName: string;
  shopSlug: string;
  provinceName: string;
};

export async function getCartLines(variantIds: string[]): Promise<{
  lines: CartLineData[];
  droppedVariantIds: string[];
}> {
  if (!variantIds || variantIds.length === 0) {
    return { lines: [], droppedVariantIds: [] };
  }

  const variants = await db.productVariant.findMany({
    where: {
      id: { in: variantIds },
    },
    include: {
      product: {
        include: {
          shop: {
            include: {
              province: true,
            },
          },
        },
      },
    },
  });

  const validLines: CartLineData[] = [];
  const foundVariantIds = new Set<string>();

  for (const v of variants) {
    foundVariantIds.add(v.id);
    // Product and Shop must both be ACTIVE
    if (v.product.status !== "ACTIVE" || v.product.shop.status !== "ACTIVE") {
      continue;
    }

    validLines.push({
      variantId: v.id,
      variantName: v.name,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      stock: v.stock,
      productId: v.product.id,
      productName: v.product.name,
      productSlug: v.product.slug,
      productImages: v.product.images,
      shopId: v.product.shop.id,
      shopName: v.product.shop.name,
      shopSlug: v.product.shop.slug,
      provinceName: v.product.shop.province.name,
    });
  }

  const validIds = new Set(validLines.map((l) => l.variantId));
  const droppedVariantIds = variantIds.filter((id) => !validIds.has(id));

  return { lines: validLines, droppedVariantIds };
}

export type ValidatedVoucher = {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  discount: number;
};

export async function validateVoucher(
  shopId: string,
  rawCode: string,
  shopSubtotal: number
): Promise<{ valid: true; voucher: ValidatedVoucher } | { valid: false; error: string }> {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, error: "Vui lòng nhập mã giảm giá" };
  }

  const voucher = await db.voucher.findUnique({
    where: {
      shopId_code: {
        shopId,
        code,
      },
    },
  });

  if (!voucher || !voucher.active) {
    return { valid: false, error: "Mã giảm giá không tồn tại hoặc đã hết hiệu lực" };
  }

  const now = new Date();
  if (voucher.startsAt > now || voucher.endsAt < now) {
    return { valid: false, error: "Mã giảm giá chưa đến hạn hoặc đã hết hạn" };
  }

  if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
    return { valid: false, error: "Mã giảm giá đã hết lượt sử dụng" };
  }

  if (shopSubtotal < voucher.minOrder) {
    return {
      valid: false,
      error: `Đơn hàng tối thiểu để áp dụng mã là ${voucher.minOrder.toLocaleString("vi-VN")} đ`,
    };
  }

  let discount = 0;
  if (voucher.type === "PERCENT") {
    discount = Math.floor((shopSubtotal * voucher.value) / 100);
    if (voucher.maxDiscount !== null && discount > voucher.maxDiscount) {
      discount = voucher.maxDiscount;
    }
  } else {
    discount = Math.min(shopSubtotal, voucher.value);
  }

  return {
    valid: true,
    voucher: {
      id: voucher.id,
      code: voucher.code,
      type: voucher.type,
      value: voucher.value,
      discount,
    },
  };
}
