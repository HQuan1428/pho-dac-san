import { redirect } from "next/navigation";
import { type Metadata } from "next";
import { getCurrentUser } from "@/server/access";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Đăng nhập - Phố Đặc Sản",
  description: "Đăng nhập vào tài khoản Phố Đặc Sản của bạn.",
};

export default async function LoginPage(props: {
  searchParams: Promise<{ callbackUrl?: string; reset?: string }>;
}) {
  const user = await getCurrentUser();
  const searchParams = await props.searchParams;

  if (user) {
    const callbackUrl =
      searchParams.callbackUrl &&
      searchParams.callbackUrl.startsWith("/") &&
      !searchParams.callbackUrl.startsWith("//")
        ? searchParams.callbackUrl
        : "/tai-khoan";
    redirect(callbackUrl);
  }

  return (
    <LoginForm
      callbackUrl={searchParams.callbackUrl}
      resetSuccess={searchParams.reset === "success"}
    />
  );
}
