"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/server/access";

export async function removeFromWishlistAction(productId: string) {
  const user = await requireUser("/tai-khoan/yeu-thich");

  await db.wishlistItem.deleteMany({
    where: {
      userId: user.id,
      productId,
    },
  });

  revalidatePath("/tai-khoan/yeu-thich");
  return { success: true };
}
