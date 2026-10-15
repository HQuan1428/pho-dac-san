"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/form-field";
import { changePasswordAction, type ProfileActionState } from "./actions";

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<ProfileActionState | null, FormData>(
    changePasswordAction,
    null
  );

  useEffect(() => {
    if (state?.success) {
      if (state.message) toast.success(state.message);
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Đổi mật khẩu</CardTitle>
        <CardDescription>
          Để bảo vệ tài khoản, không nên sử dụng mật khẩu trùng với các dịch vụ khác
        </CardDescription>
      </CardHeader>
      <form ref={formRef} action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {state?.success && (
            <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <FormField
            id="currentPassword"
            label="Mật khẩu hiện tại"
            required
            error={state?.errors?.currentPassword}
          >
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder="••••••••"
              required
              disabled={isPending}
              autoComplete="current-password"
            />
          </FormField>

          <FormField
            id="newPassword"
            label="Mật khẩu mới"
            required
            hint="Từ 8 ký tự, bao gồm ít nhất 1 chữ cái và 1 chữ số"
            error={state?.errors?.newPassword}
          >
            <Input
              id="newPassword"
              name="newPassword"
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

        <CardFooter className="flex justify-end border-t pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang đổi mật khẩu...
              </>
            ) : (
              "Đổi mật khẩu"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
