"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/form-field";
import { updateProfileAction, type ProfileActionState } from "./actions";

export function ProfileForm({
  user,
}: {
  user: { name: string; email: string; phone: string | null };
}) {
  const [state, formAction, isPending] = useActionState<ProfileActionState | null, FormData>(
    updateProfileAction,
    null
  );

  useEffect(() => {
    if (state?.success && state?.message) {
      toast.success(state.message);
    }
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Thông tin cá nhân</CardTitle>
        <CardDescription>
          Cập nhật thông tin họ tên và số điện thoại liên lạc của bạn
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

          {state?.success && (
            <Alert className="border-success/30 bg-success/10 text-success">
              <CheckCircle2 className="size-4 text-success" />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <FormField id="email" label="Địa chỉ email" hint="Email dùng để đăng nhập và không thể thay đổi">
            <Input id="email" value={user.email} disabled className="bg-muted text-muted-foreground" />
          </FormField>

          <FormField
            id="name"
            label="Họ và tên"
            required
            error={state?.errors?.name}
          >
            <Input
              id="name"
              name="name"
              defaultValue={user.name}
              required
              disabled={isPending}
            />
          </FormField>

          <FormField
            id="phone"
            label="Số điện thoại"
            hint="Định dạng Việt Nam: 0912345678"
            error={state?.errors?.phone}
          >
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={user.phone || ""}
              placeholder="0912345678"
              disabled={isPending}
            />
          </FormField>
        </CardContent>

        <CardFooter className="flex justify-end border-t pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
