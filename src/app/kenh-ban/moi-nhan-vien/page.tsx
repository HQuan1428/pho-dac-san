import Link from "next/link";
import { Store } from "lucide-react";
import { verifyInviteToken } from "@/server/seller/invite";
import { AcceptInviteView } from "@/components/seller/accept-invite-view";

export const metadata = {
  title: "Lời mời tham gia gian hàng — Phố Đặc Sản",
};

interface InvitePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function InviteStaffPage({ searchParams }: InvitePageProps) {
  const params = await searchParams;
  const token = params.token || "";

  const result = await verifyInviteToken(token);

  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="border-b bg-background">
        <div className="container-page flex items-center px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Store className="size-4" />
            </span>
            <span className="text-base font-bold">Phố Đặc Sản</span>
            <span className="text-xs text-muted-foreground ml-1">· Lời mời cộng tác</span>
          </Link>
        </div>
      </header>

      <main className="container-page py-12">
        <div className="mx-auto max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-bold tracking-tight text-center text-foreground">
            Lời mời tham gia gian hàng
          </h1>
          <p className="mt-1 text-xs text-center text-muted-foreground">
            Bạn được mời làm nhân viên quản lý trên kênh người bán Phố Đặc Sản.
          </p>

          <div className="mt-6">
            <AcceptInviteView token={token} result={result} />
          </div>
        </div>
      </main>
    </div>
  );
}
