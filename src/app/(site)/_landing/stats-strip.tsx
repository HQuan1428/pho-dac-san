import type { CSSProperties } from "react";
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
      ringClass: "ring-1.5 ring-lotus/50",
      dotClass: "bg-lotus",
    },
    {
      label: "Sản phẩm đặc sản",
      value: productCount.toLocaleString("vi-VN"),
      icon: Package,
      ringClass: "ring-1.5 ring-turmeric/50",
      dotClass: "bg-turmeric",
    },
    {
      label: "Tỉnh thành kết nối",
      value: (provinceCount > 0 ? provinceCount : 34).toString(),
      icon: MapPin,
      ringClass: "ring-1.5 ring-sky/50",
      dotClass: "bg-sky",
    },
    {
      label: "Bảo đảm nguồn gốc",
      value: "100%",
      icon: ShieldCheck,
      ringClass: "ring-1.5 ring-clay/50",
      dotClass: "bg-clay",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground py-6 md:py-8">
      {/* Decorative blurred accent blobs */}
      <div
        aria-hidden="true"
        data-parallax
        style={{ "--depth": "24px" } as CSSProperties}
        className="pointer-events-none absolute -top-16 -left-16 size-64 rounded-full bg-lotus/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        data-parallax
        style={{ "--depth": "-20px" } as CSSProperties}
        className="pointer-events-none absolute -bottom-16 -right-16 size-64 rounded-full bg-turmeric/20 blur-3xl"
      />

      <div className="container-page relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-primary-foreground/20">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="reveal flex items-center gap-4 px-2 lg:px-8 first:pl-0 last:pr-0"
              >
                <div
                  className={`relative flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 text-primary-foreground ${stat.ringClass}`}
                >
                  <Icon className="size-5" />
                  <span
                    className={`absolute -top-1 -right-1 size-2 rounded-full ring-2 ring-primary ${stat.dotClass}`}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-primary-foreground/75">
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

