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

export function AccountNav({ counts }: { counts?: AccountNavCounts }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";

  const navItems = [
    {
      href: "/account",
      tab: "overview",
      label: "Tổng quan tài khoản",
      icon: LayoutDashboard,
      count: undefined,
    },
    {
      href: "/account?tab=orders",
      tab: "orders",
      label: "Đơn hàng của tôi",
      icon: Package,
      count: counts?.orders,
    },
    {
      href: "/account?tab=wishlist",
      tab: "wishlist",
      label: "Sản phẩm yêu thích",
      icon: Heart,
      count: counts?.wishlist,
    },
    {
      href: "/account?tab=following",
      tab: "following",
      label: "Gian hàng theo dõi",
      icon: Store,
      count: counts?.following,
    },
    {
      href: "/account?tab=addresses",
      tab: "addresses",
      label: "Sổ địa chỉ",
      icon: MapPin,
      count: counts?.addresses,
    },
    {
      href: "/notifications",
      tab: null,
      label: "Thông báo",
      icon: Bell,
      count: counts?.notifications,
    },
  ];

  return (
    <nav className="flex flex-row gap-1.5 overflow-x-auto pb-2 md:flex-col md:pb-0 scrollbar-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.tab !== null
            ? pathname === "/account" && currentTab === item.tab
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            scroll={false}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors",
              isActive
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{item.label}</span>
            {typeof item.count === "number" && (
              <span
                className={cn(
                  "ml-auto rounded-full px-2 py-0.5 text-xs font-mono font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : item.count > 0
                      ? "bg-muted-foreground/15 text-foreground"
                      : "text-muted-foreground/60"
                )}
              >
                {item.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
