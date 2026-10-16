"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ResendVerificationButton } from "../(auth)/verify-email/resend-button";

export function EmailVerificationBanner({
  emailVerified,
  showNotice,
}: {
  emailVerified: Date | null;
  showNotice?: boolean;
}) {
  if (emailVerified) {
    return (
      <Alert className="border-success/30 bg-success/10 text-success">
        <CheckCircle2 className="size-4 text-success" />
        <AlertTitle className="font-medium">
          Tài khoản đã xác thực
        </AlertTitle>
        <AlertDescription className="text-xs opacity-90">
          Địa chỉ email của bạn đã được xác thực an toàn.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-warning-foreground">
      <div className="flex items-start gap-3">
        <AlertTriangle className="size-5 shrink-0 text-warning mt-0.5" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-warning-foreground">
            {showNotice
              ? "Vui lòng xác thực email của bạn"
              : "Tài khoản của bạn chưa được xác thực email"}
          </p>
          <p className="text-xs opacity-90">
            Chúng tôi đã gửi email xác thực đến địa chỉ của bạn. Vui lòng bấm vào liên kết trong email để hoàn tất.
          </p>
        </div>
      </div>
      <div className="max-w-xs pt-1">
        <ResendVerificationButton />
      </div>
    </div>
  );
}
