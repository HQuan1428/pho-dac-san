"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signIn } from "@/auth";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/server/access";
import { isValidCallbackUrl } from "@/lib/callback-url";
import {
  checkPasswordResetRateLimit,
  consumeAuthToken,
  invalidateOtherTokens,
  sendPasswordResetEmail,
  sendVerificationEmail,
  verifyAuthToken,
} from "@/server/auth-tokens";

// ponytail: in-memory failed sign-in attempts per email are tracked per-process.
const failedLoginAttempts = new Map<string, number[]>();
const FAILED_LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_LOGIN_ATTEMPTS = 10;

const vnPhoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
    email: z.string().trim().email("Địa chỉ email không hợp lệ"),
    phone: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => !val || vnPhoneRegex.test(val),
        "Số điện thoại không đúng định dạng Việt Nam (ví dụ: 0912345678 hoặc +84912345678)"
      ),
    password: z
      .string()
      .min(8, "Mật khẩu phải từ 8 ký tự")
      .regex(passwordRegex, "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ActionState = {
  error?: string;
  errors?: Record<string, string>;
  success?: boolean;
  message?: string;
};

export async function registerAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string;
      if (!errors[field]) {
        errors[field] = issue.message;
      }
    }
    return { error: "Vui lòng kiểm tra lại thông tin đăng ký.", errors };
  }

  const { name, phone, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      error: "Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.",
      errors: { email: "Email đã tồn tại trong hệ thống" },
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await db.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      passwordHash,
      role: "USER",
      status: "ACTIVE",
    },
  });

  try {
    await sendVerificationEmail({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });
  } catch (err) {
    console.error("Failed to send verification email during signup:", err);
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/tai-khoan?verify=pending",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Đăng nhập thất bại sau khi tạo tài khoản." };
    }
    throw err;
  }

  return { success: true };
}

const loginSchema = z.object({
  email: z.string().trim().email("Vui lòng nhập email hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  callbackUrl: z.string().optional(),
});

export async function loginAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    callbackUrl: formData.get("callbackUrl") || undefined,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Email hoặc mật khẩu không đúng" };
  }

  const email = parsed.data.email.toLowerCase();

  const now = Date.now();
  const recentAttempts = (failedLoginAttempts.get(email) ?? []).filter(
    (timestamp) => now - timestamp < FAILED_LOGIN_WINDOW_MS
  );
  failedLoginAttempts.set(email, recentAttempts);

  if (recentAttempts.length >= MAX_FAILED_LOGIN_ATTEMPTS) {
    return {
      error: "Quá nhiều lần đăng nhập không thành công. Vui lòng thử lại sau 15 phút.",
    };
  }

  let redirectTo = "/tai-khoan";
  if (isValidCallbackUrl(parsed.data.callbackUrl)) {
    redirectTo = parsed.data.callbackUrl;
  }

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo,
    });
    failedLoginAttempts.delete(email);
  } catch (err) {
    if (err instanceof AuthError) {
      const currentAttempts = (failedLoginAttempts.get(email) ?? []).filter(
        (timestamp) => Date.now() - timestamp < FAILED_LOGIN_WINDOW_MS
      );
      currentAttempts.push(Date.now());
      failedLoginAttempts.set(email, currentAttempts);
      return { error: "Email hoặc mật khẩu không đúng" };
    }
    failedLoginAttempts.delete(email);
    throw err;
  }

  return { success: true };
}

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Vui lòng nhập địa chỉ email hợp lệ"),
});

export async function forgotPasswordAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const raw = { email: formData.get("email") };
  const parsed = forgotPasswordSchema.safeParse(raw);

  const genericSuccessMessage =
    "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến hộp thư của bạn.";

  if (!parsed.success) {
    return {
      error: "Vui lòng nhập địa chỉ email hợp lệ",
      errors: { email: "Email không hợp lệ" },
    };
  }

  const email = parsed.data.email.toLowerCase();
  const canSend = await checkPasswordResetRateLimit(email);
  if (!canSend) {
    return {
      error: "Bạn đã yêu cầu gửi quá 3 lần trong 1 giờ. Vui lòng thử lại sau.",
    };
  }

  const user = await db.user.findUnique({
    where: { email },
  });

  if (user && user.status !== "LOCKED") {
    try {
      const res = await sendPasswordResetEmail({
        id: user.id,
        email: user.email,
        name: user.name,
      });
      if (!res.success && res.error) {
        return { error: res.error };
      }
    } catch (err) {
      console.error("Failed to send password reset email:", err);
    }
  }

  return {
    success: true,
    message: genericSuccessMessage,
  };
}

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Thiếu mã xác thực"),
    password: z
      .string()
      .min(8, "Mật khẩu phải từ 8 ký tự")
      .regex(passwordRegex, "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export async function resetPasswordAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = resetPasswordSchema.safeParse(raw);
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

  const { token, password } = parsed.data;
  const tokenRecord = await verifyAuthToken(token, "RESET_PASSWORD");

  if (!tokenRecord) {
    return {
      error:
        "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.",
    };
  }

  const newPasswordHash = await bcrypt.hash(password, 10);

  await db.user.update({
    where: { id: tokenRecord.userId },
    data: { passwordHash: newPasswordHash },
  });

  await consumeAuthToken(tokenRecord.id);
  await invalidateOtherTokens(tokenRecord.userId, "RESET_PASSWORD", tokenRecord.id);

  redirect("/dang-nhap?reset=success");
}

export async function resendVerificationAction(): Promise<ActionState> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return { error: "Bạn cần đăng nhập để gửi lại email xác thực." };
  }

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
  });

  if (!user) {
    return { error: "Người dùng không tồn tại." };
  }

  if (user.emailVerified) {
    return { success: true, message: "Email của bạn đã được xác thực rồi." };
  }

  const result = await sendVerificationEmail({
    id: user.id,
    email: user.email,
    name: user.name,
  });

  if (!result.success) {
    return { error: result.error || "Không thể gửi email xác thực lúc này." };
  }

  return {
    success: true,
    message: "Đã gửi email xác thực. Vui lòng kiểm tra hộp thư của bạn.",
  };
}
