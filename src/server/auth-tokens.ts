import "server-only";
import crypto from "crypto";
import { type TokenType } from "@prisma/client";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { escapeHtml } from "@/lib/html";

export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function generateRawToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export async function createAuthToken(userId: string, type: TokenType, expiresInHours: number) {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  const tokenRecord = await db.authToken.create({
    data: {
      userId,
      type,
      tokenHash,
      expiresAt,
    },
  });

  return { rawToken, tokenRecord };
}

export async function verifyAuthToken(rawToken: string, type: TokenType) {
  if (!rawToken || typeof rawToken !== "string") {
    return null;
  }

  const tokenHash = hashToken(rawToken);
  const token = await db.authToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!token) return null;
  if (token.type !== type) return null;
  if (token.usedAt !== null) return null;
  if (token.expiresAt.getTime() <= Date.now()) return null;

  return token;
}

export async function consumeAuthToken(id: string) {
  return db.authToken.update({
    where: { id },
    data: { usedAt: new Date() },
  });
}

export async function invalidateOtherTokens(userId: string, type: TokenType, exceptId?: string) {
  return db.authToken.updateMany({
    where: {
      userId,
      type,
      usedAt: null,
      ...(exceptId ? { id: { not: exceptId } } : {}),
    },
    data: { usedAt: new Date() },
  });
}

export async function checkVerificationRateLimit(userId: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await db.authToken.count({
    where: {
      userId,
      type: "VERIFY_EMAIL",
      createdAt: { gte: oneHourAgo },
    },
  });

  // Rate limit: max 3 tokens per hour per user
  return recentCount < 3;
}

export async function checkPasswordResetRateLimit(userIdOrEmail: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await db.authToken.count({
    where: {
      OR: [
        { userId: userIdOrEmail },
        { user: { email: userIdOrEmail.toLowerCase() } },
      ],
      type: "RESET_PASSWORD",
      createdAt: { gte: oneHourAgo },
    },
  });

  return recentCount < 3;
}

export async function sendVerificationEmail(user: { id: string; email: string; name: string }) {
  const canSend = await checkVerificationRateLimit(user.id);
  if (!canSend) {
    return { success: false, error: "Bạn đã yêu cầu gửi quá 3 lần trong 1 giờ. Vui lòng thử lại sau." };
  }

  const { rawToken } = await createAuthToken(user.id, "VERIFY_EMAIL", 24);
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/verify-email?token=${rawToken}`;

  const html = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #0b6b55; margin-bottom: 16px;">Xác thực tài khoản Phố Đặc Sản</h2>
      <p>Xin chào <strong>${escapeHtml(user.name)}</strong>,</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản tại Phố Đặc Sản. Vui lòng bấm vào nút bên dưới để xác thực địa chỉ email của bạn:</p>
      <div style="margin: 24px 0;">
        <a href="${verifyUrl}" style="background-color: #0b6b55; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
          Xác thực email
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">Liên kết này có hiệu lực trong vòng 24 giờ.</p>
      <p style="color: #6b7280; font-size: 14px;">Nếu nút trên không hoạt động, bạn có thể sao chép liên kết này vào trình duyệt:<br/><a href="${verifyUrl}" style="color: #0b6b55;">${verifyUrl}</a></p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px;">Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.</p>
    </div>
  `;

  await sendMail(user.email, "Xác thực địa chỉ email - Phố Đặc Sản", html);
  return { success: true };
}

export async function sendPasswordResetEmail(user: { id: string; email: string; name: string }) {
  const canSend = await checkPasswordResetRateLimit(user.id);
  if (!canSend) {
    return { success: false, error: "Bạn đã yêu cầu gửi quá 3 lần trong 1 giờ. Vui lòng thử lại sau." };
  }

  const { rawToken } = await createAuthToken(user.id, "RESET_PASSWORD", 1);
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

  const html = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #0b6b55; margin-bottom: 16px;">Đặt lại mật khẩu - Phố Đặc Sản</h2>
      <p>Xin chào <strong>${escapeHtml(user.name)}</strong>,</p>
      <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại Phố Đặc Sản. Vui lòng bấm vào nút bên dưới để tạo mật khẩu mới:</p>
      <div style="margin: 24px 0;">
        <a href="${resetUrl}" style="background-color: #0b6b55; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
          Đặt lại mật khẩu
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">Liên kết này có hiệu lực trong vòng 1 giờ.</p>
      <p style="color: #6b7280; font-size: 14px;">Nếu nút trên không hoạt động, bạn có thể sao chép liên kết này vào trình duyệt:<br/><a href="${resetUrl}" style="color: #0b6b55;">${resetUrl}</a></p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px;">Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể an tâm bỏ qua email này. Mật khẩu hiện tại của bạn vẫn được bảo mật.</p>
    </div>
  `;

  await sendMail(user.email, "Hướng dẫn đặt lại mật khẩu - Phố Đặc Sản", html);
  return { success: true };
}
