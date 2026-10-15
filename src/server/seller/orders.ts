"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { requireShop } from "@/server/access";

export async function getSellerOrders({
  status,
  search = "",
  sort = "desc",
  page = 1,
  pageSize = 15,
}: {
  status?: string;
  search?: string;
  sort?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}) {
  const { shop } = await requireShop();

  const validStatuses: OrderStatus[] = ["NEW", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"];
  const isStatusFilter = status && validStatuses.includes(status as OrderStatus);

  const where: import("@prisma/client").Prisma.OrderWhereInput = {
    shopId: shop.id,
    ...(isStatusFilter ? { status: status as OrderStatus } : {}),
    ...(search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" } },
            { customerPhone: { contains: search, mode: "insensitive" } },
            { customerName: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [
    total,
    orders,
    newCount,
    confirmedCount,
    shippingCount,
    completedCount,
    cancelledCount,
    allCount,
    flags,
  ] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      orderBy: { createdAt: sort === "asc" ? "asc" : "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { items: true } },
      },
    }),
    db.order.count({ where: { shopId: shop.id, status: "NEW" } }),
    db.order.count({ where: { shopId: shop.id, status: "CONFIRMED" } }),
    db.order.count({ where: { shopId: shop.id, status: "SHIPPING" } }),
    db.order.count({ where: { shopId: shop.id, status: "COMPLETED" } }),
    db.order.count({ where: { shopId: shop.id, status: "CANCELLED" } }),
    db.order.count({ where: { shopId: shop.id } }),
    db.customerFlag.findMany({
      where: { shopId: shop.id },
      select: { phone: true, reason: true },
    }),
  ]);

  const flagMap = new Map(flags.map((f) => [f.phone, f.reason || true]));

  const items = orders.map((o) => ({
    id: o.id,
    code: o.code,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    status: o.status,
    total: o.total,
    itemCount: o._count.items,
    createdAt: o.createdAt,
    hasCustomerFlag: flagMap.has(o.customerPhone),
  }));

  return {
    items,
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage: page,
    counts: {
      ALL: allCount,
      NEW: newCount,
      CONFIRMED: confirmedCount,
      SHIPPING: shippingCount,
      COMPLETED: completedCount,
      CANCELLED: cancelledCount,
    },
  };
}

export async function getSellerOrderByCode(code: string) {
  const { shop } = await requireShop();

  const order = await db.order.findFirst({
    where: { code, shopId: shop.id },
    include: {
      items: true,
      voucher: true,
      events: {
        orderBy: { createdAt: "asc" },
        include: {
          actor: { select: { id: true, name: true, role: true } },
        },
      },
      customer: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  if (!order) notFound();

  const customerFlag = await db.customerFlag.findUnique({
    where: {
      shopId_phone: {
        shopId: shop.id,
        phone: order.customerPhone,
      },
    },
  });

  return {
    order,
    customerFlag,
  };
}

export async function updateOrderStatusAction({
  code,
  nextStatus,
  cancelReason,
}: {
  code: string;
  nextStatus: OrderStatus;
  cancelReason?: string;
}) {
  const { user, shop } = await requireShop();

  const order = await db.order.findFirst({
    where: { code, shopId: shop.id },
    include: { items: true },
  });

  if (!order) {
    return { error: "Không tìm thấy đơn hàng" };
  }

  // Allowed transitions
  const allowedMap: Record<OrderStatus, OrderStatus[]> = {
    NEW: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["SHIPPING", "CANCELLED"],
    SHIPPING: ["COMPLETED", "CANCELLED"],
    COMPLETED: [],
    CANCELLED: [],
  };

  if (!allowedMap[order.status].includes(nextStatus)) {
    return { error: `Không thể chuyển trạng thái từ ${order.status} sang ${nextStatus}` };
  }

  if (nextStatus === "CANCELLED" && (!cancelReason || !cancelReason.trim())) {
    return { error: "Vui lòng nhập lý do hủy đơn hàng" };
  }

  const reason = cancelReason?.trim() || null;

  try {
    await db.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: nextStatus,
          cancelReason: nextStatus === "CANCELLED" ? reason : undefined,
        },
      });

      // Add order event
      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          actorId: user.id,
          status: nextStatus,
          note: nextStatus === "CANCELLED" ? `Lý do hủy: ${reason}` : null,
        },
      });

      // If CANCELLED, restore variant stock
      if (nextStatus === "CANCELLED") {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      // If COMPLETED, increment sold count
      if (nextStatus === "COMPLETED") {
        for (const item of order.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { soldCount: { increment: item.quantity } },
            });
          }
        }
      }
    });

    // Notify customer
    await notifyCustomer({
      customerId: order.customerId,
      customerEmail: order.customerEmail,
      orderCode: order.code,
      shopName: shop.name,
      status: nextStatus,
      reason,
    });

    revalidatePath(`/kenh-ban/don-hang/${code}`);
    revalidatePath("/kenh-ban/don-hang");
    revalidatePath("/kenh-ban");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Cập nhật trạng thái thất bại";
    return { error: msg };
  }
}

