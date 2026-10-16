import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CartButton } from "./cart-button";
import { Logo } from "./logo";

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-6">
        <Logo />
        <nav className="hidden gap-1 text-sm md:flex">
          <Link href="/cho" className="rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground">Khám phá</Link>
          <Link href="/kenh-ban" className="rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground">Bán hàng</Link>
        </nav>
        <form action="/tim-kiem" className="relative ml-auto hidden w-full max-w-xs sm:block">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            type="search"
            placeholder="Tìm đặc sản, gian hàng…"
            className="h-9 w-full rounded-md border bg-background pr-3 pl-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </form>
        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <CartButton />
          {user ? (
            <>
              <Link href="/thong-bao" aria-label="Thông báo" className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted">
                <Bell className="size-5" />
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Tài khoản" />}>
                  <Avatar className="size-7"><AvatarFallback>{user.name?.slice(0, 1) ?? "U"}</AvatarFallback></Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem render={<Link href="/tai-khoan" />}>Tài khoản</DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/tai-khoan/don-hang" />}>Đơn hàng của tôi</DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/kenh-ban" />}>Kênh người bán</DropdownMenuItem>
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
            <>
              <Button variant="ghost" size="sm" render={<Link href="/dang-nhap" />}>Đăng nhập</Button>
              <Button size="sm" render={<Link href="/dang-ky" />}>Đăng ký</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
