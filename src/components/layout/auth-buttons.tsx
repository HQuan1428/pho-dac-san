"use client";

import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthDialog, type AuthView } from "./auth-dialog";

export function AuthButtons() {
  const [open, setOpen] = useState(false);
  const [initialView, setInitialView] = useState<AuthView>("login");

  const handleOpen = (view: AuthView) => {
    setInitialView(view);
    setOpen(true);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleOpen("login")}
        className="gap-1.5"
      >
        <LogIn className="size-4" aria-hidden />
        <span>Đăng nhập</span>
      </Button>
      <Button
        size="sm"
        onClick={() => handleOpen("register")}
        className="gap-1.5 max-sm:hidden"
      >
        <UserPlus className="size-4" aria-hidden />
        <span>Đăng ký</span>
      </Button>

      <AuthDialog
        open={open}
        onOpenChange={setOpen}
        initialView={initialView}
      />
    </>
  );
}
