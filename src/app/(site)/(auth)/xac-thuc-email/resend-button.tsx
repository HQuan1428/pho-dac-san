"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { resendVerificationAction, type ActionState } from "../actions";

export function ResendVerificationButton() {
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    resendVerificationAction,
    null
  );

  return (
    <div className="w-full space-y-3">
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state?.success && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <form action={formAction}>
        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={isPending || state?.success}
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Đang gửi email...
            </>
          ) : (
            <>
              <Send className="size-4" />
              Gửi lại email xác thực
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
