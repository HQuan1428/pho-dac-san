"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/form-field";
import { loginAction, type ActionState } from "../actions";

export function LoginForm({
  callbackUrl,
  resetSuccess,
}: {
  callbackUrl?: string;
  resetSuccess?: boolean;
}) {
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    loginAction,
    null
  );

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">Đăng nhập</CardTitle>
        <CardDescription>
          Nhập email và mật khẩu của bạn để truy cập Phố Đặc Sản
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <input type="hidden" name="callbackUrl" value={callbackUrl || ""} />
        <CardContent className="space-y-4">
          {resetSuccess && (
            <Alert className="border-success/30 bg-success/10 text-success">
              <CheckCircle2 className="size-4 text-success" />
              <AlertDescription>
                Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới của bạn.
              </AlertDescription>
            </Alert>
          )}

          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <FormField id="email" label="Địa chỉ email" required>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tenban@example.com"
              required
              disabled={isPending}
              autoComplete="email"
            />
          </FormField>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <FormField id="password" label="Mật khẩu" required>
                <span />
              </FormField>
              <Link
                href="/quen-mat-khau"
                className="text-xs font-medium text-muted-foreground hover:text-primary hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isPending}
              autoComplete="current-password"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link href="/dang-ky" className="font-medium text-primary hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
