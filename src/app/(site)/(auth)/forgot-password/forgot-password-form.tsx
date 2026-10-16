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

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    forgotPasswordAction,
    null
  );

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="size-6" />
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">Quên mật khẩu</CardTitle>
        <CardDescription>
          Nhập email đăng ký của bạn. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
        </CardDescription>
      </CardHeader>

      {state?.success ? (
        <CardContent className="space-y-4 pt-2">
          <Alert className="border-success/30 bg-success/10 text-success">
            <CheckCircle2 className="size-4 text-success" />
            <AlertDescription className="text-sm leading-relaxed">
              {state.message}
            </AlertDescription>
          </Alert>

          <p className="text-center text-xs text-muted-foreground">
            Vui lòng kiểm tra hộp thư đến (và thư mục rác/spam). Liên kết có thời hạn 1 giờ.
          </p>

          <Button
            variant="outline"
            render={<Link href="/login" />}
            className="w-full mt-4"
          >
            <ArrowLeft className="size-4" />
            Quay lại đăng nhập
          </Button>
        </CardContent>
      ) : (
        <form action={formAction}>
          <CardContent className="space-y-4">
            {state?.error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <FormField
              id="email"
              label="Địa chỉ email đã đăng ký"
              required
              error={state?.errors?.email}
            >
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
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang gửi hướng dẫn...
                </>
              ) : (
                "Gửi hướng dẫn đặt lại mật khẩu"
              )}
            </Button>

            <Button
              variant="ghost"
              render={<Link href="/login" />}
              className="w-full text-muted-foreground"
            >
              <ArrowLeft className="size-4" />
              Quay lại đăng nhập
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
