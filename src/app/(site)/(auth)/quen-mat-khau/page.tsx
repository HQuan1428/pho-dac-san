import { type Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Quên mật khẩu - Phố Đặc Sản",
  description: "Yêu cầu đặt lại mật khẩu cho tài khoản Phố Đặc Sản.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
