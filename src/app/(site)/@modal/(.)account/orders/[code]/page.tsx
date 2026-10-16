import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/server/access";
import { RouteModal } from "@/components/common/route-modal";
import { OrderDetailView } from "@/app/(site)/account/orders/[code]/order-detail-view";

export default async function OrderDetailModal(props: {
  params: Promise<{ code: string }>;
}) {
  const user = await requireUser("/account");
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

  if (!order || order.customerId !== user.id) {
    notFound();
  }

  return (
    <RouteModal variant="sheet" title={`Đơn hàng #${order.code}`}>
      <OrderDetailView order={order} inModal={true} />
    </RouteModal>
  );
}
