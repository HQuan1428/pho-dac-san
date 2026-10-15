"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PackageOpen,
  ShoppingBag,
  Ticket,
  Users,
  Settings,
  Store,
  ExternalLink,
} from "lucide-react";
import type { ShopRole } from "@/server/access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SellerNavProps {
  shop: {
    id: string;
    name: string;
    slug: string;
    status: "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";
    plan: "FREE" | "PRO" | "BUSINESS";
  };
  role: ShopRole;
  user: {
    name?: string | null;
    email?: string | null;
  };
  onNavigate?: () => void;
}

const statusBadgeConfig = {
  PENDING: { label: "Chờ duyệt", variant: "secondary" as const, className: "bg-warning/20 text-warning-foreground dark:text-warning" },
  ACTIVE: { label: "Hoạt động", variant: "default" as const, className: "bg-primary/10 text-primary" },
  REJECTED: { label: "Từ chối", variant: "destructive" as const, className: "bg-destructive/10 text-destructive" },
  SUSPENDED: { label: "Tạm dừng", variant: "destructive" as const, className: "bg-destructive/10 text-destructive" },
};

export function SellerNavContent({ shop, role, user, onNavigate }: SellerNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Tổng quan",
      href: "/kenh-ban",
      icon: LayoutDashboard,
      ownerOnly: false,
      exact: true,
    },
    {
      title: "Sản phẩm",
      href: "/kenh-ban/san-pham",
      icon: PackageOpen,
      ownerOnly: false,
      exact: false,
    },
    {
      title: "Đơn hàng",
      href: "/kenh-ban/don-hang",
      icon: ShoppingBag,
      ownerOnly: false,
      exact: false,
    },
    {
      title: "Khuyến mãi",
      href: "/kenh-ban/khuyen-mai",
      icon: Ticket,
      ownerOnly: true,
      exact: false,
    },
    {
      title: "Nhân viên",
      href: "/kenh-ban/nhan-vien",
      icon: Users,
      ownerOnly: true,
      exact: false,
    },
    {
      title: "Cài đặt",
      href: "/kenh-ban/cai-dat",
      icon: Settings,
      ownerOnly: true,
      exact: false,
    },
  ];

  const visibleItems = navItems.filter((item) => !item.ownerOnly || role === "OWNER");
  const statusInfo = statusBadgeConfig[shop.status];

  return (
    <div className="flex h-full flex-col justify-between py-4">
      <div className="space-y-6">
        {/* Shop identity */}
        <div className="px-4">
          <Link
            href="/kenh-ban"
            onClick={onNavigate}
            className="flex items-center gap-2 font-semibold tracking-tight text-foreground hover:opacity-90"
          >
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Store className="size-4" />
            </span>
            <span className="text-base font-bold">Kênh Người Bán</span>
          </Link>

          <div className="mt-3 rounded-lg border bg-muted/40 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{shop.name}</p>
                <p className="font-mono text-xs text-muted-foreground truncate">@{shop.slug}</p>
              </div>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                  statusInfo.className
                )}
              >
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1 px-3">
          {visibleItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User footer & link back */}
      <div className="space-y-3 px-3">
        <div className="rounded-lg border bg-card p-3 text-xs text-muted-foreground">
          <p className="truncate font-medium text-foreground">{user.name || user.email}</p>
          <div className="mt-1 flex items-center justify-between">
            <span>{role === "OWNER" ? "Chủ gian hàng" : "Nhân viên"}</span>
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              Gói {shop.plan}
            </Badge>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs"
          render={<Link href="/" target="_blank" />}
        >
          <ExternalLink className="size-3.5 mr-2" />
          Xem trang sàn chính
        </Button>
      </div>
    </div>
  );
}
