"use client";

import { useState, useTransition } from "react";
import { Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleFollow } from "@/server/store/engagement";
import { cn } from "@/lib/utils";

export function FollowButton({
  shopId,
  initialFollowed = false,
  pathname = "/",
  size = "sm",
  variant = "outline",
  className,
}: {
  shopId: string;
  initialFollowed?: boolean;
  pathname?: string;
  size?: "sm" | "default" | "lg";
  variant?: "outline" | "default" | "secondary";
  className?: string;
}) {
  const [followed, setFollowed] = useState(initialFollowed);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const next = !followed;
        setFollowed(next);
        const res = await toggleFollow(shopId, pathname);
        if (res.followed) {
          toast.success("Đã theo dõi gian hàng");
        } else {
          toast.info("Đã bỏ theo dõi gian hàng");
        }
      } catch (err) {
        if ((err as Error)?.message?.includes("NEXT_REDIRECT")) {
          throw err;
        }
        toast.error("Vui lòng đăng nhập để theo dõi gian hàng");
      }
    });
  };

  return (
    <Button
      variant={followed ? "secondary" : variant}
      size={size}
      onClick={handleToggle}
      disabled={isPending}
      className={cn("gap-1.5 transition", className)}
    >
      {followed ? (
        <>
          <Check className="size-4 text-primary" />
          <span>Đang theo dõi</span>
        </>
      ) : (
        <>
          <Plus className="size-4" />
          <span>Theo dõi</span>
        </>
      )}
    </Button>
  );
}
