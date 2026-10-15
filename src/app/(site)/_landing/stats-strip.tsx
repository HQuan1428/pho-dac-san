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
      desc: "Đã qua kiểm duyệt nguồn gốc",
    },
    {
      label: "Sản phẩm đặc sản",
      value: productCount.toLocaleString("vi-VN"),
      icon: Package,
      desc: "Đặc sản chuẩn vị vùng miền",
    },
    {
      label: "Tỉnh thành kết nối",
      value: (provinceCount > 0 ? provinceCount : 34).toString(),
      icon: MapPin,
      desc: "Trải dài từ Bắc chí Nam",
    },
    {
      label: "Bảo đảm uy tín",
      value: "100%",
      icon: ShieldCheck,
      desc: "Xác thực danh tính chủ shop",
    },
  ];

  return (
    <section className="border-b bg-muted/30 py-10">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex flex-col items-start rounded-lg border bg-card p-4 transition-colors hover:border-foreground/20 sm:p-5"
              >
                <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
                <div className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-foreground">{stat.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{stat.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
