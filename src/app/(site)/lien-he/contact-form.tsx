"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Send, CheckCircle2 } from "lucide-react";
import { FormField } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { submitContactMessage, type ContactActionState } from "./actions";

const initialState: ContactActionState = {};

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactMessage, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Gửi tin nhắn thành công! Ban quản trị sẽ phản hồi sớm.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="rounded-xl border bg-card p-6 sm:p-8">
      {state.success ? (
        <div className="space-y-4 py-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-6" />
          </div>
          <h3 className="text-xl font-semibold">Cảm ơn bạn đã liên hệ!</h3>
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            Tin nhắn của bạn đã được chuyển đến Ban quản lý Phố Đặc Sản. Chúng tôi sẽ phản hồi qua email hoặc số điện thoại trong vòng 24 giờ làm việc.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              window.location.reload();
            }}
          >
            Gửi thêm tin nhắn khác
          </Button>
        </div>
      ) : (
        <form ref={formRef} action={formAction} className="space-y-5">
          {state.error && !state.fieldErrors && (
            <Alert variant="destructive">
              <AlertTitle>Không thể gửi</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <FormField
            id="name"
            label="Họ và tên"
            required
            error={state.fieldErrors?.name?.[0]}
            hint="Họ tên của bạn hoặc đại diện cơ sở kinh doanh"
          >
            <Input
              id="name"
              name="name"
              placeholder="Nguyễn Văn A"
              required
              disabled={isPending}
            />
          </FormField>

          <FormField
            id="email"
            label="Địa chỉ email"
            required
            error={state.fieldErrors?.email?.[0]}
            hint="Email để chúng tôi gửi phản hồi trực tiếp"
          >
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nguyenvana@example.com"
              required
              disabled={isPending}
            />
          </FormField>

          <FormField
            id="message"
            label="Nội dung tin nhắn"
            required
            error={state.fieldErrors?.message?.[0]}
            hint="Nội dung cần hỗ trợ, tư vấn mở gian hàng hoặc phản ánh chất lượng"
          >
            <Textarea
              id="message"
              name="message"
              placeholder="Xin chào, tôi muốn tìm hiểu thủ tục mở gian hàng đặc sản trà..."
              rows={5}
              required
              disabled={isPending}
            />
          </FormField>

          <Button type="submit" className="w-full" disabled={isPending}>
            <Send data-icon="inline-start" />
            {isPending ? "Đang gửi..." : "Gửi tin nhắn liên hệ"}
          </Button>
        </form>
      )}
    </div>
  );
}
