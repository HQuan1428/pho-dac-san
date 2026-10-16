"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Users,
  FolderTree,
  MapPin,
  MessageSquare,
  Shield,
  ExternalLink,
  PanelLeft,
  Menu,
  Search,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
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
import { cn } from "@/lib/utils";

interface AdminAppShellProps {
  admin: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  children: React.ReactNode;
}

const navItems = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { href: "/admin/shops", label: "Gian hàng", icon: Store, exact: false },
  { href: "/admin/users", label: "Người dùng", icon: Users, exact: false },
  { href: "/admin/categories", label: "Danh mục", icon: FolderTree, exact: false },
  { href: "/admin/regions", label: "Vùng miền & Tỉnh", icon: MapPin, exact: false },
  { href: "/admin/contacts", label: "Tin nhắn liên hệ", icon: MessageSquare, exact: false },
];

function getBreadcrumbs(pathname: string) {
  const crumbs: { label: string; href?: string }[] = [{ label: "Quản trị", href: "/admin" }];

  if (pathname === "/admin") {
    crumbs.push({ label: "Tổng quan" });
  } else if (pathname.startsWith("/admin/shops")) {
    crumbs.push({ label: "Gian hàng" });
  } else if (pathname.startsWith("/admin/users")) {
    crumbs.push({ label: "Người dùng" });
  } else if (pathname.startsWith("/admin/categories")) {
    crumbs.push({ label: "Danh mục" });
  } else if (pathname.startsWith("/admin/regions")) {
    crumbs.push({ label: "Vùng miền & Tỉnh" });
  } else if (pathname.startsWith("/admin/contacts")) {
    crumbs.push({ label: "Tin nhắn liên hệ" });
  }

  return crumbs;
}

export function AdminAppShell({ admin, children }: AdminAppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const crumbs = getBreadcrumbs(pathname);
  const adminInitial = admin.name ? admin.name.charAt(0).toUpperCase() : "A";

  return (
    <TooltipProvider>
      <div className="flex min-h-dvh bg-background">
        {/* Mobile Nav Sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu quản trị</SheetTitle>
            </SheetHeader>
            <div className="flex h-full flex-col justify-between py-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b px-5 pb-3">
                  <Logo href="/admin" />
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    ADMIN
                  </span>
                </div>

                <nav className="flex flex-col gap-1 px-3">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.exact
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t p-3 space-y-2">
                <div className="rounded-md border bg-card p-2.5 text-xs">
                  <p className="font-semibold text-foreground truncate">{admin.name || "Quản trị viên"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{admin.email}</p>
                </div>
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <span>Xem website chợ</span>
                  <ExternalLink className="size-3.5" />
                </Link>
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
          {/* Top header */}
          <div className={cn("flex h-14 items-center border-b px-4", collapsed ? "justify-center px-2" : "justify-between")}>
            {!collapsed ? (
              <div className="flex items-center gap-2 overflow-hidden">
                <Logo href="/admin" />
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  ADMIN
                </span>
              </div>
            ) : (
              <Link href="/admin" className="flex items-center justify-center" aria-label="Trang chủ Admin">
                <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Shield className="size-4" />
                </span>
              </Link>
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-3">
            <nav className={cn("flex flex-col gap-1", collapsed ? "px-2" : "px-3")}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

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
                            aria-label={item.label}
                          >
                            <Icon className="size-4.5" />
                          </Link>
                        }
                      />
                      <TooltipContent side="right">{item.label}</TooltipContent>
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
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom user/website info */}
          <div className={cn("border-t p-3", collapsed && "p-2 text-center")}>
            {!collapsed ? (
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <span>Xem website chợ</span>
                <ExternalLink className="size-3.5" />
              </Link>
            ) : (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Avatar className="size-9 border mx-auto">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {adminInitial}
                      </AvatarFallback>
                    </Avatar>
                  }
                />
                <TooltipContent side="right">
                  <p className="font-medium">{admin.name || "Quản trị viên"}</p>
                  <p className="text-[11px] text-muted-foreground">{admin.email}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </aside>

        {/* Content Area: full available width */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Top Bar with breadcrumb, search, user menu */}
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-6">
            {/* Left: Mobile menu toggle, desktop collapse toggle, breadcrumb */}
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

              <div className="hidden sm:block min-w-0">
                <Breadcrumb>
                  <BreadcrumbList>
                    {crumbs.map((crumb, idx) => {
                      const isLast = idx === crumbs.length - 1;
                      return (
                        <span key={crumb.label} className="inline-flex items-center gap-1.5">
                          {idx > 0 && <BreadcrumbSeparator />}
                          <BreadcrumbItem>
                            {isLast || !crumb.href ? (
                              <BreadcrumbPage className="font-medium text-foreground">{crumb.label}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                        </span>
                      );
                    })}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>

            {/* Right: Search + User Menu */}
            <div className="flex items-center gap-3">
              <form method="GET" action="/admin/shops" className="relative hidden sm:block w-48 md:w-64 lg:w-72">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="search"
                  name="q"
                  placeholder="Tìm shop, người dùng..."
                  className="h-8 w-full rounded-md border border-input bg-muted/40 pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:bg-background focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </form>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-full ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label="Menu quản trị viên"
                    >
                      <Avatar className="size-8 border">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {adminInitial}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  }
                />
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2 border-b">
                    <p className="truncate text-sm font-semibold text-foreground">{admin.name || "Quản trị viên"}</p>
                    <p className="truncate text-xs text-muted-foreground">{admin.email}</p>
                    <span className="mt-1 inline-block rounded bg-primary/10 px-1.5 py-0.2 text-[10px] font-semibold text-primary">
                      ADMINISTRATOR
                    </span>
                  </div>
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

          {/* Main content: p-6 with container-page wrapper */}
          <main className="flex-1 p-6">
            <div className="container-page space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
