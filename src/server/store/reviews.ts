"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/server/access";

const reviewSchema = z.object({
  productId: z.string().min(1, "Thiếu mã sản phẩm"),
  orderItemId: z.string().min(1, "Thiếu mã mục đơn hàng"),
  rating: z.coerce.number().int().min(1, "Đánh giá từ 1 đến 5 sao").max(5, "Đánh giá từ 1 đến 5 sao"),
  content: z.string().max(1000, "Nội dung đánh giá tối đa 1000 ký tự").optional(),
  path: z.string().optional(),
});

export async function submitReview(formData: FormData) {
  const user = await requireUser();

  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    orderItemId: formData.get("orderItemId"),
    rating: formData.get("rating"),
    content: formData.get("content") ?? undefined,
    path: formData.get("path") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu đánh giá không hợp lệ" };
  }

  const { productId, orderItemId, rating, content, path } = parsed.data;

  // Verify that the user has a COMPLETED order item for this product without an existing review
  const eligibleItem = await db.orderItem.findFirst({
    where: {
      id: orderItemId,
      productId,
      order: {
        customerId: user.id,
        status: "COMPLETED",
      },
      review: null,
    },
  });

  if (!eligibleItem) {
    return { error: "Bạn không thể đánh giá sản phẩm này hoặc đã đánh giá trước đó." };
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.review.create({
        data: {
          productId,
          orderItemId,
          userId: user.id,
          rating,
          content: content?.trim() || null,
        },
      });

      const reviews = await tx.review.findMany({
        where: { productId },
        select: { rating: true },
      });

      const count = reviews.length;
      const avg = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
      const roundedAvg = Math.round(avg * 10) / 10;

      await tx.product.update({
        where: { id: productId },
        data: {
          ratingAvg: roundedAvg,
          ratingCount: count,
        },
      });
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "Bạn không thể đánh giá sản phẩm này hoặc đã đánh giá trước đó." };
    }
    throw err;
  }

  if (path) {
    revalidatePath(path);
  }

  return { success: true };
}
