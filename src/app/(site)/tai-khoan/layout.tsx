import { type Metadata } from "next";
import { AccountLayoutShell } from "./account-layout-shell";

export const metadata: Metadata = {
  title: "Tài khoản của tôi - Phố Đặc Sản",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AccountLayoutShell activePath="/tai-khoan">
      {children}
    </AccountLayoutShell>
  );
}
