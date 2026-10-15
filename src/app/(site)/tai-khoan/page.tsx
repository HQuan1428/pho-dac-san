import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/server/access";
import { PageHeader } from "@/components/common/page-header";
import { EmailVerificationBanner } from "./email-verification-banner";
import { ProfileForm } from "./profile-form";
import { ChangePasswordForm } from "./change-password-form";

export const metadata: Metadata = {
  title: "Thông tin tài khoản - Phố Đặc Sản",
};

export default async function AccountPage(props: {
  searchParams: Promise<{ verify?: string }>;
}) {
  const sessionUser = await requireUser("/tai-khoan");
  const searchParams = await props.searchParams;

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      emailVerified: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thông tin tài khoản"
        description="Quản lý thông tin hồ sơ và bảo mật tài khoản của bạn"
      />

      <EmailVerificationBanner
        emailVerified={user.emailVerified}
        showNotice={searchParams.verify === "pending"}
      />

      <div className="grid gap-6">
        <ProfileForm user={user} />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
