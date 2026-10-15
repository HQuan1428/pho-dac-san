"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MapPin, ShoppingBag, Store, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/tai-khoan",
    label: "Thông tin tài khoản",
    icon: User,
    exact: true,
  },
  {
    href: "/tai-khoan/don-hang",
    label: "Đơn hàng của tôi",
    icon: ShoppingBag,
    exact: false,
  },
  {
    href: "/tai-khoan/dia-chi",
    label: "Sổ địa chỉ",
    icon: MapPin,
    exact: false,
  },
  {
    href: "/tai-khoan/yeu-thich",
    label: "Sản phẩm yêu thích",
    icon: Heart,
    exact: false,
  },
  {
    href: "/tai-khoan/theo-doi",
    label: "Gian hàng theo dõi",
    icon: Store,
    exact: false,
  },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto pb-2 md:flex-col md:pb-0">
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
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
