import Link from "next/link";
import {
  Compass,
  Heart,
  LogOut,
  MapPin,
  Package,
  Shield,
  Store,
  User,
} from "lucide-react";
import { signOut } from "@/auth";
import { getCurrentUser } from "@/server/access";
import { db } from "@/lib/db";
import { getFeaturedCategories } from "@/server/store/catalog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CartButton } from "./cart-button";
import { Logo } from "./logo";
import { AuthButtons } from "./auth-buttons";
import { CommandSearch } from "./command-search";
import { NotificationBell } from "./notification-bell";

export async function SiteHeader() {
  const user = await getCurrentUser();

  const [notifications, unreadCount, featuredCategories] = await Promise.all([
    user
      ? db.notification.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 10,
        })
      : Promise.resolve([]),
    user
      ? db.notification.count({
          where: { userId: user.id, readAt: null },
        })
      : Promise.resolve(0),
    getFeaturedCategories(),
  ]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-background/95 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_0_0_rgb(255_255_255/0.4)_inset,0_8px_24px_-12px_rgb(0_0_0/0.15)] supports-[backdrop-filter]:bg-background/55 dark:border-white/10 dark:shadow-[0_1px_0_0_rgb(255_255_255/0.1)_inset,0_8px_24px_-12px_rgb(0_0_0/0.4)]">
      <div className="container-page flex h-16 items-center gap-2 sm:gap-3 xl:gap-6">
        <Logo />
        <nav className="hidden gap-1 text-sm md:flex">
          <Link
            href="/market"
            title="Khám phá"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 whitespace-nowrap text-muted-foreground transition-colors hover:bg-white/50 hover:text-foreground dark:hover:bg-white/10"
          >
            <Compass className="size-4" aria-hidden="true" />
            <span className="sr-only xl:not-sr-only">Khám phá</span>
          </Link>
          <Link
            href="/seller"
            title="Bán hàng"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 whitespace-nowrap text-muted-foreground transition-colors hover:bg-white/50 hover:text-foreground dark:hover:bg-white/10"
          >
            <Store className="size-4" aria-hidden="true" />
            <span className="sr-only xl:not-sr-only">Bán hàng</span>
          </Link>
        </nav>

        {/* Command Search Trigger & Dialog */}
        <CommandSearch featuredCategories={featuredCategories} />

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1 sm:ml-0">
          <CartButton />
          {user ? (
            <>
              {/* Notification Popover (desktop) & Bottom Sheet (mobile) */}
              <NotificationBell
                initialNotifications={notifications}
                initialUnreadCount={unreadCount}
              />

              {/* Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Tài khoản"
                      className="rounded-full"
                    />
                  }
                >
                  <Avatar className="size-7">
                    <AvatarFallback className="text-xs font-medium">
                      {user.name?.slice(0, 1) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* Name + Email Header */}
                  <div className="flex flex-col space-y-0.5 px-2.5 py-2 text-sm border-b border-border/60">
                    <span className="font-semibold text-foreground truncate">
                      {user.name || "Khách hàng"}
                    </span>
                    {user.email && (
                      <span className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </span>
                    )}
                  </div>

                  <div className="p-1">
                    <DropdownMenuItem render={<Link href="/account" />}>
                      <User className="size-4" aria-hidden="true" />
                      <span>Tài khoản</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/account?tab=orders" />}>
                      <Package className="size-4" aria-hidden="true" />
                      <span>Đơn hàng của tôi</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/account?tab=wishlist" />}>
                      <Heart className="size-4" aria-hidden="true" />
                      <span>Đã lưu</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/account?tab=addresses" />}>
                      <MapPin className="size-4" aria-hidden="true" />
                      <span>Địa chỉ nhận hàng</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/account?tab=following" />}>
                      <Store className="size-4" aria-hidden="true" />
                      <span>Gian hàng theo dõi</span>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator />

                  <div className="p-1">
                    <DropdownMenuItem render={<Link href="/seller" />}>
                      <Store className="size-4" aria-hidden="true" />
                      <span>Kênh người bán</span>
                    </DropdownMenuItem>
                    {user.role === "ADMIN" && (
                      <DropdownMenuItem render={<Link href="/admin" />}>
                        <Shield className="size-4" aria-hidden="true" />
                        <span>Quản trị</span>
                      </DropdownMenuItem>
                    )}
                  </div>

                  <DropdownMenuSeparator />

                  <div className="p-1">
                    <form
                      action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/" });
                      }}
                    >
                      <DropdownMenuItem
                        variant="destructive"
                        render={<button type="submit" className="w-full" />}
                      >
                        <LogOut className="size-4" aria-hidden="true" />
                        <span>Đăng xuất</span>
                      </DropdownMenuItem>
                    </form>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <AuthButtons />
          )}
        </div>
      </div>
    </header>
  );
}
