"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Bell,
  Heart,
  LayoutDashboard,
  MapPin,
  Package,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AccountNavCounts = {
  orders?: number;
  wishlist?: number;
  following?: number;
  addresses?: number;
  notifications?: number;
};

const NAV_ITEMS = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard, href: "/account" },
  { id: "orders", label: "Đơn hàng", icon: Package, href: "/account?tab=orders" },
  { id: "wishlist", label: "Yêu thích", icon: Heart, href: "/account?tab=wishlist" },
  { id: "addresses", label: "Sổ địa chỉ", icon: MapPin, href: "/account?tab=addresses" },
  { id: "following", label: "Gian hàng", icon: Store, href: "/account?tab=following" },
  { id: "notifications", label: "Thông báo", icon: Bell, href: "/notifications" },
];

export function AccountNav({ counts }: { counts?: AccountNavCounts }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";

  return (
    <nav
      aria-label="Account navigation"
      className="flex items-center gap-1.5 overflow-x-auto border-b pb-2.5 scrollbar-none w-full min-w-0"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.id === "notifications"
            ? pathname.startsWith("/notifications")
            : item.id === "orders"
              ? pathname.startsWith("/account/orders") || (pathname === "/account" && currentTab === "orders")
              : pathname === "/account" && currentTab === item.id;

        const count =
          item.id === "orders"
            ? counts?.orders
            : item.id === "wishlist"
              ? counts?.wishlist
              : item.id === "following"
                ? counts?.following
                : item.id === "addresses"
                  ? counts?.addresses
                  : item.id === "notifications"
                    ? counts?.notifications
                    : undefined;

        return (
          <Link
            key={item.id}
            href={item.href}
            scroll={false}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer shrink-0",
              isActive
                ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span>{item.label}</span>
            {typeof count === "number" && count > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[11px] font-mono font-medium transition-colors",
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
