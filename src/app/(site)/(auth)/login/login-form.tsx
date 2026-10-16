"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Mail, Lock } from "lucide-react";
import { signIn } from "next-auth/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/form-field";
import { loginAction, type ActionState } from "../actions";

export function LoginForm({
  callbackUrl,
  resetSuccess,
  onSuccess,
  onSwitch,
  inDialog = false,
}: {
  callbackUrl?: string;
  resetSuccess?: boolean;
  onSuccess?: () => void;
  onSwitch?: (view: "login" | "register" | "forgot-password") => void;
  inDialog?: boolean;
}) {
  const [state, formAction, actionPending] = useActionState<ActionState | null, FormData>(
    loginAction,
    null
  );

  const [dialogError, setDialogError] = useState<string | null>(null);
  const [dialogPending, setDialogPending] = useState(false);

  const isPending = onSuccess ? dialogPending : actionPending;
  const errorMessage = onSuccess ? dialogError : state?.error;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!onSuccess) return; // Follow standard form action
    e.preventDefault();
    setDialogPending(true);
    setDialogError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setDialogError("Email hoặc mật khẩu không đúng");
      } else {
        onSuccess();
      }
    } catch {
      setDialogError("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setDialogPending(false);
    }
  };

  return (
    <Card className={inDialog ? "w-full border-0 shadow-none bg-transparent p-0" : "w-full"}>
      {!inDialog && (
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">Đăng nhập</CardTitle>
          <CardDescription>
            Nhập email và mật khẩu của bạn để truy cập Phố Đặc Sản
          </CardDescription>
        </CardHeader>
      )}
      <form action={onSuccess ? undefined : formAction} onSubmit={handleSubmit}>
        <input type="hidden" name="callbackUrl" value={callbackUrl || ""} />
        <CardContent className={inDialog ? "space-y-4 px-0" : "space-y-4"}>
          {resetSuccess && (
            <Alert className="border-success/30 bg-success/10 text-success">
              <CheckCircle2 className="size-4 text-success" aria-hidden />
              <AlertDescription>
                Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới của bạn.
              </AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" aria-hidden />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <FormField id="email" label="Địa chỉ email" required>
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <FormField id="password" label="Mật khẩu" required>
                <span />
              </FormField>
              {onSwitch ? (
                <button
                  type="button"
                  onClick={() => onSwitch("forgot-password")}
                  className="text-xs font-medium text-muted-foreground hover:text-primary hover:underline cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              ) : (
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-muted-foreground hover:text-primary hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={isPending}
                autoComplete="current-password"
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className={inDialog ? "flex flex-col gap-4 px-0 pb-0 pt-4" : "flex flex-col gap-4"}>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              "Đăng nhập"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            {onSwitch ? (
              <button
                type="button"
                onClick={() => onSwitch("register")}
                className="font-medium text-primary hover:underline cursor-pointer"
              >
                Đăng ký ngay
              </button>
            ) : (
              <Link href="/register" className="font-medium text-primary hover:underline">
                Đăng ký ngay
              </Link>
            )}
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
