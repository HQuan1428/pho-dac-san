import { redirect } from "next/navigation";
import { type Metadata } from "next";
import { getCurrentUser } from "@/server/access";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Đăng ký tài khoản - Phố Đặc Sản",
  description: "Tạo tài khoản mới tại Phố Đặc Sản để khám phá hàng trăm đặc sản vùng miền chính gốc.",
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/account");
  }

  return <RegisterForm />;
}
