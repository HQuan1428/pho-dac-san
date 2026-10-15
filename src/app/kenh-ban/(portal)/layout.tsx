import { requireShop } from "@/server/access";
import { SellerNavContent } from "@/components/seller/seller-nav";
import { SellerMobileNav } from "@/components/seller/seller-mobile-nav";
import { ShopStatusAlert } from "@/components/seller/shop-status-alert";

export const metadata = {
  title: {
    template: "%s | Kênh Người Bán — Phố Đặc Sản",
    default: "Kênh Người Bán — Phố Đặc Sản",
  },
};

export default async function SellerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, shop, role } = await requireShop();

  return (
    <div className="min-h-dvh bg-muted/20">
      {/* Mobile topbar with Sheet nav */}
      <SellerMobileNav shop={shop} role={role} user={user} />

      <div className="flex min-h-dvh">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
          <div className="sticky top-0 h-dvh">
            <SellerNavContent shop={shop} role={role} user={user} />
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-6xl space-y-6">
              {/* Top Alert for PENDING / REJECTED / SUSPENDED */}
              <ShopStatusAlert
                status={shop.status}
                statusReason={shop.statusReason}
              />

              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
