"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ResendVerificationButton } from "../(auth)/xac-thuc-email/resend-button";

export function EmailVerificationBanner({
  emailVerified,
  showNotice,
}: {
  emailVerified: Date | null;
  showNotice?: boolean;
}) {
  if (emailVerified) {
    return (
      <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-50">
        <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
        <AlertTitle className="font-medium text-emerald-800 dark:text-emerald-200">
          Tài khoản đã xác thực
        </AlertTitle>
        <AlertDescription className="text-xs text-emerald-700 dark:text-emerald-300">
          Địa chỉ email của bạn đã được xác thực an toàn.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-950 dark:text-amber-100">
      <div className="flex items-start gap-3">
        <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            {showNotice
              ? "Vui lòng xác thực email của bạn"
              : "Tài khoản của bạn chưa được xác thực email"}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300">
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
