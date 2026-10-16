import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { db } from "@/lib/db";
import { requireUser } from "@/server/access";
import { AccountNav } from "./account-nav";

export async function AccountLayoutShell({
  children,
  activePath,
}: {
  children: React.ReactNode;
  activePath: string;
}) {
  const user = await requireUser(activePath);

  const [orderCount, wishlistCount, followCount, addressCount, unreadNotificationCount] =
    await Promise.all([
      db.order.count({ where: { customerId: user.id } }),
      db.wishlistItem.count({ where: { userId: user.id } }),
      db.shopFollow.count({ where: { userId: user.id } }),
      db.address.count({ where: { userId: user.id } }),
      db.notification.count({ where: { userId: user.id, readAt: null } }),
    ]);

  const counts = {
    orders: orderCount,
    wishlist: wishlistCount,
    following: followCount,
    addresses: addressCount,
    notifications: unreadNotificationCount,
  };

  return (
    <div className="container-page py-6 md:py-8">
      <div className="grid gap-6 md:grid-cols-[240px_1fr] lg:gap-8 items-start">
        {/* 240px left nav */}
        <aside className="space-y-4 md:sticky md:top-20">
          <div className="flex items-center gap-3 rounded-lg border bg-card p-3.5 shadow-2xs">
            <Avatar className="size-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user.name ? user.name.slice(0, 1).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.name || "Khách hàng"}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <AccountNav counts={counts} />
        </aside>

        {/* Content right */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
