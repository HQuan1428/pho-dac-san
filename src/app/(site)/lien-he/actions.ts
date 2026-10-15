"use server";

import { z } from "zod";
import { db } from "@/lib/db";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập họ và tên (tối thiểu 2 ký tự)"),
  email: z.string().trim().email("Địa chỉ email không hợp lệ"),
  message: z.string().trim().min(5, "Nội dung tin nhắn cần tối thiểu 5 ký tự"),
});

export type ContactActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    name?: string[];
    email?: string[];
    message?: string[];
  };
};

export async function submitContactMessage(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  };

  const parsed = contactSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Thông tin không hợp lệ, vui lòng kiểm tra lại các trường.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await db.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        message: parsed.data.message,
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Lỗi khi lưu tin nhắn liên hệ:", err);
    return {
      success: false,
      error: "Không thể gửi tin nhắn lúc này. Vui lòng thử lại sau.",
    };
  }
}
