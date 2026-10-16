"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PackageOpen,
  ShoppingBag,
  Ticket,
  Users,
  Settings,
  ExternalLink,
  PanelLeft,
  Menu,
  Search,
  LogOut,
} from "lucide-react";
import { BrandMark } from "@/components/layout/logo";
import type { ShopRole } from "@/server/access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ShopStatusAlert } from "./shop-status-alert";
import { cn } from "@/lib/utils";

interface SellerAppShellProps {
  shop: {
    id: string;
    name: string;
    slug: string;
    status: "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";
    statusReason?: string | null;
    plan: "FREE" | "PRO" | "BUSINESS";
  };
  role: ShopRole;
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  };
  children: React.ReactNode;
}

const statusBadgeConfig = {
  PENDING: { label: "Chờ duyệt", className: "bg-warning/20 text-warning-foreground dark:text-warning" },
  ACTIVE: { label: "Hoạt động", className: "bg-primary/10 text-primary" },
  REJECTED: { label: "Từ chối", className: "bg-destructive/10 text-destructive" },
  SUSPENDED: { label: "Tạm dừng", className: "bg-destructive/10 text-destructive" },
};

const navItems = [
  { title: "Tổng quan", href: "/seller", icon: LayoutDashboard, exact: true, ownerOnly: false },
  { title: "Sản phẩm", href: "/seller/products", icon: PackageOpen, exact: false, ownerOnly: false },
  { title: "Đơn hàng", href: "/seller/orders", icon: ShoppingBag, exact: false, ownerOnly: false },
  { title: "Khuyến mãi", href: "/seller/vouchers", icon: Ticket, exact: false, ownerOnly: true },
  { title: "Nhân viên", href: "/seller/staff", icon: Users, exact: false, ownerOnly: true },
  { title: "Cài đặt", href: "/seller/settings", icon: Settings, exact: false, ownerOnly: true },
];

function getBreadcrumbs(pathname: string) {
  const crumbs: { label: string; href?: string }[] = [{ label: "Kênh Người Bán", href: "/seller" }];

  if (pathname === "/seller") {
    crumbs.push({ label: "Tổng quan" });
  } else if (pathname.startsWith("/seller/products")) {
    if (pathname === "/seller/products/new") {
      crumbs.push({ label: "Sản phẩm", href: "/seller/products" });
      crumbs.push({ label: "Thêm sản phẩm" });
    } else if (pathname === "/seller/products") {
      crumbs.push({ label: "Sản phẩm" });
    } else {
      crumbs.push({ label: "Sản phẩm", href: "/seller/products" });
      crumbs.push({ label: "Chỉnh sửa" });
    }
  } else if (pathname.startsWith("/seller/orders")) {
    if (pathname === "/seller/orders") {
      crumbs.push({ label: "Đơn hàng" });
    } else {
      crumbs.push({ label: "Đơn hàng", href: "/seller/orders" });
      const code = pathname.split("/").pop();
      crumbs.push({ label: code ? `#${code}` : "Chi tiết" });
    }
  } else if (pathname.startsWith("/seller/vouchers")) {
    crumbs.push({ label: "Khuyến mãi & Mã giảm giá" });
  } else if (pathname.startsWith("/seller/staff")) {
    crumbs.push({ label: "Nhân viên" });
  } else if (pathname.startsWith("/seller/settings")) {
    crumbs.push({ label: "Cài đặt gian hàng" });
  }

  return crumbs;
}

