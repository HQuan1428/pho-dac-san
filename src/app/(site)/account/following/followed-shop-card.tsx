"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, UserMinus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RegionTag } from "@/components/common/region-tag";
import { unfollowShopAction } from "./actions";

export type FollowedShopData = {
  id: string;
  href: string;
  name: string;
  logo?: string | null;
  province: string;
  productCount: number;
  followerCount: number;
};

export function FollowedShopCard({ shop }: { shop: FollowedShopData }) {
  const [isPending, startTransition] = useTransition();

  const handleUnfollow = () => {
    startTransition(async () => {
      const res = await unfollowShopAction(shop.id);
      if (res.success) {
        toast.success(`Đã bỏ theo dõi gian hàng "${shop.name}"`);
      }
    });
  };

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-border/80">
      <Avatar className="size-12 shrink-0">
        {shop.logo && <AvatarImage src={shop.logo} alt={shop.name} />}
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {shop.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <Link
          href={shop.href}
          className="truncate font-medium text-foreground hover:underline block"
        >
          {shop.name}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <RegionTag province={shop.province} />
          <span>·</span>
          <span>{shop.productCount} sản phẩm</span>
          <span>·</span>
          <span>{shop.followerCount} theo dõi</span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleUnfollow}
        disabled={isPending}
        className="shrink-0 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <UserMinus className="size-3.5" />
        )}
        Bỏ theo dõi
      </Button>
    </div>
  );
}
