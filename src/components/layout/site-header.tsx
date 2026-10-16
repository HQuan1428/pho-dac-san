import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { signOut } from "@/auth";
import { getCurrentUser } from "@/server/access";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CartButton } from "./cart-button";
import { Logo } from "./logo";
import { AuthButtons } from "./auth-buttons";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-background/95 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_0_0_rgb(255_255_255/0.4)_inset,0_8px_24px_-12px_rgb(0_0_0/0.15)] supports-[backdrop-filter]:bg-background/55 dark:border-white/10 dark:shadow-[0_1px_0_0_rgb(255_255_255/0.1)_inset,0_8px_24px_-12px_rgb(0_0_0/0.4)]">
      <div className="container-page flex h-16 items-center gap-6">
        <Logo />
        <nav className="hidden gap-1 text-sm md:flex">
          <Link href="/market" className="rounded-full px-3 py-1.5 whitespace-nowrap text-muted-foreground transition-colors hover:bg-white/50 hover:text-foreground dark:hover:bg-white/10">Khám phá</Link>
          <Link href="/seller" className="rounded-full px-3 py-1.5 whitespace-nowrap text-muted-foreground transition-colors hover:bg-white/50 hover:text-foreground dark:hover:bg-white/10">Bán hàng</Link>
        </nav>
        <form action="/search" className="relative ml-auto hidden w-full max-w-xs sm:block">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            type="search"
            placeholder="Tìm đặc sản, gian hàng…"
            className="h-9 w-full rounded-md border border-black/10 bg-white/50 pr-3 pl-8 text-sm backdrop-blur-md outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-white/15 dark:bg-white/5"
          />
        </form>
        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <CartButton />
          {user ? (
            <>
              <Link href="/notifications" aria-label="Thông báo" className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted">
                <Bell className="size-5" />
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Tài khoản" />}>
                  <Avatar className="size-7"><AvatarFallback>{user.name?.slice(0, 1) ?? "U"}</AvatarFallback></Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem render={<Link href="/account" />}>Tài khoản</DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/account/orders" />}>Đơn hàng của tôi</DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/seller" />}>Kênh người bán</DropdownMenuItem>
                  {user.role === "ADMIN" && <DropdownMenuItem render={<Link href="/admin" />}>Quản trị</DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/" });
                    }}
                  >
                    <DropdownMenuItem render={<button type="submit" className="w-full" />}>Đăng xuất</DropdownMenuItem>
                  </form>
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
