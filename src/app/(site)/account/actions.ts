"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/server/access";

const vnPhoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export type ProfileActionState = {
  error?: string;
  errors?: Record<string, string>;
  success?: boolean;
  message?: string;
};

const profileSchema = z.object({
  name: z.string().trim().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || vnPhoneRegex.test(val),
      "Số điện thoại không đúng định dạng Việt Nam"
    ),
});

export async function updateProfileAction(
  _prevState: ProfileActionState | null,
  formData: FormData
): Promise<ProfileActionState> {
  const sessionUser = await requireUser("/account");

  const raw = {
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string;
      if (!errors[field]) {
        errors[field] = issue.message;
      }
    }
    return { error: "Vui lòng kiểm tra lại thông tin.", errors };
  }

  await db.user.update({
    where: { id: sessionUser.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
    },
  });

  revalidatePath("/account");
  return { success: true, message: "Cập nhật thông tin thành công!" };
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z
      .string()
      .min(8, "Mật khẩu mới phải từ 8 ký tự")
      .regex(passwordRegex, "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export async function changePasswordAction(
  _prevState: ProfileActionState | null,
  formData: FormData
): Promise<ProfileActionState> {
  const sessionUser = await requireUser("/account");

  const raw = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string;
      if (!errors[field]) {
        errors[field] = issue.message;
      }
    }
    return { error: "Vui lòng kiểm tra lại thông tin mật khẩu.", errors };
  }

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
  });

  if (!user) {
    return { error: "Người dùng không tồn tại." };
  }

  const isMatch = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash
  );

  if (!isMatch) {
    return {
      error: "Mật khẩu hiện tại không chính xác.",
      errors: { currentPassword: "Mật khẩu hiện tại không chính xác" },
    };
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 10);

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  revalidatePath("/account");
  return { success: true, message: "Đổi mật khẩu thành công!" };
}
