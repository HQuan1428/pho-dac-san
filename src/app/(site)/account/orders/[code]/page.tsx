import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { db } from "@/lib/db";
import { requireUser } from "@/server/access";
import { OrderDetailView } from "./order-detail-view";

export const metadata: Metadata = {
  title: "Chi tiết đơn hàng - Phố Đặc Sản",
};

export default async function OrderDetailPage(props: {
  params: Promise<{ code: string }>;
}) {
  const user = await requireUser("/account/orders");
  const params = await props.params;

  const order = await db.order.findUnique({
    where: { code: params.code },
    include: {
      shop: {
        select: {
          name: true,
          slug: true,
          phone: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              slug: true,
            },
          },
          review: {
            select: {
              id: true,
            },
          },
        },
      },
      events: {
        where: {
          status: { not: null },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  // Only the owner can view (404 otherwise)
  if (!order || order.customerId !== user.id) {
    notFound();
  }

  return <OrderDetailView order={order} inModal={false} />;
}
