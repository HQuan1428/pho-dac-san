"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Heart, MapPin, ShoppingBag, Store, User } from "lucide-react";
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

  const navItems = [
    {
      href: "/tai-khoan",
      label: "Tổng quan tài khoản",
      icon: User,
      exact: true,
      count: undefined,
    },
    {
      href: "/tai-khoan/don-hang",
      label: "Đơn hàng của tôi",
      icon: ShoppingBag,
      exact: false,
      count: counts?.orders,
    },
    {
      href: "/tai-khoan/yeu-thich",
      label: "Sản phẩm yêu thích",
      icon: Heart,
      exact: false,
      count: counts?.wishlist,
    },
    {
      href: "/tai-khoan/theo-doi",
      label: "Gian hàng theo dõi",
      icon: Store,
      exact: false,
      count: counts?.following,
    },
    {
      href: "/tai-khoan/dia-chi",
      label: "Sổ địa chỉ",
      icon: MapPin,
      exact: false,
      count: counts?.addresses,
    },
    {
      href: "/thong-bao",
      label: "Thông báo",
      icon: Bell,
      exact: false,
      count: counts?.notifications,
    },
  ];

  return (
    <nav className="flex flex-row gap-1.5 overflow-x-auto pb-2 md:flex-col md:pb-0">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors",
              isActive
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
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
