import Link from "next/link";
import { type Metadata } from "next";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/server/access";
import { consumeAuthToken, verifyAuthToken } from "@/server/auth-tokens";
import { ResendVerificationButton } from "./resend-button";

export const metadata: Metadata = {
  title: "Xác thực email - Phố Đặc Sản",
};

export default async function VerifyEmailPage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;
  const currentUser = await getCurrentUser();

  let isSuccess = false;

  if (token) {
    const tokenRecord = await verifyAuthToken(token, "VERIFY_EMAIL");
    if (tokenRecord) {
      await db.user.update({
        where: { id: tokenRecord.userId },
        data: { emailVerified: new Date() },
      });
      await consumeAuthToken(tokenRecord.id);
      isSuccess = true;
    }
  }

  return (
    <Card className="w-full text-center">
      <CardHeader className="space-y-2">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full">
          {isSuccess ? (
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="size-6" />
            </div>
          ) : (
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <XCircle className="size-6" />
            </div>
          )}
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {isSuccess ? "Xác thực thành công!" : "Liên kết không hợp lệ hoặc đã hết hạn"}
        </CardTitle>
        <CardDescription>
          {isSuccess
            ? "Địa chỉ email của bạn đã được xác nhận. Giờ đây bạn có thể sử dụng đầy đủ các tính năng của Phố Đặc Sản."
            : "Liên kết xác thực email này đã hết hạn hoặc đã được sử dụng trước đó. Bạn có thể yêu cầu gửi lại liên kết mới."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isSuccess && (
          currentUser ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Gửi lại liên kết xác thực đến hộp thư của bạn:
              </p>
              <ResendVerificationButton />
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              Vui lòng đăng nhập để yêu cầu gửi lại liên kết xác thực.
            </div>
          )
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        {isSuccess ? (
          <Button render={<Link href="/tai-khoan" />} className="w-full">
            Đến trang tài khoản
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          !currentUser && (
            <Button
              variant="outline"
              render={<Link href="/dang-nhap?callbackUrl=/tai-khoan" />}
              className="w-full"
            >
              Đăng nhập ngay
            </Button>
          )
        )}
        <Button variant="ghost" render={<Link href="/" />} className="w-full text-muted-foreground">
          Quay về trang chủ
        </Button>
      </CardFooter>
    </Card>
  );
}
