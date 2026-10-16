import Link from "next/link";
import { Search, ArrowRight, Sparkles, Flame, MapPin, Store } from "lucide-react";
import { getMarketplaceHomeData } from "@/server/store/catalog";
import { ProductCard } from "@/components/common/product-card";
import { ShopCard } from "@/components/common/shop-card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Chợ Đặc Sản — Đặc sản chính gốc 3 miền Việt Nam",
  description: "Khám phá và đặt mua đặc sản vùng miền chính gốc Việt Nam từ các gian hàng uy tín.",
};

export default async function ChoPage() {
  const { categories, regions, newestProducts, bestSellingProducts, featuredShops } =
    await getMarketplaceHomeData();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 space-y-12">
      {/* Hero Section & Search Box */}
      <section className="relative overflow-hidden rounded-2xl border bg-muted/40 p-6 md:p-10 text-center">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-primary shadow-xs">
            <Sparkles className="size-3.5" />
            <span>Tinh hoa ẩm thực ba miền</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Chợ Đặc Sản Việt Nam
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Giao tận tay bạn những thức quà quê chuẩn vị, đậm đà bản sắc vùng miền từ những nhà sản xuất chân chính.
          </p>

          {/* Search Box */}
          <form action="/tim-kiem" className="relative mx-auto mt-6 max-w-lg">
            <Search className="absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              type="search"
              placeholder="Tìm kiếm mắm tôm, chè tân cương, kẹo dừa…"
              className="h-12 w-full rounded-full border bg-background pr-28 pl-11 text-sm shadow-xs outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute top-1.5 right-1.5 h-9 rounded-full px-4"
            >
              Tìm kiếm
            </Button>
          </form>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">Danh mục đặc sản</h2>
          <Link
            href="/tim-kiem"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <span>Tất cả</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/tim-kiem?danh-muc=${c.slug}`}
              className="group flex flex-col items-center justify-center rounded-lg border bg-card p-3 text-center transition hover:border-primary hover:bg-primary/5 hover:shadow-xs"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-muted font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition text-xs">
                {c.name.slice(0, 1)}
              </div>
              <span className="mt-2 text-xs font-medium text-foreground line-clamp-2">
                {c.name}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {c._count.products} món
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Browse by Region (Miền Bắc, Miền Trung, Miền Nam) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="size-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground md:text-2xl">Đặc sản theo vùng miền</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {regions.map((region) => (
            <div key={region.id} className="rounded-lg border bg-card p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b pb-2">
                <Link
                  href={`/tim-kiem?vung=${region.slug}`}
                  className="font-bold text-base text-foreground hover:text-primary transition"
                >
                  {region.name}
                </Link>
                <Link
                  href={`/tim-kiem?vung=${region.slug}`}
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  Xem vùng
                </Link>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {region.provinces.map((prov) => (
                  <Link
                    key={prov.id}
                    href={`/tim-kiem?tinh=${prov.slug}`}
                    className="rounded-md border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground transition hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    {prov.name}
                    {prov._count.products > 0 && (
                      <span className="ml-1 text-[10px] text-primary font-medium">
                        ({prov._count.products})
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Best-selling Products */}
      {bestSellingProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="size-5 text-warning" />
              <h2 className="text-xl font-bold text-foreground md:text-2xl">Đặc sản bán chạy</h2>
            </div>
            <Link
              href="/tim-kiem?sap-xep=ban-chay"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <span>Xem thêm</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {bestSellingProducts.map((p) => (
              <ProductCard key={p.href} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Newest Products */}
      {newestProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground md:text-2xl">Mới lên kệ</h2>
            </div>
            <Link
              href="/tim-kiem?sap-xep=moi-nhat"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <span>Xem thêm</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {newestProducts.map((p) => (
              <ProductCard key={p.href} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Shops */}
      {featuredShops.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="size-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground md:text-2xl">Gian hàng tiêu biểu</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredShops.map((shop) => (
              <ShopCard key={shop.href} shop={shop} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
