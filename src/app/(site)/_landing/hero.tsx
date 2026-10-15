import Link from "next/link";
import { ArrowRight, Store, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard, type ProductCardData } from "@/components/common/product-card";

const placeholderSvg = (hue: number, label: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="hsl(${hue} 8% 92%)"/><text x="200" y="208" font-family="sans-serif" font-size="20" text-anchor="middle" fill="hsl(${hue} 6% 55%)">${label}</text></svg>`,
  )}`;

const mockProducts: ProductCardData[] = [
  {
    href: "/cho",
    name: "Mắm tôm Sầm Sơn hũ thủy tinh 500g",
    price: 85000,
    originalPrice: 100000,
    province: "Thanh Hóa",
    shopName: "Nhà Mắm Sầm Sơn",
    rating: 4.9,
    reviewCount: 142,
    image: placeholderSvg(25, "Thanh Hóa"),
  },
  {
    href: "/cho",
    name: "Chè Tân Cương đặc biệt búp non 500g",
    price: 320000,
    originalPrice: 360000,
    province: "Thái Nguyên",
    shopName: "Trà Tân Cương Xanh",
    rating: 4.8,
    reviewCount: 96,
    image: placeholderSvg(120, "Thái Nguyên"),
  },
  {
    href: "/cho",
    name: "Mực khô Sầm Sơn loại 1 thượng hạng",
    price: 620000,
    province: "Thanh Hóa",
    shopName: "Nhà Mắm Sầm Sơn",
    rating: 5.0,
    reviewCount: 68,
    image: placeholderSvg(35, "Thanh Hóa"),
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              <span>Dành cho nhà sản xuất & chủ hộ kinh doanh đặc sản</span>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Mở gian hàng đặc sản trong 5 phút.
            </h1>

            <p className="max-w-xl text-lg text-muted-foreground">
              Đưa tinh hoa quê hương đến người tiêu dùng cả nước. Đăng sản phẩm có nhiều biến thể,
              nhận thông báo đơn tức thì và chủ động gọi điện chốt đơn với khách hàng.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button size="lg" render={<Link href="/kenh-ban/dang-ky" />}>
                <Store data-icon="inline-start" />
                Mở gian hàng miễn phí
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/cho" />}>
                Khám phá chợ
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              ✓ Không thu phí ban đầu · ✓ Miễn phí toàn bộ tính năng giai đoạn ra mắt · ✓ Không yêu cầu tích hợp cổng thanh toán phức tạp
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-xl border bg-card p-4 shadow-sm md:p-6">
              <div className="mb-4 flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Store className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Giao diện gian hàng mẫu</p>
                    <p className="text-[11px] text-muted-foreground">Hiển thị chuẩn hoá trên Phố Đặc Sản</p>
                  </div>
                </div>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Đang hoạt động
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {mockProducts.slice(0, 2).map((product) => (
                  <div key={product.name} className="pointer-events-none rounded-lg border bg-background p-2">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
