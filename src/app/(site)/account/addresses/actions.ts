"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/server/access";

const vnPhoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

const addressSchema = z.object({
  name: z.string().trim().min(2, "Họ tên người nhận phải có ít nhất 2 ký tự"),
  phone: z
    .string()
    .trim()
    .regex(vnPhoneRegex, "Số điện thoại không đúng định dạng Việt Nam"),
  provinceId: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
  detail: z.string().trim().min(3, "Vui lòng nhập địa chỉ chi tiết (số nhà, ngõ, đường, phường/xã)"),
  isDefault: z.boolean().optional(),
});

export type AddressActionState = {
  error?: string;
  errors?: Record<string, string>;
  success?: boolean;
  message?: string;
};

export async function createAddressAction(
  _prevState: AddressActionState | null,
  formData: FormData
): Promise<AddressActionState> {
  const user = await requireUser("/account/addresses");

  const raw = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    provinceId: formData.get("provinceId"),
    detail: formData.get("detail"),
    isDefault: formData.get("isDefault") === "on" || formData.get("isDefault") === "true",
  };

  const parsed = addressSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string;
      if (!errors[field]) errors[field] = issue.message;
    }
    return { error: "Vui lòng kiểm tra lại thông tin địa chỉ.", errors };
  }

  const existingCount = await db.address.count({
    where: { userId: user.id },
  });

  const shouldBeDefault = parsed.data.isDefault || existingCount === 0;

  if (shouldBeDefault) {
    await db.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }

  await db.address.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      phone: parsed.data.phone,
      provinceId: parsed.data.provinceId,
      detail: parsed.data.detail,
      isDefault: shouldBeDefault,
    },
  });

  revalidatePath("/account/addresses");
  return { success: true, message: "Thêm địa chỉ mới thành công!" };
}

export async function updateAddressAction(
  addressId: string,
  _prevState: AddressActionState | null,
  formData: FormData
): Promise<AddressActionState> {
  const user = await requireUser("/account/addresses");

  const existing = await db.address.findFirst({
    where: { id: addressId, userId: user.id },
  });

  if (!existing) {
    return { error: "Không tìm thấy địa chỉ cần cập nhật." };
  }

  const raw = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    provinceId: formData.get("provinceId"),
    detail: formData.get("detail"),
    isDefault: formData.get("isDefault") === "on" || formData.get("isDefault") === "true",
  };

  const parsed = addressSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string;
      if (!errors[field]) errors[field] = issue.message;
    }
    return { error: "Vui lòng kiểm tra lại thông tin địa chỉ.", errors };
  }

  if (parsed.data.isDefault) {
    await db.address.updateMany({
      where: { userId: user.id, id: { not: addressId } },
      data: { isDefault: false },
    });
  }

  await db.address.update({
    where: { id: addressId },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      provinceId: parsed.data.provinceId,
      detail: parsed.data.detail,
      isDefault: parsed.data.isDefault ?? existing.isDefault,
    },
  });

  revalidatePath("/account/addresses");
  return { success: true, message: "Cập nhật địa chỉ thành công!" };
}

export async function deleteAddressAction(addressId: string) {
  const user = await requireUser("/account/addresses");

  const existing = await db.address.findFirst({
    where: { id: addressId, userId: user.id },
  });

  if (!existing) {
    return { error: "Không tìm thấy địa chỉ để xóa." };
  }

  await db.address.delete({
    where: { id: addressId },
  });

  // If deleted address was default, set the latest remaining address as default
  if (existing.isDefault) {
    const nextAddress = await db.address.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    if (nextAddress) {
      await db.address.update({
        where: { id: nextAddress.id },
        data: { isDefault: true },
      });
    }
  }

  revalidatePath("/account/addresses");
  return { success: true };
}

export async function setDefaultAddressAction(addressId: string) {
  const user = await requireUser("/account/addresses");

  const existing = await db.address.findFirst({
    where: { id: addressId, userId: user.id },
  });

  if (!existing) {
    return { error: "Không tìm thấy địa chỉ." };
  }

  await db.address.updateMany({
    where: { userId: user.id },
    data: { isDefault: false },
  });

  await db.address.update({
    where: { id: addressId },
    data: { isDefault: true },
  });

  revalidatePath("/account/addresses");
  return { success: true };
}
