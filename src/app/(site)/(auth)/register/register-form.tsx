"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2, Mail, Lock, User, Phone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/common/form-field";
import { registerAction, type ActionState } from "../actions";

export function RegisterForm({
  onSwitch,
  inDialog = false,
}: {
  onSwitch?: (view: "login" | "register" | "forgot-password") => void;
  inDialog?: boolean;
} = {}) {
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    registerAction,
    null
  );

  return (
    <Card className={inDialog ? "w-full overflow-visible border-0 bg-transparent p-0 shadow-none ring-0" : "w-full"}>
      {!inDialog && (
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">Tạo tài khoản</CardTitle>
          <CardDescription>
            Đăng ký để khám phá và mua sắm đặc sản khắp các vùng miền Việt Nam
          </CardDescription>
        </CardHeader>
      )}
      <form action={formAction}>
        <CardContent className={inDialog ? "space-y-4 px-0" : "space-y-4"}>
          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" aria-hidden />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <FormField
            id="name"
            label="Họ và tên"
            required
            error={state?.errors?.name}
          >
            <div className="relative">
              <User className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden />
              <Input
                id="name"
                name="name"
                placeholder="Nguyễn Văn A"
                required
                disabled={isPending}
                autoComplete="name"
                className="pl-9"
              />
            </div>
          </FormField>

          <FormField
            id="email"
            label="Địa chỉ email"
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

          <FormField
            id="phone"
            label="Số điện thoại"
            hint="Không bắt buộc, dùng để nhận liên hệ giao hàng nhanh hơn"
            error={state?.errors?.phone}
          >
            <div className="relative">
              <Phone className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden />
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="0912345678"
                disabled={isPending}
                autoComplete="tel"
                className="pl-9"
              />
            </div>
          </FormField>

          <FormField
            id="password"
            label="Mật khẩu"
            required
            hint="Ít nhất 8 ký tự, bao gồm ít nhất 1 chữ cái và 1 chữ số"
            error={state?.errors?.password}
          >
            <div className="relative">
              <Lock className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden />
              <PasswordInput
                id="password"
                name="password"
                placeholder="••••••••"
                required
                disabled={isPending}
                autoComplete="new-password"
                className="pl-9"
              />
            </div>
          </FormField>

          <FormField
            id="confirmPassword"
            label="Xác nhận mật khẩu"
            required
            error={state?.errors?.confirmPassword}
          >
            <div className="relative">
              <Lock className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden />
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                required
                disabled={isPending}
                autoComplete="new-password"
                className="pl-9"
              />
            </div>
          </FormField>
        </CardContent>

        <CardFooter className={inDialog ? "flex flex-col gap-4 border-t-0 bg-transparent px-0 pb-0 pt-4" : "flex flex-col gap-4"}>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                <span>Đang tạo tài khoản...</span>
              </>
            ) : (
              "Đăng ký"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            {onSwitch ? (
              <button
                type="button"
                onClick={() => onSwitch("login")}
                className="font-medium text-primary hover:underline cursor-pointer"
              >
                Đăng nhập ngay
              </button>
            ) : (
              <Link href="/login" className="font-medium text-primary hover:underline">
                Đăng nhập ngay
              </Link>
            )}
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
