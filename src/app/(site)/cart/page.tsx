import Link from "next/link";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { CartView } from "@/components/store/cart-view";

export const metadata = {
  title: "Giỏ hàng — Phố Đặc Sản",
  description: "Xem và quản lý các sản phẩm đặc sản đã thêm vào giỏ hàng.",
};

export default function CartPage() {
  return (
    <div className="container-page py-6 md:py-8 space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Đường dẫn" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/market" className="hover:text-foreground transition">Chợ</Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground font-medium">Giỏ hàng</span>
      </nav>

      <div className="flex items-center gap-3 border-b pb-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ShoppingCart className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Giỏ hàng của bạn
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kiểm tra danh sách đặc sản và áp dụng mã giảm giá của từng gian hàng
          </p>
        </div>
      </div>

      <CartView />
    </div>
  );
}
