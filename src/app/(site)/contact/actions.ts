"use server";

import { z } from "zod";
import { db } from "@/lib/db";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập họ và tên (tối thiểu 2 ký tự)"),
  email: z.string().trim().email("Địa chỉ email không hợp lệ"),
  message: z.string().trim().min(5, "Nội dung tin nhắn cần tối thiểu 5 ký tự"),
  website: z.string().max(0, "Yêu cầu không hợp lệ").optional().or(z.literal("")),
});

export type ContactActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    name?: string[];
    email?: string[];
    message?: string[];
    website?: string[];
  };
};

export async function submitContactMessage(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const website = formData.get("website");
  if (website && String(website).trim().length > 0) {
    return {
      success: false,
      error: "Yêu cầu không hợp lệ.",
    };
  }

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    website: website ?? undefined,
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
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await db.contactMessage.count({
      where: {
        email: {
          equals: parsed.data.email,
          mode: "insensitive",
        },
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    if (recentCount >= 3) {
      return {
        success: false,
        error: "Bạn đã gửi quá nhiều tin nhắn trong 1 giờ qua. Vui lòng thử lại sau.",
      };
    }

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