export function SellerAppShell({ shop, role, user, children }: SellerAppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = navItems.filter((item) => !item.ownerOnly || role === "OWNER");
  const statusInfo = statusBadgeConfig[shop.status];
  const crumbs = getBreadcrumbs(pathname);
  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : "S";

  return (
    <TooltipProvider>
      <div className="flex min-h-dvh bg-muted/20">
        {/* Mobile drawer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu quản lý gian hàng</SheetTitle>
            </SheetHeader>
            <div className="flex h-full flex-col justify-between py-4">
              <div className="space-y-6">
                <div className="px-4">
                  <Link
                    href="/seller"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
                  >
                    <BrandMark className="size-7" />
                    <span className="text-base font-bold">Kênh Người Bán</span>
                  </Link>

                  <div className="mt-3 rounded-lg border bg-muted/40 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{shop.name}</p>
                        <p className="font-mono text-xs text-muted-foreground truncate">@{shop.slug}</p>
                      </div>
                      <span className={cn("inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium", statusInfo.className)}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </div>

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
                        onClick={() => setMobileOpen(false)}
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
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar: 240px (w-60), collapsible to icons (w-16) */}
        <aside
          className={cn(
            "sticky top-0 hidden h-dvh shrink-0 flex-col border-r bg-card transition-[width] duration-200 md:flex z-30",
            collapsed ? "w-16" : "w-60"
          )}
        >
          {/* Header */}
          <div className={cn("flex h-14 items-center border-b px-4", collapsed ? "justify-center px-2" : "justify-between")}>
            <Link href="/seller" className="flex items-center gap-2 overflow-hidden font-semibold tracking-tight text-foreground">
              <BrandMark className="size-7 shrink-0" />
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold leading-tight">Kênh Người Bán</p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground leading-none">Phố Đặc Sản</p>
                </div>
              )}
            </Link>
          </div>

          {/* Shop identity badge when expanded */}
          {!collapsed && (
            <div className="border-b p-3">
              <div className="rounded-md border bg-muted/30 p-2.5">
                <div className="flex items-start justify-between gap-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">{shop.name}</p>
                    <p className="font-mono text-[11px] text-muted-foreground truncate">@{shop.slug}</p>
                  </div>
                  <span className={cn("inline-flex shrink-0 items-center rounded px-1.5 py-0.2 text-[10px] font-medium", statusInfo.className)}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-3">
            <nav className={cn("space-y-1", collapsed ? "px-2" : "px-3")}>
              {visibleItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                if (collapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger
                        render={
                          <Link
                            href={item.href}
                            className={cn(
                              "flex size-10 items-center justify-center rounded-md transition-colors mx-auto",
                              isActive
                                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                            aria-label={item.title}
                          >
                            <Icon className="size-4.5" />
                          </Link>
                        }
                      />
                      <TooltipContent side="right">{item.title}</TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom footer */}
          <div className={cn("border-t p-3 space-y-2", collapsed && "p-2 text-center")}>
            {!collapsed ? (
              <>
                <div className="rounded-md border bg-card p-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="truncate font-medium text-foreground">{user.name || user.email}</p>
                    <Badge variant="outline" className="text-[10px] px-1 py-0 font-mono">
                      {shop.plan}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {role === "OWNER" ? "Chủ gian hàng" : "Nhân viên"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  className="w-full justify-start text-[11px]"
                  render={<Link href="/" target="_blank" />}
                >
                  <ExternalLink className="size-3 mr-1.5" />
                  Xem website chợ
                </Button>
              </>
            ) : (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Avatar className="size-9 border mx-auto">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                  }
                />
                <TooltipContent side="right">
                  <p className="font-medium">{user.name || user.email}</p>
                  <p className="text-[11px] text-muted-foreground">{shop.name} ({shop.plan})</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </aside>

        {/* Content area: full available width, no centered narrow column */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Top Bar with breadcrumbs, search, and user menu */}
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-6">
            {/* Left side: Hamburger for mobile, collapse toggle + breadcrumbs for desktop */}
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Mở menu điều hướng"
              >
                <Menu className="size-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon-sm"
                className="hidden md:flex text-muted-foreground hover:text-foreground"
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? "Mở rộng sidebar (240px)" : "Thu gọn sidebar (icon)"}
              >
                <PanelLeft className="size-4" />
              </Button>

              <div className="hidden sm:block min-w-0 flex-1">
                <Breadcrumb className="min-w-0">
                  <BreadcrumbList className="flex-nowrap whitespace-nowrap overflow-hidden">
                    {crumbs.map((crumb, idx) => {
                      const isLast = idx === crumbs.length - 1;
                      const isMiddle = idx > 0 && !isLast;
                      return (
                        <span key={crumb.label} className="inline-flex items-center gap-1.5 min-w-0 shrink">
                          {idx > 0 && <BreadcrumbSeparator className="shrink-0" />}
                          <BreadcrumbItem className="min-w-0">
                            {isLast || !crumb.href ? (
                              <BreadcrumbPage className="font-medium text-foreground truncate max-w-36 md:max-w-52">
                                {crumb.label}
                              </BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink
                                href={crumb.href}
                                className={cn(
                                  "truncate",
                                  isMiddle ? "max-w-24 md:max-w-32 lg:max-w-36" : "max-w-28 md:max-w-40"
                                )}
                              >
                                {crumb.label}
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                        </span>
                      );
                    })}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>

            {/* Right side: Search and User dropdown */}
            <div className="flex items-center gap-3 shrink-0">
              <form method="GET" action="/seller/products" className="relative hidden sm:block w-36 md:w-44 lg:w-56 shrink-0">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="search"
                  name="search"
                  placeholder="Tìm sản phẩm, đơn hàng..."
                  className="h-8 w-full rounded-md border border-input bg-muted/40 pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:bg-background focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </form>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-full ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label="Menu tài khoản"
                    >
                      <Avatar className="size-8 border">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  }
                />
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2 border-b">
                    <p className="truncate text-sm font-semibold text-foreground">{user.name || "Chủ gian hàng"}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        {shop.name}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                        {shop.plan}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenuItem render={<Link href="/seller/settings" />}>
                    <Settings className="size-4 mr-2" />
                    Cài đặt gian hàng
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/" target="_blank" />}>
                    <ExternalLink className="size-4 mr-2" />
                    Xem website chợ
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/api/auth/signout" />}>
                    <LogOut className="size-4 mr-2" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main content: container-page handles horizontal gutters */}
          <main className="flex-1 py-4 md:py-6 min-w-0">
            <div className="container-page space-y-6">
              <ShopStatusAlert status={shop.status} statusReason={shop.statusReason} />
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
