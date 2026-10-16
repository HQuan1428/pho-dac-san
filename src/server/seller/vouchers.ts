"use server";

import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireShop } from "@/server/access";

const voucherSchema = z
  .object({
    code: z
      .string()
      .min(3, "Mã giảm giá phải có ít nhất 3 ký tự")
      .max(20, "Mã giảm giá tối đa 20 ký tự")
      .regex(/^[A-Z0-9_-]+$/, "Mã chỉ chứa chữ hoa, số, gạch ngang hoặc gạch dưới"),
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.coerce.number().int().min(1, "Giá trị giảm phải lớn hơn 0"),
    minOrder: z.coerce.number().int().min(0, "Đơn tối thiểu không hợp lệ").default(0),
    maxDiscount: z.coerce.number().int().min(0).nullable().optional(),
    startsAt: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
    endsAt: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
    usageLimit: z.coerce.number().int().min(1).nullable().optional(),
    active: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.type === "PERCENT" && data.value > 100) return false;
      return true;
    },
    { message: "Giảm theo phần trăm tối đa là 100%", path: ["value"] }
  )
  .refine(
    (data) => {
      const start = new Date(data.startsAt);
      const end = new Date(data.endsAt);
      return end > start;
    },
    { message: "Thời gian kết thúc phải sau thời gian bắt đầu", path: ["endsAt"] }
  );

export type VoucherFormValues = z.infer<typeof voucherSchema>;

export async function getSellerVouchers() {
  const { shop } = await requireShop({ ownerOnly: true });

  return db.voucher.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
    },
  });
}

export async function createVoucherAction(data: VoucherFormValues) {
  const { shop } = await requireShop({ ownerOnly: true });

  const upperCode = data.code.trim().toUpperCase();
  const parsed = voucherSchema.safeParse({ ...data, code: upperCode });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
  }

  const existing = await db.voucher.findUnique({
    where: { shopId_code: { shopId: shop.id, code: upperCode } },
  });
  if (existing) {
    return { error: `Mã giảm giá "${upperCode}" đã tồn tại trong gian hàng` };
  }

  const { type, value, minOrder, maxDiscount, startsAt, endsAt, usageLimit, active } = parsed.data;

  try {
    await db.voucher.create({
      data: {
        shopId: shop.id,
        code: upperCode,
        type,
        value,
        minOrder,
        maxDiscount: maxDiscount && maxDiscount > 0 ? maxDiscount : null,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        usageLimit: usageLimit && usageLimit > 0 ? usageLimit : null,
        active,
      },
    });

    revalidatePath("/seller/vouchers");
    return { success: true };
  } catch (err: unknown) {
    console.error("createVoucherAction error:", err);
    return { error: "Tạo mã giảm giá thất bại" };
  }
}

export async function updateVoucherAction(id: string, data: VoucherFormValues) {
  const { shop } = await requireShop({ ownerOnly: true });

  const upperCode = data.code.trim().toUpperCase();
  const parsed = voucherSchema.safeParse({ ...data, code: upperCode });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" };
  }

  const voucher = await db.voucher.findFirst({
    where: { id, shopId: shop.id },
  });
  if (!voucher) {
    return { error: "Không tìm thấy mã giảm giá" };
  }

  if (upperCode !== voucher.code) {
    const existing = await db.voucher.findUnique({
      where: { shopId_code: { shopId: shop.id, code: upperCode } },
    });
    if (existing && existing.id !== id) {
      return { error: `Mã giảm giá "${upperCode}" đã tồn tại` };
    }
  }

  const { type, value, minOrder, maxDiscount, startsAt, endsAt, usageLimit, active } = parsed.data;

  try {
    await db.voucher.update({
      where: { id },
      data: {
        code: upperCode,
        type,
        value,
        minOrder,
        maxDiscount: maxDiscount && maxDiscount > 0 ? maxDiscount : null,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        usageLimit: usageLimit && usageLimit > 0 ? usageLimit : null,
        active,
      },
    });

    revalidatePath("/seller/vouchers");
    return { success: true };
  } catch (err: unknown) {
    console.error("updateVoucherAction error:", err);
    return { error: "Cập nhật mã giảm giá thất bại" };
  }
}

export async function toggleVoucherActiveAction(id: string, active: boolean) {
  const { shop } = await requireShop({ ownerOnly: true });

  try {
    await db.voucher.updateMany({
      where: { id, shopId: shop.id },
      data: { active },
    });

    revalidatePath("/seller/vouchers");
    return { success: true };
  } catch (err: unknown) {
    console.error("toggleVoucherActiveAction error:", err);
    return { error: "Cập nhật trạng thái thất bại" };
  }
}

export async function deleteVoucherAction(id: string) {
  const { shop } = await requireShop({ ownerOnly: true });

  const voucher = await db.voucher.findFirst({
    where: { id, shopId: shop.id },
    include: { _count: { select: { orders: true } } },
  });

  if (!voucher) {
    return { error: "Không tìm thấy mã giảm giá" };
  }

  try {
    await db.voucher.delete({ where: { id } });
    revalidatePath("/seller/vouchers");
    return { success: true };
  } catch (err: unknown) {
    console.error("deleteVoucherAction error:", err);
    return { error: "Xóa mã giảm giá thất bại" };
  }
}
