import { type Metadata } from "next";
import { AccountLayoutShell } from "../tai-khoan/account-layout-shell";

export const metadata: Metadata = {
  title: "Thông báo - Phố Đặc Sản",
};

export default function NotificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AccountLayoutShell activePath="/thong-bao">
      {children}
    </AccountLayoutShell>
  );
}
