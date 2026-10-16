"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/form-field";
import { registerAction, type ActionState } from "../actions";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    registerAction,
    null
  );

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">Tạo tài khoản</CardTitle>
        <CardDescription>
          Đăng ký để khám phá và mua sắm đặc sản khắp các vùng miền Việt Nam
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <FormField
            id="name"
            label="Họ và tên"
            required
            error={state?.errors?.name}
          >
            <Input
              id="name"
              name="name"
              placeholder="Nguyễn Văn A"
              required
              disabled={isPending}
              autoComplete="name"
            />
          </FormField>

          <FormField
            id="email"
            label="Địa chỉ email"
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

          <FormField
            id="phone"
            label="Số điện thoại"
            hint="Không bắt buộc, dùng để nhận liên hệ giao hàng nhanh hơn"
            error={state?.errors?.phone}
          >
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="0912345678"
              disabled={isPending}
              autoComplete="tel"
            />
          </FormField>

          <FormField
            id="password"
            label="Mật khẩu"
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
            label="Xác nhận mật khẩu"
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

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang tạo tài khoản...
              </>
            ) : (
              "Đăng ký"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
