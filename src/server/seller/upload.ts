"use server";

import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { requireShop } from "@/server/access";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function detectImageExtension(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return ".jpg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return ".png";
  }

  // WEBP: 'RIFF' at 0..3 and 'WEBP' at 8..11
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return ".webp";
  }

  return null;
}

export async function saveUploadedImage(
  file: File,
  shopId: string
): Promise<{ url?: string; error?: string }> {
  if (!file || !(file instanceof File)) {
    return { error: "Vui lòng chọn tệp hình ảnh" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "Dung lượng ảnh tối đa là 5MB" };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ext = detectImageExtension(buffer);
  if (!ext) {
    return { error: "Chỉ chấp nhận ảnh định dạng JPG, PNG hoặc WebP hợp lệ" };
  }

  const uploadDir = process.env.UPLOAD_DIR || "public/uploads";
  const targetDir = path.isAbsolute(uploadDir)
    ? path.join(uploadDir, shopId)
    : path.join(process.cwd(), uploadDir, shopId);

  await fs.mkdir(targetDir, { recursive: true });

  const randomName = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(targetDir, randomName);

  await fs.writeFile(filePath, buffer);

  return { url: `/uploads/${shopId}/${randomName}` };
}

export async function uploadSellerImageAction(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  try {
    const { shop } = await requireShop();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return { error: "Không tìm thấy tệp ảnh trong yêu cầu" };
    }
    return await saveUploadedImage(file, shop.id);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Tải ảnh thất bại";
    return { error: message };
  }
}
