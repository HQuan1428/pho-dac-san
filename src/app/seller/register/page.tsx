import Link from "next/link";
import { redirect } from "next/navigation";
import { Store, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  checkUserShopMembership,
  getProvincesForRegistration,
} from "@/server/seller/registration";
import { RegistrationForm } from "@/components/seller/registration-form";

export const metadata = {
  title: "Đăng ký mở gian hàng — Phố Đặc Sản",
  description: "Trở thành người bán trên sàn thương mại điện tử đặc sản vùng miền Phố Đặc Sản",
};

export default async function RegisterShopPage() {
  const { hasShop, user } = await checkUserShopMembership();

  if (hasShop) {
    redirect("/seller");
  }

  const provinces = await getProvincesForRegistration();

  return (
    <div className="min-h-dvh bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container-page flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Store className="size-4" />
            </span>
            <span className="text-base font-bold">Phố Đặc Sản</span>
            <span className="text-xs text-muted-foreground ml-1">· Đăng ký gian hàng</span>
          </Link>

          <Button variant="ghost" size="sm" render={<Link href="/" />}>
            <ArrowLeft className="size-4 mr-1.5" />
            Về trang chủ
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container-page py-10">
        <div className="mx-auto max-w-2xl rounded-lg border bg-card p-6 md:p-8 shadow-sm">
          <div className="border-b pb-5">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <ShieldCheck className="size-4" />
              <span>Chương trình đối tác người bán Phố Đặc Sản</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              Mở gian hàng đặc sản của bạn
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Đưa tinh hoa sản vật quê hương tiếp cận hàng ngàn khách hàng trên toàn quốc.
              Sau khi gửi đăng ký, hồ sơ sẽ được ban quản trị phê duyệt trong vòng 24 giờ.
            </p>
          </div>

          <div className="pt-6">
            <RegistrationForm
              provinces={provinces}
              defaultPhone={user?.phone || ""}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
