import Link from "next/link";
import { requireAdmin } from "@/server/access";
import { Logo } from "@/components/layout/logo";
import { AdminNav } from "./_components/admin-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ExternalLink, Shield } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <Logo href="/admin" />
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            ADMIN
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <AdminNav />
        </div>

        <div className="border-t p-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <span>Xem website chợ</span>
            <ExternalLink className="size-3.5" />
          </Link>
        </div>
      </aside>

      {/* Main body */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <Logo href="/admin" />
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="size-4 text-primary" />
              <span>Bảng điều khiển Quản trị viên</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium leading-none text-foreground">{admin.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{admin.email}</p>
            </div>
            <Avatar className="size-8 border">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {admin.name ? admin.name.charAt(0).toUpperCase() : "A"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Mobile Nav row */}
        <div className="border-b bg-card px-2 md:hidden overflow-x-auto">
          <AdminNav />
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
