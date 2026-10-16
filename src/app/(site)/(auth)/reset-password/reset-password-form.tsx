"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, KeyRound, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/form-field";
import { resetPasswordAction, type ActionState } from "../actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    resetPasswordAction,
    null
  );

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <KeyRound className="size-6" />
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">Đặt lại mật khẩu</CardTitle>
        <CardDescription>
          Nhập mật khẩu mới cho tài khoản của bạn
        </CardDescription>
      </CardHeader>

      <form action={formAction}>
        <input type="hidden" name="token" value={token} />

        <CardContent className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <FormField
            id="password"
            label="Mật khẩu mới"
            required
            hint="Ít nhất 8 ký tự, bao gồm ít nhất 1 chữ cái và 1 chữ số"
            error={state?.errors?.password}
          >
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isPending}
              autoComplete="new-password"
            />
          </FormField>

          <FormField
            id="confirmPassword"
            label="Xác nhận mật khẩu mới"
            required
            error={state?.errors?.confirmPassword}
          >
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              disabled={isPending}
              autoComplete="new-password"
            />
          </FormField>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang lưu mật khẩu...
              </>
            ) : (
              "Lưu mật khẩu mới"
            )}
          </Button>

          <Button
            variant="ghost"
            render={<Link href="/login" />}
            className="w-full text-muted-foreground"
          >
            Hủy và quay về đăng nhập
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
