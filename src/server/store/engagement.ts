"use server";

import { db } from "@/lib/db";
import { requireUser } from "@/server/access";

export async function toggleWishlist(productId: string, pathname = "/") {
  const user = await requireUser(pathname);
  const existing = await db.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId: user.id,
        productId,
      },
    },
  });

  if (existing) {
    await db.wishlistItem.delete({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });
    return { wishlisted: false };
  }

  await db.wishlistItem.create({
    data: {
      userId: user.id,
      productId,
    },
  });

  return { wishlisted: true };
}

export async function toggleFollow(shopId: string, pathname = "/") {
  const user = await requireUser(pathname);
  const existing = await db.shopFollow.findUnique({
    where: {
      userId_shopId: {
        userId: user.id,
        shopId,
      },
    },
  });

  if (existing) {
    await db.shopFollow.delete({
      where: {
        userId_shopId: {
          userId: user.id,
          shopId,
        },
      },
    });
    return { followed: false };
  }

  await db.shopFollow.create({
    data: {
      userId: user.id,
      shopId,
    },
  });

  return { followed: true };
}
