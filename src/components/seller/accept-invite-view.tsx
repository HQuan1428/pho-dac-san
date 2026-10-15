"use client";

import { useState } from "react";
import Link from "next/link";
import { Store, ShieldAlert, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { acceptInviteAction, type verifyInviteToken } from "@/server/seller/invite";

interface AcceptInviteViewProps {
  token: string;
  result: Awaited<ReturnType<typeof verifyInviteToken>>;
}

export function AcceptInviteView({ token, result }: AcceptInviteViewProps) {
  const [loading, setLoading] = useState(false);

  if (!result.valid || !result.invite) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <ShieldAlert className="size-4" />
          <AlertTitle className="font-semibold">Lời mời không hợp lệ</AlertTitle>
          <AlertDescription className="text-sm mt-1">
            {result.error || "Không tìm thấy thông tin lời mời hoặc lời mời đã hết hạn."}
          </AlertDescription>
        </Alert>

        <div className="pt-2">
          <Button variant="outline" className="w-full" render={<Link href="/" />}>
            <ArrowLeft className="size-4 mr-2" />
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const { invite, user } = result;

  const handleAccept = async () => {
    setLoading(true);
    try {
      const res = await acceptInviteAction(token);
      if (res?.error) {
        toast.error(res.error);
        setLoading(false);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        throw err;
      }
      const msg = err instanceof Error ? err.message : "Chấp nhận lời mời thất bại";
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-muted/30 p-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Store className="size-6" />
        </div>
        <h2 className="mt-3 text-lg font-bold text-foreground">{invite.shop.name}</h2>
        {invite.shop.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {invite.shop.description}
          </p>
        )}
      </div>

      <div className="rounded-lg border bg-card p-4 space-y-3 text-xs text-muted-foreground">
        <div className="flex justify-between border-b pb-2">
          <span>Tài khoản tiếp nhận:</span>
          <span className="font-medium text-foreground">{user?.email}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span>Vai trò được giao:</span>
          <span className="font-medium text-primary">Nhân viên gian hàng</span>
        </div>
        <div>
          <span className="font-medium text-foreground block mb-1">Quyền hạn cụ thể:</span>
          <ul className="list-disc pl-4 space-y-1">
            <li>Xem và xử lý đơn hàng (gọi xác nhận, đổi trạng thái)</li>
            <li>Xem và quản lý thông tin sản phẩm</li>
            <li>Không thể sửa cài đặt gian hàng, voucher hay quản lý nhân sự</li>
          </ul>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleAccept}
          disabled={loading}
          className="w-full py-5 text-base gap-2"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <CheckCircle2 className="size-5" />
          )}
          Chấp nhận tham gia gian hàng
        </Button>

        <Button variant="ghost" className="w-full text-xs" render={<Link href="/" />}>
          Bỏ qua và về trang chủ
        </Button>
      </div>
    </div>
  );
}
