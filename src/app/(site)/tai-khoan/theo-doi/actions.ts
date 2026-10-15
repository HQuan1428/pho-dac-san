"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/server/access";

export async function unfollowShopAction(shopId: string) {
  const user = await requireUser("/tai-khoan/theo-doi");

  await db.shopFollow.deleteMany({
    where: {
      userId: user.id,
      shopId,
    },
  });

  revalidatePath("/tai-khoan/theo-doi");
  return { success: true };
}
