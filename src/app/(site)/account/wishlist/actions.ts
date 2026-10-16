"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/server/access";

export async function removeFromWishlistAction(productId: string) {
  const user = await requireUser("/account/wishlist");

  await db.wishlistItem.deleteMany({
    where: {
      userId: user.id,
      productId,
    },
  });

  revalidatePath("/account/wishlist");
  return { success: true };
}
