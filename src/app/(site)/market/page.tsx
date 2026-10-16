import Link from "next/link";
import { Search, ArrowRight, Sparkles, Flame, MapPin, Store } from "lucide-react";
import { getMarketplaceHomeData } from "@/server/store/catalog";
import { ProductCard } from "@/components/store/product-card";
import { CategoryTile } from "@/components/store/category-tile";
import { ShopCard } from "@/components/common/shop-card";
import { RegionBrowser } from "@/components/store/region-browser";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Chợ Đặc Sản — Đặc sản chính gốc 3 miền Việt Nam",
  description: "Khám phá và đặt mua đặc sản vùng miền chính gốc Việt Nam từ các gian hàng uy tín.",
};

export default async function ChoPage() {
  const { categories, regions, newestProducts, bestSellingProducts, featuredShops } =
    await getMarketplaceHomeData();

  // Up to 10 products for 2 rows of 5 columns
  const bestSellers = bestSellingProducts.slice(0, 10);
  const newest = newestProducts.slice(0, 10);
  const shops = featuredShops.slice(0, 4);

  // Sample product images for promo banner
  const promoImages = bestSellingProducts
    .slice(0, 3)
    .map((p) => ({ image: p.image, name: p.name }));

  return (
    <div className="container-page py-6 md:py-8 space-y-10">
      {/* Compact Top: 2-column banner row */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px] gap-4 items-stretch">
        {/* Wide Promo Banner using product images */}
        <div className="relative rounded-xl border bg-gradient-to-br from-card via-muted/30 to-muted/60 p-5 md:p-6 flex flex-col justify-between overflow-hidden shadow-xs">
          <div className="relative z-10 space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-2.5 py-0.5 text-xs font-medium text-primary backdrop-blur shadow-xs">
              <Sparkles className="size-3.5" />
              <span>Tinh hoa ẩm thực ba miền</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Chợ Đặc Sản Việt Nam
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Thức quà quê chuẩn vị truyền thống từ những nhà sản xuất chân chính, giao tận tay bạn.
            </p>

            {/* Compact search in promo */}
            <form action="/search" className="relative mt-3 max-w-md flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="q"
                  type="search"
                  placeholder="Tìm kiếm mắm tôm, chè tân cương, kẹo dừa…"
                  className="h-10 w-full rounded-lg border bg-background pr-3 pl-9 text-xs shadow-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition"
                />
              </div>
              <Button type="submit" size="sm" className="h-10 px-4 text-xs shrink-0">
                Tìm kiếm
              </Button>
            </form>
          </div>

          {/* Product image showcases on desktop */}
          <div className="hidden sm:flex absolute right-4 bottom-4 items-center -space-x-3 pointer-events-none opacity-90 lg:opacity-100">
            {promoImages.map((item, idx) => (
              <div
                key={idx}
                className="size-16 sm:size-20 rounded-lg border-2 border-background bg-card shadow-md overflow-hidden transform transition duration-300 hover:scale-110 hover:z-20"
                style={{
                  transform: `rotate(${idx === 0 ? "-6deg" : idx === 1 ? "4deg" : "-2deg"}) translateY(${idx === 1 ? "-6px" : "0px"})`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="size-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 2 Stacked Small Banners for Regions */}
        <div className="flex flex-col gap-3 justify-between">
          <Link
            href="/search?vung=mien-bac"
            className="group flex-1 flex items-center justify-between rounded-xl border bg-card p-4 shadow-xs transition hover:border-primary/60 hover:bg-muted/30"
          >
            <div className="space-y-1">
              <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Đặc sản Miền Bắc
              </span>
              <h2 className="text-sm font-semibold text-foreground group-hover:text-primary transition">
                Hương vị đất kinh kỳ & rẻo cao
              </h2>
              <p className="text-xs text-muted-foreground line-clamp-1">
                Chè Thái Nguyên, mắm tôm, nem chua...
              </p>
            </div>
            <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition shrink-0 ml-3">
              <ArrowRight className="size-4" />
            </div>
          </Link>

          <Link
            href="/search?vung=mien-trung"
            className="group flex-1 flex items-center justify-between rounded-xl border bg-card p-4 shadow-xs transition hover:border-primary/60 hover:bg-muted/30"
          >
            <div className="space-y-1">
              <span className="inline-block rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                Miền Trung & Miền Nam
              </span>
              <h2 className="text-sm font-semibold text-foreground group-hover:text-primary transition">
                Đậm đà nắng gió & miệt vườn
              </h2>
              <p className="text-xs text-muted-foreground line-clamp-1">
                Mực khô Sầm Sơn, cà phê Đắk Lắk, kẹo dừa...
              </p>
            </div>
            <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition shrink-0 ml-3">
              <ArrowRight className="size-4" />
            </div>
          </Link>
        </div>
      </section>

      {/* Horizontal Category Rail (8 in one row at xl, scrollable on mobile) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Danh mục đặc sản</h2>
          <Link
            href="/search"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <span>Tất cả danh mục</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Scrollable on mobile, 8 per row at xl */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none xl:grid xl:grid-cols-8 xl:gap-3 xl:overflow-visible xl:pb-0">
          {categories.map((c) => (
            <CategoryTile key={c.id} category={c} />
          ))}
        </div>
      </section>

      {/* Region Browser: 3 compact columns with province chips */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Đặc sản theo vùng miền</h2>
          </div>
          <Link
            href="/search"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <span>Khám phá 63 tỉnh thành</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <RegionBrowser regions={regions} />
      </section>

      {/* Best-selling Products: 5-col xl grid, 2 rows max */}
      {bestSellers.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-warning" />
              <h2 className="text-lg font-bold text-foreground">Đặc sản bán chạy</h2>
            </div>
            <Link
              href="/search?sap-xep=ban-chay"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.href} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Newest Products: 5-col xl grid, 2 rows max */}
      {newest.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Mới lên kệ</h2>
            </div>
            <Link
              href="/search?sap-xep=moi-nhat"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {newest.map((p) => (
              <ProductCard key={p.href} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Shops: 4 per row */}
      {shops.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="size-4 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Gian hàng tiêu biểu</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {shops.map((shop) => (
              <ShopCard key={shop.href} shop={shop} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
