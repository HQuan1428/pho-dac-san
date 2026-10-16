import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Store, Sparkles, ShoppingBag, TrendingUp, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { OrderStatusBadge } from "@/components/common/order-status-badge";
import { Price } from "@/components/common/price";
import { RatingStars } from "@/components/common/rating-stars";
import { cn } from "@/lib/utils";

const mockMiniProducts = [
  {
    name: "Chè Tân Cương đặc biệt",
    price: 320000,
    province: "Thái Nguyên",
    rating: 4.8,
    image: "/images/products/che-tan-cuong-1.webp",
    spot: "var(--primary)",
  },
  {
    name: "Mắm tôm Sầm Sơn hũ 500g",
    price: 85000,
    province: "Thanh Hóa",
    rating: 4.9,
    image: "/images/products/mam-tom-sam-son-2.webp",
    spot: "var(--turmeric)",
  },
  {
    name: "Nem chua Thanh Hóa",
    price: 50000,
    province: "Thanh Hóa",
    rating: 4.9,
    image: "/images/products/nem-chua-thanh-hoa-1.webp",
    spot: "var(--lotus)",
  },
  {
    name: "Mực khô Sầm Sơn loại 1",
    price: 620000,
    province: "Thanh Hóa",
    rating: 4.7,
    image: "/images/products/muc-kho-sam-son-1.webp",
    spot: "var(--sky)",
  },
];

const mockOrders = [
  {
    code: "ORD-0842",
    item: "Chè Tân Cương 500g",
    customer: "Hoàng Anh (Hà Nội)",
    amount: 320000,
    status: "NEW" as const,
  },
  {
    code: "ORD-0841",
    item: "Mắm tôm Sầm Sơn hũ 500g",
    customer: "Thu Trang (Đà Nẵng)",
    amount: 85000,
    status: "CONFIRMED" as const,
  },
  {
    code: "ORD-0840",
    item: "Nem chua Thanh Hóa",
    customer: "Nam Hải (TP.HCM)",
    amount: 50000,
    status: "SHIPPING" as const,
  },
];

const mockStats = [
  {
    label: "Đơn mới",
    value: "18",
    delta: "+12%",
    icon: ShoppingBag,
    iconBg: "bg-lotus/10",
    iconColor: "text-lotus",
    trendColor: "text-lotus",
  },
  {
    label: "Doanh thu",
    value: "12,4 tr",
    delta: "+15%",
    icon: TrendingUp,
    iconBg: "bg-turmeric/10",
    iconColor: "text-turmeric",
    trendColor: "text-turmeric",
  },
  {
    label: "Sản phẩm",
    value: "24",
    delta: "+4%",
    icon: PackageOpen,
    iconBg: "bg-sky/10",
    iconColor: "text-sky",
    trendColor: "text-sky",
  },
];

