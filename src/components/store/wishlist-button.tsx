"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleWishlist } from "@/server/store/engagement";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  initialWishlisted = false,
  pathname = "/",
  className,
}: {
  productId: string;
  initialWishlisted?: boolean;
  pathname?: string;
  className?: string;
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const next = !wishlisted;
        setWishlisted(next);
        const res = await toggleWishlist(productId, pathname);
        if (res.wishlisted) {
          toast.success("Đã thêm vào danh sách yêu thích");
        } else {
          toast.info("Đã xóa khỏi danh sách yêu thích");
        }
      } catch (err) {
        // In Next.js redirect throws NEXT_REDIRECT, which is normal when not signed in
        if ((err as Error)?.message?.includes("NEXT_REDIRECT")) {
          throw err;
        }
        toast.error("Vui lòng đăng nhập để lưu sản phẩm yêu thích");
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={wishlisted ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
      className={cn("transition", className)}
    >
      <Heart
        className={cn(
          "size-5 transition",
          wishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"
        )}
      />
    </Button>
  );
}
