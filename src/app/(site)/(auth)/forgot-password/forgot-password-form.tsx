"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/form-field";
import { forgotPasswordAction, type ActionState } from "../actions";

export function ForgotPasswordForm({
  onSwitch,
  inDialog = false,
}: {
  onSwitch?: (view: "login" | "register" | "forgot-password") => void;
  inDialog?: boolean;
} = {}) {
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    forgotPasswordAction,
    null
  );

  return (
    <Card className={inDialog ? "w-full overflow-visible border-0 bg-transparent p-0 shadow-none ring-0" : "w-full"}>
      {!inDialog && (
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="size-6" aria-hidden />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">Quên mật khẩu</CardTitle>
          <CardDescription>
            Nhập email đăng ký của bạn. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
          </CardDescription>
        </CardHeader>
      )}

      {state?.success ? (
        <CardContent className={inDialog ? "space-y-4 px-0 pt-2" : "space-y-4 pt-2"}>
          <Alert className="border-success/30 bg-success/10 text-success">
            <CheckCircle2 className="size-4 text-success" aria-hidden />
            <AlertDescription className="text-sm leading-relaxed">
              {state.message}
            </AlertDescription>
          </Alert>

          <p className="text-center text-xs text-muted-foreground">
            Vui lòng kiểm tra hộp thư đến (và thư mục rác/spam). Liên kết có thời hạn 1 giờ.
          </p>

          {onSwitch ? (
            <Button
              variant="outline"
              type="button"
              onClick={() => onSwitch("login")}
              className="w-full mt-4 gap-2"
            >
              <ArrowLeft className="size-4" aria-hidden />
              <span>Quay lại đăng nhập</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              render={<Link href="/login" />}
              className="w-full mt-4 gap-2"
            >
              <ArrowLeft className="size-4" aria-hidden />
              <span>Quay lại đăng nhập</span>
            </Button>
          )}
        </CardContent>
      ) : (
        <form action={formAction}>
          <CardContent className={inDialog ? "space-y-4 px-0" : "space-y-4"}>
            {state?.error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" aria-hidden />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <FormField
              id="email"
              label="Địa chỉ email đã đăng ký"
              required
              error={state?.errors?.email}
            >
              <div className="relative">
                <Mail className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tenban@example.com"
                  required
                  disabled={isPending}
                  autoComplete="email"
                  className="pl-9"
                />
              </div>
            </FormField>
          </CardContent>

          <CardFooter className={inDialog ? "flex flex-col gap-3 border-t-0 bg-transparent px-0 pb-0 pt-4" : "flex flex-col gap-3"}>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  <span>Đang gửi hướng dẫn...</span>
                </>
              ) : (
                "Gửi hướng dẫn đặt lại mật khẩu"
              )}
            </Button>

            {onSwitch ? (
              <Button
                variant="ghost"
                type="button"
                onClick={() => onSwitch("login")}
                className="w-full text-muted-foreground gap-2"
              >
                <ArrowLeft className="size-4" aria-hidden />
                <span>Quay lại đăng nhập</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                render={<Link href="/login" />}
                className="w-full text-muted-foreground gap-2"
              >
                <ArrowLeft className="size-4" aria-hidden />
                <span>Quay lại đăng nhập</span>
              </Button>
            )}
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
