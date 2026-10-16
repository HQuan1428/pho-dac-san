"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, KeyRound, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/app/(site)/(auth)/login/login-form";
import { RegisterForm } from "@/app/(site)/(auth)/register/register-form";
import { ForgotPasswordForm } from "@/app/(site)/(auth)/forgot-password/forgot-password-form";

export type AuthView = "login" | "register" | "forgot-password";

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
    if (open) {
      setView(initialView);
    }
  }, [open, initialView]);

  const handleLoginSuccess = () => {
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent mobileSheet className="sm:max-w-md p-6">
        <DialogTitle className="sr-only">
          {view === "login"
            ? "Đăng nhập"
            : view === "register"
            ? "Đăng ký tài khoản"
            : "Quên mật khẩu"}
        </DialogTitle>

        {view === "forgot-password" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-3 pr-8">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setView("login")}
                aria-label="Quay lại đăng nhập"
                className="text-muted-foreground hover:text-foreground -ml-1"
              >
                <ArrowLeft className="size-4" aria-hidden />
              </Button>
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 text-primary" aria-hidden />
                <h2 className="text-base font-semibold text-foreground">
                  Quên mật khẩu
                </h2>
              </div>
            </div>
            <ForgotPasswordForm onSwitch={setView} inDialog />
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <Tabs
              value={view}
              onValueChange={(val) => setView(val as AuthView)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="gap-2">
                  <LogIn className="size-4" aria-hidden />
                  <span>Đăng nhập</span>
                </TabsTrigger>
                <TabsTrigger value="register" className="gap-2">
                  <UserPlus className="size-4" aria-hidden />
                  <span>Đăng ký</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="pt-2">
                <LoginForm
                  onSuccess={handleLoginSuccess}
                  onSwitch={setView}
                  inDialog
                />
              </TabsContent>
              <TabsContent value="register" className="pt-2">
                <RegisterForm
                  onSwitch={setView}
                  inDialog
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
