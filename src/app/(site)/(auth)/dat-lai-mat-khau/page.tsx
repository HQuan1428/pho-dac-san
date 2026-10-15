import Link from "next/link";
import { type Metadata } from "next";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyAuthToken } from "@/server/auth-tokens";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu - Phố Đặc Sản",
};

export default async function ResetPasswordPage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;

  if (!token) {
    return (
      <Card className="w-full text-center">
        <CardHeader className="space-y-2">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Thiếu liên kết xác thực
          </CardTitle>
          <CardDescription>
            Không tìm thấy mã xác thực để đặt lại mật khẩu. Vui lòng gửi lại yêu cầu.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2">
          <Button render={<Link href="/quen-mat-khau" />} className="w-full">
            Yêu cầu đặt lại mật khẩu
          </Button>
          <Button variant="ghost" render={<Link href="/dang-nhap" />} className="w-full text-muted-foreground">
            Quay lại đăng nhập
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const tokenRecord = await verifyAuthToken(token, "RESET_PASSWORD");
  if (!tokenRecord) {
    return (
      <Card className="w-full text-center">
        <CardHeader className="space-y-2">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Liên kết không hợp lệ hoặc đã hết hạn
          </CardTitle>
          <CardDescription>
            Liên kết đặt lại mật khẩu này đã hết hạn hoặc đã được sử dụng trước đó. Vui lòng gửi lại yêu cầu mới.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2">
          <Button render={<Link href="/quen-mat-khau" />} className="w-full">
            Yêu cầu liên kết mới
          </Button>
          <Button variant="ghost" render={<Link href="/dang-nhap" />} className="w-full text-muted-foreground">
            <ArrowLeft className="size-4" />
            Quay lại đăng nhập
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return <ResetPasswordForm token={token} />;
}
