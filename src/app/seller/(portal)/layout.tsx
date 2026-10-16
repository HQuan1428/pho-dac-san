import { requireShop } from "@/server/access";
import { SellerAppShell } from "@/components/seller/seller-app-shell";

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
    <SellerAppShell shop={shop} role={role} user={user}>
      {children}
    </SellerAppShell>
  );
}