export async function addCallNoteAction({
  code,
  note,
}: {
  code: string;
  note: string;
}) {
  const { user, shop } = await requireShop();

  if (!note || !note.trim()) {
    return { error: "Vui lòng nhập nội dung ghi chú" };
  }

  const order = await db.order.findFirst({
    where: { code, shopId: shop.id },
    select: { id: true },
  });

  if (!order) {
    return { error: "Không tìm thấy đơn hàng" };
  }

  try {
    await db.orderEvent.create({
      data: {
        orderId: order.id,
        actorId: user.id,
        note: note.trim(),
      },
    });

    revalidatePath(`/kenh-ban/don-hang/${code}`);
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Thêm ghi chú thất bại";
    return { error: msg };
  }
}

export async function toggleCustomerFlagAction({
  phone,
  reason,
  remove = false,
}: {
  phone: string;
  reason?: string;
  remove?: boolean;
}) {
  const { shop } = await requireShop();

  if (!phone) {
    return { error: "Số điện thoại không hợp lệ" };
  }

  try {
    if (remove) {
      await db.customerFlag.deleteMany({
        where: { shopId: shop.id, phone },
      });
    } else {
      await db.customerFlag.upsert({
        where: { shopId_phone: { shopId: shop.id, phone } },
        update: { reason: reason?.trim() || "Bom hàng / không nhận hàng" },
        create: {
          shopId: shop.id,
          phone,
          reason: reason?.trim() || "Bom hàng / không nhận hàng",
        },
      });
    }

    revalidatePath("/kenh-ban/don-hang");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Cập nhật đánh dấu thất bại";
    return { error: msg };
  }
}

async function notifyCustomer({
  customerId,
  customerEmail,
  orderCode,
  shopName,
  status,
  reason,
}: {
  customerId?: string | null;
  customerEmail?: string | null;
  orderCode: string;
  shopName: string;
  status: OrderStatus;
  reason?: string | null;
}) {
  const notificationContent: Record<OrderStatus, { title: string; body: string } | null> = {
    NEW: null,
    CONFIRMED: {
      title: `Đơn hàng #${orderCode} đã được xác nhận`,
      body: `Gian hàng ${shopName} đã xác nhận đơn hàng của bạn và đang chuẩn bị sản phẩm.`,
    },
    SHIPPING: {
      title: `Đơn hàng #${orderCode} đang được giao`,
      body: `Đơn hàng từ ${shopName} đã được bàn giao cho đơn vị vận chuyển. Vui lòng để ý điện thoại.`,
    },
    COMPLETED: {
      title: `Đơn hàng #${orderCode} đã hoàn thành`,
      body: `Cảm ơn bạn đã mua hàng tại ${shopName}! Chúc bạn có trải nghiệm tuyệt vời.`,
    },
    CANCELLED: {
      title: `Đơn hàng #${orderCode} đã bị hủy`,
      body: `Đơn hàng #${orderCode} từ ${shopName} đã bị hủy.${reason ? ` Lý do: ${reason}` : ""}`,
    },
  };

  const content = notificationContent[status];
  if (!content) return;

  try {
    if (customerId) {
      await db.notification.create({
        data: {
          userId: customerId,
          title: content.title,
          body: content.body,
          link: `/tai-khoan/don-hang`,
        },
      });
    }

    if (customerEmail) {
      await sendMail(
        customerEmail,
        `[Phố Đặc Sản] ${content.title}`,
        `<div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #059669;">Phố Đặc Sản</h2>
          <p>Xin chào quý khách,</p>
          <p>${content.body}</p>
          <p>Mã đơn hàng: <strong>${orderCode}</strong></p>
          <p>Trân trọng,<br/>Đội ngũ Phố Đặc Sản</p>
        </div>`
      );
    }
  } catch (err) {
    console.error("Lỗi gửi thông báo cho khách hàng:", err);
  }
}
