import { type Metadata } from "next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { requireUser } from "@/server/access";
import { AccountNav } from "./account-nav";

export const metadata: Metadata = {
  title: "Tài khoản của tôi - Phố Đặc Sản",
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/tai-khoan");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <aside className="space-y-6">
          <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
            <Avatar className="size-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user.name ? user.name.slice(0, 1).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.name || "Khách hàng"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>

          <AccountNav />
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
