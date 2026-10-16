"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, Search, ShoppingCart, User } from "lucide-react";
import { useCart, setCartSheetOpen } from "@/lib/cart";
import { setCommandSearchOpen } from "./command-search";

export function MobileTabBar() {
  const pathname = usePathname();
  const cartItems = useCart();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const isHomeActive = pathname === "/";
  const isMarketActive = pathname.startsWith("/market");
  const isSearchActive = pathname.startsWith("/search");
  const isAccountActive =
    pathname.startsWith("/account") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/seller");

  return (
    <nav
      aria-label="Điều hướng chính trên di động"
      className="fixed inset-x-0 bottom-0 z-30 md:hidden border-t border-white/40 bg-background/95 backdrop-blur-xl backdrop-saturate-150 shadow-[0_-1px_0_0_rgb(255_255_255/0.4)_inset,0_-4px_20px_-8px_rgb(0_0_0/0.1)] supports-[backdrop-filter]:bg-background/70 dark:border-white/10 dark:shadow-[0_-1px_0_0_rgb(255_255_255/0.1)_inset,0_-4px_20px_-8px_rgb(0_0_0/0.3)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid h-14 grid-cols-5 items-center">
        {/* 1. Trang chủ */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isHomeActive
              ? "text-primary font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home className="size-5" aria-hidden="true" />
          <span className="text-[10px] leading-none">Trang chủ</span>
        </Link>

        {/* 2. Chợ */}
        <Link
          href="/market"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isMarketActive
              ? "text-primary font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Store className="size-5" aria-hidden="true" />
          <span className="text-[10px] leading-none">Chợ</span>
        </Link>

        {/* 3. Tìm (Opens Command Search) */}
        <button
          type="button"
          onClick={() => setCommandSearchOpen(true)}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isSearchActive
              ? "text-primary font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label="Tìm kiếm đặc sản"
        >
          <Search className="size-5" aria-hidden="true" />
          <span className="text-[10px] leading-none">Tìm</span>
        </button>

        {/* 4. Giỏ (Opens Cart Sheet) */}
        <button
          type="button"
          onClick={() => setCartSheetOpen(true)}
          className="relative flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Giỏ hàng (${cartCount} sản phẩm)`}
        >
          <div className="relative">
            <ShoppingCart className="size-5" aria-hidden="true" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground leading-none">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-none">Giỏ</span>
        </button>

        {/* 5. Tài khoản */}
        <Link
          href="/account"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isAccountActive
              ? "text-primary font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="size-5" aria-hidden="true" />
          <span className="text-[10px] leading-none">Tài khoản</span>
        </Link>
      </div>
    </nav>
  );
}
