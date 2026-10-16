import { db } from "@/lib/db";
import { Store, Package, MapPin, ShieldCheck } from "lucide-react";

export async function StatsStrip() {
  const [shopCount, productCount, provinceCount] = await Promise.all([
    db.shop.count({ where: { status: "ACTIVE" } }),
    db.product.count({ where: { status: "ACTIVE" } }),
    db.province.count(),
  ]);

  const stats = [
    {
      label: "Gian hàng hoạt động",
      value: shopCount.toLocaleString("vi-VN"),
      icon: Store,
    },
    {
      label: "Sản phẩm đặc sản",
      value: productCount.toLocaleString("vi-VN"),
      icon: Package,
    },
    {
      label: "Tỉnh thành kết nối",
      value: (provinceCount > 0 ? provinceCount : 34).toString(),
      icon: MapPin,
    },
    {
      label: "Bảo đảm nguồn gốc",
      value: "100%",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="border-b bg-muted/30 py-6 md:py-8">
      <div className="container-page">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-border">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="reveal flex items-center gap-4 px-2 lg:px-8 first:pl-0 last:pr-0"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
