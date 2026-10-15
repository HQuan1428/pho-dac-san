"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lockUser, unlockUser } from "./actions";
import type { UserRole, UserStatus } from "@prisma/client";

export function UserActionButton({
  userId,
  userName,
  status,
  role,
  isSelf,
}: {
  userId: string;
  userName: string;
  status: UserStatus;
  role: UserRole;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (isSelf || role === "ADMIN") return;

    startTransition(async () => {
      try {
        if (status === "ACTIVE") {
          const res = await lockUser(userId);
          if (res.success) {
            toast.success(`Đã khóa tài khoản "${userName}"`);
          } else {
            toast.error(res.error || "Không thể khóa tài khoản");
          }
        } else {
          const res = await unlockUser(userId);
          if (res.success) {
            toast.success(`Đã mở khóa tài khoản "${userName}"`);
          } else {
            toast.error(res.error || "Không thể mở khóa tài khoản");
          }
        }
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Có lỗi xảy ra");
      }
    });
  };

  if (isSelf) {
    return (
      <span className="text-xs text-muted-foreground italic">
        (Tài khoản của bạn)
      </span>
    );
  }

  if (role === "ADMIN") {
    return (
      <span className="text-xs text-muted-foreground italic">
        (Quản trị viên)
      </span>
    );
  }

  return (
    <Button
      size="xs"
      variant={status === "ACTIVE" ? "outline" : "default"}
      className={status === "ACTIVE" ? "text-destructive hover:bg-destructive/10" : ""}
      onClick={handleToggle}
      disabled={isPending}
    >
      {status === "ACTIVE" ? (
        <>
          <Lock data-icon="inline-start" className="size-3.5" />
          Khóa
        </>
      ) : (
        <>
          <Unlock data-icon="inline-start" className="size-3.5" />
          Mở khóa
        </>
      )}
    </Button>
  );
}
