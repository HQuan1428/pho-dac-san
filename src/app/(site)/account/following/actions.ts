"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/server/access";

export async function unfollowShopAction(shopId: string) {
  const user = await requireUser("/account/following");

  await db.shopFollow.deleteMany({
    where: {
      userId: user.id,
      shopId,
    },
  });

  revalidatePath("/account/following");
  return { success: true };
}
