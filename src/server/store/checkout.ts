"use server";

import crypto from "crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/server/access";
import { sendMail } from "@/lib/mail";
import { escapeHtml } from "@/lib/html";

class OutOfStockError extends Error {
  constructor(productName: string) {
    super(`Sản phẩm ${productName} không đủ hàng`);
    this.name = "OutOfStockError";
  }
}

class VoucherError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VoucherError";
  }
}

const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

const checkoutItemSchema = z.object({
  variantId: z.string().min(1, "Thiếu mã biến thể"),
  quantity: z.number().int().min(1, "Số lượng phải lớn hơn 0"),
});

const checkoutInputSchema = z.object({
  name: z.string().trim().min(2, "Họ và tên tối thiểu 2 ký tự"),
  phone: z.string().trim().regex(phoneRegex, "Số điện thoại không hợp lệ (VD: 0912345678)"),
  email: z.string().trim().email("Email không hợp lệ").optional().or(z.literal("")),
  provinceId: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
  addressDetail: z.string().trim().min(5, "Địa chỉ chi tiết tối thiểu 5 ký tự"),
  note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự").optional().or(z.literal("")),
  items: z.array(checkoutItemSchema).min(1, "Giỏ hàng đang trống"),
  vouchers: z.record(z.string(), z.string()).optional(), // shopId -> voucherCode
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

function generateOrderCode(date: Date): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const random = crypto.randomInt(0, 36 ** 4).toString(36).toUpperCase().padStart(4, "0");
  return `ORD-${yy}${mm}${dd}-${random}`;
}

function formatVnd(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export async function placeOrder(input: CheckoutInput) {
  // 1. Zod validation
  const parsed = checkoutInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const data = parsed.data;
  const user = await getCurrentUser();

  // 2. IP resolution & Rate limiting
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  const realIp = h.get("x-real-ip");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  // Rate limit by phone: reject if >= 5 orders in the last hour
  const phoneCount = await db.order.count({
    where: {
      customerPhone: data.phone,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (phoneCount >= 5) {
    return {
      error: "Số điện thoại này đã đặt 5 đơn hàng trong vòng 1 giờ qua. Vui lòng thử lại sau.",
    };
  }

  // Rate limit by IP: reject if >= 10 orders in the last hour
  if (clientIp) {
    const ipCount = await db.order.count({
      where: {
        ip: clientIp,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (ipCount >= 10) {
      return {
        error: "Địa chỉ mạng này đã đặt quá nhiều đơn hàng trong vòng 1 giờ qua. Vui lòng thử lại sau.",
      };
    }
  }

  // 3. Re-read variants & products & shops from DB
  const province = await db.province.findUnique({
    where: { id: data.provinceId },
  });
  if (!province) {
    return { error: "Tỉnh/Thành phố không hợp lệ" };
  }

  const variantIds = data.items.map((i) => i.variantId);
  const variants = await db.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: {
        include: {
          shop: {
            include: {
              owner: true,
              members: { include: { user: true } },
            },
          },
        },
      },
    },
  });

  const variantMap = new Map(variants.map((v) => [v.id, v]));

  // Check each item exists, is active, and has sufficient stock
  for (const item of data.items) {
    const v = variantMap.get(item.variantId);
    if (!v) {
      return { error: "Sản phẩm không tồn tại trong hệ thống." };
    }
    if (v.product.status !== "ACTIVE" || v.product.shop.status !== "ACTIVE") {
      return { error: `Sản phẩm "${v.product.name}" hiện không còn mở bán.` };
    }
    if (v.stock < item.quantity) {
      return {
        error: `Sản phẩm ${v.product.name} không đủ hàng`,
      };
    }
  }

  // Group items by shop
  type ShopGroup = {
    shop: (typeof variants)[0]["product"]["shop"];
    items: Array<{
      variant: (typeof variants)[0];
      quantity: number;
    }>;
  };
  const shopGroups = new Map<string, ShopGroup>();

  for (const item of data.items) {
    const v = variantMap.get(item.variantId)!;
    const shopId = v.product.shopId;
    if (!shopGroups.has(shopId)) {
      shopGroups.set(shopId, {
        shop: v.product.shop,
        items: [],
      });
    }
    shopGroups.get(shopId)!.items.push({
      variant: v,
      quantity: item.quantity,
    });
  }

  const checkoutId = crypto.randomUUID();
  const now = new Date();

  // Validate vouchers for each shop beforehand
  type PreparedShopOrder = {
    shop: (typeof variants)[0]["product"]["shop"];
    items: Array<{
      variant: (typeof variants)[0];
      quantity: number;
    }>;
    subtotal: number;
    discount: number;
    total: number;
    voucherId?: string;
    voucherRecord?: { id: string; usedCount: number };
  };

  const preparedOrders: PreparedShopOrder[] = [];

  for (const [shopId, group] of shopGroups) {
    const subtotal = group.items.reduce((sum, i) => sum + i.variant.price * i.quantity, 0);
    let discount = 0;
    let voucherRecord: { id: string; usedCount: number } | undefined = undefined;

    const voucherCode = data.vouchers?.[shopId]?.trim().toUpperCase();
    if (voucherCode) {
      const v = await db.voucher.findUnique({
        where: { shopId_code: { shopId, code: voucherCode } },
      });
      if (
        v &&
        v.active &&
        v.startsAt <= now &&
        v.endsAt >= now &&
        (v.usageLimit === null || v.usedCount < v.usageLimit) &&
        subtotal >= v.minOrder
      ) {
        voucherRecord = v;
        if (v.type === "PERCENT") {
          discount = Math.floor((subtotal * v.value) / 100);
          if (v.maxDiscount !== null && discount > v.maxDiscount) {
            discount = v.maxDiscount;
          }
        } else {
          discount = Math.min(subtotal, v.value);
        }
      }
    }

    const total = Math.max(0, subtotal - discount);
    preparedOrders.push({
      shop: group.shop,
      items: group.items,
      subtotal,
      discount,
      total,
      voucherId: voucherRecord?.id,
      voucherRecord,
    });
  }

  // 4. Atomic transaction
  let createdOrders: Array<{
    id: string;
    code: string;
    shop: (typeof variants)[0]["product"]["shop"];
    items: Array<{ productName: string; variantName: string; price: number; quantity: number }>;
    subtotal: number;
    discount: number;
    total: number;
  }> = [];

  try {
    createdOrders = await db.$transaction(async (tx) => {
      const results = [];

      for (const orderData of preparedOrders) {
        // Generate unique order code
        let code = generateOrderCode(now);
        let exists = await tx.order.findUnique({ where: { code } });
        let attempts = 0;
        while (exists && attempts < 10) {
          code = generateOrderCode(now);
          exists = await tx.order.findUnique({ where: { code } });
          attempts++;
        }

        // Create Order
        const order = await tx.order.create({
          data: {
            code,
            checkoutId,
            shopId: orderData.shop.id,
            customerId: user?.id ?? null,
            customerName: data.name,
            customerPhone: data.phone,
            customerEmail: data.email || null,
            provinceId: data.provinceId,
            shippingAddress: data.addressDetail,
            note: data.note || null,
            status: "NEW",
            voucherId: orderData.voucherId ?? null,
            subtotal: orderData.subtotal,
            discount: orderData.discount,
            total: orderData.total,
            ip: clientIp,
            items: {
              create: orderData.items.map((i) => ({
                productId: i.variant.product.id,
                variantId: i.variant.id,
                productName: i.variant.product.name,
                variantName: i.variant.name,
                price: i.variant.price,
                quantity: i.quantity,
              })),
            },
            events: {
              create: {
                actorId: user?.id ?? null,
                status: "NEW",
                note: "Đơn hàng mới được tạo",
              },
            },
          },
        });

        // Decrement stock for each variant with concurrency check
        for (const i of orderData.items) {
          const res = await tx.productVariant.updateMany({
            where: { id: i.variant.id, stock: { gte: i.quantity } },
            data: {
              stock: { decrement: i.quantity },
            },
          });

          if (res.count === 0) {
            throw new OutOfStockError(i.variant.product.name);
          }
        }

        // Re-check voucher inside the transaction and increment usedCount
        if (orderData.voucherId) {
          const voucher = await tx.voucher.findUnique({
            where: { id: orderData.voucherId },
          });

          if (!voucher || !voucher.active) {
            throw new VoucherError("Mã giảm giá đã hết lượt sử dụng");
          }

          const voucherUpdate = await tx.voucher.updateMany({
            where: {
              id: orderData.voucherId,
              active: true,
              OR: [
                { usageLimit: null },
                ...(voucher.usageLimit !== null
                  ? [{ usedCount: { lt: voucher.usageLimit } }]
                  : []),
              ],
            },
            data: {
              usedCount: { increment: 1 },
            },
          });

          if (voucherUpdate.count === 0) {
            throw new VoucherError("Mã giảm giá đã hết lượt sử dụng");
          }
        }

        results.push({
          id: order.id,
          code: order.code,
          shop: orderData.shop,
          items: orderData.items.map((i) => ({
            productName: i.variant.product.name,
            variantName: i.variant.name,
            price: i.variant.price,
            quantity: i.quantity,
          })),
          subtotal: orderData.subtotal,
          discount: orderData.discount,
          total: orderData.total,
        });
      }

      return results;
    });
  } catch (err: unknown) {
    if (err instanceof OutOfStockError || err instanceof VoucherError) {
      return { error: err.message };
    }
    console.error("Order transaction error:", err);
    return { error: "Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại." };
  }

  // 5. Post-transaction Notifications and Emails
  // Note: Wrapped in try/catch so any mail/notification failure does not fail the order.
  for (const ord of createdOrders) {
    try {
      // Find all staff userIds to notify
      const staffUserIds = ord.shop.members.map((m) => m.userId);
      const notifyUserIds = Array.from(new Set([ord.shop.ownerId, ...staffUserIds]));

      // In-app notifications
      for (const uid of notifyUserIds) {
        await db.notification.create({
          data: {
            userId: uid,
            title: `Đơn hàng mới #${ord.code}`,
            body: `Khách hàng ${data.name} đã đặt đơn hàng trị giá ${formatVnd(ord.total)}.`,
            link: `/seller/orders`,
          },
        }).catch((e) => console.error("Notification creation failed:", e));
      }

      // Email to shop owner & staff
      const shopEmails = Array.from(
        new Set([
          ord.shop.owner.email,
          ...ord.shop.members.map((m) => m.user.email),
        ].filter(Boolean))
      );

      const itemsHtml = ord.items
        .map(
          (it) =>
            `<tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(it.productName)} (${escapeHtml(it.variantName)})</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${it.quantity}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatVnd(it.price)}</td>
            </tr>`
        )
        .join("");

      const shopEmailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0b6b55;">Bạn có đơn hàng mới #${escapeHtml(ord.code)}</h2>
          <p>Xin chào <strong>${escapeHtml(ord.shop.name)}</strong>,</p>
          <p>Khách hàng <strong>${escapeHtml(data.name)}</strong> vừa đặt một đơn hàng mới từ gian hàng của bạn.</p>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Thông tin nhận hàng</h3>
            <p style="margin: 4px 0;"><strong>Họ tên:</strong> ${escapeHtml(data.name)}</p>
            <p style="margin: 4px 0;"><strong>Điện thoại:</strong> ${escapeHtml(data.phone)}</p>
            <p style="margin: 4px 0;"><strong>Địa chỉ:</strong> ${escapeHtml(data.addressDetail)}</p>
            ${data.note ? `<p style="margin: 4px 0;"><strong>Ghi chú:</strong> ${escapeHtml(data.note)}</p>` : ""}
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f3f4f6; text-align: left;">
                <th style="padding: 8px;">Sản phẩm</th>
                <th style="padding: 8px; text-align: center;">SL</th>
                <th style="padding: 8px; text-align: right;">Giá</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 8px; text-align: right;"><strong>Tạm tính:</strong></td>
                <td style="padding: 8px; text-align: right;">${formatVnd(ord.subtotal)}</td>
              </tr>
              ${ord.discount > 0 ? `
              <tr>
                <td colspan="2" style="padding: 8px; text-align: right; color: #0b6b55;"><strong>Giảm giá:</strong></td>
                <td style="padding: 8px; text-align: right; color: #0b6b55;">-${formatVnd(ord.discount)}</td>
              </tr>` : ""}
              <tr>
                <td colspan="2" style="padding: 8px; text-align: right; font-size: 16px;"><strong>Tổng cộng:</strong></td>
                <td style="padding: 8px; text-align: right; font-size: 16px; font-weight: bold; color: #0b6b55;">${formatVnd(ord.total)}</td>
              </tr>
            </tfoot>
          </table>

          <p style="color: #6b7280; font-size: 14px;">
            Vui lòng sớm liên hệ với khách hàng qua số điện thoại <strong>${escapeHtml(data.phone)}</strong> để xác nhận và giao hàng.
          </p>
        </div>
      `;

      for (const email of shopEmails) {
        await sendMail(email, `[Phố Đặc Sản] Đơn hàng mới #${ord.code}`, shopEmailHtml).catch((e) =>
          console.error("Shop email error:", e)
        );
      }

      // Customer confirmation email if email was provided
      if (data.email) {
        const customerEmailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0b6b55;">Đặt hàng thành công #${escapeHtml(ord.code)}</h2>
            <p>Xin chào <strong>${escapeHtml(data.name)}</strong>,</p>
            <p>Cảm ơn bạn đã đặt hàng tại <strong>${escapeHtml(ord.shop.name)}</strong> trên Phố Đặc Sản.</p>
            
            <div style="background-color: #ecfdf5; border-left: 4px solid #0b6b55; padding: 12px; margin: 16px 0;">
              <strong>Shop sẽ gọi điện xác nhận đơn, thanh toán khi nhận hàng.</strong>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f3f4f6; text-align: left;">
                  <th style="padding: 8px;">Sản phẩm</th>
                  <th style="padding: 8px; text-align: center;">SL</th>
                  <th style="padding: 8px; text-align: right;">Giá</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 8px; text-align: right;"><strong>Tạm tính:</strong></td>
                  <td style="padding: 8px; text-align: right;">${formatVnd(ord.subtotal)}</td>
                </tr>
                ${ord.discount > 0 ? `
                <tr>
                  <td colspan="2" style="padding: 8px; text-align: right; color: #0b6b55;"><strong>Giảm giá:</strong></td>
                  <td style="padding: 8px; text-align: right; color: #0b6b55;">-${formatVnd(ord.discount)}</td>
                </tr>` : ""}
                <tr>
                  <td colspan="2" style="padding: 8px; text-align: right; font-size: 16px;"><strong>Tổng cộng:</strong></td>
                  <td style="padding: 8px; text-align: right; font-size: 16px; font-weight: bold; color: #0b6b55;">${formatVnd(ord.total)}</td>
                </tr>
              </tfoot>
            </table>

            <p style="color: #6b7280; font-size: 14px;">
              Địa chỉ giao hàng: ${escapeHtml(data.addressDetail)}<br/>
              Số điện thoại người nhận: ${escapeHtml(data.phone)}
            </p>
          </div>
        `;

        await sendMail(data.email, `[Phố Đặc Sản] Xác nhận đơn hàng #${ord.code}`, customerEmailHtml).catch((e) =>
          console.error("Customer email error:", e)
        );
      }
    } catch (postErr) {
      console.error("Post-order error:", postErr);
    }
  }

  return { success: true, checkoutId };
}
