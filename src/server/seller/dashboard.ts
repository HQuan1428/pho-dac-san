"use server";

import "server-only";
import { db } from "@/lib/db";
import { requireShop } from "@/server/access";

export async function getSellerDashboardData() {
  const { shop } = await requireShop();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [
    newOrdersCount,
    ordersThisMonthCount,
    ordersLastMonthCount,
    revenueThisMonthAggregate,
    revenueLastMonthAggregate,
    productsCount,
    followersCount,
    recentThirtyDaysOrders,
    topProducts,
    latestNewOrders,
  ] = await Promise.all([
    // 1. New orders
    db.order.count({
      where: { shopId: shop.id, status: "NEW" },
    }),
    // 2. Orders this month
    db.order.count({
      where: { shopId: shop.id, createdAt: { gte: startOfMonth } },
    }),
    // 3. Orders last month
    db.order.count({
      where: {
        shopId: shop.id,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    // 4. Revenue this month (COMPLETED orders)
    db.order.aggregate({
      where: {
        shopId: shop.id,
        status: "COMPLETED",
        createdAt: { gte: startOfMonth },
      },
      _sum: { total: true },
    }),
    // 5. Revenue last month (COMPLETED orders)
    db.order.aggregate({
      where: {
        shopId: shop.id,
        status: "COMPLETED",
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { total: true },
    }),
    // 6. Products count
    db.product.count({
      where: { shopId: shop.id },
    }),
    // 7. Followers count
    db.shopFollow.count({
      where: { shopId: shop.id },
    }),
    // 8. Orders in the last 30 days for chart
    db.order.findMany({
      where: {
        shopId: shop.id,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
        total: true,
        status: true,
      },
    }),
    // 9. Top 5 products by soldCount
    db.product.findMany({
      where: { shopId: shop.id },
      orderBy: { soldCount: "desc" },
      take: 5,
      include: {
        category: { select: { name: true } },
        variants: {
          orderBy: { sortOrder: "asc" },
          select: { price: true },
        },
      },
    }),
    // 10. Latest 5 NEW orders
    db.order.findMany({
      where: { shopId: shop.id, status: "NEW" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        _count: { select: { items: true } },
      },
    }),
  ]);

  // Calculate deltas
  const ordersDelta =
    ordersLastMonthCount > 0
      ? Math.round(((ordersThisMonthCount - ordersLastMonthCount) / ordersLastMonthCount) * 100)
      : undefined;

  const currentRevenue = revenueThisMonthAggregate._sum.total || 0;
  const lastRevenue = revenueLastMonthAggregate._sum.total || 0;
  const revenueDelta =
    lastRevenue > 0
      ? Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100)
      : undefined;

  // Build 30 days bar chart data
  const chartDays: { dateKey: string; label: string; count: number; revenue: number }[] = [];
  const dayMap = new Map<string, { count: number; revenue: number }>();

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().slice(0, 10); // YYYY-MM-DD
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const label = `${day}/${month}`;
    chartDays.push({ dateKey, label, count: 0, revenue: 0 });
    dayMap.set(dateKey, { count: 0, revenue: 0 });
  }

  for (const o of recentThirtyDaysOrders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    const entry = dayMap.get(key);
    if (entry) {
      entry.count += 1;
      if (o.status === "COMPLETED") {
        entry.revenue += o.total;
      }
    }
  }

  const chartData = chartDays.map((d) => {
    const entry = dayMap.get(d.dateKey);
    return {
      dateKey: d.dateKey,
      label: d.label,
      count: entry ? entry.count : 0,
      revenue: entry ? entry.revenue : 0,
    };
  });

  return {
    shop,
    stats: {
      newOrders: newOrdersCount,
      ordersThisMonth: ordersThisMonthCount,
      ordersDelta,
      estimatedRevenue: currentRevenue,
      revenueDelta,
      productsCount,
      followersCount,
    },
    chartData,
    topProducts: topProducts.map((p) => {
      const minPrice = p.variants.reduce((min, v) => (v.price < min ? v.price : min), Infinity);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: p.images[0] || null,
        categoryName: p.category.name,
        soldCount: p.soldCount,
        ratingAvg: p.ratingAvg,
        minPrice: minPrice === Infinity ? 0 : minPrice,
      };
    }),
    latestNewOrders: latestNewOrders.map((o) => ({
      id: o.id,
      code: o.code,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      total: o.total,
      itemCount: o._count.items,
      createdAt: o.createdAt,
    })),
  };
}
