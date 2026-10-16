"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BadgeCheck, MapPinned, PhoneCall, type LucideIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/app/(site)/(auth)/login/login-form";
import { RegisterForm } from "@/app/(site)/(auth)/register/register-form";
import { ForgotPasswordForm } from "@/app/(site)/(auth)/forgot-password/forgot-password-form";

export type AuthView = "login" | "register" | "forgot-password";

const VIEWS: Record<AuthView, { title: string; subtitle: string }> = {
  login: { title: "Đăng nhập", subtitle: "Chào mừng bạn quay lại Phố Đặc Sản." },
  register: { title: "Tạo tài khoản", subtitle: "Miễn phí, chỉ mất chưa tới một phút." },
  "forgot-password": { title: "Quên mật khẩu", subtitle: "Nhập email để nhận liên kết đặt lại mật khẩu." },
};

const BENEFITS: { icon: LucideIcon; text: string }[] = [
  { icon: MapPinned, text: "Đặc sản chính gốc từ 34 tỉnh thành" },
  { icon: BadgeCheck, text: "Gian hàng được duyệt, nguồn gốc rõ ràng" },
  { icon: PhoneCall, text: "Shop gọi xác nhận, kiểm hàng rồi mới trả tiền" },
];

const PHOTOS = [
  { src: "/images/products/che-tan-cuong-1.webp", alt: "Chè Tân Cương" },
  { src: "/images/products/nem-chua-thanh-hoa-1.webp", alt: "Nem chua Thanh Hóa" },
  { src: "/images/products/muc-kho-sam-son-1.webp", alt: "Mực khô Sầm Sơn" },
  { src: "/images/products/mam-tom-sam-son-2.webp", alt: "Mắm tôm" },
];

// Two-column auth popup: form on the left, brand intro on the right (hidden on mobile).
// Views switch through the links inside each form; there is no login/register toggle.
export function AuthDialog({
  open,
  onOpenChange,
  initialView = "login",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialView?: AuthView;
}) {
  const router = useRouter();
  const [view, setView] = useState<AuthView>(initialView);

  useEffect(() => {
    if (open) setView(initialView);
  }, [open, initialView]);

  const handleLoginSuccess = () => {
    onOpenChange(false);
    router.refresh();
  };

  const { title, subtitle } = VIEWS[view];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent mobileSheet className="gap-0 overflow-hidden p-0 sm:max-w-4xl md:grid-cols-2 md:[&>[data-slot=dialog-close]]:text-primary-foreground md:[&>[data-slot=dialog-close]]:hover:bg-white/15">
        <div className="flex flex-col gap-5 p-6 sm:p-8">
          <div className="flex items-start gap-2 pr-6">
            {view === "forgot-password" ? (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setView("login")}
                aria-label="Quay lại đăng nhập"
                className="-ml-1 text-muted-foreground"
              >
                <ArrowLeft className="size-4" aria-hidden />
              </Button>
            ) : null}
            <div className="min-w-0">
              <DialogTitle className="text-xl font-bold tracking-tight">{title}</DialogTitle>
              <DialogDescription className="mt-0.5 text-sm text-muted-foreground">{subtitle}</DialogDescription>
            </div>
          </div>

          {view === "login" && <LoginForm onSuccess={handleLoginSuccess} onSwitch={setView} inDialog />}
          {view === "register" && <RegisterForm onSwitch={setView} inDialog />}
          {view === "forgot-password" && <ForgotPasswordForm onSwitch={setView} inDialog />}
        </div>

        <aside className="relative hidden flex-col justify-between gap-6 overflow-hidden bg-primary p-8 text-primary-foreground md:flex">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-mark-white.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -right-16 -bottom-16 size-72 opacity-10"
          />
          <div className="relative space-y-3">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-mark-white.svg" alt="" aria-hidden className="size-8" />
              <span className="text-base font-bold tracking-tight">Phố Đặc Sản</span>
            </div>
            <p className="text-2xl font-bold leading-snug tracking-tight text-balance">
              Hương vị quê nhà, gửi trọn ba miền
            </p>
            <ul className="space-y-2.5 pt-1 text-sm text-primary-foreground/85">
              {BENEFITS.map(({ icon: BenefitIcon, text }) => (
                <li key={text} className="flex items-start gap-2.5">
                  <BenefitIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative grid grid-cols-4 gap-2">
            {PHOTOS.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.src}
                src={p.src}
                alt={p.alt}
                className="aspect-square w-full rounded-lg object-cover ring-2 ring-primary-foreground/20"
              />
            ))}
          </div>
        </aside>
      </DialogContent>
    </Dialog>
  );
}