const regionAvatars = [
  { initials: "LH", bg: "bg-lotus/15 text-lotus" },
  { initials: "TT", bg: "bg-turmeric/20 text-turmeric" },
  { initials: "HN", bg: "bg-sky/15 text-sky" },
  { initials: "MĐ", bg: "bg-clay/15 text-clay" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24">
      {/* Decorative blurred color blobs with cursor parallax */}
      <div
        aria-hidden="true"
        data-parallax
        style={{ "--depth": "30px" } as React.CSSProperties}
        className="pointer-events-none absolute -top-24 left-1/4 -z-10 h-80 w-80 sm:h-96 sm:w-96 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        data-parallax
        style={{ "--depth": "-20px" } as React.CSSProperties}
        className="pointer-events-none absolute top-1/3 -left-12 -z-10 h-72 w-72 sm:h-80 sm:w-80 rounded-full bg-lotus/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        data-parallax
        style={{ "--depth": "16px" } as React.CSSProperties}
        className="pointer-events-none absolute -bottom-10 left-1/3 -z-10 h-72 w-72 sm:h-80 sm:w-80 rounded-full bg-turmeric/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        data-parallax
        style={{ "--depth": "-36px" } as React.CSSProperties}
        className="pointer-events-none absolute -top-12 -right-12 -z-10 h-80 w-80 sm:h-96 sm:w-96 rounded-full bg-sky/20 blur-3xl"
      />

      <div className="container-page">
        <div className="grid items-center gap-8 lg:gap-12 lg:grid-cols-[1.1fr_1fr]">
          {/* Left Column: Headline, CTAs, Social Proof */}
          <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500">
            <div className="inline-flex items-center gap-2 rounded-full border border-lotus/30 bg-lotus/10 px-3 py-1 text-xs font-medium text-foreground">
              <Sparkles className="size-3.5 text-lotus" />
              <span>Dành cho nhà sản xuất &amp; chủ hộ kinh doanh đặc sản</span>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl text-balance">
              Mở gian hàng đặc sản trong 5 phút.
            </h1>

            <p className="max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Đưa tinh hoa quê hương đến người tiêu dùng cả nước. Đăng sản phẩm có nhiều biến thể,
              nhận thông báo đơn tức thì và chủ động gọi điện chốt đơn với khách hàng.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button size="lg" render={<Link href="/seller/register" />}>
                <Store data-icon="inline-start" />
                Mở gian hàng miễn phí
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/market" />}>
                Khám phá chợ
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>

            {/* Social proof under CTAs */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {regionAvatars.map((avatar, idx) => (
                  <Avatar key={idx} className="size-8 border-2 border-background ring-1 ring-border">
                    <AvatarFallback className={cn("text-[11px] font-semibold", avatar.bg)}>
                      {avatar.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div className="text-xs text-muted-foreground leading-tight">
                <span className="font-semibold text-foreground">200+ gian hàng</span> đặc sản từ 34 tỉnh thành
                <br />
                <span>đã xác thực và mở bán thành công</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              ✓ Không thu phí ban đầu · ✓ Miễn phí toàn bộ tính năng giai đoạn ra mắt · ✓ Nhận đơn &amp; gọi chốt trực tiếp
            </p>
          </div>

          {/* Right Column: Dense UI Mock of Seller Center */}
          <div className="relative motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 motion-safe:delay-150">
            <div data-tilt className="rounded-xl border bg-card p-4 shadow-sm md:p-5">
              {/* Mock Header Bar */}
              <div className="mb-4 flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Store className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Kênh Người Bán — Nhà Mắm Sầm Sơn</p>
                    <p className="text-[11px] text-muted-foreground">Thanh Hóa · Gian hàng đã xác thực</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                  <span className="size-1.5 rounded-full bg-success" />
                  Đang hoạt động
                </span>
              </div>

              {/* Stat row (3 StatCards with accents) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {mockStats.map((stat) => (
                  <div key={stat.label} className="rounded-lg border bg-card p-2.5 sm:p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="truncate">{stat.label}</span>
                      <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-md", stat.iconBg, stat.iconColor)}>
                        <stat.icon className="size-3.5" />
                      </span>
                    </div>
                    <p className="mt-1.5 text-base sm:text-lg font-semibold tabular-nums text-foreground">{stat.value}</p>
                    <p className={cn("mt-0.5 text-[10px] sm:text-[11px] font-medium truncate", stat.trendColor)}>
                      {stat.delta} so với tháng trước
                    </p>
                  </div>
                ))}
              </div>

              {/* Layered / offset section: Orders + 2x2 Mini Product Grid */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {/* Orders Card */}
                <div className="rounded-lg border bg-background/80 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold">Đơn hàng mới nhất</p>
                    <span className="text-[10px] font-medium text-primary">3 đơn cần gọi</span>
                  </div>
                  <div className="divide-y divide-border/60">
                    {mockOrders.map((order) => (
                      <div key={order.code} className="py-2 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-medium text-[11px]">{order.code}</span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="truncate text-xs font-medium text-foreground mt-0.5">
                          {order.item}
                        </p>
                        <div className="mt-0.5 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="truncate">{order.customer}</span>
                          <Price amount={order.amount} className="font-semibold text-foreground shrink-0 ml-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2x2 Mini Product Grid */}
                <div className="rounded-lg border bg-background/80 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold">Sản phẩm nổi bật</p>
                    <span className="text-[10px] text-muted-foreground">4 sản phẩm</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {mockMiniProducts.map((p) => (
                      <div
                        key={p.name}
                        data-spotlight
                        style={{ "--spot": p.spot } as React.CSSProperties}
                        className="flex flex-col overflow-hidden rounded-md border bg-card p-1.5 transition-colors motion-safe:transition-transform motion-safe:hover:-translate-y-0.5"
                      >
                        <div className="relative aspect-square w-full overflow-hidden rounded">
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            sizes="120px"
                            className="object-cover"
                          />
                        </div>
                        <p className="mt-1 line-clamp-1 text-[11px] font-medium text-foreground">
                          {p.name}
                        </p>
                        <div className="mt-0.5 flex items-center justify-between gap-1">
                          <Price amount={p.price} className="text-[11px] font-semibold text-foreground" />
                          <RatingStars value={p.rating} compact className="hidden xl:inline-flex scale-75 origin-right shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
