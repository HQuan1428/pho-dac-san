import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/server/access";
import { CheckoutView } from "@/components/store/checkout-view";

export const metadata = {
  title: "Đặt hàng — Phố Đặc Sản",
  description: "Xác nhận thông tin nhận hàng và hoàn tất đơn hàng đặc sản.",
};

export default async function DatHangPage() {
  const [provinces, sessionUser] = await Promise.all([
    db.province.findMany({
      include: {
        region: {
          select: { name: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    getCurrentUser(),
  ]);

  let user: { name: string; email: string; phone: string | null } | null = null;
  let savedAddresses: Array<{
    id: string;
    name: string;
    phone: string;
    provinceId: string;
    detail: string;
    isDefault: boolean;
    province: { name: string };
  }> = [];

  if (sessionUser) {
    const [dbUser, addresses] = await Promise.all([
      db.user.findUnique({
        where: { id: sessionUser.id },
        select: { name: true, email: true, phone: true },
      }),
      db.address.findMany({
        where: { userId: sessionUser.id },
        include: {
          province: {
            select: { name: true },
          },
        },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      }),
    ]);
    user = dbUser;
    savedAddresses = addresses;
  }

  return (
    <div className="container-page py-6 md:py-8 space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Đường dẫn" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/market" className="hover:text-foreground transition">Chợ</Link>
        <ChevronRight className="size-3" />
        <Link href="/cart" className="hover:text-foreground transition">Giỏ hàng</Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground font-medium">Đặt hàng</span>
      </nav>

      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Thanh toán & Đặt hàng
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Điền địa chỉ nhận hàng để các gian hàng chuẩn bị và gửi hàng cho bạn
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-primary" />
          <span>Thanh toán COD khi nhận hàng</span>
        </div>
      </div>

      <CheckoutView
        provinces={provinces}
        savedAddresses={savedAddresses}
        userEmail={user?.email ?? ""}
        userName={user?.name ?? ""}
        userPhone={user?.phone ?? ""}
      />
    </div>
  );
}
